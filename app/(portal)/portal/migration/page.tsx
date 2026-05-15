"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PhaseStatus = "completed" | "in_progress" | "upcoming";

interface MilestoneItem {
  label: string;
  done: boolean;
}

interface Phase {
  id: string;
  number: number;
  title: string;
  description: string;
  status: PhaseStatus;
  progress: number;
  startDate: string;
  endDate: string;
  owner: string;
  milestones: MilestoneItem[];
}

const phases: Phase[] = [
  {
    id: "phase-1",
    number: 1,
    title: "Assessment & Discovery",
    description: "Inventory current workloads, map dependencies, define cloud-readiness score, and agree on target architecture.",
    status: "completed",
    progress: 100,
    startDate: "Jan 2026",
    endDate: "Feb 2026",
    owner: "Ascelios Cloud Architect",
    milestones: [
      { label: "Workload inventory completed", done: true },
      { label: "Dependency mapping finalised", done: true },
      { label: "Cloud-readiness assessment report delivered", done: true },
      { label: "Target architecture approved by Acme Corp", done: true },
      { label: "TCO & business case sign-off", done: true },
    ],
  },
  {
    id: "phase-2",
    number: 2,
    title: "Architecture & Planning",
    description: "Design the landing zone, networking topology, identity integration, and security baseline for the target cloud environment.",
    status: "completed",
    progress: 100,
    startDate: "Feb 2026",
    endDate: "Mar 2026",
    owner: "Ascelios Cloud Architect",
    milestones: [
      { label: "AWS Landing Zone deployed", done: true },
      { label: "Hub-and-spoke VPC topology configured", done: true },
      { label: "Azure AD federation with AWS IAM Identity Centre", done: true },
      { label: "Security baseline (GuardDuty, Security Hub, Config) enabled", done: true },
      { label: "CI/CD pipeline skeleton validated", done: true },
    ],
  },
  {
    id: "phase-3",
    number: 3,
    title: "Pilot Migration",
    description: "Migrate two non-critical workloads to validate tooling, runbooks, and cut-over procedures before the full wave.",
    status: "in_progress",
    progress: 62,
    startDate: "Mar 2026",
    endDate: "May 2026",
    owner: "Ascelios Migration Lead",
    milestones: [
      { label: "Pilot workloads selected (analytics-postgres, dev-vm-fleet)", done: true },
      { label: "Replication streams established via AWS MGN", done: true },
      { label: "Test cut-over completed — zero data loss confirmed", done: true },
      { label: "Performance benchmarks validated in cloud", done: false },
      { label: "Runbook sign-off by Acme Corp ops team", done: false },
    ],
  },
  {
    id: "phase-4",
    number: 4,
    title: "Full Migration — Wave 1",
    description: "Migrate production EKS workloads, RDS databases, and SAP Sandbox to AWS. Achieve 60 % of estate in cloud.",
    status: "upcoming",
    progress: 0,
    startDate: "Jun 2026",
    endDate: "Aug 2026",
    owner: "Ascelios Migration Lead",
    milestones: [
      { label: "Wave 1 migration window agreed (Jun 14–16)", done: false },
      { label: "prod-eks-cluster migrated and validated", done: false },
      { label: "RDS multi-AZ cluster migrated", done: false },
      { label: "SAP S/4HANA Sandbox migrated to AWS", done: false },
      { label: "On-premises footprint decommission plan approved", done: false },
    ],
  },
  {
    id: "phase-5",
    number: 5,
    title: "Full Migration — Wave 2",
    description: "Migrate remaining on-premises workloads. Decommission legacy data-centre racks and complete DNS cut-over.",
    status: "upcoming",
    progress: 0,
    startDate: "Sep 2026",
    endDate: "Oct 2026",
    owner: "Ascelios Migration Lead",
    milestones: [
      { label: "All remaining workloads migrated", done: false },
      { label: "Legacy data centre racks decommissioned", done: false },
      { label: "DNS cut-over completed", done: false },
      { label: "Disaster-recovery runbooks updated", done: false },
    ],
  },
  {
    id: "phase-6",
    number: 6,
    title: "Optimisation & Steady State",
    description: "Right-size resources, implement FinOps practices, enable auto-scaling, and hand off to Ascelios Managed Cloud Ops.",
    status: "upcoming",
    progress: 0,
    startDate: "Nov 2026",
    endDate: "Dec 2026",
    owner: "Ascelios FinOps & SRE",
    milestones: [
      { label: "Reserved Instance / Savings Plan purchase", done: false },
      { label: "Auto-scaling policies tuned to traffic baselines", done: false },
      { label: "Monthly FinOps review cadence established", done: false },
      { label: "Managed Cloud Ops SLA baseline agreed", done: false },
      { label: "Migration closure report delivered", done: false },
    ],
  },
];

