"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTickets } from "@/lib/tickets/ticket-context";

/* ── Types ────────────────────────────────────────────── */

type ResType = "Kubernetes" | "VM Group" | "Managed Database" | "Object Storage";
type Severity = "info" | "warning" | "danger";
type ModalState = "form" | "submitting" | "done";

type QuickActionId =
  | "k8s-restart" | "k8s-scale" | "k8s-drain"
  | "vm-reboot" | "vm-scale" | "vm-patch"
  | "db-snapshot" | "db-restart" | "db-scale"
  | "s3-sync" | "s3-lifecycle" | "s3-policy";

type ManagedActionId =
  | "k8s-deploy" | "k8s-update" | "k8s-delete" | "k8s-ingress"
  | "vm-terminate" | "vm-ami" | "vm-resize" | "vm-snapshot"
  | "db-restore" | "db-promote" | "db-reset-pw" | "db-clone"
  | "s3-version" | "s3-copy" | "s3-encrypt" | "s3-cors";

type ActionId = QuickActionId | ManagedActionId;

interface ManagedResource {
  id: string; name: string; type: ResType; cloud: string; region: string;
  status: "active" | "provisioning"; size: string; cost: string;
}

/* ── Static data ─────────────────────────────────────── */

const managedResources: ManagedResource[] = [
  { id: "res-001", name: "prod-eks-cluster",    type: "Kubernetes",       cloud: "AWS",   region: "us-east-1",    status: "active",       size: "3× m5.xlarge",      cost: "$620/mo" },
  { id: "res-003", name: "analytics-postgres",  type: "Managed Database", cloud: "GCP",   region: "europe-west1", status: "active",       size: "db-custom-4-16384", cost: "$210/mo" },
  { id: "res-004", name: "dev-vm-fleet",         type: "VM Group",         cloud: "AWS",   region: "eu-west-1",    status: "active",       size: "4× t3.medium",      cost: "$180/mo" },
  { id: "res-005", name: "ci-runner-pool",       type: "VM Group",         cloud: "AWS",   region: "us-east-1",    status: "active",       size: "2× c5.large spot",  cost: "$95/mo" },
  { id: "res-006", name: "backup-storage",       type: "Object Storage",   cloud: "Azure", region: "westeurope",   status: "active",       size: "12 TB LRS",         cost: "$45/mo" },
];

