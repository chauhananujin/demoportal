"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

const finopsSteps = [
  { step: "1", label: "Identify", desc: "Surface waste via usage analytics and tagging audits" },
  { step: "2", label: "Analyse",  desc: "Quantify potential savings and implementation complexity" },
  { step: "3", label: "Optimise", desc: "Execute changes with Ascelios engineers — ticket-tracked" },
  { step: "4", label: "Monitor",  desc: "Validate savings in next billing cycle, repeat monthly" },
];

const costRecommendations = [
  {
    title: "Right-size prod-eks-cluster node groups",
    detail: "CPU utilisation averaging 22% over 30 days. Downsize from m5.2xlarge to m5.xlarge.",
    approach: [
      "Enable Kubernetes Metrics Server and review HPA/VPA recommendations",
      "Schedule maintenance window to update node group launch template",
      "Drain nodes gracefully and validate workload stability at new size",
    ],
    saving: "$380/mo",
    impact: "High",
    effort: "Low",
    category: "Compute",
  },
  {
    title: "Delete 4 unattached EBS volumes",
    detail: "Volumes detached for > 60 days in us-east-1. No snapshots scheduled.",
    approach: [
      "Create final snapshots of each volume as a safety backup",
      "Tag volumes for deletion and raise change-request ticket",
      "Delete volumes after 7-day confirmation window",
    ],
    saving: "$94/mo",
    impact: "Low",
    effort: "Low",
    category: "Storage",
  },
  {
    title: "Enable S3 Intelligent-Tiering on analytics bucket",
    detail: "2.4 TB bucket with infrequent access pattern. Estimated 40% storage cost reduction.",
    approach: [
      "Run S3 Storage Lens report to confirm access frequency distribution",
      "Apply Intelligent-Tiering storage class via lifecycle policy",
      "Set 30-day activation threshold for Infrequent Access tier",
    ],
    saving: "$210/mo",
    impact: "Medium",
    effort: "Low",
    category: "Storage",
  },
  {
    title: "Purchase Reserved Instances for RDS baseline",
    detail: "3 on-demand db.r6g.xlarge instances running 24/7. 1-year No Upfront RI saves 38%.",
    approach: [
      "Verify 90-day utilisation trend confirms consistent usage",
      "Purchase 1-year Convertible RIs for flexibility on engine upgrades",
      "Apply RI coverage to all 3 instances in the same AZ family",
    ],
    saving: "$640/mo",
    impact: "High",
    effort: "Medium",
    category: "Database",
  },
  {
    title: "Migrate NAT Gateway traffic to VPC Endpoints",
    detail: "S3 and DynamoDB traffic routed through NAT Gateway. Gateway endpoints are free.",
    approach: [
      "Audit VPC flow logs to identify top NAT Gateway destinations",
      "Create Gateway Endpoints for S3 and DynamoDB in all VPCs",
      "Update route tables to prefer endpoints; validate with VPC flow logs",
    ],
    saving: "$160/mo",
    impact: "Medium",
    effort: "Medium",
    category: "Networking",
  },
  {
    title: "Enable AWS Compute Optimizer auto-scaling recommendations",
    detail: "Lambda functions and ECS tasks show 60%+ idle time during off-peak hours.",
    approach: [
      "Opt in to Compute Optimizer for Lambda, ECS, and Auto Scaling Groups",
      "Review generated recommendations and filter by savings > $50/mo",
      "Apply approved recommendations via Terraform and raise optimisation ticket",
    ],
    saving: "$225/mo",
    impact: "Medium",
    effort: "Low",
    category: "Compute",
  },
];

const impactStyle: Record<string, string> = {
  High:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Medium: "text-amber-400  bg-amber-400/10  border-amber-400/20",
  Low:    "text-slate-400  bg-slate-400/10  border-slate-400/20",
};

const effortStyle: Record<string, string> = {
  Low:    "text-sky-400   bg-sky-400/10   border-sky-400/20",
  Medium: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  High:   "text-red-400   bg-red-400/10   border-red-400/20",
};

