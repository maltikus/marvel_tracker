import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Moon, Sun, Trash2, Upload, X } from 'lucide-react';
import { useUi } from '../store/ui';
import { useStore, type Settings } from '../store/store';
import { exportProgress, importProgressFromFile } from '../lib/backup';
import { toast } from '../hooks/useToast';

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-xl border border-border bg-surface p-3 text-left transition hover:bg-surface-3"
      role="switch"
      aria-checked={checked}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
      <span
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-accent' : 'bg-surface-3 border border-border'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          style={{ left: checked ? 22 : 2 }}
        />
      </span>
    </button>
  );
}

export default function SettingsPanel() {
  const open = useUi((s) => s.settingsOpen);
  const toggleSettings = useUi((s) => s.toggleSettings);
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const reset = useStore((s) => s.reset);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSetting(k, v);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleSettings(false)}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface-2 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl tracking-wide">Settings</h2>
              <button
                onClick={() => toggleSettings(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted hover:text-ink"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Timeline</p>
              <Toggle
                label="Show Timeline-adjacent titles"
                hint="Marvel Television / ABC / Netflix — not in Marvel Studios' official timeline (AoS, Agent Carter, Defenders, …)."
                checked={settings.showAdjacent}
                onChange={(v) => set('showAdjacent', v)}
              />
              <Toggle
                label="Show optional multiverse / animation"
                hint="Marvel Zombies, Your Friendly Neighborhood Spider-Man, X-Men '97 — explicitly outside the Sacred Timeline."
                checked={settings.showOptionalMultiverse}
                onChange={(v) => set('showOptionalMultiverse', v)}
              />

              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted">Viewing</p>
              <Toggle
                label="Spoiler-free mode"
                hint="Blur synopses, episode titles and stills for anything you haven't watched yet."
                checked={settings.spoilerFree}
                onChange={(v) => set('spoilerFree', v)}
              />
              <Toggle
                label="Reduce motion"
                hint="Minimise animations and disable confetti."
                checked={settings.reduceMotion}
                onChange={(v) => set('reduceMotion', v)}
              />

              <div className="mt-1 flex items-center justify-between rounded-xl border border-border bg-surface p-3">
                <span className="text-sm font-semibold">Theme</span>
                <div className="flex gap-1 rounded-lg border border-border p-1">
                  {(['dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => set('theme', t)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                        settings.theme === t ? 'bg-accent text-white' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {t === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted">
                Backup &amp; data
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={exportProgress}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm font-semibold transition hover:bg-surface-3"
                >
                  <Download size={16} /> Export
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm font-semibold transition hover:bg-surface-3"
                >
                  <Upload size={16} /> Import
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importProgressFromFile(f);
                    e.target.value = '';
                  }}
                />
              </div>
              <p className="text-xs text-muted">
                Progress lives only in this browser's local storage. Export regularly to move between
                devices.
              </p>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-accent/40 p-3 text-sm font-semibold text-accent transition hover:bg-accent/10"
                >
                  <Trash2 size={16} /> Reset all progress
                </button>
              ) : (
                <div className="mt-2 flex flex-col gap-2 rounded-xl border border-accent/50 bg-accent/10 p-3">
                  <span className="text-sm font-semibold">Erase all progress and ratings?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        reset();
                        setConfirmReset(false);
                        toast('Progress reset', 'info');
                      }}
                      className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-bold text-white"
                    >
                      Yes, reset
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-muted">
              This product uses the TMDB API but is not endorsed or certified by TMDB. An unofficial
              fan project with no affiliation to Marvel or Disney.
            </p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