const quickActionsByType: Record<ResType, { id: QuickActionId; label: string; sub: string; severity: Severity; icon: React.ReactNode }[]> = {
  "Kubernetes": [
    { id: "k8s-restart", label: "Rolling Restart", sub: "Restart all pods gracefully",  severity: "warning",
      icon: <><path d="M13.5 7A6 6 0 1 0 12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13.5 3.5v3.5H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
    { id: "k8s-scale",   label: "Scale Nodes",     sub: "Adjust node group size",       severity: "info",
      icon: <><rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M8 7v2M6 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></> },
    { id: "k8s-drain",   label: "Drain Node",      sub: "Cordon and drain a node",      severity: "warning",
      icon: <><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></> },
  ],
  "VM Group": [
    { id: "vm-reboot", label: "Reboot Fleet",  sub: "Rolling reboot of all VMs",    severity: "warning",
      icon: <><path d="M13.5 7A6 6 0 1 0 12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13.5 3.5v3.5H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
    { id: "vm-scale",  label: "Scale Fleet",   sub: "Add or remove instances",      severity: "info",
      icon: <><rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><circle cx="12.5" cy="4.5" r="1" fill="currentColor"/><circle cx="12.5" cy="11.5" r="1" fill="currentColor"/></> },
    { id: "vm-patch",  label: "OS Patching",   sub: "Apply security patches",       severity: "info",
      icon: <><path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/></> },
  ],
  "Managed Database": [
    { id: "db-snapshot", label: "Create Snapshot", sub: "On-demand backup",              severity: "info",
      icon: <><ellipse cx="8" cy="5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3 5v6a5 2 0 0 0 10 0V5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 8a5 2 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4"/></> },
    { id: "db-restart",  label: "Restart Service", sub: "Graceful database restart",     severity: "warning",
      icon: <><path d="M13.5 7A6 6 0 1 0 12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13.5 3.5v3.5H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
    { id: "db-scale",    label: "Scale Compute",   sub: "Resize instance class",         severity: "info",
      icon: <><rect x="2" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 16h8M9 12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 5v4M7 7h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></> },
  ],
  "Object Storage": [
    { id: "s3-sync",      label: "Sync Replica",   sub: "Trigger cross-region sync",     severity: "info",
      icon: <><path d="M2 8h12M10 5l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 4h5M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></> },
    { id: "s3-lifecycle", label: "Set Lifecycle",  sub: "Configure retention rules",     severity: "info",
      icon: <><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></> },
    { id: "s3-policy",    label: "Access Policy",  sub: "Update bucket permissions",     severity: "warning",
      icon: <><path d="M8 1.333L13.333 3.667v4c0 3.2-2.133 5.867-5.333 6.666C2.8 13.534.667 10.867.667 7.667v-4L8 1.333Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5.333 8l1.667 1.667L10.667 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
  ],
};

const managedActionsByType: Record<ResType, { id: ManagedActionId; label: string; sub: string; icon: React.ReactNode }[]> = {
  "Kubernetes": [
    { id: "k8s-deploy",  label: "Deploy Workload",  sub: "Push a new workload version",
      icon: <><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/></> },
    { id: "k8s-update",  label: "Update Cluster",   sub: "Upgrade k8s control plane",
      icon: <><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
    { id: "k8s-delete",  label: "Delete Workload",  sub: "Remove a workload namespace",
      icon: <><path d="M5.5 5.5l7 7M12.5 5.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/></> },
    { id: "k8s-ingress", label: "Update Ingress",   sub: "Modify ingress routing rules",
      icon: <><path d="M1.333 8h13.334M10 3.333L14.667 8 10 12.667" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
  ],
  "VM Group": [
    { id: "vm-terminate", label: "Terminate VM",     sub: "Permanently delete instance",
      icon: <><path d="M5.5 5.5l7 7M12.5 5.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/></> },
    { id: "vm-ami",       label: "Update AMI",       sub: "Replace base image for fleet",
      icon: <><rect x="2" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 16h8M9 12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 6.5l2 2 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></> },
    { id: "vm-resize",    label: "Resize Instance",  sub: "Change instance type",
      icon: <><rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M8 7v2M6 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></> },
    { id: "vm-snapshot",  label: "Create Snapshot",  sub: "On-demand VM disk backup",
      icon: <><path d="M2 6l6-4 6 4v8l-6 2-6-2V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 6l6 4 6-4M8 10v6" stroke="currentColor" strokeWidth="1.4"/></> },
  ],
  "Managed Database": [
    { id: "db-restore",   label: "Restore Backup",  sub: "Restore from a snapshot",
      icon: <><path d="M13.5 7A6 6 0 1 0 12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13.5 3.5v3.5H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
    { id: "db-promote",   label: "Promote Replica", sub: "Promote read replica to primary",
      icon: <><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
    { id: "db-reset-pw",  label: "Reset Password",  sub: "Rotate master credentials",
      icon: <><rect x="3" y="7" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5.5a3 3 0 0 1 6 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8.5" cy="11" r="1" fill="currentColor"/></> },
    { id: "db-clone",     label: "Clone Instance",  sub: "Create a dev/test clone",
      icon: <><rect x="2" y="8" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="11" y="2" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M7 11h3l-1.5-1.5M10 11l-1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 5H7l1.5-1.5M7 5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  ],
  "Object Storage": [
    { id: "s3-version",  label: "Versioning",        sub: "Enable object versioning",
      icon: <><path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/></> },
    { id: "s3-copy",     label: "Cross-Region Copy", sub: "Copy bucket to another region",
      icon: <><path d="M2 8h12M10 5l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 4h5M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></> },
    { id: "s3-encrypt",  label: "Encryption",        sub: "Configure SSE-KMS settings",
      icon: <><rect x="3" y="7" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5.5a3 3 0 0 1 6 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8.5" cy="11" r="1" fill="currentColor"/></> },
    { id: "s3-cors",     label: "CORS Rules",        sub: "Update CORS configuration",
      icon: <><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></> },
  ],
};

const severityStyle = {
  info:    { card: "hover:border-brand-primary/40 hover:bg-brand-primary/5", icon: "text-brand-accent bg-brand-accent/10 border-brand-accent/20" },
  warning: { card: "hover:border-amber-400/40 hover:bg-amber-400/5",        icon: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  danger:  { card: "hover:border-red-400/40 hover:bg-red-400/5",            icon: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const cloudColor: Record<string, string> = { AWS: "text-amber-400", Azure: "text-sky-400", GCP: "text-emerald-400" };

/* ── Shared UI atoms ─────────────────────────────────── */

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div ref={ref} className="relative z-10 w-full max-w-xl bg-[#0d1f2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, sub, severity, onClose }: { title: string; sub?: string; severity: Severity; onClose: () => void }) {
  const border = severity === "danger" ? "border-red-500/30" : severity === "warning" ? "border-amber-400/20" : "border-white/8";
  return (
    <div className={`flex items-start justify-between px-6 py-4 border-b ${border} shrink-0`}>
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors mt-0.5 shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function DoneState({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="px-6 py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-8" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <p className="text-white font-medium mb-1">Action completed</p>
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <Button onClick={onClose} className="bg-brand-primary hover:bg-brand-accent text-white">Close</Button>
    </div>
  );
}

function TicketCreatedState({ ticketId, operation, onClose }: { ticketId: string; operation: string; onClose: () => void }) {
  return (
    <div className="px-6 py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M17 7H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM14 7V5a2 2 0 0 0-4 0v2" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-white font-semibold mb-1">Ticket Created — Pending Approval</p>
      <p className="text-brand-accent font-mono text-sm mb-2">{ticketId}</p>
      <p className="text-slate-400 text-sm mb-1">{operation}</p>
      <p className="text-slate-500 text-xs mb-6 leading-relaxed max-w-xs mx-auto">
        An Ascelios engineer will review and approve this request within 4 business hours. Execution will only begin after explicit approval.
      </p>
      <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
        <Link href="/portal/tickets">
          <Button className="w-full bg-brand-primary hover:bg-brand-accent text-white text-sm">View Ticket</Button>
        </Link>
        <Button variant="outline" onClick={onClose} className="w-full border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-sm">Close</Button>
      </div>
    </div>
  );
}

function ApprovalNotice() {
  return (
    <div className="bg-brand-accent/6 border border-brand-accent/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-brand-accent shrink-0 mt-0.5">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7 4.5v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <p className="text-slate-400 leading-relaxed">
        <span className="text-brand-accent font-medium">Approval required. </span>
        Submitting this form creates a ticket. An Ascelios engineer must approve before any work begins.
      </p>
    </div>
  );
}

function ActionTile({ label, sub, severity, icon, onClick }: { label: string; sub: string; severity: Severity; icon: React.ReactNode; onClick: () => void }) {
  const s = severityStyle[severity];
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-2 p-3 rounded-xl border border-white/8 bg-white/3 transition-all text-center ${s.card}`}
    >
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${s.icon}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">{icon}</svg>
      </div>
      <div>
        <p className="text-[11px] font-medium text-white leading-tight">{label}</p>
        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{sub}</p>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   QUICK OPERATION MODALS (immediate, no ticket)
───────────────────────────────────────────────────────── */

function K8sRollingRestartModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [checks, setChecks] = useState([false, false]);
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`Rolling restart initiated on ${resource.name}. Pods will cycle one at a time to preserve availability.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Rolling Restart" sub={`${resource.name} · all deployments`} severity="warning" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Each pod will be terminated and replaced one-by-one. Services with <code className="bg-white/10 px-1 rounded">minReadySeconds</code> set will respect that window. Total duration depends on pod startup time.</p>
        </div>
        <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-1.5 text-xs">
          {[{ label: "Strategy", value: "RollingUpdate (default)" }, { label: "Scope", value: "All namespaces and deployments" }, { label: "Est. duration", value: "5–15 min depending on pod count" }].map(({ label, value }) => (
            <div key={label} className="flex gap-3"><span className="text-slate-500 w-28 shrink-0">{label}</span><span className="text-slate-300">{value}</span></div>
          ))}
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Pre-restart checklist</p>
          {["No active deployments or CI pipelines in progress", "PodDisruptionBudgets will not cause a restart loop"].map((item, i) => (
            <label key={item} className="flex items-start gap-2.5 cursor-pointer mb-2">
              <input type="checkbox" checked={checks[i]} onChange={(e) => { const n = [...checks]; n[i] = e.target.checked; setChecks(n); }} className="mt-0.5 accent-brand-primary shrink-0" />
              <span className="text-xs text-slate-300 leading-relaxed">{item}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!checks.every(Boolean) || state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1400)); setState("done"); }} className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[140px]">
          {state === "submitting" ? "Initiating…" : "Start Rolling Restart"}
        </Button>
      </div>
    </>
  );
}

function K8sScaleNodesModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [target, setTarget] = useState(3);
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`Node group scaling to ${target} nodes initiated on ${resource.name}.`} onClose={onClose} />;
  const current = 3;
  const isScaleDown = target < current;
  return (
    <>
      <ModalHeader title="Scale Nodes" sub={`${resource.name} · current: ${current} nodes`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Min", value: "2" }, { label: "Current", value: String(current) }, { label: "Max", value: "10" }].map(({ label, value }) => (
            <div key={label} className="bg-white/3 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-lg font-semibold text-white font-mono">{value}</p>
            </div>
          ))}
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-3 block">Target node count: <span className="text-white font-semibold ml-1 font-mono">{target}</span></Label>
          <input type="range" min={2} max={10} value={target} onChange={e => setTarget(Number(e.target.value))}
            className="w-full accent-brand-primary" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>2</span><span>10</span></div>
        </div>
        {isScaleDown && (
          <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <p>Scaling down drains nodes gracefully but may interrupt workloads that can't reschedule. Ensure PodDisruptionBudgets allow this change.</p>
          </div>
        )}
        <div className="flex gap-3 text-xs">
          <div className="flex-1 bg-white/3 border border-white/10 rounded-lg p-2.5">
            <p className="text-slate-500 mb-0.5">Cost impact</p>
            <p className={`font-medium ${target > current ? "text-amber-400" : "text-emerald-400"}`}>
              {target > current ? `+${(target - current) * 206}/mo est.` : target < current ? `−${(current - target) * 206}/mo est.` : "No change"}
            </p>
          </div>
          <div className="flex-1 bg-white/3 border border-white/10 rounded-lg p-2.5">
            <p className="text-slate-500 mb-0.5">Change</p>
            <p className="text-white font-mono">{current} → {target} nodes</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={target === current || state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1400)); setState("done"); }} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[120px]">
          {state === "submitting" ? "Scaling…" : "Apply Scale"}
        </Button>
      </div>
    </>
  );
}

function VMScaleFleetModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const currentCount = resource.name === "dev-vm-fleet" ? 4 : 2;
  const [target, setTarget] = useState(currentCount);
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`Fleet scaling to ${target} instances initiated on ${resource.name}.`} onClose={onClose} />;
  const isSpot = resource.name === "ci-runner-pool";
  return (
    <>
      <ModalHeader title="Scale Fleet" sub={`${resource.name} · ${currentCount} instances ${isSpot ? "(spot)" : ""}`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div>
          <Label className="text-xs text-slate-400 mb-3 block">Target instance count: <span className="text-white font-semibold ml-1 font-mono">{target}</span></Label>
          <input type="range" min={0} max={12} value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full accent-brand-primary" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>0</span><span>12</span></div>
        </div>
        {isSpot && (
          <div className="bg-brand-accent/6 border border-brand-accent/15 rounded-xl px-4 py-3 text-xs text-slate-400">
            <span className="text-brand-accent font-medium">Spot fleet. </span>
            AWS Spot capacity is not guaranteed. Scale-up requests may not be fulfilled immediately if spot capacity is constrained.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/3 border border-white/10 rounded-lg p-2.5">
            <p className="text-slate-500 mb-0.5">Change</p>
            <p className="text-white font-mono">{currentCount} → {target} instances</p>
          </div>
          <div className="bg-white/3 border border-white/10 rounded-lg p-2.5">
            <p className="text-slate-500 mb-0.5">Est. time</p>
            <p className="text-white">{target > currentCount ? "3–5 min" : "1–2 min"}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={target === currentCount || state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1400)); setState("done"); }} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[120px]">
          {state === "submitting" ? "Scaling…" : "Apply Scale"}
        </Button>
      </div>
    </>
  );
}

function VMOSPatchModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [schedule, setSchedule] = useState<"immediate" | "window">("window");
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`OS patching job queued for ${resource.name}. Instances will be patched one-by-one.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="OS Patching" sub={`${resource.name} · all instances`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-1.5 text-xs">
          {[{ label: "Patch set", value: "All available security patches" }, { label: "Strategy", value: "Rolling — one instance at a time" }, { label: "Est. downtime per VM", value: "10–20 minutes" }].map(({ label, value }) => (
            <div key={label} className="flex gap-3"><span className="text-slate-500 w-36 shrink-0">{label}</span><span className="text-slate-300">{value}</span></div>
          ))}
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Patch window</Label>
          <div className="grid grid-cols-2 gap-3">
            {([{ id: "immediate" as const, label: "Immediate", sub: "Start within 15 min" }, { id: "window" as const, label: "Next maintenance window", sub: "Sun 02:00–06:00 UTC" }]).map(opt => (
              <button key={opt.id} onClick={() => setSchedule(opt.id)} className={`p-3 rounded-xl border text-left transition-all ${schedule === opt.id ? "bg-brand-primary/15 border-brand-primary" : "bg-white/3 border-white/10 hover:border-white/20"}`}>
                <p className={`text-sm font-medium ${schedule === opt.id ? "text-brand-accent" : "text-white"}`}>{opt.label}</p>
                <p className={`text-xs mt-0.5 ${schedule === opt.id ? "text-slate-400" : "text-slate-500"}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
          {schedule === "immediate" && <p className="mt-2 text-xs text-amber-400 bg-amber-400/8 border border-amber-400/15 rounded-lg px-3 py-2">Immediate patching will cause rolling instance restarts outside of any change window.</p>}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1400)); setState("done"); }} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[120px]">
          {state === "submitting" ? "Queuing…" : "Schedule Patch"}
        </Button>
      </div>
    </>
  );
}

function VMRebootFleetModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const valid = confirm === resource.name;
  if (state === "done") return <DoneState message={`Rolling reboot initiated on ${resource.name}. Instances will restart one-by-one.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Reboot Fleet" sub={`${resource.name} · rolling restart`} severity="warning" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Instances will be rebooted one-by-one. Active connections will be dropped per instance during its reboot cycle. Est. per-instance downtime: <strong>2–4 minutes</strong>.</p>
        </div>
        <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-1.5 text-xs">
          {[{ label: "Strategy", value: "Rolling — one instance at a time" }, { label: "Total est. time", value: `${resource.name === "dev-vm-fleet" ? "~16" : "~8"} min` }, { label: "Rollback", value: "N/A — reboot is reversible" }].map(({ label, value }) => (
            <div key={label} className="flex gap-3"><span className="text-slate-500 w-28 shrink-0">{label}</span><span className="text-slate-300">{value}</span></div>
          ))}
        </div>
        <div>
          <Label htmlFor="reboot-confirm" className="text-xs text-slate-400 mb-1.5 block">
            Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">{resource.name}</span> to confirm
          </Label>
          <Input id="reboot-confirm" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={resource.name} className="bg-white/5 border-amber-400/20 focus-visible:border-amber-400 text-white placeholder:text-slate-700 font-mono" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid || state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1500)); setState("done"); }} className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Rebooting…" : "Reboot Fleet"}
        </Button>
      </div>
    </>
  );
}

function DBSnapshotModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [name, setName] = useState(`${resource.name}-manual-${new Date().toISOString().slice(0, 10)}`);
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`Snapshot "${name}" initiated. It will appear in your backup list within a few minutes.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Create Snapshot" sub={`${resource.name} · on-demand backup`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-1.5 text-xs">
          {[{ label: "Type", value: "Consistent snapshot" }, { label: "Impact", value: "Zero downtime (brief I/O pause)" }, { label: "Retention", value: "30 days (default policy)" }].map(({ label, value }) => (
            <div key={label} className="flex gap-3"><span className="text-slate-500 w-24 shrink-0">{label}</span><span className="text-slate-300">{value}</span></div>
          ))}
        </div>
        <div>
          <Label htmlFor="snap-name" className="text-xs text-slate-400 mb-1.5 block">Snapshot name</Label>
          <Input id="snap-name" value={name} onChange={e => setName(e.target.value)} className="bg-white/5 border-white/15 focus-visible:border-brand-primary text-white font-mono" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!name.trim() || state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1200)); setState("done"); }} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[140px]">
          {state === "submitting" ? "Creating…" : "Create Snapshot"}
        </Button>
      </div>
    </>
  );
}

function DBRestartModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const valid = confirm === resource.name;
  if (state === "done") return <DoneState message={`Restart initiated for ${resource.name}. Connections will be interrupted for 30–90 seconds.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Restart Database Service" sub={`${resource.name} · brief connection interruption`} severity="warning" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>All active connections will be dropped. Applications should handle reconnect automatically. Expected downtime: <strong>30–90 seconds</strong>.</p>
        </div>
        <div>
          <Label htmlFor="db-confirm" className="text-xs text-slate-400 mb-1.5 block">
            Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">{resource.name}</span> to confirm
          </Label>
          <Input id="db-confirm" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={resource.name} className="bg-white/5 border-amber-400/20 focus-visible:border-amber-400 text-white placeholder:text-slate-700 font-mono" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid || state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1500)); setState("done"); }} className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Restarting…" : "Restart Service"}
        </Button>
      </div>
    </>
  );
}

function S3SyncModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`Sync job initiated for ${resource.name}. Objects will propagate to replica within minutes.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Sync Replica" sub={`${resource.name} · trigger cross-region replication`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-1.5 text-xs">
          {[{ label: "Source", value: "westeurope (primary)" }, { label: "Replica", value: "northeurope (DR)" }, { label: "Objects", value: "12 TB (~2.4 M objects)" }, { label: "Est. time", value: "Varies — large objects sync first" }].map(({ label, value }) => (
            <div key={label} className="flex gap-3"><span className="text-slate-500 w-24 shrink-0">{label}</span><span className="text-slate-300">{value}</span></div>
          ))}
        </div>
        <p className="text-xs text-slate-500">Only objects modified since the last sync will be transferred. No data loss risk — this is additive.</p>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1200)); setState("done"); }} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[120px]">
          {state === "submitting" ? "Triggering…" : "Trigger Sync"}
        </Button>
      </div>
    </>
  );
}

