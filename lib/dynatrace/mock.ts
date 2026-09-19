/**
 * Deterministic mock generator for Dynatrace summary data.
 *
 * Same MZ id → same numbers, every time. This keeps the portal demo
 * stable across reloads while still varying by tenant.
 *
 * When DYNATRACE_MOCK=false, the route handler short-circuits this
 * and goes through dtClient.get() against the real Dynatrace API.
 */
import type {
  AlertKind, DtAlert, DtEntity, DtEntityType, DtMetric, DtSeries,
  DtSeriesPoint, DtSummary,
} from "./types";

/** Tiny seeded PRNG (mulberry32). Deterministic. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fmtCompact(n: number): string {
  if (n >= 1000) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n);
  return n.toString();
}

const ALERT_TEMPLATES: { kind: AlertKind; text: (host: string) => string }[] = [
  { kind: "RESOLVED",      text: (h) => `${h}: node-group memory pressure resolved after autoscale` },
  { kind: "INVESTIGATING", text: (h) => `${h}: p99 query latency above SLO — auto-ticket created` },
  { kind: "DEPLOYED",      text: (h) => `Datasphere collector v3.4 deployed to ${h} — log ingestion +12%` },
  { kind: "HEALTHY",       text: () => "All Kubernetes control planes nominal across 3 regions" },
  { kind: "RESOLVED",      text: (h) => `${h}: disk pressure cleared after volume expansion` },
  { kind: "INVESTIGATING", text: (h) => `${h}: HTTP 5xx rate above baseline — root-cause analysis in progress` },
  { kind: "DEPLOYED",      text: (h) => `OneAgent updated on ${h} — zero downtime` },
  { kind: "HEALTHY",       text: (h) => `${h}: all synthetic checks passing` },
];

const HOST_NAMES = [
  "prod-eks-cluster", "rds-analytics-postgres", "sap-s4-prod-eu",
  "ci-runner-pool", "dev-vm-fleet", "datasphere-edge", "kafka-broker-3",
];

export function generateMockSummary(args: {
  tenantId: string;
  tenantName: string;
  managementZoneId: string;
  managementZoneName: string;
}): DtSummary {
  const seed = hashString(args.managementZoneId);
  const rand = rng(seed);

  const hosts      = 600 + Math.floor(rand() * 1400);
  const containers = 8_000 + Math.floor(rand() * 40_000);
  const problems   = Math.floor(rand() * 6);
  const mttrMin    = 4 + Math.floor(rand() * 20);
  const evPerSec   = 8 + rand() * 30; // 8 – 38 k
  const coverage   = 99.6 + rand() * 0.4; // 99.6 – 100.0

  function sparkline(amplitude: number = 30, trend: number = 0): number[] {
    const points: number[] = [];
    for (let i = 0; i < 24; i++) {
      const noise = (rand() - 0.5) * amplitude;
      const t = 50 + trend * i + noise;
      points.push(Math.max(2, Math.min(98, Math.round(t))));
    }
    return points;
  }

  const metrics: DtMetric[] = [
    { key: "hosts",      label: "Monitored Hosts",   value: fmtCompact(hosts),                ok: null,            sparkline: sparkline(8, 0.4) },
    { key: "containers", label: "Active Containers", value: fmtCompact(containers),           ok: null,            sparkline: sparkline(10, 0.6) },
    { key: "problems",   label: "Open Problems",     value: problems.toString(),              ok: problems === 0 ? true : false, sparkline: sparkline(20, -0.2) },
    { key: "mttr",       label: "MTTR (30d avg)",    value: `${mttrMin} min`,                 ok: mttrMin < 12,    sparkline: sparkline(15, -0.6) },
    { key: "events",     label: "Events / second",   value: `${evPerSec.toFixed(1)} k`,       ok: null,            sparkline: sparkline(25, 0) },
    { key: "coverage",   label: "Coverage",          value: `${coverage.toFixed(2)}%`,        ok: coverage >= 99.9, sparkline: sparkline(2, 0.05) },
  ];

  // Build a mixed feed of ~6 recent activity entries
  const alerts: DtAlert[] = [];
  let minutesAgo = Math.floor(rand() * 30);
  for (let i = 0; i < 6; i++) {
    const tpl = ALERT_TEMPLATES[Math.floor(rand() * ALERT_TEMPLATES.length)];
    const host = HOST_NAMES[Math.floor(rand() * HOST_NAMES.length)];
    minutesAgo += 8 + Math.floor(rand() * 25);
    const d = new Date(Date.now() - minutesAgo * 60_000);
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    alerts.push({
      id: `evt-${seed}-${i}`,
      kind: tpl.kind,
      text: tpl.text(host),
      time,
    });
  }

  return {
    source: "mock",
    generatedAt: new Date().toISOString(),
    tenant: {
      id: args.tenantId,
      name: args.tenantName,
      managementZoneId: args.managementZoneId,
      managementZoneName: args.managementZoneName,
    },
    metrics,
    alerts,
  };
}

/* ── Entities ────────────────────────────────────────────────── */

