// components/portal/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermission } from "@/lib/auth/use-permission";
import { usePortalTheme } from "@/lib/portal/theme-context";
import type { PortalAction } from "@/lib/tickets/types";

const navItems: { href: string; label: string; icon: React.ReactNode; gate?: PortalAction }[] = [
  {
    href: "/portal/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: "/portal/monitoring",
    label: "Monitoring",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1 9h2.5l1.5-5 2 9 1.5-4 1.5 3h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/infrastructure",
    label: "Infrastructure",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="12.5" cy="4.5" r="1" fill="currentColor"/>
        <circle cx="12.5" cy="11.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/onboarding",
    label: "Onboarding",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="6" cy="5.333" r="2.333" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1.333 13.333c0-2.577 2.089-4.666 4.667-4.666s4.667 2.089 4.667 4.666" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M12.667 5.333v4M14.667 7.333h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/tenants",
    label: "Tenants",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5L1.5 5l6.5 3.5L14.5 5 8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M1.5 8L8 11.5 14.5 8M1.5 11L8 14.5 14.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/tickets",
    label: "Tickets",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M14 10.667A1.333 1.333 0 0 1 12.667 12H4L1.333 14.667V3.333A1.333 1.333 0 0 1 2.667 2h10A1.333 1.333 0 0 1 14 3.333v7.334Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/backups",
    label: "Backups",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <ellipse cx="8" cy="5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 5v6a5 2 0 0 0 10 0V5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 8a5 2 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 11v2M6.5 12.5l1.5 1 1.5-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/services",
    label: "Services",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 1v14M2 4.5l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: "/portal/documents",
    label: "Documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M9 1H3.667A1.333 1.333 0 0 0 2.333 2.333V13.667A1.333 1.333 0 0 0 3.667 15h8.666A1.333 1.333 0 0 0 13.667 13.667V5.667L9 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M9 1v4.667h4.667M5.333 8.667h5.334M5.333 11.333h5.334M5.333 6H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/migration",
    label: "Migration",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1.333 8h13.334M10 3.333L14.667 8 10 12.667" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.333 3.333L1.333 8l4 4.667" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    href: "/portal/compliance",
    label: "Compliance",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.333L13.333 3.667v4c0 3.2-2.133 5.867-5.333 6.666C2.8 13.534.667 10.867.667 7.667v-4L8 1.333Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5.333 8l1.667 1.667L10.667 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/billing",
    label: "Billing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.333" y="3.333" width="13.333" height="9.333" rx="1.333" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1.333 6.667h13.333" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M4 9.667h2M4 11h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/admin/users",
    label: "Users",
    gate: "manage:users",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1.333 14c0-2.577 2.089-4.667 4.667-4.667S10.667 11.423 10.667 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="12" cy="5" r="1.667" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 9.333A3.333 3.333 0 0 1 14.667 12.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.333" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 1.333V3M8 13v1.667M1.333 8H3M13 8h1.667M3.286 3.286l1.178 1.178M11.536 11.536l1.178 1.178M3.286 12.714l1.178-1.178M11.536 4.464l1.178-1.178" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = usePortalTheme();
  const canManageUsers = usePermission("manage:users");
  const visibleItems = navItems.filter((item) => {
    if (item.gate === "manage:users") return canManageUsers;
    return true;
  });

  return (
    <aside className="w-60 shrink-0 bg-brand-bg border-r border-brand-surface flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 h-20 flex items-center border-b border-brand-surface">
        <Link href="/" aria-label="Ascelios — home" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ascelios-logo.svg" alt="Ascelios" className="h-[60px] w-auto" />
        </Link>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
          Portal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-brand-primary/15 text-brand-accent"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn("shrink-0", active ? "text-brand-accent" : "text-slate-500")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-xs text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/15 transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            {theme === "dark" ? (
              // Sun icon (action: switch TO light)
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 1.5v1.4M7 11.1v1.4M1.5 7h1.4M11.1 7h1.4M3.1 3.1l1 1M9.9 9.9l1 1M3.1 10.9l1-1M9.9 4.1l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ) : (
              // Moon icon (action: switch TO dark)
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M12 8.4A5.5 5.5 0 0 1 5.6 2 5.5 5.5 0 1 0 12 8.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            )}
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </span>
          <span
            className={cn(
              "inline-flex items-center font-mono text-[9px] uppercase tracking-wider border rounded px-1.5 py-0.5",
              theme === "dark"
                ? "text-slate-500 border-white/10 bg-black/20"
                : "text-brand-accent border-brand-accent/30 bg-brand-accent/10",
            )}
          >
            {theme}
          </span>
        </button>
      </div>

      {/* Command palette hint */}
      <div className="px-3 pb-3">
        <div
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-xs text-slate-400"
          title="Press ⌘K (or Ctrl+K) anywhere"
        >
          <span className="inline-flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7a5 5 0 1 1 10 0A5 5 0 0 1 2 7Z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5.5 6.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .7-1.5 1-1.5 1.8M7 9.7v0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Open command bar
          </span>
          <kbd className="inline-flex items-center font-mono text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5 bg-black/20">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Account */}
      <div className="px-4 py-4 border-t border-brand-surface">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-accent text-xs font-semibold shrink-0">
            {user?.email.slice(0, 2).toUpperCase() ?? "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{user?.email ?? ""}</p>
            <span className={cn(
              "font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border inline-block mt-0.5",
              user?.role === "admin"
                ? "text-red-400 border-red-400/30 bg-red-400/10"
                : user?.role === "manager"
                ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                : "text-slate-400 border-slate-400/30 bg-slate-400/10"
            )}>{user?.role ?? ""}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-slate-500 hover:text-white transition-colors py-1 px-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