function S3LifecycleModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const [standard, setStandard] = useState("30");
  const [ia, setIa] = useState("90");
  const [glacier, setGlacier] = useState("365");
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`Lifecycle policy updated for ${resource.name}.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Configure Lifecycle" sub={`${resource.name} · retention rules`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <p className="text-xs text-slate-500">Set the number of days before objects transition between storage tiers.</p>
        {[{ label: "Standard → Infrequent Access", value: ia, set: setIa, id: "ia" }, { label: "Standard → Glacier", value: glacier, set: setGlacier, id: "glacier" }, { label: "Delete after (days)", value: standard, set: setStandard, id: "del" }].map(({ label, value, set, id }) => (
          <div key={id}>
            <Label htmlFor={id} className="text-xs text-slate-400 mb-1.5 block">{label}</Label>
            <div className="flex items-center gap-2">
              <Input id={id} type="number" min={1} value={value} onChange={e => set(e.target.value)} className="bg-white/5 border-white/15 focus-visible:border-brand-primary text-white w-24 font-mono" />
              <span className="text-xs text-slate-500">days</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1000)); setState("done"); }} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[130px]">
          {state === "submitting" ? "Saving…" : "Save Lifecycle"}
        </Button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   MANAGED OPERATION MODALS (ticket-creating)
───────────────────────────────────────────────────────── */

function K8sDeployModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("latest");
  const [namespace, setNamespace] = useState("default");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const valid = image.trim().length > 0;
  if (state === "done") return <TicketCreatedState ticketId={ticketId} operation={`Deploy ${image}:${tag} to ${resource.name} (${namespace})`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Deploy Workload" sub={`${resource.name} · create change ticket`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <ApprovalNotice />
        <div>
          <Label htmlFor="img" className="text-xs text-slate-400 mb-1.5 block">Container image</Label>
          <Input id="img" value={image} onChange={e => setImage(e.target.value)} placeholder="e.g. myapp/api" className="bg-white/5 border-white/15 focus-visible:border-brand-primary text-white font-mono placeholder:text-slate-700" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tag" className="text-xs text-slate-400 mb-1.5 block">Image tag</Label>
            <Input id="tag" value={tag} onChange={e => setTag(e.target.value)} className="bg-white/5 border-white/15 focus-visible:border-brand-primary text-white font-mono" />
          </div>
          <div>
            <Label htmlFor="ns" className="text-xs text-slate-400 mb-1.5 block">Namespace</Label>
            <Input id="ns" value={namespace} onChange={e => setNamespace(e.target.value)} className="bg-white/5 border-white/15 focus-visible:border-brand-primary text-white font-mono" />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid || state === "submitting"} onClick={async () => {
          setState("submitting");
          await new Promise(r => setTimeout(r, 1000));
          const t = createTicket({ title: `Deploy ${image}:${tag} to ${resource.name}`, type: "infra-operation", detail: { resource: resource.name, image, tag, namespace } });
          setTicketId(t.id);
          setState("done");
        }} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Creating ticket…" : "Create Ticket"}
        </Button>
      </div>
    </>
  );
}

function VMTerminateModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const { createTicket } = useTickets();
  const instances = resource.name === "dev-vm-fleet" ? ["i-0a1b2c3d", "i-0e4f5a6b", "i-07c8d9e0", "i-0f1a2b3c"] : ["i-0spot01aa", "i-0spot02bb"];
  const [selected, setSelected] = useState(instances[0]);
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const valid = confirm === selected;
  if (state === "done") return <TicketCreatedState ticketId={ticketId} operation={`Terminate instance ${selected} from ${resource.name}`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Terminate Instance" sub={`${resource.name} · permanent deletion`} severity="danger" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <ApprovalNotice />
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300 flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Termination is irreversible. The instance and its ephemeral storage will be permanently deleted. A final snapshot will be taken before execution.</p>
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Select instance to terminate</Label>
          <div className="space-y-1.5">
            {instances.map(i => (
              <button key={i} onClick={() => setSelected(i)} className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-mono transition-all ${selected === i ? "bg-red-500/10 border-red-500/40 text-red-300" : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20"}`}>{i}</button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="term-confirm" className="text-xs text-slate-400 mb-1.5 block">
            Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">{selected}</span> to confirm
          </Label>
          <Input id="term-confirm" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={selected} className="bg-white/5 border-red-500/20 focus-visible:border-red-500 text-white placeholder:text-slate-700 font-mono" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-red-500/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid || state === "submitting"} onClick={async () => {
          setState("submitting");
          await new Promise(r => setTimeout(r, 1000));
          const t = createTicket({ title: `Terminate instance ${selected} from ${resource.name}`, type: "infra-operation", detail: { resource: resource.name, instanceId: selected } });
          setTicketId(t.id);
          setState("done");
        }} className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Creating ticket…" : "Create Ticket"}
        </Button>
      </div>
    </>
  );
}

function DBScaleComputeModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const { createTicket } = useTickets();
  const tiers = [
    { id: "db-custom-2-8192",    label: "db-custom-2-8192",    desc: "2 vCPU · 8 GB",  cost: "$110/mo" },
    { id: "db-custom-4-16384",   label: "db-custom-4-16384",   desc: "4 vCPU · 16 GB", cost: "$210/mo", current: true },
    { id: "db-custom-8-32768",   label: "db-custom-8-32768",   desc: "8 vCPU · 32 GB", cost: "$400/mo" },
    { id: "db-custom-16-65536",  label: "db-custom-16-65536",  desc: "16 vCPU · 64 GB",cost: "$790/mo" },
  ];
  const [selected, setSelected] = useState("db-custom-4-16384");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const unchanged = selected === "db-custom-4-16384";
  if (state === "done") return <TicketCreatedState ticketId={ticketId} operation={`Scale ${resource.name} to ${selected}`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Scale Compute" sub={`${resource.name} · resize instance class`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <ApprovalNotice />
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Scaling requires a brief maintenance window. Expect 2–5 minutes of downtime. All connections will be dropped during the resize.</p>
        </div>
        <div className="space-y-2">
          {tiers.map(tier => (
            <button key={tier.id} onClick={() => setSelected(tier.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${selected === tier.id ? "bg-brand-primary/15 border-brand-primary" : "bg-white/3 border-white/10 hover:border-white/20"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-mono font-medium ${selected === tier.id ? "text-brand-accent" : "text-white"}`}>{tier.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tier.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{tier.cost}</p>
                  {tier.current && <span className="text-[10px] text-brand-accent font-mono">current</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={unchanged || state === "submitting"} onClick={async () => {
          setState("submitting");
          await new Promise(r => setTimeout(r, 1000));
          const t = createTicket({ title: `Scale ${resource.name} to ${selected}`, type: "infra-operation", detail: { resource: resource.name, targetClass: selected } });
          setTicketId(t.id);
          setState("done");
        }} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Creating ticket…" : "Create Ticket"}
        </Button>
      </div>
    </>
  );
}

function DBRestoreModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const { createTicket } = useTickets();
  const snapshots = [
    { id: "snap-20260514-0300", label: "auto-20260514-0300", age: "Today 03:00 UTC",    size: "38 GB" },
    { id: "snap-20260513-0300", label: "auto-20260513-0300", age: "Yesterday 03:00 UTC", size: "37 GB" },
    { id: "snap-20260512-0300", label: "auto-20260512-0300", age: "2 days ago",          size: "37 GB" },
    { id: "snap-manual-0501",   label: "manual-20260501",    age: "13 days ago",         size: "35 GB" },
  ];
  const [selected, setSelected] = useState(snapshots[0].id);
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const valid = confirm === resource.name;
  if (state === "done") return <TicketCreatedState ticketId={ticketId} operation={`Restore ${resource.name} from ${snapshots.find(s => s.id === selected)?.label}`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Restore Backup" sub={`${resource.name} · overwrites current data`} severity="warning" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <ApprovalNotice />
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Restoring overwrites the current database. All data changes since the snapshot will be lost. The database will be offline during restore (est. 30–60 min).</p>
        </div>
        <div className="space-y-1.5">
          {snapshots.map(snap => (
            <button key={snap.id} onClick={() => setSelected(snap.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${selected === snap.id ? "bg-amber-400/10 border-amber-400/40" : "bg-white/3 border-white/10 hover:border-white/20"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-mono ${selected === snap.id ? "text-amber-300" : "text-white"}`}>{snap.label}</p>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">{snap.age}</p>
                  <p className="text-[11px] text-slate-600">{snap.size}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div>
          <Label htmlFor="restore-confirm" className="text-xs text-slate-400 mb-1.5 block">
            Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">{resource.name}</span> to confirm
          </Label>
          <Input id="restore-confirm" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={resource.name} className="bg-white/5 border-amber-400/20 focus-visible:border-amber-400 text-white placeholder:text-slate-700 font-mono" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid || state === "submitting"} onClick={async () => {
          setState("submitting");
          await new Promise(r => setTimeout(r, 1000));
          const t = createTicket({ title: `Restore ${resource.name} from snapshot ${snapshots.find(s => s.id === selected)?.label}`, type: "infra-operation", detail: { resource: resource.name, snapshotId: selected } });
          setTicketId(t.id);
          setState("done");
        }} className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Creating ticket…" : "Create Ticket"}
        </Button>
      </div>
    </>
  );
}

function S3AccessPolicyModal({ resource, onClose }: { resource: ManagedResource; onClose: () => void }) {
  const { createTicket } = useTickets();
  const policies = [
    { id: "private",     label: "Private",           desc: "No public access — Ascelios-managed IAM roles only" },
    { id: "restricted",  label: "Restricted",         desc: "Read access to specific AWS accounts via bucket policy" },
    { id: "public-read", label: "Public Read",        desc: "Objects readable by anyone (suitable for static assets only)" },
  ];
  const [selected, setSelected] = useState("private");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  if (state === "done") return <TicketCreatedState ticketId={ticketId} operation={`Set access policy on ${resource.name} to "${policies.find(p => p.id === selected)?.label}"`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Set Access Policy" sub={`${resource.name} · bucket permissions`} severity="warning" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <ApprovalNotice />
        <div className="space-y-2">
          {policies.map(policy => (
            <button key={policy.id} onClick={() => setSelected(policy.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${selected === policy.id ? "bg-brand-primary/15 border-brand-primary" : "bg-white/3 border-white/10 hover:border-white/20"}`}>
              <p className={`text-sm font-medium ${selected === policy.id ? "text-brand-accent" : "text-white"}`}>{policy.label}</p>
              <p className={`text-xs mt-0.5 ${selected === policy.id ? "text-slate-400" : "text-slate-500"}`}>{policy.desc}</p>
            </button>
          ))}
        </div>
        {selected === "public-read" && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300 flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <p>Public read makes all objects world-readable. Ensure no sensitive data is stored in this bucket before proceeding.</p>
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={state === "submitting"} onClick={async () => {
          setState("submitting");
          await new Promise(r => setTimeout(r, 1000));
          const t = createTicket({ title: `Set access policy on ${resource.name} to "${policies.find(p => p.id === selected)?.label}"`, type: "infra-operation", detail: { resource: resource.name, policy: selected } });
          setTicketId(t.id);
          setState("done");
        }} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Creating ticket…" : "Create Ticket"}
        </Button>
      </div>
    </>
  );
}

/* Generic managed-operation modal for actions not needing a bespoke form */
function GenericManagedModal({ title, sub, resource, onClose }: { title: string; sub: string; resource: ManagedResource; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  if (state === "done") return <TicketCreatedState ticketId={ticketId} operation={`${title} on ${resource.name}`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title={title} sub={`${resource.name} · ${sub}`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <ApprovalNotice />
        <div>
          <Label htmlFor="notes" className="text-xs text-slate-400 mb-1.5 block">Additional notes / requirements (optional)</Label>
          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any specific requirements or context for the Ascelios engineer…" className="w-full bg-white/5 border border-white/15 focus:border-brand-primary text-white text-sm rounded-lg px-3 py-2 outline-none resize-none placeholder:text-slate-700" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={state === "submitting"} onClick={async () => {
          setState("submitting");
          await new Promise(r => setTimeout(r, 1000));
          const t = createTicket({ title: `${title} — ${resource.name}`, type: "infra-operation", detail: { resource: resource.name, operation: title, notes } });
          setTicketId(t.id);
          setState("done");
        }} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[130px]">
          {state === "submitting" ? "Creating ticket…" : "Create Ticket"}
        </Button>
      </div>
    </>
  );
}

/* ── Widget ───────────────────────────────────────────── */

export function ResourceManagementWidget() {
  const [selected, setSelected] = useState<ManagedResource>(managedResources[0]);
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  function closeModal() { setActiveAction(null); }

  const quickActions = quickActionsByType[selected.type];
  const managedActions = managedActionsByType[selected.type];

  const managedActionMeta: Record<ManagedActionId, { title: string; sub: string }> = {
    "k8s-deploy":  { title: "Deploy Workload",    sub: "Push a new workload version" },
    "k8s-update":  { title: "Update Cluster",     sub: "Upgrade k8s control plane" },
    "k8s-delete":  { title: "Delete Workload",    sub: "Remove a workload namespace" },
    "k8s-ingress": { title: "Update Ingress",     sub: "Modify ingress routing rules" },
    "vm-terminate":{ title: "Terminate Instance", sub: "Permanently delete instance" },
    "vm-ami":      { title: "Update AMI",         sub: "Replace base image for fleet" },
    "vm-resize":   { title: "Resize Instance",    sub: "Change instance type" },
    "vm-snapshot": { title: "Create Snapshot",    sub: "On-demand VM disk backup" },
    "db-restore":  { title: "Restore Backup",     sub: "Restore from a snapshot" },
    "db-promote":  { title: "Promote Replica",    sub: "Promote read replica to primary" },
    "db-reset-pw": { title: "Reset Password",     sub: "Rotate master credentials" },
    "db-clone":    { title: "Clone Instance",     sub: "Create a dev/test clone" },
    "s3-version":  { title: "Enable Versioning",  sub: "Enable object versioning" },
    "s3-copy":     { title: "Cross-Region Copy",  sub: "Copy bucket to another region" },
    "s3-encrypt":  { title: "Encryption Config",  sub: "Configure SSE-KMS settings" },
    "s3-cors":     { title: "Update CORS Rules",  sub: "Update CORS configuration" },
  };

  return (
    <>
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-sm font-semibold text-white">Manage Resource</p>
            <p className="text-xs text-slate-500 mt-0.5">Operations on cloud resources</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${selected.status === "active" ? "bg-emerald-400" : "bg-amber-400"}`} />
            <select
              value={selected.id}
              onChange={e => { const r = managedResources.find(x => x.id === e.target.value); if (r) setSelected(r); }}
              className="bg-white/5 border border-white/15 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
            >
              {managedResources.map(r => <option key={r.id} value={r.id} className="bg-[#0d1f2d]">{r.name}</option>)}
            </select>
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 py-2.5 border-b border-white/5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          {[
            { label: "Type",   value: selected.type },
            { label: "Cloud",  value: selected.cloud },
            { label: "Region", value: selected.region },
            { label: "Size",   value: selected.size },
            { label: "Cost",   value: selected.cost },
          ].map(({ label, value }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="text-slate-600">{label}:</span>
              <span className={label === "Cloud" ? `font-mono ${cloudColor[selected.cloud]}` : "text-slate-400 font-mono"}>{value}</span>
            </span>
          ))}
        </div>

        {/* Quick Operations */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Quick Operations</p>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map(a => (
              <ActionTile key={a.id} label={a.label} sub={a.sub} severity={a.severity} icon={a.icon} onClick={() => setActiveAction(a.id)} />
            ))}
          </div>
        </div>

        <div className="mx-5 h-px bg-white/8 my-1" />

        {/* Managed Operations */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Infrastructure Changes</p>
            <span className="font-mono text-[9px] text-brand-accent border border-brand-accent/30 rounded-full px-1.5 py-0.5 uppercase tracking-wide">Creates ticket · requires approval</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {managedActions.map(a => (
              <ActionTile key={a.id} label={a.label} sub={a.sub} severity="info" icon={a.icon} onClick={() => setActiveAction(a.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick operation modals */}
      <Modal open={activeAction === "k8s-restart"} onClose={closeModal}><K8sRollingRestartModal resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "k8s-scale"}   onClose={closeModal}><K8sScaleNodesModal    resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "vm-reboot"}   onClose={closeModal}><VMRebootFleetModal      resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "vm-scale"}    onClose={closeModal}><VMScaleFleetModal      resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "vm-patch"}    onClose={closeModal}><VMOSPatchModal         resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "db-snapshot"} onClose={closeModal}><DBSnapshotModal        resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "db-restart"}  onClose={closeModal}><DBRestartModal         resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "db-scale"}    onClose={closeModal}><DBScaleComputeModal    resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "s3-sync"}     onClose={closeModal}><S3SyncModal            resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "s3-lifecycle"}onClose={closeModal}><S3LifecycleModal       resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "s3-policy"}   onClose={closeModal}><S3AccessPolicyModal    resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "k8s-drain"}   onClose={closeModal}><GenericManagedModal title="Drain Node" sub="cordon and drain" resource={selected} onClose={closeModal} /></Modal>

      {/* Managed operation modals */}
      <Modal open={activeAction === "k8s-deploy"}  onClose={closeModal}><K8sDeployModal        resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "vm-terminate"} onClose={closeModal}><VMTerminateModal      resource={selected} onClose={closeModal} /></Modal>
      <Modal open={activeAction === "db-restore"}  onClose={closeModal}><DBRestoreModal         resource={selected} onClose={closeModal} /></Modal>
      {(["k8s-update","k8s-delete","k8s-ingress","vm-ami","vm-resize","vm-snapshot","db-promote","db-reset-pw","db-clone","s3-version","s3-copy","s3-encrypt","s3-cors"] as ManagedActionId[]).map(id => (
        <Modal key={id} open={activeAction === id} onClose={closeModal}>
          <GenericManagedModal title={managedActionMeta[id].title} sub={managedActionMeta[id].sub} resource={selected} onClose={closeModal} />
        </Modal>
      ))}
    </>
  );
}
