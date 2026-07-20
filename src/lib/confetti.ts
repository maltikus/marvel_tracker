import confetti from 'canvas-confetti';

function reduced(): boolean {
  return (
    document.documentElement.classList.contains('reduce-motion') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const COLORS = ['#e11d2e', '#ff8a4c', '#f5c542', '#ffffff'];

export function celebrate() {
  if (reduced()) return;
  const end = Date.now() + 900;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: COLORS,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: COLORS,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function bigCelebrate() {
  if (reduced()) return;
  confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors: COLORS });
  setTimeout(
    () => confetti({ particleCount: 120, spread: 120, startVelocity: 45, origin: { y: 0.5 }, colors: COLORS }),
    250,
  );
}
