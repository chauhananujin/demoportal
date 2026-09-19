/**
 * Shape of responses returned by lib/dynatrace/client.ts.
 *
 * Mirrors the slice of Dynatrace v2 + Grail that Phase 1 uses for the
 * portal /portal/monitoring summary. When the mock flag is on, the mock
 * generator produces values in this exact shape — so the route handlers
 * and React UI don't care whether the data came from a real DT env or
 * the mock generator.
 */

export type AlertKind = "RESOLVED" | "INVESTIGATING" | "DEPLOYED" | "HEALTHY";

export interface DtMetric {
  /** Stable identifier for the card (e.g. "hosts", "containers") */
  key: string;
  /** Display label, e.g. "Monitored Hosts" */
  label: string;
  /** Pre-formatted value, e.g. "1,284" or "8 min" */
  value: string;
  /**
   * Health hint used to color the value:
   *   true  → green (good)
   *   false → yellow (attention)
   *   null  → neutral (just a count)
   */
  ok: boolean | null;
  /** 24 normalized samples for the sparkline (0–100) */
  sparkline: number[];
}

export interface DtAlert {
  id: string;
  kind: AlertKind;
  text: string;
  /** HH:MM */
  time: string;
}

export interface DtSummary {
  /** Source of the data — UI shows a small badge */
  source: "mock" | "live";
  /** ISO timestamp the response was generated at the server */
  generatedAt: string;
  /** Tenant identifier and Dynatrace MZ this summary was scoped to */
  tenant: {
    id: string;
    name: string;
    managementZoneId: string;
    managementZoneName: string;
  };
  metrics: DtMetric[];
  alerts: DtAlert[];
}

export interface DtSummaryError {
  error: string;
  /** Machine-readable code so the UI can branch */
  code: "no_tenant" | "no_dt_mz" | "upstream" | "config" | "unauthorized" | "not_found";
}

export type DtSummaryResponse = DtSummary | DtSummaryError;

/* ── Phase 2: metric series + entities ─────────────────────────── */

export type DtEntityType = "HOST" | "SERVICE" | "DATABASE" | "CLUSTER" | "SAP_SYSTEM";

export interface DtEntity {
  id: string;
  displayName: string;
  type: DtEntityType;
  /** Cloud + region/zone for the side label */
  cloud?: string;
  region?: string;
  /** Health: true = healthy, false = degraded, null = unknown */
  ok: boolean | null;
  /** One-line state — e.g. "All synthetic checks passing" */
  state: string;
  /** 24-point recent CPU/usage sparkline (0–100) */
  sparkline: number[];
  /** Open problem count attributed to this entity */
  openProblems: number;
}

/** Single point in a time series. `t` is epoch ms. */
export interface DtSeriesPoint {
  t: number;
  v: number;
}

export interface DtSeries {
  metricSelector: string;
  /** Human label, e.g. "CPU usage" */
  label: string;
  /** Y-axis unit suffix, e.g. "%", "ms", "req/s" */
  unit: string;
  /** Entity binding this series belongs to */
  entityId: string;
  /** Series points, oldest → newest */
  points: DtSeriesPoint[];
  /** Pre-computed: latest value, formatted with unit */
  latest: string;
  /** % delta vs first point — positive means up */
  deltaPct: number;
  /** Health hint for line color (true=green, false=red, null=cyan) */
  ok: boolean | null;
}

export interface DtMetricsResponse {
  source: "mock" | "live";
  generatedAt: string;
  tenant: DtSummary["tenant"];
  series: DtSeries[];
}

export interface DtEntitiesResponse {
  source: "mock" | "live";
  generatedAt: string;
  tenant: DtSummary["tenant"];
  entities: DtEntity[];
}
