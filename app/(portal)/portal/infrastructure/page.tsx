"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { SAPManagementWidget } from "@/components/portal/sap-management-widget";
import { ResourceManagementWidget } from "@/components/portal/resource-management-widget";

const resources = [
  {
    id: "res-001",
    name: "prod-eks-cluster",
    type: "Kubernetes",
    cloud: "AWS",
    region: "us-east-1",
    size: "3× m5.xlarge nodes",
    status: "active",
    cost: "$620/mo",
    created: "Mar 5, 2026",
  },
  {
    id: "res-002",
    name: "sap-s4-sandbox-02",
    type: "SAP Sandbox",
    cloud: "Azure",
    region: "westeurope",
    size: "Standard_E16s_v4",
    status: "provisioning",
    cost: "$1,100/mo",
    created: "May 14, 2026",
  },
  {
    id: "res-003",
    name: "analytics-postgres",
    type: "Managed Database",
    cloud: "GCP",
    region: "europe-west1",
    size: "db-custom-4-16384",
    status: "active",
    cost: "$210/mo",
    created: "Feb 20, 2026",
  },
  {
    id: "res-004",
    name: "dev-vm-fleet",
    type: "VM Group",
    cloud: "AWS",
    region: "eu-west-1",
    size: "4× t3.medium",
    status: "active",
    cost: "$180/mo",
    created: "Feb 20, 2026",
  },
  {
    id: "res-005",
    name: "ci-runner-pool",
    type: "VM Group",
    cloud: "AWS",
    region: "us-east-1",
    size: "2× c5.large (spot)",
    status: "active",
    cost: "$95/mo",
    created: "Mar 12, 2026",
  },
  {
    id: "res-006",
    name: "backup-storage",
    type: "Object Storage",
    cloud: "Azure",
    region: "westeurope",
    size: "12 TB (LRS)",
    status: "active",
    cost: "$45/mo",
    created: "Feb 20, 2026",
  },
  {
    id: "res-007",
    name: "sap-s4-sandbox-01",
    type: "SAP Sandbox",
    cloud: "Azure",
    region: "westeurope",
    size: "Standard_E16s_v4",
    status: "terminated",
    cost: "—",
    created: "Jan 15, 2026",
  },
];