const categoryStyle: Record<string, string> = {
  Compute:    "text-sky-400    bg-sky-400/10    border-sky-400/20",
  Storage:    "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Database:   "text-amber-400  bg-amber-400/10  border-amber-400/20",
  Networking: "text-teal-400   bg-teal-400/10   border-teal-400/20",
};

const statsAll = [
  { label: "Active Services",       value: "3",          sub: "SAP Managed, Cloud Ops, DevOps", color: "text-brand-accent",  costOnly: false },
  { label: "Provisioned Resources", value: "7",          sub: "5 active · 2 provisioning",      color: "text-violet-400",   costOnly: false },
  { label: "Open Tickets",          value: "2",          sub: "1 critical · 1 medium",          color: "text-amber-400",    costOnly: false },
  { label: "Account Balance",       value: "$1,240.00",  sub: "Available credits",               color: "text-emerald-400", costOnly: true  },
];

const recentTickets = [
  { id: "TKT-0041", title: "S/4HANA transport failing in QA system", priority: "critical", status: "open",    updated: "2 hours ago" },
  { id: "TKT-0039", title: "AWS RDS multi-AZ failover test request", priority: "medium",   status: "open",    updated: "1 day ago" },
  { id: "TKT-0037", title: "Terraform state lock after failed apply",  priority: "high",    status: "resolved", updated: "3 days ago" },
  { id: "TKT-0035", title: "Monthly FinOps cost review — April",       priority: "low",     status: "closed",  updated: "5 days ago" },
];

