/**
 * Resolves an Ascelios tenant id to its Dynatrace Management Zone binding.
 *
 * In a real deploy this would query the server-side tenant store. For
 * Phase 1 the route handler receives a serialized tenant payload from
 * the client (sourced from TenantProvider in localStorage) and we run
 * validation on it. This is acknowledged as a demo-only shortcut — see
 * lib/dynatrace/mz.ts header comment.
 *
 * SECURITY NOTE: When this is wired to a real server-side tenant store
 * (Phase 2+), `resolveTenantMz` MUST derive the binding from the user's
 * SESSION, never from a client-supplied tenant id. The current demo
 * accepts a client payload because there is no server-side state — but
 * the function signature already returns null if the binding is missing
 * or the input is shaped wrong, so the route handler's downstream logic
 * doesn't have to special-case that.
 */
import type { Tenant, TenantDynatrace } from "@/lib/onboarding/types";

export interface ResolvedTenant {
  id: string;
  name: string;
  dynatrace: TenantDynatrace;
}

export function resolveTenantMz(tenant: Tenant | null | undefined): ResolvedTenant | null {
  if (!tenant) return null;
  if (!tenant.dynatrace) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    dynatrace: tenant.dynatrace,
  };
}

/**
 * Stripped-down validator used by route handlers. Accepts a JSON-parsed
 * payload from the client and confirms it has the bare minimum we need
 * to scope a Dynatrace query. Returns null if anything is off.
 */
export function parseTenantPayload(input: unknown): Tenant | null {
  if (typeof input !== "object" || input === null) return null;
  const t = input as Record<string, unknown>;
  if (typeof t.id !== "string" || typeof t.name !== "string") return null;
  // dynatrace block is optional on the type; route returns no_dt_mz if absent.
  return t as unknown as Tenant;
}
