"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PortalSidebar } from "./sidebar";
import { Chatbot } from "./chatbot";

export function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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
    <div className="flex min-h-screen bg-[#0a1929]">
      <PortalSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Chatbot />
    </div>
  );
}
