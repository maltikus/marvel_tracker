import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const icons = {
  success: Check,
  info: Info,
  error: X,
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border border-border bg-surface-2/95 px-4 py-3 shadow-card backdrop-blur"
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                  t.tone === 'error' ? 'bg-accent/20 text-accent' : 'bg-gold/20 text-gold'
                }`}
              >
                <Icon size={14} />
              </span>
              <span className="text-sm font-medium">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-1 text-muted hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
