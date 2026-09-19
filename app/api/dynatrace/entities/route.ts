/**
 * POST /api/dynatrace/entities
 *
 * Returns the list of monitored entities (hosts, services, databases…)
 * for a given tenant's Management Zone. Phase 2.
 *
 * Request body:  { tenant: Tenant }
 * Response:      DtEntitiesResponse | DtSummaryError
 *
 * Cached for 5 minutes per spec — inventory changes slowly.
 */
import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/dynatrace/cache";
import { parseTenantPayload, resolveTenantMz } from "@/lib/dynatrace/mz";
import { generateMockEntities } from "@/lib/dynatrace/mock";
import { isMockMode } from "@/lib/dynatrace/token";
import type { DtEntitiesResponse, DtSummaryError } from "@/lib/dynatrace/types";

const TTL_MS = 5 * 60 * 1000;

export async function POST(req: Request): Promise<NextResponse<DtEntitiesResponse | DtSummaryError>> {
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

  const cacheKey = `dt:entities:${resolved.dynatrace.managementZoneId}`;
  const cached = cacheGet<DtEntitiesResponse>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    if (!isMockMode()) {
      return NextResponse.json(
        { error: "Live Dynatrace integration not yet configured", code: "config" },
        { status: 500 },
      );
    }

    const entities = generateMockEntities({
      tenantId: resolved.id,
      tenantName: resolved.name,
      managementZoneId: resolved.dynatrace.managementZoneId,
      managementZoneName: resolved.dynatrace.managementZoneName,
    });

    const response: DtEntitiesResponse = {
      source: "mock",
      generatedAt: new Date().toISOString(),
      tenant: {
        id: resolved.id,
        name: resolved.name,
        managementZoneId: resolved.dynatrace.managementZoneId,
        managementZoneName: resolved.dynatrace.managementZoneName,
      },
      entities,
    };

    cacheSet(cacheKey, response, TTL_MS);
    return NextResponse.json(response);
  } catch (err) {
    console.error("dynatrace entities route error", err);
    return NextResponse.json(
      { error: "Upstream Dynatrace request failed", code: "upstream" },
      { status: 502 },
    );
  }
}
