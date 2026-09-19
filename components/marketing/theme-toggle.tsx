"use client";
import { useEffect, useRef, useState } from "react";

type ThemeId = "midnight" | "slate" | "mist" | "sand";

const themes: { id: ThemeId; label: string; tone: "Dark" | "Light"; swatch: [string, string] }[] = [
  { id: "midnight", label: "Midnight", tone: "Dark",  swatch: ["#0D1F2D", "#06B6D4"] },
  { id: "slate",    label: "Slate",    tone: "Dark",  swatch: ["#1B1D27", "#818CF8"] },
  { id: "mist",     label: "Mist",     tone: "Light", swatch: ["#E6EAF0", "#0E7490"] },
  { id: "sand",     label: "Sand",     tone: "Light", swatch: ["#ECE5D8", "#B45309"] },
];

const STORAGE_KEY = "ascelios-marketing-theme";

function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  if (id === "midnight") root.removeAttribute("data-marketing-theme");
  else root.setAttribute("data-marketing-theme", id);
}

export function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>("midnight");
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? "midnight";
    setCurrent(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function pick(id: ThemeId) {
    setCurrent(id);
    applyTheme(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
    setOpen(false);
  }

  const active = themes.find((t) => t.id === current) ?? themes[0];

  return (
    <div ref={popRef} className="fixed bottom-6 left-6 z-[70]">
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-3 w-60 rounded-xl border border-white/10 bg-brand-surface shadow-2xl shadow-black/40 overflow-hidden"
        >
          <p className="px-3 pt-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">Theme</p>
          {themes.map((t) => {
            const isActive = t.id === current;
            return (
              <button
                key={t.id}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => pick(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
                  aria-hidden="true"
                />
                <span className="flex-1">
                  <span className="block font-semibold leading-tight">{t.label}</span>
                  <span className="block text-[10px] text-slate-500 leading-tight">{t.tone}</span>
                </span>
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Theme: ${active.label}. Change theme.`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 h-11 pl-2 pr-3 rounded-full bg-brand-surface border border-white/15 hover:border-white/30 shadow-lg shadow-black/20 transition-all hover:scale-[1.02] active:scale-95 text-slate-300 hover:text-white text-xs font-medium"
      >
        <span
          className="w-6 h-6 rounded-full border border-white/20 shrink-0"
          style={{ background: `linear-gradient(135deg, ${active.swatch[0]} 50%, ${active.swatch[1]} 50%)` }}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">{active.label}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 7.5l3.5-3.5 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

/* Inline no-flicker script — read theme from localStorage and apply
 * before first paint. Stringified for use in a <script> tag. */
export const themeBootstrapScript = `
(function(){try{
  var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
  if(t && t!=='midnight'){document.documentElement.setAttribute('data-marketing-theme',t);}
}catch(e){}})();
`;
