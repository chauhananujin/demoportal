"use client";
import Link from "next/link";
import { useMemo } from "react";
import { use } from "react";
import { cn } from "@/lib/utils";
import { useTenants } from "@/lib/onboarding/tenant-context";
import { useDynatraceEntities } from "@/lib/dynatrace/use-dynatrace-entities";
import { useDynatraceMetrics } from "@/lib/dynatrace/use-dynatrace-metrics";
import { dynatraceUiEntityUrl, isLiveDynatraceEnv } from "@/lib/dynatrace/deep-link";
import { AreaChart } from "@/components/portal/area-chart";

const HOST_METRIC_SELECTORS = [
  "builtin:host.cpu.usage",
  "builtin:host.mem.usage",
  "builtin:host.disk.usedPct",
  "builtin:service.requestCount.total",
];

const SERVICE_METRIC_SELECTORS = [
  "builtin:service.response.time",
  "builtin:service.requestCount.total",
  "builtin:service.errors.total",
  "builtin:host.cpu.usage",
];

const ENTITY_TYPE_COLORS: Record<string, string> = {
  HOST:       "text-sky-400 border-sky-400/30 bg-sky-400/10",
  CLUSTER:    "text-violet-400 border-violet-400/30 bg-violet-400/10",
  SERVICE:    "text-teal-400 border-teal-400/30 bg-teal-400/10",
  DATABASE:   "text-amber-400 border-amber-400/30 bg-amber-400/10",
  SAP_SYSTEM: "text-brand-accent border-brand-accent/30 bg-brand-accent/10",
};

interface PageProps {
  params: Promise<{ entityId: string }>;
}