const statusConfig: Record<PhaseStatus, { label: string; style: string; dotStyle: string }> = {
  completed:   { label: "Completed",   style: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dotStyle: "bg-emerald-400" },
  in_progress: { label: "In Progress", style: "text-brand-accent bg-brand-accent/10 border-brand-accent/20", dotStyle: "bg-brand-accent animate-pulse" },
  upcoming:    { label: "Upcoming",    style: "text-slate-500 bg-slate-500/10 border-slate-500/20", dotStyle: "bg-slate-600" },
};

const overallProgress = Math.round(
  phases.reduce((sum, p) => sum + p.progress, 0) / phases.length
);

export default function MigrationPage() {
  const completedPhases = phases.filter((p) => p.status === "completed").length;
  const inProgress = phases.find((p) => p.status === "in_progress");

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cloud Migration Journey</h1>
          <p className="text-slate-500 text-sm mt-1">
            {completedPhases} of {phases.length} phases complete ·{" "}
            {inProgress ? `Currently in ${inProgress.title}` : "All phases scheduled"}
          </p>
        </div>
        <Link href="/portal/tickets">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white text-sm">
            + Log Migration Issue
          </Button>
        </Link>
      </div>

      {/* Overall progress bar */}
      <div className="bg-brand-surface border border-white/8 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white">Overall Progress</p>
          <span className="text-sm font-semibold text-brand-accent tabular-nums">{overallProgress}%</span>
        </div>
        <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
          <span><span className="text-emerald-400 font-medium">{completedPhases}</span> phases completed</span>
          <span><span className="text-brand-accent font-medium">{phases.filter((p) => p.status === "in_progress").length}</span> in progress</span>
          <span><span className="text-slate-400 font-medium">{phases.filter((p) => p.status === "upcoming").length}</span> upcoming</span>
          <span className="ml-auto">Target completion: <span className="text-white font-medium">Dec 2026</span></span>
        </div>
      </div>

      {/* Phase timeline */}
      <div className="space-y-4">
        {phases.map((phase, idx) => {
          const cfg = statusConfig[phase.status];
          const isLast = idx === phases.length - 1;

          return (
            <div key={phase.id} className="flex gap-4">
              {/* Timeline spine */}
              <div className="flex flex-col items-center shrink-0 w-8">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                  phase.status === "completed"   ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" :
                  phase.status === "in_progress" ? "border-brand-accent bg-brand-accent/10 text-brand-accent" :
                                                   "border-slate-700 bg-slate-800 text-slate-500"
                )}>
                  {phase.status === "completed" ? "✓" : phase.number}
                </div>
                {!isLast && (
                  <div className={cn(
                    "w-0.5 flex-1 min-h-4 mt-1",
                    phase.status === "completed" ? "bg-emerald-500/30" : "bg-white/8"
                  )} />
                )}
              </div>

              {/* Phase card */}
              <div className={cn(
                "flex-1 bg-brand-surface border rounded-xl overflow-hidden mb-2",
                phase.status === "in_progress" ? "border-brand-accent/30" : "border-white/8"
              )}>
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-white">Phase {phase.number}: {phase.title}</p>
                        <span className={cn("font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border", cfg.style)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{phase.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">{phase.startDate} – {phase.endDate}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{phase.owner}</p>
                    </div>
                  </div>

                  {/* Progress bar (only show when active) */}
                  {phase.status === "in_progress" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>Phase progress</span>
                        <span className="text-brand-accent font-medium">{phase.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-accent rounded-full"
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  <div className="space-y-1.5">
                    {phase.milestones.map((m, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
                          m.done
                            ? "bg-emerald-500/15 border-emerald-500/30"
                            : "bg-white/3 border-white/10"
                        )}>
                          {m.done && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4l2 2 3-3" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className={cn(
                          "text-xs leading-5",
                          m.done ? "text-slate-400 line-through decoration-slate-600" : "text-slate-300"
                        )}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
