"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WatchDemoButton } from "./watch-demo";

const links = [
  { href: "/services/sap", label: "SAP" },
  { href: "/services/data", label: "Data" },
  { href: "/services/btp", label: "BTP" },
  { href: "/services/ai-analytics", label: "AI & Analytics" },
  { href: "/services/cloud", label: "Cloud" },
  { href: "/services/devops", label: "DevOps" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-surface">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" aria-label="Ascelios — home" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ascelios-logo.svg" alt="Ascelios" className="h-16 w-auto" />
        </Link>
        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <WatchDemoButton variant="nav" className="hidden sm:inline-flex" />
          <Link href="/portal/login" className="hidden sm:inline-block text-sm text-slate-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/onboarding">
            <Button size="sm" className="bg-brand-primary hover:bg-brand-accent text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
