import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WatchDemoButton } from "./watch-demo";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-brand-bg to-brand-surface py-28 px-6 text-center">
      <p className="text-brand-accent-light text-sm font-semibold tracking-widest uppercase mb-4">
        Cloud + SAP Expertise
      </p>
      <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
        Your Enterprise<br />Cloud & SAP Partner
      </h1>
      <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
        End-to-end services from implementation and migration to 24/7 managed support — across SAP and all major cloud platforms.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/onboarding">
          <Button size="lg" className="bg-brand-primary hover:bg-brand-accent text-white font-semibold">
            Get Started
          </Button>
        </Link>
        <WatchDemoButton variant="ghost" className="!text-base">
          <span className="inline-flex items-center gap-2">
            <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-accent/25 border border-brand-accent/40 text-brand-accent-light">
              <svg width="9" height="9" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                <path d="M2 1l5 3-5 3V1z" fill="currentColor" />
              </svg>
            </span>
            <span>Watch demo · 69 sec</span>
          </span>
        </WatchDemoButton>
      </div>
      <p className="text-xs text-slate-500 mt-5">
        Self-serve onboarding · provision in minutes · cancel anytime
      </p>
    </section>
  );
}
