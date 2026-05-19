import { useEffect, useState } from 'react';
import { BackgroundFX, FxSwitcher, type FxKind } from './BackgroundFX';

type Theme = 'light' | 'dark';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/deepgunner', external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/singh-deepinder', external: true },
  { label: 'Email', href: 'deepindersingh.23@gmail.com', external: false },
] as const;

const FX_DEFAULT: FxKind = 'web';
const FX_VALUES: readonly FxKind[] = ['off', 'spotlight', 'motes', 'grain', 'web'] as const;

const readInitialTheme = (): Theme => {
  if (typeof document === 'undefined') return 'dark';
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' ? 'light' : 'dark';
};

const readInitialFx = (): FxKind => {
  try {
    const v = localStorage.getItem('fx');
    if (v && (FX_VALUES as readonly string[]).includes(v)) return v as FxKind;
  } catch {}
  return FX_DEFAULT;
};

export default function App() {
  const [time, setTime] = useState<string>('');
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [fx, setFx] = useState<FxKind>(readInitialFx);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#F4EFE6');
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem('fx', fx); } catch {}
  }, [fx]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Vancouver',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat('en-CA', opts).format(now));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <>
    <BackgroundFX effect={fx} />
    <main className="page">
      <button
        type="button"
        className="mark"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? (
          // moon
          <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M40 36c-9.94 0-18-8.06-18-18 0-2.12.37-4.15 1.04-6.04A18 18 0 1 0 46.04 34.96 18.06 18.06 0 0 1 40 36z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // sun
          <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="30" cy="30" r="9" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <g stroke="currentColor" strokeWidth="0.6" strokeLinecap="round">
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                const r1 = 14;
                const r2 = 18 + (i % 2 === 0 ? 2 : 0);
                return (
                  <line
                    key={i}
                    x1={30 + Math.cos(a) * r1}
                    y1={30 + Math.sin(a) * r1}
                    x2={30 + Math.cos(a) * r2}
                    y2={30 + Math.sin(a) * r2}
                  />
                );
              })}
            </g>
          </svg>
        )}
      </button>

      <header className="meta">
        <span className="kicker"><span className="hl">Portfolio</span> · in progress</span>
        <span className="time" aria-label="Local time in Surrey, BC">
          Surrey, BC · <span className="hl">{time}</span>
        </span>
      </header>

      <section className="hero">
        <p className="greet hl">Hello —</p>
        <h1 className="name">
          <span className="name-line">Deep</span>
          <span className="name-line italic">Singh</span>
        </h1>
        <p className="role">
          Fullstack developer. <span className="dim">Currently building things at the edge of code and design.</span>
        </p>
      </section>

      <nav className="links" aria-label="Find me elsewhere">
        {LINKS.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            className="link"
            style={{ animationDelay: `${800 + i * 90}ms` }}
            {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span className="link-label">{l.label}</span>
            <span className="link-arrow" aria-hidden="true">
              {l.external ? '↗' : '→'}
            </span>
          </a>
        ))}
      </nav>

      <footer className="foot">
        <span>A proper site is on the way.</span>
        <span className="dot" aria-hidden="true">·</span>
        <a className="foot-link" href="https://hoovugalu.com" target="_blank" rel="noopener noreferrer">
          <span className="hl">See</span> <em>Bangalore in Bloom</em> ↗
        </a>
        <span className="dot" aria-hidden="true">·</span>
        <FxSwitcher value={fx} onChange={setFx} />
      </footer>
    </main>
    </>
  );
}