const ENTITY_TEMPLATES: Array<{
  displayName: string;
  type: DtEntityType;
  cloud: string;
  region: string;
  baseLoad: number;        // 0–100 baseline for the spark
  volatility: number;      // amplitude
  faultProb: number;       // chance of being marked degraded
}> = [
  { displayName: "prod-eks-cluster",      type: "CLUSTER",    cloud: "AWS",   region: "eu-west-1",  baseLoad: 55, volatility: 14, faultProb: 0.15 },
  { displayName: "analytics-postgres",    type: "DATABASE",   cloud: "AWS",   region: "eu-west-1",  baseLoad: 32, volatility: 10, faultProb: 0.30 },
  { displayName: "prod-s4hana-eu",        type: "SAP_SYSTEM", cloud: "Azure", region: "westeurope", baseLoad: 48, volatility: 12, faultProb: 0.10 },
  { displayName: "ci-runner-pool",        type: "HOST",       cloud: "AWS",   region: "us-east-1",  baseLoad: 60, volatility: 18, faultProb: 0.20 },
  { displayName: "dev-vm-fleet",          type: "HOST",       cloud: "Azure", region: "westeurope", baseLoad: 28, volatility:  9, faultProb: 0.05 },
  { displayName: "datasphere-edge",       type: "SERVICE",    cloud: "GCP",   region: "europe-west1", baseLoad: 40, volatility: 11, faultProb: 0.18 },
  { displayName: "kafka-broker-3",        type: "SERVICE",    cloud: "AWS",   region: "us-east-1",  baseLoad: 50, volatility: 13, faultProb: 0.10 },
  { displayName: "vendor-portal-v2",      type: "SERVICE",    cloud: "Azure", region: "westeurope", baseLoad: 36, volatility:  8, faultProb: 0.08 },
];

const STATE_TEMPLATES = {
  ok:    ["All synthetic checks passing", "Operating within SLO", "Nominal", "No active alerts"],
  warn:  ["Latency above baseline", "Memory pressure detected", "Retry rate elevated", "Synthetic check failed once"],
  fault: ["SLO breach — root-cause analysis in progress", "Disk saturation imminent", "Connection pool exhausted"],
};

function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.floor(r * arr.length)];
}

export function generateMockEntities(args: {
  tenantId: string;
  tenantName: string;
  managementZoneId: string;
  managementZoneName: string;
}): DtEntity[] {
  const seed = hashString("entities:" + args.managementZoneId);
  const rand = rng(seed);

  return ENTITY_TEMPLATES.map((tpl, idx) => {
    // Per-entity sub-seed so individual hosts are stable too
    const subSeed = hashString(`${args.managementZoneId}:${tpl.displayName}`);
    const subRand = rng(subSeed);

    const isDegraded = subRand() < tpl.faultProb;
    const isWarn = !isDegraded && subRand() < 0.15;
    const ok: boolean | null = isDegraded ? false : isWarn ? null : true;
    const state = isDegraded ? pick(STATE_TEMPLATES.fault, subRand())
      : isWarn ? pick(STATE_TEMPLATES.warn, subRand())
      : pick(STATE_TEMPLATES.ok, subRand());

    const sparkline: number[] = [];
    for (let i = 0; i < 24; i++) {
      const noise = (subRand() - 0.5) * tpl.volatility;
      const v = tpl.baseLoad + noise + (isDegraded ? 18 : 0);
      sparkline.push(Math.max(2, Math.min(98, Math.round(v))));
    }

    const openProblems = isDegraded ? 1 + Math.floor(rand() * 3) : 0;

    return {
      id: `HOST-${tpl.displayName.replace(/[^a-z0-9]/gi, "").toUpperCase()}-${idx}`,
      displayName: tpl.displayName,
      type: tpl.type,
      cloud: tpl.cloud,
      region: tpl.region,
      ok,
      state,
      sparkline,
      openProblems,
    };
  });
}

