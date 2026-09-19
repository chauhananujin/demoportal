"use client";
import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTenants } from "@/lib/onboarding/tenant-context";
import { useDynatraceSummary } from "@/lib/dynatrace/use-dynatrace-summary";
import { useDynatraceEntities } from "@/lib/dynatrace/use-dynatrace-entities";
import type { AlertKind, DtEntity } from "@/lib/dynatrace/types";

const ALERT_KIND_TO_CHIP: Record<AlertKind, "ok" | "warn" | "info"> = {
  RESOLVED: "ok",
  INVESTIGATING: "warn",
  DEPLOYED: "info",
  HEALTHY: "ok",
};

const chipColors: Record<string, string> = {
  ok:   "bg-green-500/15 text-green-400",
  warn: "bg-yellow-400/15 text-yellow-300",
  info: "bg-brand-primary/20 text-brand-accent",
};

const metricValueColor = (ok: boolean | null) =>
  ok === true ? "text-green-400" : ok === false ? "text-yellow-300" : "text-white";

/* ── Capabilities (adapted from Dynatrace Infrastructure Observability) ─ */

const capabilities = [
  {
    title: "AI-Powered Intelligence",
    body:  "Causal AI continuously analyzes every host, container, and service — pinpointing root cause with precise, explainable answers and zero false-positive alert fatigue.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 4l3.6 8.4L28 16l-8.4 3.6L16 28l-3.6-8.4L4 16l8.4-3.6L16 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Unified Grail Datastore",
    body:  "Schema-free, tiered-storage-free retention for logs, metrics, traces, and events — query any signal in context without manually tagging anything.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="16" cy="9" rx="11" ry="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 9v7c0 2.2 4.9 4 11 4s11-1.8 11-4V9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 16v7c0 2.2 4.9 4 11 4s11-1.8 11-4v-7" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "AutomationEngine",
    body:  "Auto-remediation, ServiceNow / Jira ticket creation, and live CMDB updates triggered by any signal — wired to your existing change-control workflow.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Log Monitoring & Analytics",
    body:  "Observability, security, and business analytics together in one query layer — at a fraction of the storage cost of legacy SIEM/APM stacks.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="22" height="22" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 11h14M9 16h10M9 21h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Continuous Discovery",
    body:  "Hosts, VMs, containers, network, virtualization, services — automatically mapped end-to-end. No agent-by-agent configuration as your estate changes.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 5v3M16 24v3M5 16h3M24 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Platform Extensibility",
    body:  "Hundreds of pre-built extensions for SAP, Kubernetes, hyperscaler services, network gear, and message bus — plus an API for custom collectors.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="18" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="5" y="18" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M22.5 18v9M18 22.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const stats = [
  { number: "40%", label: "Operations productivity gain from AI-driven insights" },
  { number: "60%", label: "Fewer major outages and service degradations" },
  { number: "90%", label: "Improvement in mean time to recovery (MTTR)" },
];

const integrations = [
  "Kubernetes", "AWS", "Azure", "GCP", "VMware", "OpenShift",
  "SAP HANA", "S/4HANA", "PostgreSQL", "Kafka", "ServiceNow", "Jira",
];

/* ── Sparkline ───────────────────────────────────────────────────────── */

function Sparkline({ points }: { points: number[] }) {
  // Defensive: bail out if no points yet (loading state)
  if (!points || points.length === 0) {
    return <svg viewBox="0 0 100 32" className="w-full h-10" />;
  }
  // Caller passes 24 values in [0, 100]. We invert the y-axis (SVG y grows
  // downward) so higher numbers = visually higher on the chart.
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * 100},${32 - (p / 100) * 32}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-10">
      <path d={path} stroke="currentColor" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function StaleBadge({ lastFetched }: { lastFetched: number | null }) {
  if (!lastFetched) return null;
  const seconds = Math.floor((Date.now() - lastFetched) / 1000);
  if (seconds < 45) return null;
  return (
    <span className="font-mono text-[10px] uppercase tracking-wide text-yellow-300 border border-yellow-400/30 bg-yellow-400/10 rounded-full px-2 py-0.5">
      Stale · {seconds}s
    </span>
  );
}

export default function MonitoringPage() {
  // Pick the most recently created active tenant as the scope target. In a
  // production deployment the user would explicitly select which tenant
  // they're viewing; for the demo we just take the newest one.
  const { tenants } = useTenants();
  const activeTenant = useMemo(() => {
    const sorted = [...tenants].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted[0] ?? null;
  }, [tenants]);

  const { data, error, loading, lastFetched } = useDynatraceSummary(activeTenant);

  // Map sparkline colour to metric health
  const metricSparkColor = (ok: boolean | null) =>
    ok === false ? "text-yellow-300/70" : ok === true ? "text-green-400/70" : "text-brand-accent/60";

  return (
    <div className="px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase text-brand-accent mb-2">
            Observability
          </p>
          <h1 className="text-2xl font-semibold text-white">Monitoring</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Automatic, AI-powered infrastructure observability across hybrid and cloud environments —
            with precise root-cause answers and auto-remediation wired into your change workflow.
          </p>
        </div>
        <Link
          href="/portal/tickets"
          className="text-sm bg-brand-primary hover:bg-brand-accent text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Open observability ticket
        </Link>
      </div>

      {/* Live console */}
      <section className="bg-brand-surface border border-white/8 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
              Ascelios — Observability Plane
              {data && (
                <>
                  <span className="text-slate-700 mx-2">·</span>
                  <span className="text-slate-400">{data.tenant.managementZoneName}</span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StaleBadge lastFetched={lastFetched} />
            {data?.source === "mock" && (
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500 border border-white/10 rounded-full px-2 py-0.5">
                Mock data
              </span>
            )}
            <span className={cn(
              "flex items-center gap-1.5 font-mono text-[10px]",
              error ? "text-red-400" : "text-green-400",
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                error ? "bg-red-400" : "bg-green-400 shadow-[0_0_6px_#4ade80]",
              )} />
              {error ? "Offline" : `Live · ${data?.metrics.find((m) => m.key === "events")?.value ?? "—"} ev/s`}
            </span>
          </div>
        </div>

        {/* Empty / loading / error states */}
        {!activeTenant && (
          <div className="border border-dashed border-white/10 rounded-lg p-8 text-center">
            <p className="text-slate-300 text-sm mb-1">No tenant selected.</p>
            <p className="text-slate-500 text-xs mb-4">Run the onboarding flow to provision a tenant — observability data scopes to its Management Zone.</p>
            <Link
              href="/onboarding"
              className="inline-block text-xs bg-brand-primary hover:bg-brand-accent text-white font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Start onboarding →
            </Link>
          </div>
        )}

        {activeTenant && loading && !data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-lg p-3">
                <div className="h-3 w-16 bg-white/10 rounded mb-2 animate-pulse" />
                <div className="h-6 w-20 bg-white/10 rounded mb-3 animate-pulse" />
                <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {activeTenant && error && !data && (
          <div className="border border-red-400/20 bg-red-400/5 rounded-lg p-4 text-sm text-red-300">
            <p className="font-medium mb-1">Couldn&apos;t reach the observability plane.</p>
            <p className="text-xs text-red-300/80 font-mono">{error.code}: {error.error}</p>
          </div>
        )}

        {/* Metrics grid */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {data.metrics.map((m) => (
              <div key={m.key} className="bg-white/5 border border-white/8 rounded-lg p-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">{m.label}</p>
                <p className={cn("text-xl font-semibold leading-none mb-2", metricValueColor(m.ok))}>{m.value}</p>
                <div className={cn("h-10", metricSparkColor(m.ok))}>
                  <Sparkline points={m.sparkline} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts */}
        {data && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Recent activity</p>
            <div>
              {data.alerts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-white/6 last:border-0">
                  <span className={cn(
                    "inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded-full",
                    chipColors[ALERT_KIND_TO_CHIP[a.kind]],
                  )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {a.kind}
                  </span>
                  <span className="text-xs text-slate-300 flex-1 leading-snug">{a.text}</span>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Entities (Phase 2) — full inventory of monitored entities */}
      <EntitiesSection tenant={activeTenant} />

      {/* Inside the platform — reference screenshots */}
      <section className="mb-8">
        <div className="mb-4">
          <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Inside the platform</p>
          <h2 className="text-xl font-semibold text-white">Operator workflow, real screens.</h2>
        </div>

        {/* Lead — Monitoring Overview dashboard (full width) */}
        <figure className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden mb-3">
          {/* eslint-disable-next-line @next/next/no-img-center */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/monitoring-overview.png"
            alt="Monitoring Overview dashboard — applications, services, infrastructure, and database panels at a glance"
            loading="lazy"
            className="w-full h-auto block"
          />
          <figcaption className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/8 text-xs flex-wrap">
            <span className="text-slate-300">
              <span className="text-white font-semibold">Monitoring Overview</span> — applications, services, infrastructure, and databases on a single pane of glass.
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">
              Ascelios console
            </span>
          </figcaption>
        </figure>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Reference — Problems detail */}
          <figure className="lg:col-span-2 bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dynatrace-overview.webp"
              alt="Dynatrace Problems detail — affected entities, impact, root cause, and automated remediation"
              width={1440}
              height={810}
              loading="lazy"
              className="w-full h-auto block"
            />
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/8 text-xs flex-wrap">
              <span className="text-slate-300">
                <span className="text-white font-semibold">Problem detail</span> — impact, root cause, and auto-remediation in one view.
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Source: Dynatrace
              </span>
            </figcaption>
          </figure>

          {/* Secondary — Smartscape topology */}
          <figure className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dynatrace-smartscape.webp"
              alt="Smartscape on Grail — automatic, real-time topology of every service and dependency"
              width={1600}
              height={899}
              loading="lazy"
              className="w-full h-auto block"
            />
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/8 text-xs flex-wrap">
              <span className="text-slate-300">
                <span className="text-white font-semibold">Smartscape topology</span> — live dependency map.
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Source: Dynatrace
              </span>
            </figcaption>
          </figure>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 max-w-3xl">
          Screenshots from Dynatrace&apos;s product UI shown for reference — Dynatrace is the underlying observability platform Ascelios operates on your behalf. © Dynatrace LLC.
        </p>
      </section>

      {/* Capabilities */}
      <section className="mb-8">
        <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Capabilities</p>
        <h2 className="text-xl font-semibold text-white mb-5">Everything you need to run with confidence.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="bg-brand-surface border border-white/8 rounded-xl p-5 hover:border-brand-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-accent flex items-center justify-center mb-4">
                {c.icon}
              </div>
              <h3 className="text-white text-sm font-semibold mb-1.5">{c.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud-native deep integrations — AWS + Azure SAP observability */}
      <section className="mb-8">
        <div className="mb-5">
          <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Cloud-native observability</p>
          <h2 className="text-xl font-semibold text-white">Depth where you run.</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            On top of the platform-level capabilities, we wire in the cloud provider&apos;s own first-party SAP observability so you keep parity with native tooling and don&apos;t lose features in the abstraction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* AWS card */}
          <article className="bg-brand-surface border border-white/8 rounded-xl p-5 flex flex-col">
            <header className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-orange-400/10 border border-orange-400/30 text-orange-300 font-mono text-[10px] font-bold tracking-wider">
                  AWS
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">AWS for SAP</p>
                  <h3 className="text-white font-semibold text-base leading-tight">End-to-End Observability for SAP on AWS</h3>
                </div>
              </div>
            </header>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              A layered observability strategy across application, database, network, and user experience — using AWS-native services tuned for SAP HANA, NetWeaver, and SAP Fiori workloads.
            </p>
            <ul className="space-y-2.5 mb-5 flex-1">
              {[
                { title: "CloudWatch Application Insights", desc: "Pre-built monitors for SAP HANA and SAP NetWeaver — automated detection of common failure modes." },
                { title: "CloudWatch RUM", desc: "Real-user monitoring for SAP Fiori — page load, errors, and journey performance from the browser." },
                { title: "CloudWatch Internet Monitor", desc: "ISP-level network latency tracking between users and SAP endpoints, by city/ASN." },
                { title: "Compute Optimizer + SLOs", desc: "Right-size HANA hosts continuously; define SLOs and burn-rate alerts on SAP workloads." },
                { title: "Amazon Q CLI + MCP Servers", desc: "Natural-language root-cause analysis across metrics, traces, logs, and Athena queries." },
              ].map((b) => (
                <li key={b.title} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-300/80 mt-1 shrink-0">›</span>
                  <span>
                    <span className="text-slate-200 font-medium">{b.title}</span>
                    <span className="text-slate-400"> — {b.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            <footer className="pt-4 border-t border-white/8 flex items-center justify-between gap-3 text-xs flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-widest text-orange-300/70">
                MTTR: days → minutes
              </span>
              <a
                href="https://aws.amazon.com/blogs/awsforsap/end-to-end-observability-for-sap-on-aws-part-1-overview/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-300 hover:text-orange-200 border-b border-orange-300/40 hover:border-orange-200 pb-px"
              >
                AWS docs →
              </a>
            </footer>
          </article>

          {/* Azure card */}
          <article className="bg-brand-surface border border-white/8 rounded-xl p-5 flex flex-col">
            <header className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-sky-400/10 border border-sky-400/30 text-sky-300 font-mono text-[10px] font-bold tracking-wider">
                  AZURE
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Microsoft Azure for SAP</p>
                  <h3 className="text-white font-semibold text-base leading-tight">Azure Monitor for SAP solutions (AMS)</h3>
                </div>
              </div>
            </header>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              First-party AMS providers stream telemetry from every layer of the SAP stack into a shared Log Analytics workspace — queryable from Workbooks, Sentinel, and your own dashboards.
            </p>
            <ul className="space-y-2.5 mb-5 flex-1">
              {[
                { title: "SAP NetWeaver provider", desc: "Dispatcher / ICM / Gateway / Message Server / Enqueue / IGS availability + work-process, lock, and queue stats." },
                { title: "SAP HANA provider", desc: "Per-minute pull over the SQL port — host status, system replication, backups, long-running transactions." },
                { title: "Database providers", desc: "Microsoft SQL Server and IBM Db2 providers for AnyDB SAP landscapes." },
                { title: "Pacemaker + Linux OS", desc: "HA cluster state, OS-level metrics for SLES/RHEL for SAP — fail-over visibility without extra agents." },
                { title: "Workbooks + Log Analytics", desc: "Pre-built KQL dashboards; alert via Azure Monitor Action Groups; integrate with Sentinel for security correlation." },
              ].map((b) => (
                <li key={b.title} className="flex items-start gap-2 text-sm">
                  <span className="text-sky-300/80 mt-1 shrink-0">›</span>
                  <span>
                    <span className="text-slate-200 font-medium">{b.title}</span>
                    <span className="text-slate-400"> — {b.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            <footer className="pt-4 border-t border-white/8 flex items-center justify-between gap-3 text-xs flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-widest text-sky-300/70">
                Native Azure billing · pay-as-you-go
              </span>
              <a
                href="https://learn.microsoft.com/en-us/azure/sap/monitor/about-azure-monitor-sap-solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-300 hover:text-sky-200 border-b border-sky-300/40 hover:border-sky-200 pb-px"
              >
                Microsoft Learn →
              </a>
            </footer>
          </article>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 max-w-3xl">
          We operate both alongside the Dynatrace platform — provider-native data flows into Dynatrace Grail for unified queries, and you keep direct access to AWS / Azure consoles for hyperscaler-specific tooling.
        </p>
      </section>

      {/* Outcomes / stat band */}
      <section className="bg-brand-surface border border-white/8 rounded-xl p-6 mb-8">
        <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Outcomes you can measure</p>
        <h2 className="text-xl font-semibold text-white mb-6">What customers see in the first 90 days.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/8 border border-white/8 rounded-lg overflow-hidden">
          {stats.map((s) => (
            <div key={s.number} className="bg-white/4 px-6 py-6">
              <p className="text-4xl font-semibold tracking-tight leading-none mb-2">
                <span className="text-brand-accent">{s.number}</span>
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="mb-8">
        <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Stacks we watch</p>
        <h2 className="text-xl font-semibold text-white mb-4">Coverage out of the box.</h2>
        <div className="flex flex-wrap gap-2">
          {integrations.map((i) => (
            <span
              key={i}
              className="inline-flex items-center font-mono text-xs text-slate-300 border border-white/15 rounded-full px-3 py-1.5 bg-white/3"
            >
              {i}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 max-w-2xl">
          Plus 600+ extensions from Dynatrace Hub for SAP modules, hyperscaler PaaS services,
          message bus, network gear, and security platforms. Need a custom collector? Tell us via a ticket.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-brand-bg border border-brand-primary/30 rounded-xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-white text-sm font-semibold mb-1">Need to onboard a new workload?</p>
          <p className="text-xs text-slate-400">Open an observability ticket and we'll get your stack on the platform within the same business day.</p>
        </div>
        <Link
          href="/portal/tickets"
          className="text-sm bg-brand-primary hover:bg-brand-accent text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Request onboarding →
        </Link>
      </section>
    </div>
  );
}

/* ── Entities section (Phase 2) ─────────────────────────────────────── */

const ENTITY_TYPE_COLORS: Record<string, string> = {
  HOST:       "text-sky-400 border-sky-400/30 bg-sky-400/10",
  CLUSTER:    "text-violet-400 border-violet-400/30 bg-violet-400/10",
  SERVICE:    "text-teal-400 border-teal-400/30 bg-teal-400/10",
  DATABASE:   "text-amber-400 border-amber-400/30 bg-amber-400/10",
  SAP_SYSTEM: "text-brand-accent border-brand-accent/30 bg-brand-accent/10",
};

function EntitySpark({ points, ok }: { points: number[]; ok: boolean | null }) {
  if (!points || points.length === 0) return null;
  const stroke = ok === false ? "#fbbf24" : ok === true ? "#34d399" : "#06b6d4";
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * 100},${32 - (p / 100) * 32}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-8">
      <path d={path} stroke={stroke} strokeWidth="1.4" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function EntityRow({ entity }: { entity: DtEntity }) {
  const typeStyle = ENTITY_TYPE_COLORS[entity.type] ?? "text-slate-400 border-slate-400/30 bg-slate-400/10";
  const dot = entity.ok === false ? "bg-yellow-300" : entity.ok === true ? "bg-emerald-400" : "bg-sky-400";
  return (
    <Link
      href={`/portal/monitoring/${encodeURIComponent(entity.id)}`}
      className="group grid grid-cols-12 items-center gap-3 px-3 py-3 border-b border-white/6 last:border-0 hover:bg-white/3 transition-colors"
    >
      <div className="col-span-4 min-w-0 flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full shrink-0", dot, entity.ok === true ? "shadow-[0_0_6px_#34d399]" : "")} />
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate group-hover:text-brand-accent transition-colors">{entity.displayName}</p>
          <p className="font-mono text-[10px] text-slate-500 truncate">{entity.id}</p>
        </div>
      </div>
      <div className="col-span-2">
        <span className={cn("font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border", typeStyle)}>
          {entity.type.replace("_", " ")}
        </span>
      </div>
      <div className="col-span-2 hidden md:block text-xs text-slate-400 truncate">
        {entity.cloud} · {entity.region}
      </div>
      <div className="col-span-3 hidden lg:block">
        <EntitySpark points={entity.sparkline} ok={entity.ok} />
      </div>
      <div className="col-span-1 text-right">
        {entity.openProblems > 0 ? (
          <span className="inline-flex items-center font-mono text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300">
            {entity.openProblems} open
          </span>
        ) : (
          <span className="font-mono text-[10px] text-slate-600">—</span>
        )}
      </div>
    </Link>
  );
}

function EntitiesSection({ tenant }: { tenant: ReturnType<typeof useTenants>["tenants"][number] | null }) {
  const { data, loading, error } = useDynatraceEntities(tenant);
  if (!tenant) return null;

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Inventory</p>
          <h2 className="text-xl font-semibold text-white">Monitored entities.</h2>
        </div>
        {data && (
          <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
            {data.entities.length} entities · scoped to {data.tenant.managementZoneName}
          </span>
        )}
      </div>

      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-3 px-3 py-2 border-b border-white/8 bg-white/3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          <div className="col-span-4">Entity</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2 hidden md:block">Cloud / Region</div>
          <div className="col-span-3 hidden lg:block">Load · last hour</div>
          <div className="col-span-1 text-right">Problems</div>
        </div>

        {loading && !data && (
          <div className="p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="h-3 w-40 bg-white/10 rounded animate-pulse" />
                <div className="ml-auto h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {error && !data && (
          <div className="p-6 text-sm text-red-300 bg-red-400/5">
            Couldn&apos;t load entities. <span className="font-mono text-xs">{error.code}: {error.error}</span>
          </div>
        )}

        {data?.entities.map((e) => <EntityRow key={e.id} entity={e} />)}
      </div>
    </section>
  );
}