export default function EntityDetailPage({ params }: PageProps) {
  const { entityId } = use(params);
  const decodedId = decodeURIComponent(entityId);

  // Pick the same active tenant as the monitoring index does.
  const { tenants } = useTenants();
  const activeTenant = useMemo(() => {
    const sorted = [...tenants].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted[0] ?? null;
  }, [tenants]);

  // Look up the entity definition via the entities endpoint
  const { data: entitiesData, loading: entitiesLoading } = useDynatraceEntities(activeTenant);
  const entity = entitiesData?.entities.find((e) => e.id === decodedId) ?? null;

  // Choose metric selectors based on entity type
  const selectors = useMemo(() => {
    if (!entity) return HOST_METRIC_SELECTORS;
    return entity.type === "SERVICE" || entity.type === "DATABASE"
      ? SERVICE_METRIC_SELECTORS
      : HOST_METRIC_SELECTORS;
  }, [entity]);

  const { data: metricsData, loading: metricsLoading, error: metricsError } = useDynatraceMetrics(
    activeTenant,
    decodedId,
    selectors,
  );

  // ── Render guards ──
  if (!activeTenant) {
    return (
      <div className="px-8 py-12 max-w-3xl">
        <h1 className="text-2xl font-semibold text-white mb-2">No tenant selected</h1>
        <p className="text-sm text-slate-400 mb-6">Onboard a tenant to view entity telemetry.</p>
        <Link href="/onboarding" className="text-sm bg-brand-primary hover:bg-brand-accent text-white font-medium px-4 py-2 rounded-lg transition-colors">
          Start onboarding →
        </Link>
      </div>
    );
  }

  if (entitiesLoading && !entitiesData) {
    return (
      <div className="px-8 py-12 max-w-6xl">
        <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-4" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0,1,2,3].map((i) => (
            <div key={i} className="bg-brand-surface border border-white/8 rounded-xl p-5 h-56 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="px-8 py-12 max-w-3xl">
        <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Not found</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Entity not in this tenant</h1>
        <p className="text-sm text-slate-400 mb-2 font-mono">{decodedId}</p>
        <p className="text-sm text-slate-400 mb-6">This entity isn't part of the Management Zone we just queried. It may have been retired, or you may be scoped to a different tenant.</p>
        <Link href="/portal/monitoring" className="text-sm bg-brand-primary hover:bg-brand-accent text-white font-medium px-4 py-2 rounded-lg transition-colors">
          ← Back to monitoring
        </Link>
      </div>
    );
  }

  const dot = entity.ok === false ? "bg-yellow-300" : entity.ok === true ? "bg-emerald-400" : "bg-sky-400";
  const typeStyle = ENTITY_TYPE_COLORS[entity.type] ?? "text-slate-400 border-slate-400/30 bg-slate-400/10";

  return (
    <div className="px-8 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <Link
        href="/portal/monitoring"
        className="inline-flex items-center text-xs text-slate-500 hover:text-white mb-4 transition-colors"
      >
        ← Back to monitoring
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className={cn(
              "w-3 h-3 rounded-full shrink-0",
              dot,
              entity.ok === true && "shadow-[0_0_8px_#34d399]",
            )} />
            <h1 className="text-2xl font-semibold text-white">{entity.displayName}</h1>
            <span className={cn(
              "font-mono text-[11px] uppercase tracking-wide px-2 py-1 rounded-full border",
              typeStyle,
            )}>
              {entity.type.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {entity.cloud} · {entity.region} · <span className="font-mono text-[12px]">{entity.id}</span>
          </p>
          <p className="text-sm text-slate-300 mt-2">{entity.state}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {entity.openProblems > 0 && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-yellow-300 border border-yellow-400/30 bg-yellow-400/10 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              {entity.openProblems} open problem{entity.openProblems === 1 ? "" : "s"}
            </span>
          )}
          <a
            href={dynatraceUiEntityUrl(entity.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs bg-brand-primary hover:bg-brand-accent text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            View in Dynatrace
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M4 2h6v6M10 2L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </a>
          {!isLiveDynatraceEnv() && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-600">
              opens Dynatrace docs · mock mode
            </span>
          )}
        </div>
      </div>

      {/* Charts grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {metricsLoading && !metricsData && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-brand-surface border border-white/8 rounded-xl p-5 h-56 animate-pulse" />
        ))}

        {metricsError && !metricsData && (
          <div className="md:col-span-2 border border-red-400/20 bg-red-400/5 rounded-xl p-5 text-sm text-red-300">
            Couldn&apos;t fetch metrics. <span className="font-mono text-xs">{metricsError.code}: {metricsError.error}</span>
          </div>
        )}

        {metricsData?.series.map((s) => {
          const tone = s.ok === false ? "warn" : s.ok === true ? "good" : "neutral";
          const deltaSign = s.deltaPct > 0 ? "+" : "";
          const deltaColor = s.deltaPct > 0
            ? (tone === "good" ? "text-emerald-400" : "text-yellow-300")
            : s.deltaPct < 0
            ? (tone === "warn" ? "text-emerald-400" : "text-slate-400")
            : "text-slate-500";

          return (
            <div key={s.metricSelector} className="bg-brand-surface border border-white/8 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-semibold text-white leading-none">{s.latest}</p>
                </div>
                <span className={cn("font-mono text-[11px]", deltaColor)}>
                  {deltaSign}{s.deltaPct}%
                </span>
              </div>
              <AreaChart points={s.points} unit={s.unit} tone={tone} height={140} />
              <p className="font-mono text-[10px] text-slate-600 mt-2 truncate">{s.metricSelector}</p>
            </div>
          );
        })}
      </section>

      {/* Quick context — entity 24h sparkline + meta */}
      <section className="bg-brand-surface border border-white/8 rounded-xl p-5 mb-8">
        <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-3">Recent load · last 24 points</p>
        <div className="h-12">
          {/* Reuse spark from inventory sparkline shape (0–100 array) */}
          <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full">
            <path
              d={entity.sparkline
                .map((p, i) => `${i === 0 ? "M" : "L"}${(i / (entity.sparkline.length - 1)) * 100},${32 - (p / 100) * 32}`)
                .join(" ")}
              stroke={entity.ok === false ? "#fbbf24" : entity.ok === true ? "#34d399" : "#06b6d4"}
              strokeWidth="1.6"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}
