/**
 * Dynatrace API client. This is the SINGLE chokepoint through which all
 * Dynatrace requests must pass.
 *
 * Multi-tenant safety guarantee:
 *   Every method on this client REQUIRES a `managementZoneId` argument.
 *   Without it the request is rejected at construction time. This makes
 *   it physically impossible to accidentally query across customer
 *   boundaries from anywhere in the codebase.
 *
 * Phase 1 only implements what the /summary route needs.
 */
import { getDynatraceToken, isMockMode } from "./token";

export class UnscopedQueryError extends Error {
  constructor() {
    super("dynatrace client: managementZoneId is required on every request");
    this.name = "UnscopedQueryError";
  }
}

interface ScopedRequest {
  /** Dynatrace MZ ID — REQUIRED to enforce multi-tenant scoping */
  managementZoneId: string;
}

interface GetOpts extends ScopedRequest {
  query?: Record<string, string | number>;
  timeoutMs?: number;
}

function assertScoped(managementZoneId: string | undefined): asserts managementZoneId is string {
  if (!managementZoneId || managementZoneId.trim() === "") {
    throw new UnscopedQueryError();
  }
}

function envUrl(): string {
  const u = process.env.DYNATRACE_ENV_URL;
  if (!u) throw new Error("dynatrace: DYNATRACE_ENV_URL not set");
  return u.replace(/\/+$/, "");
}

export const dtClient = {
  /**
   * GET against a Dynatrace v2 endpoint. The `managementZone` query
   * parameter is injected automatically and CANNOT be overridden by
   * callers — even if a caller passes `managementZone` in `query`, the
   * scope from `managementZoneId` always wins.
   */
  async get<T>(path: string, opts: GetOpts): Promise<T> {
    assertScoped(opts.managementZoneId);

    // Live path (Phase 1+ when DYNATRACE_MOCK=false)
    const token = await getDynatraceToken();

    if (isMockMode()) {
      // The mock branch is handled by the route — clients should not call
      // dtClient.get() in mock mode. Throw to make this loud.
      throw new Error("dtClient.get called in mock mode — use the mock generator instead");
    }

    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.query ?? {})) {
      if (k.toLowerCase() === "managementzone") continue; // caller can't override
      params.set(k, String(v));
    }
    params.set("managementZone", opts.managementZoneId);

    const url = `${envUrl()}${path}?${params.toString()}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`dynatrace GET ${path}: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  },
};
