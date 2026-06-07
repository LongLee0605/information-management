import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function ConfettiCelebration({ active }: { active: boolean }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!active || firedRef.current) return undefined;

    firedRef.current = true;
    const duration = 2800;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 72,
        origin: { x: 0, y: 0.65 },
        colors: ['#3b82f6', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 72,
        origin: { x: 1, y: 0.65 },
        colors: ['#3b82f6', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#3b82f6', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'],
    });

    frame();

    return () => {
      firedRef.current = false;
    };
  }, [active]);

  return null;
}