/* ── Metric series ───────────────────────────────────────────── */

interface MetricShape {
  label: string;
  unit: string;
  /** Where the series mostly sits (0 → 100 axis) */
  base: number;
  /** Random amplitude on top of base */
  amplitude: number;
  /** Linear trend per point (positive = climbing) */
  trend: number;
  /** "true" means low is good (response time, errors); "false" means high is good (throughput, coverage) */
  lowIsGood: boolean;
}

const METRIC_SHAPES: Record<string, MetricShape> = {
  "builtin:host.cpu.usage":          { label: "CPU usage",       unit: "%",    base: 48, amplitude: 18, trend: 0.2, lowIsGood: true  },
  "builtin:host.mem.usage":          { label: "Memory usage",    unit: "%",    base: 62, amplitude: 12, trend: 0.1, lowIsGood: true  },
  "builtin:host.disk.usedPct":       { label: "Disk used",       unit: "%",    base: 71, amplitude:  4, trend: 0.05, lowIsGood: true  },
  "builtin:service.response.time":   { label: "Response time",   unit: "ms",   base: 38, amplitude: 22, trend: -0.4, lowIsGood: true  },
  "builtin:service.requestCount.total": { label: "Throughput",   unit: "req/s", base: 56, amplitude: 28, trend:  0.6, lowIsGood: false },
  "builtin:service.errors.total":    { label: "Error rate",      unit: "%",    base:  6, amplitude:  5, trend: -0.1, lowIsGood: true  },
};

const DEFAULT_SHAPE: MetricShape = {
  label: "Metric", unit: "", base: 50, amplitude: 15, trend: 0, lowIsGood: true,
};

export function generateMockSeries(args: {
  managementZoneId: string;
  metricSelector: string;
  entityId: string;
  /** Number of points; default 60 (1-minute resolution × 1h) */
  points?: number;
  /** Resolution in seconds between points; default 60 */
  resolutionSec?: number;
}): DtSeries {
  const pointCount = args.points ?? 60;
  const resolution = args.resolutionSec ?? 60;

  const shape = METRIC_SHAPES[args.metricSelector] ?? DEFAULT_SHAPE;
  const seed = hashString(`${args.managementZoneId}:${args.entityId}:${args.metricSelector}`);
  const rand = rng(seed);

  const now = Date.now();
  const points: DtSeriesPoint[] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = now - (pointCount - 1 - i) * resolution * 1000;
    const noise = (rand() - 0.5) * shape.amplitude * 2;
    const v = Math.max(0, shape.base + shape.trend * i + noise);
    points.push({ t, v: Math.round(v * 100) / 100 });
  }

  // Pre-compute display values
  const latestVal = points[points.length - 1].v;
  const firstVal  = points[0].v;
  const deltaPct  = firstVal === 0 ? 0 : ((latestVal - firstVal) / firstVal) * 100;

  // Health hint: above 75 is bad for low-is-good metrics
  let ok: boolean | null = null;
  if (shape.unit === "%") {
    ok = shape.lowIsGood ? latestVal < 75 : latestVal > 25;
  } else if (shape.lowIsGood) {
    // For ms / errors / etc., flag red if trend is climbing > 20%
    ok = deltaPct < 20;
  }

  const fmtLatest = shape.unit === "%"
    ? `${latestVal.toFixed(1)}%`
    : shape.unit === "ms"
    ? `${Math.round(latestVal)} ms`
    : `${latestVal.toFixed(1)} ${shape.unit}`.trim();

  return {
    metricSelector: args.metricSelector,
    label: shape.label,
    unit: shape.unit,
    entityId: args.entityId,
    points,
    latest: fmtLatest,
    deltaPct: Math.round(deltaPct * 10) / 10,
    ok,
  };
}