const statusStyle: Record<string, string> = {
  active:       "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  provisioning: "text-brand-accent bg-brand-accent/10 border-brand-accent/20",
  terminated:   "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

const cloudColor: Record<string, string> = {
  AWS:   "text-amber-400",
  Azure: "text-sky-400",
  GCP:   "text-emerald-400",
};

const typeIcon: Record<string, React.ReactNode> = {
  "Kubernetes":       <path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>,
  "SAP Sandbox":      <><rect x="2" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" stroke="currentColor" strokeWidth="1.4"/></>,
  "Managed Database": <><ellipse cx="8" cy="5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3 5v6a5 2 0 0 0 10 0V5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 8a5 2 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4"/></>,
  "VM Group":         <><rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><circle cx="12.5" cy="4.5" r="1" fill="currentColor"/><circle cx="12.5" cy="11.5" r="1" fill="currentColor"/></>,
  "Object Storage":   <><path d="M2 6l6-4 6 4v8l-6 2-6-2V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 6l6 4 6-4M8 10v6" stroke="currentColor" strokeWidth="1.4"/></>,
  "Load Balancer":    <><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
};

// ─── Mock metrics data ────────────────────────────────────────────────────────

interface ResourceMetrics {
  cpu: number[];
  memory: number[];
  networkIn: number[];
  networkOut: number[];
  note?: "provisioning" | "terminated" | "storage";
}

const resourceMetrics: Record<string, ResourceMetrics> = {
  "res-001": {
    cpu:        [18,22,25,21,19,23,28,35,42,38,32,30,29,31,35,40,38,30,25,22,20,19,21,22],
    memory:     [45,46,47,46,45,45,48,52,58,56,54,53,52,54,57,60,58,52,50,48,47,46,47,48],
    networkIn:  [12,14,15,11,10,12,18,28,35,32,28,25,24,26,30,34,32,24,18,14,12,11,12,13],
    networkOut: [8,9,10,7,6,8,12,20,28,25,20,18,17,19,22,26,24,17,12,9,8,7,8,9],
  },
  "res-002": { cpu: [], memory: [], networkIn: [], networkOut: [], note: "provisioning" },
  "res-003": {
    cpu:        [15,16,14,13,14,15,20,28,35,32,30,28,27,30,33,36,34,27,22,18,15,14,15,16],
    memory:     [62,63,62,61,61,62,65,70,76,74,72,71,70,72,74,77,75,70,67,64,62,62,63,63],
    networkIn:  [5,5,4,4,5,5,8,15,22,20,18,16,16,18,20,23,21,15,10,7,5,5,5,5],
    networkOut: [18,20,16,14,15,18,28,45,60,55,50,46,45,48,52,58,55,44,35,25,18,16,17,19],
  },
  "res-004": {
    cpu:        [5,3,4,3,3,4,15,35,42,38,30,28,32,35,40,38,30,20,8,5,4,3,4,5],
    memory:     [30,28,27,26,26,27,35,48,55,52,50,48,50,52,55,53,48,40,32,28,27,26,27,28],
    networkIn:  [1,1,1,1,1,1,5,12,18,15,12,11,12,14,16,15,12,8,3,1,1,1,1,1],
    networkOut: [1,1,0,0,1,1,4,10,15,12,10,9,10,11,13,12,10,6,2,1,1,0,1,1],
  },
  "res-005": {
    cpu:        [2,2,2,2,2,2,2,2,85,92,88,5,2,2,2,2,78,95,90,5,2,2,2,2],
    memory:     [15,15,15,15,15,15,15,15,60,72,68,20,15,15,15,15,65,78,70,18,15,15,15,15],
    networkIn:  [0,0,0,0,0,0,0,0,45,55,50,2,0,0,0,0,40,58,48,2,0,0,0,0],
    networkOut: [0,0,0,0,0,0,0,0,30,38,35,1,0,0,0,0,28,42,34,1,0,0,0,0],
  },
  "res-006": {
    cpu: [], memory: [],
    networkIn:  [0,0,0,0,0,0,0,150,280,320,260,180,100,40,10,5,0,0,0,0,0,0,0,0],
    networkOut: [0,0,0,0,0,0,0,80,180,200,160,120,60,20,5,2,0,0,0,0,0,0,0,0],
    note: "storage",
  },
  "res-007": { cpu: [], memory: [], networkIn: [], networkOut: [], note: "terminated" },
};

// ─── LineChart ────────────────────────────────────────────────────────────────

function LineChart({
  data,
  color,
  gradientId,
  height = 64,
}: {
  data: number[];
  color: string;
  unit: string;
  gradientId: string;
  height?: number;
}) {
  const W = 400;
  const H = height;
  const pad = H * 0.12;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return [x, y] as [number, number];
  });
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;

  const thresh80Y = H - pad - (0.8 * (H - 2 * pad));
  const thresh50Y = H - pad - (0.5 * (H - 2 * pad));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {/* Threshold lines */}
      <line x1="0" y1={thresh80Y} x2={W} y2={thresh80Y} stroke={color} strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.15" />
      <line x1="0" y1={thresh50Y} x2={W} y2={thresh50Y} stroke={color} strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.15" />
      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

