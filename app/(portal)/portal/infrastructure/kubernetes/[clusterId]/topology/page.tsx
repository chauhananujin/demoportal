"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  getCluster,
  getService,
  getWorkload,
  dependenciesForWorkload,
  podsForWorkload,
  eventsForWorkload,
  topologyAppsForCluster,
  type K8sWorkload,
  type K8sPod,
  type K8sService,
  type WorkloadDependency,
  type TopologyApp,
} from "@/lib/portal/kubernetes";
import { KubernetesActionModals, type ActiveAction } from "@/components/portal/kubernetes-actions";
import { WorkloadDetailDrawer, type TabId } from "@/components/portal/kubernetes-workload-detail";

/* ── Severity mapping shared by workload + pod nodes ─────── */

type Severity = "healthy" | "degraded" | "failing";

function workloadSeverity(w: K8sWorkload): Severity {
  if (w.status === "Degraded") return "degraded";
  if (w.status === "Pending") return "failing";
  return "healthy";
}

function podSeverity(p: K8sPod): Severity {
  if (p.status === "Running" || p.status === "Completed") return "healthy";
  if (p.status === "Pending") return "degraded";
  return "failing";
}

const severityLabel: Record<Severity, string> = { healthy: "Healthy", degraded: "Degraded", failing: "Failing" };
const severityBadge: Record<Severity, string> = {
  healthy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  degraded: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  failing: "text-red-400 bg-red-400/10 border-red-400/20",
};
const severityBorder: Record<Severity, string> = {
  healthy: "border-white/10",
  degraded: "border-amber-400/40",
  failing: "border-red-400/40",
};

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === "healthy") return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2l2.2 2.2L9.5 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (severity === "degraded") return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1.5L11 10H1L6 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
  return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M6 3.4v3M6 8.2v.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}

function StatusPill({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border shrink-0 ${severityBadge[severity]}`}>
      <SeverityIcon severity={severity} />
      {severityLabel[severity]}
    </span>
  );
}

/* ── Node + connector primitives ─────────────────────────── */

function NodeBox({
  kind, name, sub, severity, active, onClick,
}: {
  kind: string; name: string; sub?: string; severity?: Severity; active?: boolean; onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`w-56 text-left bg-brand-surface border rounded-xl px-4 py-3 transition-colors shrink-0 ${
        severity ? severityBorder[severity] : "border-white/10"
      } ${active ? "ring-1 ring-brand-primary" : ""} ${onClick ? "hover:border-brand-primary/50 cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">{kind}</span>
        {severity && <StatusPill severity={severity} />}
      </div>
      <p className="text-sm font-semibold text-white font-mono truncate">{name}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5 truncate font-mono">{sub}</p>}
    </Comp>
  );
}

function VConnector() {
  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="w-px h-5 bg-white/15" />
      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="text-white/25 -mt-px"><path d="M0 0l4 6 4-6Z" fill="currentColor"/></svg>
    </div>
  );
}

