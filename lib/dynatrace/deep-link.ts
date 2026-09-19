/**
 * Deep-link URL builders for the Dynatrace UI.
 *
 * In live mode (DYNATRACE_ENV_URL set), produces real `.../ui/entity/...`
 * URLs. In mock/demo mode, falls back to the public docs page so the
 * "View in Dynatrace" buttons go *somewhere* sensible.
 *
 * Designed to be safely usable from client components — reads only
 * NEXT_PUBLIC_ env vars.
 */

const FALLBACK = "https://www.dynatrace.com/platform/infrastructure-observability/";

function envBase(): string | null {
  const url = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DYNATRACE_ENV_URL : undefined;
  return url && url.startsWith("http") ? url.replace(/\/+$/, "") : null;
}

export function dynatraceUiEntityUrl(entityId: string): string {
  const base = envBase();
  return base ? `${base}/ui/entity/${encodeURIComponent(entityId)}` : FALLBACK;
}

export function dynatraceUiProblemUrl(problemId: string): string {
  const base = envBase();
  return base ? `${base}/ui/problems/${encodeURIComponent(problemId)}` : FALLBACK;
}

export function dynatraceUiManagementZoneUrl(mzId: string): string {
  const base = envBase();
  return base ? `${base}/ui/settings/managementZones?mzId=${encodeURIComponent(mzId)}` : FALLBACK;
}

/** True if the deep link points at a real Dynatrace env (vs the docs fallback). */
export function isLiveDynatraceEnv(): boolean {
  return envBase() !== null;
}
