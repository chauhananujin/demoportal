"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { usePortalTheme } from "@/lib/portal/theme-context";
import { PortalSidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";

export function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { theme } = usePortalTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect after auth has loaded — avoids false redirect during hydration
    if (!loading && !user && pathname !== "/portal/login") {
      router.push("/portal/login");
    }
  }, [loading, user, pathname, router]);

  // Login page: full-screen, no sidebar
  if (pathname === "/portal/login") {
    return <>{children}</>;
  }

  // Wait for auth to load before deciding what to render
  if (loading) return null;

  // Not authenticated — blank while redirect runs
  if (!user) return null;

  // Authenticated portal shell
  return (
    <div data-portal-theme={theme} className="flex min-h-screen bg-[#0a1929]">
      <PortalSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <CommandPalette />
    </div>
  );
}
