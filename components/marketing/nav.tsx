"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/services/sap", label: "SAP Services" },
  { href: "/services/cloud", label: "Cloud Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-surface">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-brand-accent font-bold text-xl tracking-tight">
          Ascelios
        </Link>
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-accent text-white">
          <Link href="/portal/dashboard">Client Login</Link>
        </Button>
      </nav>
    </header>
  );
}
