"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SAPManagementWidget } from "@/components/portal/sap-management-widget";

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

const active    = resources.filter((r) => r.status === "active").length;
const prov      = resources.filter((r) => r.status === "provisioning").length;
const totalCost = resources
  .filter((r) => r.status !== "terminated")
  .reduce((sum, r) => sum + (parseFloat(r.cost.replace(/[$,/a-z]/gi, "")) || 0), 0);

export default function InfrastructurePage() {
  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Infrastructure</h1>
          <p className="text-slate-500 text-sm mt-1">
            {active} active · {prov} provisioning · ${totalCost.toLocaleString()}/mo estimated
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
              className={`bg-brand-surface border rounded-xl p-5 transition-all ${
                r.status === "terminated"
                  ? "border-white/5 opacity-50"
                  : "border-white/8 hover:border-brand-primary/40 hover:shadow-lg hover:shadow-brand-primary/5 cursor-pointer"
              }`}
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
                <div>
                  <p className="text-slate-500 mb-0.5">Est. cost</p>
                  <p className="text-slate-300">{r.cost}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Created</p>
                  <p className="text-slate-300">{r.created}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">ID</p>
                  <p className="text-slate-500 font-mono text-[11px]">{r.id}</p>
                </div>
              </div>
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

      {/* Instance Management */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-white">Instance Management</h2>
          <div className="flex-1 h-px bg-white/8" />
        </div>
        <SAPManagementWidget />
      </div>
    </div>
  );
}
