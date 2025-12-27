export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  durationMs?: number;
  colors?: string[];
}

const defaultColors = ['#f59e0b', '#a855f7', '#3b82f6', '#10b981', '#ef4444'];

export function triggerConfetti(options: ConfettiOptions = {}) {
  if (typeof window === 'undefined') return () => undefined;

  const {
    particleCount = 80,
    spread = 240,
    durationMs = 1500,
    colors = defaultColors,
  } = options;

  const root = document.createElement('div');
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.pointerEvents = 'none';
  root.style.zIndex = '9999';

  document.body.appendChild(root);

  const start = performance.now();

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.width = '8px';
    el.style.height = '12px';
    el.style.borderRadius = '2px';
    el.style.background = colors[i % colors.length];
    el.style.left = '50%';
    el.style.top = '35%';

    const angle = ((i / particleCount) * spread - spread / 2) * (Math.PI / 180);
    const velocity = 450 + Math.random() * 350;

    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 250;

    root.appendChild(el);

    return { el, vx, vy, rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 720 };
  });

  let raf = 0;

  const tick = (now: number) => {
    const t = (now - start) / 1000;

    particles.forEach((p) => {
      const x = p.vx * t;
      const y = p.vy * t + 0.5 * 900 * t * t; // gravity
      const rot = p.rot + p.rotSpeed * t;

      p.el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      p.el.style.opacity = String(Math.max(0, 1 - (now - start) / durationMs));
    });

    if (now - start < durationMs) {
      raf = requestAnimationFrame(tick);
    } else {
      cleanup();
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(raf);
    root.remove();
  };

  raf = requestAnimationFrame(tick);

  return cleanup;
}
