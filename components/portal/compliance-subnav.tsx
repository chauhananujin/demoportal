"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/portal/compliance",       label: "Compliance Dashboard" },
  { href: "/portal/compliance/audit", label: "Security Audit" },
];

export function ComplianceSubNav() {
  const pathname = usePathname();
  return (
    <div className="flex border-b border-white/8 mb-8 -mt-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-5 py-3 text-sm border-b-2 transition-colors whitespace-nowrap",
              active
                ? "border-brand-accent text-white font-medium"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
