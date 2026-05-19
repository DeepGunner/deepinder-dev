import { useEffect, useRef } from 'react';

export type FxKind = 'off' | 'spotlight' | 'motes' | 'grain' | 'web';

export const FX_OPTIONS: { key: FxKind; label: string }[] = [
  { key: 'off',       label: 'none' },
  { key: 'spotlight', label: 'spot' },
  { key: 'motes',     label: 'motes' },
  { key: 'grain',     label: 'grain' },
  { key: 'web',       label: 'web' },
];

export function BackgroundFX({ effect }: { effect: FxKind }) {
  switch (effect) {
    case 'spotlight': return <Spotlight />;
    case 'motes':     return <Motes />;
    case 'grain':     return <Grain />;
    case 'web':       return <Constellation />;
    default:          return null;
  }
}

function readVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', e.clientX + 'px');
        el.style.setProperty('--my', e.clientY + 'px');
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="fx fx-spotlight" aria-hidden="true" />;
}

function Grain() {
  return <div className="fx fx-grain" aria-hidden="true" />;
}

function Motes() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 38;
    const dots = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 0.6 + Math.random() * 1.4,
      a: 0.25 + Math.random() * 0.4,
    }));

    const reduced = prefersReducedMotion();
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const color = readVar('--fx-dot', '#888');
      for (const d of dots) {
        if (!reduced) {
          d.x += d.vx; d.y += d.vy;
          if (d.x < -5) d.x = w + 5;
          if (d.x > w + 5) d.x = -5;
          if (d.y < -5) d.y = h + 5;
          if (d.y > h + 5) d.y = -5;
        }
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = d.a;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="fx fx-canvas" aria-hidden="true" />;
}

function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 42;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r: 1.0 + Math.random() * 1.2,           // star size variation
      phase: Math.random() * Math.PI * 2,      // twinkle phase offset
      freq: 0.4 + Math.random() * 1.0,         // twinkle speed
    }));

    let mx = -10000, my = -10000;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -10000; my = -10000; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);

    const reduced = prefersReducedMotion();
    const R = 140;
    const RC = R * 1.3;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const line = readVar('--fx-line', '#7D8EB8');
      const dot  = readVar('--fx-dot',  '#D8DCE5');
      const t = performance.now() / 1000;

      if (!reduced) {
        for (const n of nodes) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < -5) n.x = w + 5;
          if (n.x > w + 5) n.x = -5;
          if (n.y < -5) n.y = h + 5;
          if (n.y > h + 5) n.y = -5;
        }
      }

      // node-to-node faint lines
      ctx.lineWidth = 0.4;
      ctx.strokeStyle = line;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const k = 1 - Math.sqrt(d2) / R;
            ctx.globalAlpha = 0.16 * k;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // node-to-cursor highlight lines (still cosmic, brighter)
      ctx.strokeStyle = line;
      ctx.lineWidth = 0.6;
      for (const n of nodes) {
        const dx = n.x - mx, dy = n.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < RC * RC) {
          const k = 1 - Math.sqrt(d2) / RC;
          ctx.globalAlpha = 0.55 * k;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }

      // stars — gentle twinkle via sine-modulated alpha
      ctx.fillStyle = dot;
      for (const n of nodes) {
        const twinkle = reduced ? 0.7 : 0.55 + Math.sin(t * n.freq + n.phase) * 0.25;
        ctx.globalAlpha = Math.max(0.2, twinkle);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return <canvas ref={ref} className="fx fx-canvas" aria-hidden="true" />;
}

export function FxSwitcher({
  value,
  onChange,
}: {
  value: FxKind;
  onChange: (v: FxKind) => void;
}) {
  return (
    <span className="fx-switch" role="group" aria-label="Background effect">
      <span className="fx-switch-label hl">FX</span>
      {FX_OPTIONS.map((opt, i) => (
        <span key={opt.key} className="fx-switch-item">
          {i > 0 && <span className="dot" aria-hidden="true">·</span>}
          <button
            type="button"
            className={'fx-switch-btn' + (value === opt.key ? ' is-active' : '')}
            onClick={() => onChange(opt.key)}
            aria-pressed={value === opt.key}
          >
            {opt.label}
          </button>
        </span>
      ))}
    </span>
  );
}
