/**
 * POST /api/dynatrace/metrics
 *
 * Returns one or more metric series for a given entity in a tenant's
 * Management Zone. Phase 2.
 *
 * Request body:
 *   {
 *     tenant: Tenant,
 *     entityId: string,
 *     metricSelectors: string[],      // e.g. ["builtin:host.cpu.usage", ...]
 *     points?: number,                // default 60
 *     resolutionSec?: number,         // default 60
 *   }
 *
 * Response: DtMetricsResponse | DtSummaryError
 *
 * Cached for 60s per spec — matches Dynatrace's natural granularity.
 */
import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/dynatrace/cache";
import { parseTenantPayload, resolveTenantMz } from "@/lib/dynatrace/mz";
import { generateMockSeries } from "@/lib/dynatrace/mock";
import { isMockMode } from "@/lib/dynatrace/token";
import type { DtMetricsResponse, DtSeries, DtSummaryError } from "@/lib/dynatrace/types";

const TTL_MS = 60_000;

interface RequestBody {
  tenant?: unknown;
  entityId?: unknown;
  metricSelectors?: unknown;
  points?: unknown;
  resolutionSec?: unknown;
}

export async function POST(req: Request): Promise<NextResponse<DtMetricsResponse | DtSummaryError>> {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", code: "no_tenant" }, { status: 400 });
  }

  const tenant = parseTenantPayload(body.tenant);
  if (!tenant) {
    return NextResponse.json(
      { error: "Missing or malformed `tenant` in request body", code: "no_tenant" },
      { status: 400 },
    );
  }
  const entityId = typeof body.entityId === "string" ? body.entityId : "";
  const metricSelectors = Array.isArray(body.metricSelectors)
    ? body.metricSelectors.filter((s): s is string => typeof s === "string")
    : [];

  if (!entityId || metricSelectors.length === 0) {
    return NextResponse.json(
      { error: "`entityId` and at least one `metricSelectors` entry are required", code: "no_tenant" },
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

  const pts = typeof body.points === "number" && body.points > 0 && body.points <= 360
    ? Math.floor(body.points) : 60;
  const res = typeof body.resolutionSec === "number" && body.resolutionSec >= 30 && body.resolutionSec <= 3600
    ? Math.floor(body.resolutionSec) : 60;

  const selectorKey = metricSelectors.slice().sort().join(",");
  const cacheKey = `dt:metrics:${resolved.dynatrace.managementZoneId}:${entityId}:${pts}:${res}:${selectorKey}`;
  const cached = cacheGet<DtMetricsResponse>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    if (!isMockMode()) {
      return NextResponse.json(
        { error: "Live Dynatrace integration not yet configured", code: "config" },
        { status: 500 },
      );
    }

    const series: DtSeries[] = metricSelectors.map((sel) =>
      generateMockSeries({
        managementZoneId: resolved.dynatrace.managementZoneId,
        metricSelector: sel,
        entityId,
        points: pts,
        resolutionSec: res,
      }),
    );

    const response: DtMetricsResponse = {
      source: "mock",
      generatedAt: new Date().toISOString(),
      tenant: {
        id: resolved.id,
        name: resolved.name,
        managementZoneId: resolved.dynatrace.managementZoneId,
        managementZoneName: resolved.dynatrace.managementZoneName,
      },
      series,
    };

    cacheSet(cacheKey, response, TTL_MS);
    return NextResponse.json(response);
  } catch (err) {
    console.error("dynatrace metrics route error", err);
    return NextResponse.json(
      { error: "Upstream Dynatrace request failed", code: "upstream" },
      { status: 502 },
    );
  }
}
