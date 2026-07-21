import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Cloud, Loader2, LogOut, Mail, X } from 'lucide-react';
import { useUi } from '../store/ui';
import { useAuth } from '../store/auth';

export default function AuthPanel() {
  const open = useUi((s) => s.authOpen);
  const toggleAuth = useUi((s) => s.toggleAuth);
  const { enabled, status, user, error, info, busy, signIn, signUp, signOut, clearMessages } =
    useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const close = () => {
    toggleAuth(false);
    clearMessages();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') void signIn(email.trim(), password);
    else void signUp(email.trim(), password);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface-2 p-6 shadow-card"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent-soft">
                  <Cloud size={18} />
                </span>
                <div>
                  <h2 className="font-display text-2xl leading-none tracking-wide">Cloud sync</h2>
                  <p className="text-xs text-muted">Track your progress across devices</p>
                </div>
              </div>
              <button
                onClick={close}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted hover:text-ink"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {!enabled ? (
              <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
                Cloud sync isn't configured for this deployment. Progress is saved locally in this
                browser; use <b className="text-ink">Settings → Export</b> to move it between
                devices.
              </div>
            ) : status === 'signed_in' && user ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Signed in as</p>
                  <p className="truncate font-semibold">{user.email}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-accent-soft">
                    <Cloud size={13} /> Progress syncs automatically.
                  </p>
                </div>
                <button
                  onClick={() => void signOut()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm font-semibold transition hover:bg-surface-3"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="flex rounded-lg border border-border bg-surface p-0.5 text-sm">
                  {(['signin', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m);
                        clearMessages();
                      }}
                      className={`flex-1 rounded-md py-1.5 font-semibold transition ${
                        mode === m ? 'bg-accent text-white' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {m === 'signin' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>

                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-muted">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-muted">Password</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                    placeholder="••••••••"
                  />
                </label>

                {error && (
                  <p className="flex items-start gap-1.5 text-xs text-accent">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                  </p>
                )}
                {info && (
                  <p className="flex items-start gap-1.5 text-xs text-gold">
                    <Mail size={14} className="mt-0.5 shrink-0" /> {info}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                >
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
                <p className="text-center text-[11px] text-muted">
                  Guest progress on this device is merged into your account on first sign-in.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
