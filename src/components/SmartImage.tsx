import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** Blur/hide contents for spoiler-free mode. */
  spoiler?: boolean;
  draggable?: boolean;
}

/** Image with blur-up load and skeleton fallback. */
export default function SmartImage({ src, alt, className = '', spoiler, draggable = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !failed && <div className="skeleton absolute inset-0" />}
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={draggable}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover blur-up ${loaded ? 'loaded' : ''} ${
            spoiler ? 'spoiler-blur' : ''
          }`}
        />
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-surface-3 text-muted text-xs">
          {alt}
        </div>
      )}
    </div>
  );
}
