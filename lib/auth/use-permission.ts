"use client";
import type { PortalAction } from "@/lib/tickets/types";
import { useAuth } from "./auth-context";
import { hasPermission } from "./permissions";

export function usePermission(action: PortalAction): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return hasPermission(user.role, action);
}