function MetricCard({
  title,
  data,
  color,
  unit,
  gradientId,
}: {
  title: string;
  data: number[];
  color: string;
  unit: string;
  gradientId: string;
}) {
  const last = data[data.length - 1] ?? 0;
  const avg = data.length ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;
  const maxVal = data.length ? Math.max(...data) : 0;
  const minVal = data.length ? Math.min(...data) : 0;

  // Badge color for cpu/memory: >80 red, >60 amber, else emerald; network always sky
  const isNetwork = unit === "MB/s";
  const badgeColor = isNetwork
    ? "text-sky-400 bg-sky-400/10 border-sky-400/20"
    : last > 80
    ? "text-red-400 bg-red-400/10 border-red-400/20"
    : last > 60
    ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
    : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

  return (
    <div className="bg-white/3 border border-white/8 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{title}</span>
        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${badgeColor}`}>
          {last}{unit === "%" ? "%" : ` ${unit}`}
        </span>
      </div>
      <LineChart data={data} color={color} unit={unit} gradientId={gradientId} />
      <div className="flex gap-3 mt-2 text-[10px] text-slate-600">
        <span>Avg: {avg}{unit === "%" ? "%" : ` ${unit}`}</span>
        <span>·</span>
        <span>Max: {maxVal}{unit === "%" ? "%" : ` ${unit}`}</span>
        <span>·</span>
        <span>Min: {minVal}{unit === "%" ? "%" : ` ${unit}`}</span>
      </div>
    </div>
  );
}

// ─── ResourceDetailPanel ──────────────────────────────────────────────────────

type Resource = (typeof resources)[number];

function ResourceDetailPanel({
  resource,
  metrics,
  onClose,
  showCost,
}: {
  resource: Resource;
  metrics: ResourceMetrics;
  onClose: () => void;
  showCost: boolean;
}) {
  const icon = typeIcon[resource.type] ?? typeIcon["VM Group"];

  return (
    <>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        data-testid="resource-detail-panel"
        className="fixed right-0 top-0 h-screen w-[480px] z-50 flex flex-col overflow-hidden shadow-2xl"
        style={{ animation: "slideInRight 250ms ease-out both", background: "#0b1e2e", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header — sticky */}
        <div className="shrink-0 border-b border-white/8 px-5 py-4 flex items-start justify-between gap-3" style={{ background: "#0b1e2e" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400" aria-hidden="true">
                {icon}
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white font-mono truncate">{resource.name}</p>
              <p className="text-xs text-slate-500">
                {resource.type} · <span className={cloudColor[resource.cloud]}>{resource.cloud}</span> · {resource.region}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0 mt-0.5"
            aria-label="Close panel"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Meta row */}
        <div className="shrink-0 px-5 py-3 border-b border-white/6 flex items-center gap-3 flex-wrap">
          <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyle[resource.status]}`}>
            {resource.status === "provisioning" ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse inline-block" />
                {resource.status}
              </span>
            ) : resource.status}
          </span>
          <span className="text-xs text-slate-500 font-mono">{resource.size}</span>
          {showCost && <span className="text-xs text-slate-400">{resource.cost}</span>}
          <span className="text-xs text-slate-600 ml-auto">Created {resource.created}</span>
        </div>

        {resource.type === "Kubernetes" && resource.status === "active" && (
          <div className="shrink-0 px-5 py-3 border-b border-white/6">
            <Link
              href="/portal/infrastructure/kubernetes/prod-eks-cluster"
              className="flex items-center justify-center gap-1.5 text-xs text-brand-accent hover:text-white border border-brand-accent/20 hover:border-brand-accent/40 hover:bg-brand-accent/10 rounded-lg py-2 transition-colors"
            >
              Open Kubernetes Dashboard
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M4 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        )}

        {/* Charts section — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {metrics.note === "provisioning" ? (
            <div className="px-5 py-12 flex items-center justify-center">
              <p className="text-sm text-slate-500">Metrics collecting — resource is still provisioning</p>
            </div>
          ) : metrics.note === "terminated" ? (
            <div className="px-5 py-12 flex items-center justify-center">
              <p className="text-sm text-slate-500">Resource terminated — no metrics available</p>
            </div>
          ) : metrics.note === "storage" ? (
            <div className="px-5 py-5 grid grid-cols-2 gap-4">
              <MetricCard title="Network In" data={metrics.networkIn} color="#22d3ee" unit="MB/s" gradientId={`${resource.id}-netIn`} />
              <MetricCard title="Network Out" data={metrics.networkOut} color="#34d399" unit="MB/s" gradientId={`${resource.id}-netOut`} />
            </div>
          ) : (
            <div className="px-5 py-5 grid grid-cols-2 gap-4">
              <MetricCard title="CPU %" data={metrics.cpu} color="#f59e0b" unit="%" gradientId={`${resource.id}-cpu`} />
              <MetricCard title="Memory %" data={metrics.memory} color="#818cf8" unit="%" gradientId={`${resource.id}-mem`} />
              <MetricCard title="Network In" data={metrics.networkIn} color="#22d3ee" unit="MB/s" gradientId={`${resource.id}-netIn`} />
              <MetricCard title="Network Out" data={metrics.networkOut} color="#34d399" unit="MB/s" gradientId={`${resource.id}-netOut`} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Page stats ───────────────────────────────────────────────────────────────

const active    = resources.filter((r) => r.status === "active").length;
const prov      = resources.filter((r) => r.status === "provisioning").length;
const totalCost = resources
  .filter((r) => r.status !== "terminated")
  .reduce((sum, r) => sum + (parseFloat(r.cost.replace(/[$,/a-z]/gi, "")) || 0), 0);

export default function InfrastructurePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();
  const showCost = user?.role !== "user";

  return (
    <div className="px-8 py-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Infrastructure</h1>
          <p className="text-slate-500 text-sm mt-1">
            {active} active · {prov} provisioning{showCost && ` · $${totalCost.toLocaleString()}/mo estimated`}
          </p>
        </div>
        <Link href="/portal/infrastructure/new">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white text-sm">
            + Request Provisioning
          </Button>
        </Link>
      </div>

      {/* Resource grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {resources.map((r) => {
          const icon = typeIcon[r.type] ?? typeIcon["VM Group"];
          return (
            <div
              key={r.id}
              onClick={() => r.status !== "terminated" && setSelectedId(selectedId === r.id ? null : r.id)}
              className={`bg-brand-surface border rounded-xl p-5 transition-all ${
                r.status === "terminated"
                  ? "border-white/5 opacity-50"
                  : "border-white/8 hover:border-brand-primary/40 hover:shadow-lg hover:shadow-brand-primary/5 cursor-pointer"
              } ${r.id === selectedId ? "ring-1 ring-brand-primary/60" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400" aria-hidden="true">
                    {icon}
                  </svg>
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyle[r.status]}`}>
                  {r.status === "provisioning" ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse inline-block" />
                      {r.status}
                    </span>
                  ) : r.status}
                </span>
              </div>

              <p className="text-sm font-medium text-white font-mono mb-1 truncate">{r.name}</p>
              <p className="text-xs text-slate-500 mb-4">
                {r.type} · <span className={cloudColor[r.cloud]}>{r.cloud}</span> · {r.region}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/8 pt-4">
                <div>
                  <p className="text-slate-500 mb-0.5">Size</p>
                  <p className="text-slate-300 font-mono text-[11px] truncate">{r.size}</p>
                </div>
                {showCost ? (
                  <div>
                    <p className="text-slate-500 mb-0.5">Est. cost</p>
                    <p className="text-slate-300">{r.cost}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-500 mb-0.5">Type</p>
                    <p className="text-slate-300 truncate">{r.type}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-0.5">Created</p>
                  <p className="text-slate-300">{r.created}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">ID</p>
                  <p className="text-slate-500 font-mono text-[11px]">{r.id}</p>
                </div>
              </div>

              {r.type === "Kubernetes" && r.status === "active" && (
                <Link
                  href="/portal/infrastructure/kubernetes/prod-eks-cluster"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 flex items-center justify-center gap-1.5 text-xs text-brand-accent hover:text-white border border-brand-accent/20 hover:border-brand-accent/40 hover:bg-brand-accent/10 rounded-lg py-2 transition-colors"
                >
                  Open Kubernetes Dashboard
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M4 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              )}
            </div>
          );
        })}

        {/* New resource CTA card */}
        <Link href="/portal/infrastructure/new" className="group block">
          <div className="h-full min-h-[200px] bg-brand-surface border border-dashed border-white/15 rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-brand-accent" aria-hidden="true">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm text-slate-400 group-hover:text-white transition-colors font-medium">Request new resource</p>
            <p className="text-xs text-slate-600 text-center">K8s cluster, VM, database, SAP sandbox, and more</p>
          </div>
        </Link>
      </div>

      {/* Resource Management */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-white">Resource Management</h2>
          <div className="flex-1 h-px bg-white/8" />
        </div>
        <ResourceManagementWidget />
      </div>

      {/* SAP Instance Management */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-white">SAP Instance Management</h2>
          <div className="flex-1 h-px bg-white/8" />
        </div>
        <SAPManagementWidget />
      </div>

      {/* Floating detail drawer */}
      {selectedId && (() => {
        const r = resources.find((res) => res.id === selectedId)!;
        const m = resourceMetrics[selectedId] ?? { cpu: [], memory: [], networkIn: [], networkOut: [] };
        return <ResourceDetailPanel resource={r} metrics={m} onClose={() => setSelectedId(null)} showCost={showCost} />;
      })()}
    </div>
  );
}