function HDashedConnector({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 shrink-0">
      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{label}</span>
      <div className="w-8 border-t border-dashed border-white/20" />
      <svg width="6" height="8" viewBox="0 0 6 8" fill="none" className="text-white/25 shrink-0"><path d="M0 0l6 4-6 4Z" fill="currentColor"/></svg>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

type DetailState = { workload: K8sWorkload; tab: TabId } | null;

export default function TopologyPage() {
  const params = useParams<{ clusterId: string }>();
  const cluster = getCluster(params.clusterId);

  const [action, setAction] = useState<ActiveAction>(null);
  const [detail, setDetail] = useState<DetailState>(null);
  const [showHealthy, setShowHealthy] = useState(true);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(100);

  const apps = cluster ? topologyAppsForCluster(cluster.id) : [];
  const defaultAppId = apps.find((a) => a.workload.status !== "Running" && a.workload.status !== "Scheduled")?.id ?? apps[0]?.id;
  const [selectedAppId, setSelectedAppId] = useState<string | undefined>(defaultAppId);

  if (!cluster) {
    notFound();
    return null;
  }

  const filteredApps = apps.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected: TopologyApp | undefined = apps.find((a) => a.id === selectedAppId) ?? apps[0];

  const pods = selected ? podsForWorkload(selected.workload.id) : [];
  const visiblePods = showHealthy ? pods : (() => {
    const failing = pods.filter((p) => podSeverity(p) !== "healthy");
    return failing.length > 0 ? failing : pods;
  })();

  interface DepChain { dep: WorkloadDependency; service: K8sService; workload: K8sWorkload }
  const dependencies = selected ? dependenciesForWorkload(selected.workload.id) : [];
  const depChains: DepChain[] = dependencies
    .map((dep): DepChain | null => {
      const service = getService(dep.toServiceId);
      const workload = service ? getWorkload(service.workloadId) : undefined;
      return service && workload ? { dep, service, workload } : null;
    })
    .filter((c): c is DepChain => c !== null)
    .filter((c) => showHealthy || workloadSeverity(c.workload) !== "healthy");

  const recentActivity = selected
    ? [
        ...eventsForWorkload(selected.workload).map((e) => ({ text: e.message, time: e.lastSeen, warn: e.type === "Warning" })),
        { text: `${selected.workload.name} rollout started`, time: `${selected.workload.age} ago`, warn: false },
      ].slice(0, 4)
    : [];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-8 pt-6 pb-2 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal/infrastructure" className="hover:text-white transition-colors">Infrastructure</Link>
        <span>/</span>
        <Link href="/portal/infrastructure/kubernetes" className="hover:text-white transition-colors">Kubernetes</Link>
        <span>/</span>
        <Link href={`/portal/infrastructure/kubernetes/${cluster.id}`} className="hover:text-white transition-colors">{cluster.name}</Link>
        <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ml-1 ${
          cluster.environment === "production" ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-sky-400 bg-sky-400/10 border-sky-400/20"
        }`}>
          {cluster.environment}
        </span>
      </div>

      {/* Header */}
      <div className="px-8 pb-4">
        <h1 className="text-2xl font-semibold text-white">Service Topology</h1>
        <p className="text-slate-500 text-sm mt-1">Follow traffic. Inspect workloads. Resolve issues.</p>
      </div>

      {/* Controls */}
      <div className="px-8 pb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white/3 border border-white/8 rounded-lg p-0.5">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-brand-primary text-white">Topology</span>
          <Link href={`/portal/infrastructure/kubernetes/${cluster.id}`} className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white transition-colors">List</Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Group by</span>
          <select
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-primary/50 max-w-[220px]"
          >
            {filteredApps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a resource…"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 w-44"
        />

        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={showHealthy}
            onClick={() => setShowHealthy((v) => !v)}
            className={`w-8 h-4.5 rounded-full relative transition-colors ${showHealthy ? "bg-brand-primary" : "bg-white/15"}`}
          >
            <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${showHealthy ? "left-[17px]" : "left-0.5"}`} />
          </button>
          Show healthy
        </label>

        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setZoom((z) => Math.max(60, z - 10))} className="w-7 h-7 rounded-md border border-white/10 bg-white/3 text-slate-400 hover:text-white flex items-center justify-center">−</button>
          <span className="text-xs text-slate-500 font-mono w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(150, z + 10))} className="w-7 h-7 rounded-md border border-white/10 bg-white/3 text-slate-400 hover:text-white flex items-center justify-center">+</button>
          <button onClick={() => setZoom(100)} className="ml-1 text-xs px-2.5 py-1.5 rounded-md border border-white/10 bg-white/3 text-slate-400 hover:text-white transition-colors">Fit view</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="px-8 pb-4 overflow-x-auto">
        {!selected ? (
          <div className="py-16 flex items-center justify-center text-sm text-slate-500">No applications found for this cluster.</div>
        ) : (
          <div
            className="bg-[#0a1929] border border-white/8 rounded-xl p-8 min-h-[560px]"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-white">{selected.namespace} namespace</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selected.ingress ? "1 ingress · " : ""}1 service · 1 deployment{depChains.length > 0 ? ` · ${depChains.length} dependency` : ""}
              </p>
            </div>

            <div className="origin-top-left transition-transform" style={{ transform: `scale(${zoom / 100})` }}>
              <div className="flex flex-col items-center">
                {selected.ingress && (
                  <>
                    <NodeBox kind="Public traffic" name="Internet" sub="HTTPS" />
                    <VConnector />
                    <NodeBox kind="Ingress" name={selected.ingress.name} sub={selected.ingress.path} />
                    <VConnector />
                  </>
                )}
                <NodeBox
                  kind="Service"
                  name={selected.service.name}
                  sub={selected.service.ports.map((p) => `${p.from} → ${p.to}`).join(", ")}
                />
                <VConnector />

                <div className="flex items-start">
                  <div className="flex flex-col items-center">
                    <NodeBox
                      kind={selected.workload.kind}
                      name={selected.workload.name}
                      sub={`${selected.workload.status} · ${selected.workload.readyReplicas}/${selected.workload.desiredReplicas} ready`}
                      severity={workloadSeverity(selected.workload)}
                      active
                      onClick={() => setDetail({ workload: selected.workload, tab: "overview" })}
                    />
                    {visiblePods.length > 0 && (
                      <>
                        <VConnector />
                        <div className="flex gap-3 flex-wrap justify-center">
                          {visiblePods.map((p) => (
                            <NodeBox
                              key={p.id}
                              kind="Pod"
                              name={p.name}
                              severity={podSeverity(p)}
                              onClick={() => setDetail({ workload: selected.workload, tab: podSeverity(p) === "healthy" ? "pods" : "overview" })}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {depChains.map(({ dep, service, workload }) => (
                    <div key={dep.id} className="flex items-start">
                      <div className="mt-6"><HDashedConnector label={`${dep.protocol} ${dep.port}`} /></div>
                      <div className="flex flex-col items-center">
                        <NodeBox kind="Service" name={service.name} sub={service.ports.map((p) => `${p.from}`).join(", ")} />
                        <VConnector />
                        <NodeBox
                          kind={workload.kind}
                          name={workload.name}
                          sub={`${workload.readyReplicas}/${workload.desiredReplicas} ready`}
                          severity={workloadSeverity(workload)}
                          onClick={() => setDetail({ workload, tab: "overview" })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 flex-wrap mt-8 pt-4 border-t border-white/6 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-4 border-t border-white/30" /> Routes / selects</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-white/30" /> Dependency</span>
              <span className="flex items-center gap-1.5 text-emerald-400"><SeverityIcon severity="healthy" /> Healthy</span>
              <span className="flex items-center gap-1.5 text-amber-400"><SeverityIcon severity="degraded" /> Degraded</span>
              <span className="flex items-center gap-1.5 text-red-400"><SeverityIcon severity="failing" /> Failing</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent activity */}
      {selected && (
        <div className="px-8 pb-6 pt-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Recent activity</p>
          <div className="bg-brand-surface border border-white/8 rounded-xl divide-y divide-white/6">
            {recentActivity.map((a, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                <span className={a.warn ? "text-amber-300" : "text-slate-300"}>{a.text}</span>
                <span className="text-slate-600 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {detail && (
        <WorkloadDetailDrawer
          workload={detail.workload}
          clusterName={cluster.name}
          initialTab={detail.tab}
          onClose={() => setDetail(null)}
          onAction={(kind) => setAction({ kind, workload: detail.workload })}
        />
      )}
      <KubernetesActionModals action={action} clusterName={cluster.name} onClose={() => setAction(null)} />
    </div>
  );
}
