"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PortalSidebar } from "./sidebar";

export function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && pathname !== "/portal/login") {
      router.push("/portal/login");
    }
  }, [user, pathname, router]);

  // Login page: full-screen, no sidebar
  if (pathname === "/portal/login") {
    return <>{children}</>;
  }

  // Not yet authenticated — blank while redirect runs
  if (!user) return null;

  // Authenticated portal shell
  return (
    <div className="flex min-h-screen bg-[#0a1929]">
      <PortalSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