const priorityColor: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
  high:     "text-orange-400 bg-orange-400/10 border-orange-400/20",
  medium:   "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low:      "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const statusColor: Record<string, string> = {
  open:     "text-brand-accent bg-brand-accent/10 border-brand-accent/20",
  resolved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  closed:   "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

const activeServices = [
  { name: "SAP Managed Services",  tier: "Enterprise", status: "operational", next: "Jun 1, 2026" },
  { name: "Cloud Operations — AWS", tier: "Advanced",   status: "operational", next: "Jun 1, 2026" },
  { name: "DevOps as a Service",    tier: "Standard",   status: "operational", next: "Jun 1, 2026" },
];

const recentResources = [
  { name: "prod-eks-cluster",    type: "Kubernetes",  cloud: "AWS",   region: "us-east-1",      status: "active" },
  { name: "sap-s4-sandbox-02",  type: "SAP Sandbox",  cloud: "Azure", region: "westeurope",     status: "provisioning" },
  { name: "analytics-postgres", type: "Database",     cloud: "GCP",   region: "europe-west1",   status: "active" },
  { name: "dev-vm-fleet",       type: "VM Group",     cloud: "AWS",   region: "eu-west-1",      status: "active" },
];

const resourceStatusStyle: Record<string, string> = {
  active:       "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  provisioning: "text-brand-accent bg-brand-accent/10 border-brand-accent/20",
  terminated:   "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

const cloudBadge: Record<string, string> = {
  AWS:   "text-amber-400",
  Azure: "text-sky-400",
  GCP:   "text-emerald-400",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isUser = user?.role === "user";
  const stats = statsAll.filter(s => !s.costOnly || !isUser);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Good morning, Acme Corp</h1>
          <p className="text-slate-500 text-sm mt-1">Wednesday, 14 May 2026</p>
        </div>
        <Link href="/portal/tickets">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white text-sm">
            + New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className={`grid gap-4 mb-8 ${isUser ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
        {stats.map((s) => (
          <div key={s.label} className="bg-brand-surface border border-white/8 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Infrastructure */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-sm font-semibold text-white">Infrastructure</p>
            <p className="text-xs text-slate-500 mt-0.5">Resources provisioned by Ascelios on your behalf</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/portal/infrastructure" className="text-xs text-brand-primary hover:text-brand-accent transition-colors">
              View all →
            </Link>
            <Link href="/portal/infrastructure/new">
              <Button className="bg-brand-primary hover:bg-brand-accent text-white text-xs h-7 px-3">
                + Provision Resource
              </Button>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {recentResources.map((r) => (
            <div key={r.name} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-slate-400" aria-hidden="true">
                  <rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                  <circle cx="12.5" cy="4.5" r="1" fill="currentColor"/>
                  <circle cx="12.5" cy="11.5" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium font-mono">{r.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.type} · <span className={cloudBadge[r.cloud]}>{r.cloud}</span> · {r.region}</p>
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${resourceStatusStyle[r.status]}`}>
                {r.status === "provisioning" ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                    {r.status}
                  </span>
                ) : r.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Optimisation — managers and admins only */}
      {!isUser && <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden mb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-sm font-semibold text-white">Cost Optimisation</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimated total savings&nbsp;
              <span className="text-emerald-400 font-semibold">$1,709/mo</span>
              &nbsp;across {costRecommendations.length} recommendations
            </p>
          </div>
          <Link href="/portal/billing" className="text-xs text-brand-primary hover:text-brand-accent transition-colors">
            View billing →
          </Link>
        </div>

        {/* FinOps approach steps */}
        <div className="px-6 py-4 border-b border-white/8 bg-white/2">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-3">Ascelios FinOps Approach</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {finopsSteps.map((s, i) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-accent text-[10px] font-bold shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-xs text-white font-medium">{s.label}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{s.desc}</p>
                </div>
                {i < finopsSteps.length - 1 && (
                  <div className="hidden lg:block absolute" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="divide-y divide-white/5">
          {costRecommendations.map((r, idx) => (
            <div key={r.title} className="px-6 py-5 hover:bg-white/3 transition-colors">
              <div className="flex items-start gap-4">
                {/* Index */}
                <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[11px] text-slate-500 font-mono shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm text-white font-medium leading-snug">{r.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border ${categoryStyle[r.category] ?? ""}`}>
                        {r.category}
                      </span>
                      <span className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border ${impactStyle[r.impact]}`}>
                        {r.impact} impact
                      </span>
                      <span className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border ${effortStyle[r.effort]}`}>
                        {r.effort} effort
                      </span>
                      <span className="text-emerald-400 text-xs font-semibold tabular-nums ml-1 whitespace-nowrap">
                        {r.saving}
                      </span>
                    </div>
                  </div>
                  {/* Detail */}
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{r.detail}</p>
                  {/* Approach steps */}
                  <div className="bg-white/3 border border-white/8 rounded-lg px-4 py-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Approach</p>
                    <ol className="space-y-1.5">
                      {r.approach.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="text-brand-accent font-mono shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/8 flex items-center justify-between bg-white/2">
          <p className="text-xs text-slate-500">Recommendations from 30-day usage data · refreshed daily by Ascelios FinOps team</p>
          <Link href="/portal/tickets">
            <Button className="bg-brand-primary hover:bg-brand-accent text-white text-xs h-7 px-3">
              Create Optimisation Ticket
            </Button>
          </Link>
        </div>
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-white">Recent Tickets</p>
            <Link href="/portal/tickets" className="text-xs text-brand-primary hover:text-brand-accent transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentTickets.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.id} · {t.updated}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${priorityColor[t.priority]}`}>
                    {t.priority}
                  </span>
                  <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusColor[t.status]}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Services */}
        <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-white">Active Services</p>
            <Link href="/portal/services" className="text-xs text-brand-primary hover:text-brand-accent transition-colors">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {activeServices.map((s) => (
              <div key={s.name} className="px-6 py-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-white font-medium">{s.name}</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Operational" />
                </div>
                <p className="text-xs text-slate-500">{s.tier} · renews {s.next}</p>
              </div>
            ))}
          </div>
          {!isUser && (
            <div className="px-6 py-4 border-t border-white/8">
              <Link href="/portal/billing/add-funds">
                <Button variant="outline" className="w-full text-sm border-brand-primary/40 text-brand-accent hover:bg-brand-primary/10 hover:text-white">
                  Add Funds
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
