import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Props {
  value?: number; // 1..10 (half steps)
  onChange: (value: number | undefined) => void;
  size?: number;
  readOnly?: boolean;
}

/** 5 stars, each half = 1 point → 1..10 scale. Click same value to clear. */
export default function RatingStars({ value, onChange, size = 28, readOnly }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  const pick = (v: number) => {
    if (readOnly) return;
    onChange(v === value ? undefined : v);
  };

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating out of 10"
      onMouseLeave={() => setHover(null)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const full = (i + 1) * 2;
        const half = full - 1;
        const fillLevel = display >= full ? 'full' : display >= half ? 'half' : 'empty';
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            {/* half (left) hit area */}
            {!readOnly && (
              <>
                <button
                  type="button"
                  aria-label={`Rate ${half} of 10`}
                  className="absolute left-0 top-0 z-10 h-full w-1/2"
                  onMouseEnter={() => setHover(half)}
                  onClick={() => pick(half)}
                />
                <button
                  type="button"
                  aria-label={`Rate ${full} of 10`}
                  className="absolute right-0 top-0 z-10 h-full w-1/2"
                  onMouseEnter={() => setHover(full)}
                  onClick={() => pick(full)}
                />
              </>
            )}
            <motion.div
              animate={{ scale: display >= half ? 1 : 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="relative h-full w-full"
            >
              <Star size={size} className="absolute inset-0 text-border" strokeWidth={1.5} />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: fillLevel === 'full' ? '100%' : fillLevel === 'half' ? '50%' : '0%' }}
              >
                <Star size={size} className="text-gold" fill="currentColor" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>
        );
      })}
      <span className="ml-2 tabular-nums text-sm font-semibold text-muted">
        {value ? value.toFixed(value % 1 ? 1 : 0) : '–'}<span className="opacity-50">/10</span>
      </span>
    </div>
  );
}
