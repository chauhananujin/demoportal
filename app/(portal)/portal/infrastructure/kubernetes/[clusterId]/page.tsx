"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  CLUSTERS,
  getCluster,
  nodesForCluster,
  namespacesForCluster,
  workloadsForCluster,
  workloadsWithIssues,
  clusterStats,
  type K8sWorkload,
} from "@/lib/portal/kubernetes";
import { KubernetesActionModals, type ActiveAction } from "@/components/portal/kubernetes-actions";
import { WorkloadDetailDrawer, type TabId } from "@/components/portal/kubernetes-workload-detail";

/* ── Style maps ──────────────────────────────────────────── */

const nodeStatusStyle: Record<string, string> = {
  Ready: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  NotReady: "text-red-400 bg-red-400/10 border-red-400/20",
  SchedulingDisabled: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const workloadStatusStyle: Record<string, string> = {
  Running: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Degraded: "text-red-400 bg-red-400/10 border-red-400/20",
  Scheduled: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

function usageColor(pct: number) {
  return pct > 80 ? "text-red-400" : pct > 60 ? "text-amber-400" : "text-slate-300";
}

/* ── Workload row action menu (kebab) ────────────────────── */

function WorkloadActionMenu({ onSelect }: { onSelect: (action: "scale" | "restart" | "delete") => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="13" r="1.4"/></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-1 w-40 rounded-lg border border-white/10 bg-[#0d1f2d] shadow-2xl z-20 overflow-hidden">
          {([
            { id: "scale" as const, label: "Scale" },
            { id: "restart" as const, label: "Restart" },
            { id: "delete" as const, label: "Delete" },
          ]).map((a) => (
            <button
              key={a.id}
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onSelect(a.id); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                a.id === "delete" ? "text-red-400 hover:bg-red-500/10" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

type DetailState = { workload: K8sWorkload; tab: TabId } | null;

export default function ClusterDashboardPage() {
  const params = useParams<{ clusterId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const showCost = user?.role !== "user";

  const cluster = getCluster(params.clusterId);

  // All hooks must run unconditionally on every render — the not-found
  // redirect below happens only after every hook below has been called.
  const [action, setAction] = useState<ActiveAction>(null);
  // Deep-link support: /kubernetes/[clusterId]?workload=wl-3 opens that workload's
  // detail drawer on first render — computed lazily so it only runs once on mount.
  const [detail, setDetail] = useState<DetailState>(() => {
    if (!cluster) return null;
    const workloadId = searchParams.get("workload");
    if (!workloadId) return null;
    const w = workloadsForCluster(cluster.id).find((wl) => wl.id === workloadId);
    return w ? { workload: w, tab: "overview" } : null;
  });
  const [namespaceFilter, setNamespaceFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  if (!cluster) {
    notFound();
    return null;
  }

  const namespaces = namespacesForCluster(cluster.id);
  const nodes = nodesForCluster(cluster.id);
  const allWorkloads = workloadsForCluster(cluster.id);
  const stats = clusterStats(cluster.id);
  const issues = workloadsWithIssues(cluster.id).filter((w) => namespaceFilter === "all" || w.namespace === namespaceFilter);
  const workloads = allWorkloads.filter(
    (w) =>
      (namespaceFilter === "all" || w.namespace === namespaceFilter) &&
      w.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      {/* Breadcrumb + title */}
      <div className="px-8 pt-8 pb-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Link href="/portal/infrastructure" className="hover:text-white transition-colors">Infrastructure</Link>
          <span>/</span>
          <Link href="/portal/infrastructure/kubernetes" className="hover:text-white transition-colors">Kubernetes</Link>
          <span>/</span>
          <span className="text-slate-300">{cluster.name}</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{cluster.name}</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and administer this Kubernetes cluster.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/portal/infrastructure/kubernetes/${cluster.id}/topology`}>
              <Button variant="outline" className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-sm">
                View Topology
              </Button>
            </Link>
            <Button onClick={() => setAction({ kind: "deploy", clusterId: cluster.id })} className="bg-brand-primary hover:bg-brand-accent text-white text-sm">
              + Deploy Workload
            </Button>
          </div>
        </div>
      </div>

      {/* Persistent context bar: cluster / namespace / environment — always visible */}
      <div className="sticky top-0 z-20 bg-[#0a1929]/95 backdrop-blur border-y border-white/8 px-8 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Cluster</span>
          <select
            value={cluster.id}
            onChange={(e) => router.push(`/portal/infrastructure/kubernetes/${e.target.value}`)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-primary/50"
          >
            {CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Namespace</span>
          <select
            value={namespaceFilter}
            onChange={(e) => setNamespaceFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-primary/50"
          >
            <option value="all">All namespaces</option>
            {namespaces.map((ns) => <option key={ns.id} value={ns.name}>{ns.name}</option>)}
          </select>
        </div>
        <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border ${
          cluster.environment === "production" ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-sky-400 bg-sky-400/10 border-sky-400/20"
        }`}>
          {cluster.environment}
        </span>
        <span className="text-xs text-slate-500 ml-auto font-mono">
          {cluster.cloud} · {cluster.region} · {cluster.version}{showCost && ` · ${cluster.cost}`}
        </span>
      </div>

      <div className="px-8 py-8">
        {/* Health at a glance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Nodes Ready</p>
            <p className="text-xl font-semibold text-white font-mono">{stats.nodesReady}/{stats.nodesTotal}</p>
          </div>
          <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Pods Running</p>
            <p className="text-xl font-semibold text-white font-mono">{stats.podsRunning}/{stats.podsCapacity}</p>
          </div>
          <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">CPU Usage</p>
            <p className={`text-xl font-semibold font-mono ${usageColor(stats.avgCpu)}`}>{stats.avgCpu}%</p>
          </div>
          <div className="bg-brand-surface border border-white/8 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Memory Usage</p>
            <p className={`text-xl font-semibold font-mono ${usageColor(stats.avgMemory)}`}>{stats.avgMemory}%</p>
          </div>
        </div>

        {/* Actionable issues */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">Needs Attention</h2>
            <div className="flex-1 h-px bg-white/8" />
            {issues.length > 0 && (
              <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border text-red-400 bg-red-400/10 border-red-400/20">
                {issues.length} issue{issues.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {issues.length === 0 ? (
            <div className="bg-brand-surface border border-white/8 rounded-xl px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 5" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-sm text-slate-400">All workloads are healthy in the selected scope.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((w) => (
                <div key={w.id} className="bg-red-500/5 border border-red-500/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${workloadStatusStyle[w.status]}`}>{w.status}</span>
                      <p className="text-sm font-medium text-white font-mono truncate">{w.namespace}/{w.name}</p>
                    </div>
                    <p className="text-xs text-slate-400">{w.issue}</p>
                  </div>
                  <Button
                    onClick={() => setDetail({ workload: w, tab: "overview" })}
                    variant="outline"
                    className="border-red-400/30 text-red-300 hover:text-white hover:bg-red-500/10 text-xs shrink-0"
                  >
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workload management */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="text-lg font-semibold text-white">Workloads</h2>
            <div className="flex-1 h-px bg-white/8 min-w-[24px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workloads…"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 w-full sm:w-56"
            />
          </div>
          <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  {namespaceFilter === "all" && <th className="px-4 py-3 font-medium">Namespace</th>}
                  <th className="px-4 py-3 font-medium">Ready</th>
                  <th className="px-4 py-3 font-medium">CPU</th>
                  <th className="px-4 py-3 font-medium">Memory</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {workloads.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">No workloads match this filter.</td></tr>
                )}
                {workloads.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => setDetail({ workload: w, tab: "overview" })}
                    className="border-b border-white/6 last:border-0 cursor-pointer hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-mono text-xs">{w.name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{w.kind}</td>
                    {namespaceFilter === "all" && <td className="px-4 py-3 text-slate-400 text-xs font-mono">{w.namespace}</td>}
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{w.readyReplicas}/{w.desiredReplicas}</td>
                    <td className={`px-4 py-3 font-mono text-xs ${usageColor(w.cpuPercent)}`}>{w.cpuPercent}%</td>
                    <td className={`px-4 py-3 font-mono text-xs ${usageColor(w.memoryPercent)}`}>{w.memoryPercent}%</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${workloadStatusStyle[w.status]}`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{w.age}</td>
                    <td className="px-4 py-3 text-right">
                      {w.kind !== "CronJob" && (
                        <WorkloadActionMenu onSelect={(kind) => setAction({ kind, workload: w })} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nodes */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">Nodes</h2>
            <div className="flex-1 h-px bg-white/8" />
          </div>
          <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Node</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">CPU</th>
                  <th className="px-4 py-3 font-medium">Memory</th>
                  <th className="px-4 py-3 font-medium">Pods</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr key={n.id} className="border-b border-white/6 last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-white font-mono text-xs">{n.name}</p>
                      <p className="text-slate-500 text-[11px]">{n.instanceType} · {n.zone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${nodeStatusStyle[n.status]}`}>{n.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{n.roles.join(", ")}</td>
                    <td className={`px-4 py-3 font-mono text-xs ${usageColor(n.cpuPercent)}`}>{n.cpuPercent}%</td>
                    <td className={`px-4 py-3 font-mono text-xs ${usageColor(n.memoryPercent)}`}>{n.memoryPercent}%</td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{n.pods}/{n.podsCapacity}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{n.age}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setAction({ kind: "drain", node: n })}
                        disabled={n.status !== "Ready"}
                        className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Cordon &amp; Drain
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail flow: pods, logs, events, metrics, YAML */}
      {detail && (
        <WorkloadDetailDrawer
          workload={detail.workload}
          clusterName={cluster.name}
          initialTab={detail.tab}
          onClose={() => setDetail(null)}
          onAction={(kind) => setAction({ kind, workload: detail.workload })}
        />
      )}

      {/* Action modals — always show affected cluster/namespace before confirmation */}
      <KubernetesActionModals action={action} clusterName={cluster.name} onClose={() => setAction(null)} />
    </div>
  );
}
