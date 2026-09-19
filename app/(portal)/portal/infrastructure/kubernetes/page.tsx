"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useTickets } from "@/lib/tickets/ticket-context";
import { Button } from "@/components/ui/button";
import {
  clustersOverview,
  fleetStats,
  fleetIssues,
  seededSeries,
  type ClusterOverview,
  type Environment,
} from "@/lib/portal/kubernetes";
import type { Ticket, TicketStatus } from "@/lib/tickets/types";

const TREND_COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#94a3b8"];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

/* ── Usage bar (CPU / Memory) ─────────────────────────────── */

function UsageBar({ pct }: { pct: number }) {
  const hot = pct >= 80;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden shrink-0">
        <div className={`h-full ${hot ? "bg-amber-400" : "bg-brand-accent"}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className={`font-mono text-xs ${hot ? "text-amber-400" : "text-slate-300"}`}>{pct}%</span>
    </div>
  );
}

/* ── Fleet trend chart (memory utilization by cluster) ───── */

function FleetTrendChart({ clusters }: { clusters: ClusterOverview[] }) {
  const series = clusters.map((c, i) => ({
    id: c.id,
    label: c.name,
    color: TREND_COLORS[i % TREND_COLORS.length],
    data: seededSeries(`${c.id}-mem-trend`, c.memoryPercent),
  }));
  const n = series[0]?.data.length ?? 24;
  const W = 900, H = 220, padL = 34, padB = 24, padT = 10, padR = 12;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xFor = (i: number) => padL + (i / (n - 1)) * plotW;
  const yFor = (v: number) => padT + plotH - (v / 100) * plotH;
  const xTicks = [0, Math.round((n - 1) * 0.25), Math.round((n - 1) * 0.5), Math.round((n - 1) * 0.75), n - 1];
  const xLabels = ["00:00", "06:00", "12:00", "18:00", "24:00"];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} aria-hidden="true">
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={padL} y1={yFor(v)} x2={W - padR} y2={yFor(v)} stroke="#fff" strokeOpacity="0.06" />
            <text x={padL - 8} y={yFor(v) + 3} textAnchor="end" fontSize="10" fill="#64748b">{v}%</text>
          </g>
        ))}
        <line x1={padL} y1={yFor(80)} x2={W - padR} y2={yFor(80)} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity="0.6" />
        <text x={padL + 4} y={yFor(80) - 5} fontSize="10" fill="#f59e0b">Warning 80%</text>
        {series.map((s) => {
          const d = s.data.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).join(" ");
          return <path key={s.id} d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />;
        })}
        {xTicks.map((i, idx) => (
          <text key={i} x={xFor(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#64748b">{xLabels[idx]}</text>
        ))}
      </svg>
      <div className="flex items-center gap-5 flex-wrap mt-2 px-1">
        {series.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-slate-400 font-mono">{s.label}</span>
            <span className="text-white font-mono">{s.data[s.data.length - 1]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Recent changes (derived from real tickets) ──────────── */

const TICKET_STATUS_UI: Record<TicketStatus, { icon: "check" | "clock" | "x"; color: string; label: string }> = {
  approved: { icon: "check", color: "text-emerald-400", label: "Completed" },
  pending_manager: { icon: "clock", color: "text-amber-400", label: "Pending approval" },
  pending_admin: { icon: "clock", color: "text-amber-400", label: "Pending approval" },
  rejected: { icon: "x", color: "text-red-400", label: "Rejected" },
};

function ChangeIcon({ icon, color }: { icon: "check" | "clock" | "x"; color: string }) {
  return (
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${color} border-current/30 bg-current/10`}>
      {icon === "check" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.2 2.2L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {icon === "clock" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M5 2.7V5l1.6 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
      {icon === "x" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function KubernetesFleetPage() {
  const { user } = useAuth();
  const showCost = user?.role !== "user";
  const router = useRouter();
  const { tickets } = useTickets();
  const [tab, setTab] = useState<"all" | Environment>("all");
  const [query, setQuery] = useState("");

  const clusters = useMemo(() => clustersOverview(), []);
  const stats = useMemo(() => fleetStats(), []);
  const issues = useMemo(() => fleetIssues(), []);

  const visible = clusters.filter(
    (c) => (tab === "all" || c.environment === tab) && c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const recentChanges = useMemo(
    () =>
      [...tickets]
        .filter((t): t is Ticket => t.type === "infra-operation")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [tickets],
  );

  return (
    <div className="px-8 py-8">
      {/* Breadcrumb + title */}
      <Link href="/portal/infrastructure" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors mb-4">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Infrastructure
      </Link>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Your Kubernetes Fleet</h1>
          <p className="text-slate-500 text-sm mt-1">
            {stats.clusters} cluster{stats.clusters === 1 ? "" : "s"} across {new Set(clusters.map((c) => c.region)).size} regions
          </p>
        </div>
        <Link href="/portal/infrastructure/new">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white text-sm">+ Request New Cluster</Button>
        </Link>
      </div>

      {/* Health at a glance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Clusters</p>
          <p className="text-xl font-semibold text-white font-mono">{stats.clusters}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-400">{stats.healthy} healthy</span>
            {stats.degraded > 0 && <> · <span className="text-amber-400">{stats.degraded} degraded</span></>}
          </p>
        </div>
        <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Ready Nodes</p>
          <p className="text-xl font-semibold text-white font-mono">{stats.nodesReady}/{stats.nodesTotal}</p>
          {stats.nodesReady < stats.nodesTotal && <p className="text-[11px] text-red-400 mt-1">{stats.nodesTotal - stats.nodesReady} needs attention</p>}
        </div>
        <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Running Pods</p>
          <p className="text-xl font-semibold text-white font-mono">{stats.podsRunning}/{stats.podsTotal}</p>
        </div>
        <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Active Issues</p>
          <p className="text-xl font-semibold text-white font-mono">{stats.totalIssues}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.critical > 0 && <span className="text-red-400">{stats.critical} critical</span>}
            {stats.critical > 0 && stats.warning > 0 && " · "}
            {stats.warning > 0 && <span className="text-amber-400">{stats.warning} warning{stats.warning > 1 ? "s" : ""}</span>}
            {stats.totalIssues === 0 && <span className="text-emerald-400">none</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: clusters table + trend chart */}
        <div className="xl:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h2 className="text-lg font-semibold text-white">Clusters</h2>
              <div className="flex items-center gap-1 bg-white/3 border border-white/8 rounded-lg p-0.5 ml-2">
                {([
                  { id: "all" as const, label: `All clusters (${clusters.length})` },
                  { id: "production" as const, label: `Production (${clusters.filter((c) => c.environment === "production").length})` },
                  { id: "staging" as const, label: `Staging (${clusters.filter((c) => c.environment === "staging").length})` },
                ]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      tab === t.id ? "bg-brand-primary text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter clusters…"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 ml-auto w-full sm:w-48"
              />
            </div>
            <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-left text-xs text-slate-500">
                    <th className="px-4 py-3 font-medium">Cluster</th>
                    <th className="px-4 py-3 font-medium">Health</th>
                    <th className="px-4 py-3 font-medium">Nodes</th>
                    <th className="px-4 py-3 font-medium">CPU</th>
                    <th className="px-4 py-3 font-medium">Memory</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">No clusters match this filter.</td></tr>
                  )}
                  {visible.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/portal/infrastructure/kubernetes/${c.id}`)}
                      className="border-b border-white/6 last:border-0 cursor-pointer hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-white font-mono text-xs">{c.name}</p>
                        <p className="text-slate-500 text-[11px]">{c.region} · {c.environment}{showCost && ` · ${c.cost}`}</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.health === "Healthy" ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M3.5 6l1.7 1.7L8.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Healthy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.2L11 10H1L6 1.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 4.8v2.6M6 8.6v.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                            Degraded
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{c.nodesReady}/{c.nodesTotal}</td>
                      <td className="px-4 py-3"><UsageBar pct={c.cpuPercent} /></td>
                      <td className="px-4 py-3"><UsageBar pct={c.memoryPercent} /></td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline-block"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-white">Memory Utilization by Cluster</h2>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            <div className="bg-brand-surface border border-white/8 rounded-xl p-5">
              <FleetTrendChart clusters={clusters} />
            </div>
          </div>
        </div>

        {/* Right: needs attention + recent changes */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-white">Needs Attention</h2>
              {issues.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">{issues.length}</span>
              )}
            </div>
            <div className="bg-brand-surface border border-white/8 rounded-xl divide-y divide-white/6">
              {issues.length === 0 && (
                <p className="px-4 py-5 text-sm text-slate-500">All clusters are healthy.</p>
              )}
              {issues.map((issue) => (
                <div key={issue.id} className="px-4 py-4 flex items-start gap-3">
                  {issue.severity === "critical" ? (
                    <div className="w-6 h-6 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 3.2v3M6 8.2v.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.5L11 10H1L6 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 5v2M6 8.5v.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium">{issue.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{issue.context}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{issue.ago}</p>
                    <Link
                      href={
                        issue.workloadId
                          ? `/portal/infrastructure/kubernetes/${issue.clusterId}?workload=${issue.workloadId}`
                          : `/portal/infrastructure/kubernetes/${issue.clusterId}`
                      }
                      className="text-xs text-brand-accent hover:text-white transition-colors inline-flex items-center gap-1 mt-1.5"
                    >
                      {issue.workloadId ? "View workload" : "Inspect node"}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Changes</h2>
            <div className="bg-brand-surface border border-white/8 rounded-xl divide-y divide-white/6">
              {recentChanges.length === 0 && (
                <p className="px-4 py-5 text-sm text-slate-500">No infrastructure changes yet.</p>
              )}
              {recentChanges.map((t) => {
                const ui = TICKET_STATUS_UI[t.status];
                const resource = typeof t.detail.resource === "string" ? t.detail.resource : undefined;
                return (
                  <div key={t.id} className="px-4 py-3.5 flex items-start gap-3">
                    <ChangeIcon icon={ui.icon} color={ui.color} />
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{resource ? `${resource} · ` : ""}{timeAgo(t.createdAt)}</p>
                      <p className={`text-xs mt-0.5 ${ui.color}`}>{ui.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
