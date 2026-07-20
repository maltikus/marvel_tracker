import { motion } from 'framer-motion';

interface Props {
  value: number; // 0..100
  className?: string;
  tone?: 'accent' | 'gold' | 'muted';
  height?: number;
}

const tones: Record<string, string> = {
  accent: 'from-accent to-accent-soft',
  gold: 'from-gold to-accent-soft',
  muted: 'from-muted to-muted',
};

export default function ProgressBar({ value, className = '', tone = 'accent', height = 8 }: Props) {
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-surface-3 ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${tones[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
