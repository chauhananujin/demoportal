"use client";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WatchDemoButtonProps {
  variant?: "primary" | "ghost" | "nav";
  className?: string;
  children?: ReactNode;
}

export function WatchDemoButton({ variant = "primary", className, children }: WatchDemoButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    // Lock background scroll while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const label = children ?? (
    <span className="inline-flex items-center gap-2">
      <PlayBadge />
      <span>Watch demo</span>
    </span>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 transition-colors",
          variant === "primary" && "bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-lg",
          variant === "ghost"   && "text-slate-400 hover:text-white text-sm border-b border-slate-600 hover:border-white self-center pb-px",
          variant === "nav"     && "text-sm text-slate-400 hover:text-white",
          className,
        )}
      >
        {label}
      </button>

      {open && <DemoModal onClose={() => setOpen(false)} />}
    </>
  );
}

function PlayBadge() {
  return (
    <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-accent/25 border border-brand-accent/40">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <path d="M2 1l5 3-5 3V1z" fill="currentColor" />
      </svg>
    </span>
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ascelios portal demo"
      className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Player frame */}
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#0b1e2e", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            <span className="ml-3 font-mono text-[11px] uppercase tracking-wide text-slate-500">
              Ascelios Portal — Live demo
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demo"
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Narrated MP4 with HTML5 video controls */}
        <div className="bg-brand-bg">
          <video
            src="/demo.mp4"
            poster="/demo-poster.jpg"
            controls
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-auto block"
            width={1920}
            height={1080}
            aria-label="Ascelios client portal walkthrough — onboarding, dashboard, FinOps, tickets, and the ⌘K command palette"
          >
            {/* Fallback WebP loop for browsers that block autoplay or don't support MP4 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo.webp" alt="Ascelios portal walkthrough" className="w-full h-auto block" />
          </video>
        </div>

        {/* Footer caption */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs">
          <span className="text-slate-400">
            69-second narrated walkthrough · Onboarding · Dashboard · FinOps · Tickets · ⌘K palette
          </span>
          <a
            href="/onboarding"
            className="text-brand-accent hover:text-brand-accent-light border-b border-brand-accent/40 hover:border-brand-accent-light pb-px"
          >
            Try it yourself →
          </a>
        </div>
      </div>
    </div>
  );
}
