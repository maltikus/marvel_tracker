import { supabase, PROGRESS_TABLE } from './supabase';
import { useStore, type Progress } from '../store/store';

/**
 * Union-merge two progress blobs. Watched episodes are unioned per series;
 * unit entries take whichever was updated most recently. Used on first sign-in
 * so local "guest" progress is folded into the account rather than lost.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const episodes: Progress['episodes'] = {};
  const epKeys = new Set([...Object.keys(a.episodes), ...Object.keys(b.episodes)]);
  for (const k of epKeys) {
    episodes[k] = [...new Set([...(a.episodes[k] ?? []), ...(b.episodes[k] ?? [])])];
  }

  const units: Progress['units'] = {};
  const unitIds = new Set([...Object.keys(a.units), ...Object.keys(b.units)]);
  for (const id of unitIds) {
    const ua = a.units[id];
    const ub = b.units[id];
    if (ua && ub) units[id] = (ua.updatedAt ?? '') >= (ub.updatedAt ?? '') ? ua : ub;
    else units[id] = (ua ?? ub)!;
  }
  return { units, episodes };
}

const isEmpty = (p: Progress): boolean =>
  Object.keys(p.units).length === 0 && Object.keys(p.episodes).length === 0;

export async function pullProgress(userId: string): Promise<Progress | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[sync] pull failed:', error.message);
    return null;
  }
  return (data?.data as Progress) ?? null;
}

export async function pushProgress(userId: string, progress: Progress): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from(PROGRESS_TABLE)
    .upsert(
      { user_id: userId, data: progress, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  if (error) {
    console.warn('[sync] push failed:', error.message);
    return false;
  }
  return true;
}

// --- push subscription (debounced) -----------------------------------------

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;
/** Suppress the push that a remote-driven local update would otherwise trigger. */
let suppressPush = false;

/** Apply a remote progress blob locally without echoing it straight back up. */
export function applyRemoteProgress(progress: Progress) {
  suppressPush = true;
  useStore.getState().importState({ progress });
  // release after the store notifies subscribers
  queueMicrotask(() => {
    suppressPush = false;
  });
}

/** Start pushing local progress changes for this user (debounced). */
export function startPushSync(userId: string) {
  stopPushSync();
  unsubscribe = useStore.subscribe((state, prev) => {
    if (suppressPush) return;
    if (state.progress === prev.progress) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      void pushProgress(userId, useStore.getState().progress);
    }, 800);
  });
}

export function stopPushSync() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
}

/**
 * Reconcile local + remote once when a session becomes active.
 * @param initial true on page-load restore (remote wins); false on an explicit
 *   sign-in (union-merge so guest progress is migrated into the account).
 */
export async function reconcile(userId: string, initial: boolean): Promise<void> {
  const local = useStore.getState().progress;
  const remote = await pullProgress(userId);

  let next: Progress;
  if (!remote) {
    next = local; // first time for this account — seed it with local
  } else if (initial) {
    next = remote; // returning device — adopt the cloud copy
  } else if (isEmpty(local)) {
    next = remote;
  } else {
    next = mergeProgress(local, remote); // sign-in with guest data — migrate it
  }

  applyRemoteProgress(next);
  await pushProgress(userId, next);
}
