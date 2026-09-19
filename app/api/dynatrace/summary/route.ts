/**
 * POST /api/dynatrace/summary
 *
 * Phase 1 endpoint. Returns the 6 summary metric cards + recent activity
 * for a given Ascelios tenant, scoped to that tenant's Dynatrace
 * Management Zone.
 *
 * Request body:
 *   { tenant: Tenant }   — client passes the active tenant (from
 *                          TenantProvider/localStorage in the demo)
 *
 * Response:
 *   200  DtSummary       — live summary payload
 *   400  DtSummaryError  — malformed request
 *   404  DtSummaryError  — tenant has no Dynatrace binding yet
 *   500  DtSummaryError  — upstream / config failure
 *
 * Mock mode (DYNATRACE_MOCK != "false"): returns deterministic mock
 * data shaped exactly like a live response. Cached server-side for 30s
 * keyed by MZ id so polling clients don't generate fresh values on
 * every poll.
 */
import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/dynatrace/cache";
import { parseTenantPayload, resolveTenantMz } from "@/lib/dynatrace/mz";
import { generateMockSummary } from "@/lib/dynatrace/mock";
import { isMockMode } from "@/lib/dynatrace/token";
import type { DtSummary, DtSummaryError } from "@/lib/dynatrace/types";

const TTL_MS = 30_000;

export async function POST(req: Request): Promise<NextResponse<DtSummary | DtSummaryError>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", code: "no_tenant" }, { status: 400 });
  }

  const tenant = parseTenantPayload((body as { tenant?: unknown })?.tenant);
  if (!tenant) {
    return NextResponse.json(
      { error: "Missing or malformed `tenant` in request body", code: "no_tenant" },
      { status: 400 },
    );
  }

  const resolved = resolveTenantMz(tenant);
  if (!resolved) {
    return NextResponse.json(
      { error: "Tenant has no Dynatrace Management Zone binding yet", code: "no_dt_mz" },
      { status: 404 },
    );
  }

  const cacheKey = `dt:summary:${resolved.dynatrace.managementZoneId}`;
  const cached = cacheGet<DtSummary>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    let summary: DtSummary;

    if (isMockMode()) {
      summary = generateMockSummary({
        tenantId: resolved.id,
        tenantName: resolved.name,
        managementZoneId: resolved.dynatrace.managementZoneId,
        managementZoneName: resolved.dynatrace.managementZoneName,
      });
    } else {
      // Live path will be filled in once real Dynatrace credentials are
      // available. The shape returned here will match DtSummary so the
      // mock/live boundary is invisible to the caller.
      return NextResponse.json(
        { error: "Live Dynatrace integration not yet configured", code: "config" },
        { status: 500 },
      );
    }

    cacheSet(cacheKey, summary, TTL_MS);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("dynatrace summary route error", err);
    return NextResponse.json(
      { error: "Upstream Dynatrace request failed", code: "upstream" },
      { status: 502 },
    );
  }
}
