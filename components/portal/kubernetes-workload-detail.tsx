"use client";

import { useState } from "react";
import {
  podsForWorkload,
  eventsForWorkload,
  logsForWorkload,
  yamlForWorkload,
  seededSeries,
  type K8sWorkload,
} from "@/lib/portal/kubernetes";

export type TabId = "overview" | "pods" | "logs" | "events" | "metrics" | "yaml";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "pods", label: "Pods" },
  { id: "logs", label: "Logs" },
  { id: "events", label: "Events" },
  { id: "metrics", label: "Metrics" },
  { id: "yaml", label: "YAML" },
];

const workloadStatusStyle: Record<string, string> = {
  Running: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Degraded: "text-red-400 bg-red-400/10 border-red-400/20",
  Scheduled: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const podStatusStyle: Record<string, string> = {
  Running: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Completed: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CrashLoopBackOff: "text-red-400 bg-red-400/10 border-red-400/20",
  ImagePullBackOff: "text-red-400 bg-red-400/10 border-red-400/20",
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 400;
  const H = 72;
  const pad = 8;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} aria-hidden="true">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function WorkloadDetailDrawer({
  workload,
  clusterName,
  initialTab = "overview",
  onClose,
  onAction,
}: {
  workload: K8sWorkload;
  clusterName: string;
  initialTab?: TabId;
  onClose: () => void;
  onAction: (kind: "scale" | "restart" | "delete") => void;
}) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const pods = podsForWorkload(workload.id);
  const events = eventsForWorkload(workload);
  const logs = logsForWorkload(workload);
  const canDeploy = workload.kind !== "CronJob";
  const affectedPod = pods.find((p) => p.status !== "Running" && p.status !== "Completed");
  const latestEvent = events.find((e) => e.type === "Warning") ?? events[0];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        data-testid="workload-detail-drawer"
        className="fixed right-0 top-0 h-screen w-full max-w-[640px] z-50 flex flex-col overflow-hidden shadow-2xl"
        style={{ background: "#0b1e2e", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-white/8 px-6 py-4" style={{ background: "#0b1e2e" }}>
          <p className="text-[11px] text-slate-500 font-mono mb-1">{clusterName} / {workload.namespace}</p>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-semibold text-white font-mono truncate">{workload.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{workload.kind} · {workload.image}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
              aria-label="Close panel"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="shrink-0 px-6 py-3 border-b border-white/6 flex items-center gap-3 flex-wrap">
          <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${workloadStatusStyle[workload.status]}`}>{workload.status}</span>
          <span className="text-xs text-slate-400 font-mono">{workload.readyReplicas}/{workload.desiredReplicas} ready</span>
          <span className="text-xs text-slate-500">CPU {workload.cpuPercent}%</span>
          <span className="text-xs text-slate-500">Mem {workload.memoryPercent}%</span>
          <span className="text-xs text-slate-600 ml-auto">Age {workload.age}</span>
        </div>

        {workload.issue && (
          <div className="shrink-0 mx-6 mt-3 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2.5 flex items-start gap-2 text-xs text-red-300">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <p>{workload.issue}</p>
          </div>
        )}

        {/* Quick actions */}
        <div className="shrink-0 px-6 py-3 border-b border-white/6 flex items-center gap-2">
          {canDeploy && (
            <>
              <button onClick={() => onAction("scale")} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/3 text-slate-300 hover:text-white hover:bg-white/8 transition-colors">Scale</button>
              <button onClick={() => onAction("restart")} className="text-xs px-3 py-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 text-amber-300 hover:bg-amber-400/10 transition-colors">Restart</button>
              <button onClick={() => onAction("delete")} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10 transition-colors">Delete</button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="shrink-0 px-6 border-b border-white/8 flex items-center gap-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 text-xs font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id ? "text-white border-brand-primary" : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && (
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Replica health</p>
                <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
                  {Array.from({ length: Math.max(workload.desiredReplicas, 1) }).map((_, i) => (
                    <div key={i} className={`flex-1 ${i < workload.readyReplicas ? "bg-emerald-400" : "bg-red-400"}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">{workload.readyReplicas} ready / {workload.desiredReplicas} desired</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">CPU</p>
                  <p className="text-lg font-semibold text-white font-mono">{workload.cpuPercent}%</p>
                </div>
                <div className="bg-white/3 border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Memory</p>
                  <p className="text-lg font-semibold text-white font-mono">{workload.memoryPercent}%</p>
                </div>
              </div>

              {affectedPod && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Affected pod</p>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="text-sm text-white font-mono truncate">{affectedPod.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{affectedPod.status} · {affectedPod.restarts} restarts</p>
                    <div className="flex gap-2">
                      <button onClick={() => setTab("logs")} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-accent text-white transition-colors">Open pod logs</button>
                      <button onClick={() => setTab("events")} className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 transition-colors">View events</button>
                    </div>
                  </div>
                </div>
              )}

              {latestEvent && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Latest event</p>
                  <div className="bg-white/3 border border-white/10 rounded-lg p-3">
                    <p className="text-sm text-white">{latestEvent.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{workload.name} · {latestEvent.lastSeen}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Configuration</p>
                <div className="bg-white/3 border border-white/10 rounded-lg divide-y divide-white/6 text-xs">
                  {[
                    { label: "Image", value: workload.image },
                    { label: "Namespace", value: workload.namespace },
                    { label: "Updated", value: `${workload.age} ago` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between px-3 py-2">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-slate-300 font-mono truncate max-w-[60%] text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "pods" && (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8 text-left text-slate-500">
                  <th className="px-6 py-2.5 font-medium">Pod</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Restarts</th>
                  <th className="px-4 py-2.5 font-medium">Node</th>
                  <th className="px-4 py-2.5 font-medium">Age</th>
                </tr>
              </thead>
              <tbody>
                {pods.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-6 text-slate-500 text-center">No pods for this workload.</td></tr>
                )}
                {pods.map((p) => (
                  <tr key={p.id} className="border-b border-white/6 last:border-0">
                    <td className="px-6 py-2.5 text-white font-mono truncate max-w-[220px]">{p.name}</td>
                    <td className="px-4 py-2.5"><span className={`font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${podStatusStyle[p.status]}`}>{p.status}</span></td>
                    <td className="px-4 py-2.5 text-slate-300 font-mono">{p.restarts}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px] truncate max-w-[160px]">{p.node}</td>
                    <td className="px-4 py-2.5 text-slate-500">{p.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "logs" && (
            <div className="p-6">
              <div className="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
                {logs.map((line, i) => (
                  <p key={i} className={line.includes("ERROR") ? "text-red-400" : line.includes("WARN") ? "text-amber-400" : ""}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {tab === "events" && (
            <div className="p-6 space-y-2.5">
              {events.map((e) => (
                <div key={e.id} className="bg-white/3 border border-white/8 rounded-lg p-3 flex items-start gap-3">
                  <span className={`font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border shrink-0 mt-0.5 ${
                    e.type === "Warning" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-slate-400 bg-slate-400/10 border-slate-400/20"
                  }`}>{e.type}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium">{e.reason}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{e.message}</p>
                    <p className="text-[10px] text-slate-600 mt-1">×{e.count} · last seen {e.lastSeen}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "metrics" && (
            <div className="p-6 space-y-5">
              <div className="bg-white/3 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">CPU</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border text-amber-400 bg-amber-400/10 border-amber-400/20">{workload.cpuPercent}%</span>
                </div>
                <Sparkline data={seededSeries(`${workload.id}-cpu`, workload.cpuPercent)} color="#f59e0b" />
              </div>
              <div className="bg-white/3 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Memory</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border text-indigo-400 bg-indigo-400/10 border-indigo-400/20">{workload.memoryPercent}%</span>
                </div>
                <Sparkline data={seededSeries(`${workload.id}-mem`, workload.memoryPercent)} color="#818cf8" />
              </div>
            </div>
          )}

          {tab === "yaml" && (
            <div className="p-6">
              <pre className="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
                {yamlForWorkload(workload)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
