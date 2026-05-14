"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTickets } from "@/lib/tickets/ticket-context";

/* ── Types ────────────────────────────────────────────── */

type ServerActionId = "start-server" | "reboot-server" | "os-patch" | "kernel-patch" | "shutdown-sap" | "shutdown-os";
type SAPActionId    = "client-copy" | "transport-move" | "system-refresh" | "hana-revision" | "support-pack" | "sap-addon" | "upgrade-request";
type ActionId = ServerActionId | SAPActionId;
type ModalState = "form" | "review" | "submitting" | "done";
type Severity = "info" | "warning" | "danger";

interface SAPInstance {
  id: string; name: string; type: string; cloud: string; region: string;
  status: "active" | "provisioning" | "stopped";
  sapVersion: string; kernelVersion: string; osVersion: string; hanaRevision: string; spLevel: string;
}

/* ── Static data ─────────────────────────────────────── */

const sapInstances: SAPInstance[] = [
  { id: "res-001", name: "prod-s4hana-eu",    type: "SAP S/4HANA 2023", cloud: "Azure", region: "westeurope", status: "active",
    sapVersion: "S/4HANA 2023 FPS01", kernelVersion: "7.93 PL 900", osVersion: "SUSE Linux Enterprise 15 SP5", hanaRevision: "2.00.074.00", spLevel: "SAPK-20314INSAPHANA" },
  { id: "res-002", name: "sap-s4-sandbox-02", type: "SAP S/4HANA 2022", cloud: "Azure", region: "westeurope", status: "stopped",
    sapVersion: "S/4HANA 2022 FPS03", kernelVersion: "7.93 PL 800", osVersion: "SUSE Linux Enterprise 15 SP5", hanaRevision: "2.00.070.00", spLevel: "SAPK-20214INSAPHANA" },
];

const serverActions: { id: ServerActionId; label: string; sub: string; severity: Severity; icon: React.ReactNode }[] = [
  { id: "start-server",  label: "Start Server",   sub: "Start OS and SAP services",     severity: "info",    icon: <path d="M5 3l10 5-10 5V3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/> },
  { id: "reboot-server", label: "Reboot Server",  sub: "Graceful restart of the host",  severity: "warning", icon: <><path d="M13.5 7A6 6 0 1 0 12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13.5 3.5v3.5H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "os-patch",      label: "OS Patching",    sub: "Apply OS security patches",     severity: "info",    icon: <><path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/></> },
  { id: "kernel-patch",  label: "Kernel Patch",   sub: "Update SAP kernel release",     severity: "info",    icon: <><rect x="2" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 16h8M9 12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 6.5l2 2 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "shutdown-sap",  label: "Shutdown SAP",   sub: "Graceful application stop",     severity: "warning", icon: <><path d="M6 4.5A6 6 0 1 0 12 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
  { id: "shutdown-os",   label: "Shutdown OS",    sub: "Power off the host",            severity: "danger",  icon: <><path d="M5.5 5.5l7 7M12.5 5.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/></> },
];

const sapActions: { id: SAPActionId; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "client-copy",      label: "Client Copy",            sub: "Copy SAP client to target",        icon: <><rect x="2" y="8" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="11" y="2" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M7 11h3l-1.5-1.5M10 11l-1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 5H7l1.5-1.5M7 5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "transport-move",   label: "Transport Move",         sub: "Move transports between systems",  icon: <><path d="M2 8h12M10 5l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 4h5M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></> },
  { id: "system-refresh",   label: "System Refresh",         sub: "Refresh system from source",       icon: <><path d="M13.5 7A6 6 0 1 0 12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13.5 3.5v3.5H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "hana-revision",    label: "HANA Revision",          sub: "Upgrade HANA database revision",   icon: <><ellipse cx="8" cy="5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3 5v6a5 2 0 0 0 10 0V5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 8a5 2 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4"/></> },
  { id: "support-pack",     label: "Support Pack",           sub: "Apply SAP support package stack",  icon: <><rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M6 7l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "sap-addon",        label: "SAP Addon",              sub: "Request addon installation",       icon: <><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/></> },
  { id: "upgrade-request",  label: "Upgrade Request",        sub: "Request SAP version upgrade",      icon: <><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
];

const severityStyle = {
  info:    { card: "hover:border-brand-primary/40 hover:bg-brand-primary/5", icon: "text-brand-accent bg-brand-accent/10 border-brand-accent/20" },
  warning: { card: "hover:border-amber-400/40 hover:bg-amber-400/5",        icon: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  danger:  { card: "hover:border-red-400/40 hover:bg-red-400/5",            icon: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const kernelVersionOptions = ["7.93 PL 1000 (latest)", "7.93 PL 950", "7.93 PL 900 (current)"];
const hanaRevisions = ["2.00.076.00 (latest)", "2.00.075.00", "2.00.074.00 (current)"];
const spLevels = ["SAPK-20414INSAPHANA (latest)", "SAPK-20314INSAPHANA (current)"];
const upgradeTargets = ["SAP S/4HANA 2024", "SAP S/4HANA 2023 FPS02", "SAP S/4HANA 2023 FPS01 (current)"];
const sapClients = ["100 — Production", "200 — Training", "300 — Development", "400 — Sandbox"];
const copyProfiles = [
  { id: "SAP0",    label: "SAP0",    desc: "No client-specific data — profiles and authorizations only" },
  { id: "SAPCUST", label: "SAPCUST", desc: "All customizing, no application data or user master" },
  { id: "SAPALL",  label: "SAPALL",  desc: "Full copy including all application data" },
];
const transportRoutes = ["DEV → QAS", "DEV → PRD", "QAS → PRD", "PRD → QAS (system refresh route)"];
const upgradeApproaches = [
  { id: "conversion", label: "System Conversion",          desc: "In-place conversion of existing ECC/S/4HANA system" },
  { id: "greenfield", label: "New Implementation",         desc: "Clean implementation with data migration" },
  { id: "selective",  label: "Selective Data Transition",  desc: "Selective migration of data objects" },
];

/* ── Modal shell ─────────────────────────────────────── */

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
      <p className="text-white font-medium mb-1">Action submitted</p>
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
        An Ascelios engineer will review and approve this request within 4 business hours. Execution will only begin after explicit approval. You will be notified by email.
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
        Submitting this form creates a ticket. An Ascelios engineer must approve the request before any work begins.
      </p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-white/5 last:border-0 text-sm">
      <span className="text-slate-500 w-36 shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SERVER OPERATION MODALS
───────────────────────────────────────────────────────── */

function StartServerModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const [checks, setChecks] = useState([false, false, false]);
  const [state, setState] = useState<ModalState>("form");
  const allChecked = checks.every(Boolean);

  if (state === "done") return <DoneState message={`Start sequence initiated on ${instance.name}. OS → HANA → SAP App will start in order.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Start Server" sub={`${instance.name} · currently stopped`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-2 text-xs">
          {[
            { label: "Start sequence", value: "OS → SAP HANA → SAP Application" },
            { label: "Est. duration",  value: "10–15 minutes end-to-end" },
            { label: "Post-start",     value: "Ascelios will verify all services are healthy" },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3"><span className="text-slate-500 w-28 shrink-0">{label}</span><span className="text-slate-300">{value}</span></div>
          ))}
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Pre-start checklist</p>
          {["Previous shutdown was clean — no open transactions or active users", "Downstream systems notified of planned start", "Maintenance window or change ticket is in place"].map((item, i) => (
            <label key={item} className="flex items-start gap-2.5 cursor-pointer mb-2">
              <input type="checkbox" checked={checks[i]} onChange={(e) => { const n = [...checks]; n[i] = e.target.checked; setChecks(n); }} className="mt-0.5 accent-brand-primary shrink-0" />
              <span className="text-xs text-slate-300 leading-relaxed">{item}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!allChecked} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1400)); setState("done"); }} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[120px]">
          Start Server
        </Button>
      </div>
    </>
  );
}

function RebootServerModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const [timeout_, setTimeout_] = useState<"300" | "600">("600");
  const [state, setState] = useState<ModalState>("form");
  const valid = confirmText === instance.name;

  if (state === "done") return <DoneState message={`Reboot sequence initiated on ${instance.name}. SAP → HANA → OS will stop then restart.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="Reboot Server" sub={`${instance.name} · full graceful restart`} severity="warning" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Full stop/start cycle: SAP app → HANA → OS reboot → OS → HANA → SAP app. All active sessions will be disconnected. Est. total downtime: <strong>15–25 minutes</strong>.</p>
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">SAP graceful shutdown timeout</Label>
          <div className="flex gap-2">
            {([["300","5 min"],["600","10 min"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setTimeout_(v)} className={`flex-1 py-2 rounded-lg text-sm border transition-all ${timeout_ === v ? "bg-amber-400/15 border-amber-400/50 text-amber-300" : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="reboot-confirm" className="text-xs text-slate-400 mb-1.5 block">
            Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">{instance.name}</span> to confirm
          </Label>
          <Input id="reboot-confirm" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={instance.name} className="bg-white/5 border-amber-400/20 focus-visible:border-amber-400 text-white placeholder:text-slate-700 font-mono" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid || state === "submitting"} onClick={async () => { setState("submitting"); await new Promise(r => setTimeout(r, 1500)); setState("done"); }} className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[130px]">
          {state === "submitting" ? "Initiating…" : "Reboot Server"}
        </Button>
      </div>
    </>
  );
}

function OSPatchModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const [schedule, setSchedule] = useState<"immediate"|"scheduled">("scheduled");
  const [sapStop, setSapStop] = useState<"auto"|"manual">("auto");
  const [state, setState] = useState<ModalState>("form");
  if (state === "done") return <DoneState message={`OS patch job queued for ${instance.name}. Est. downtime: 2–4 hours.`} onClose={onClose} />;
  return (
    <>
      <ModalHeader title="OS Patching" sub={`${instance.name} · ${instance.osVersion}`} severity="info" onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-brand-accent/6 border border-brand-accent/15 rounded-xl px-4 py-3 text-xs text-slate-400">
          <span className="text-brand-accent font-medium">Current OS: </span>{instance.osVersion}. Ascelios applies all vendor security patches, validates the patch set, and reboots. SAP services are stopped first.
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Patch window</Label>
          <div className="grid grid-cols-2 gap-3">
            {([{id:"immediate",label:"Immediate",sub:"Start within 15 min"},{id:"scheduled",label:"Next maintenance window",sub:"Sun 02:00–06:00 UTC"}] as const).map(opt => (
              <button key={opt.id} onClick={() => setSchedule(opt.id)} className={`p-3 rounded-xl border text-left transition-all ${schedule===opt.id?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                <p className={`text-sm font-medium ${schedule===opt.id?"text-brand-accent":"text-white"}`}>{opt.label}</p>
                <p className={`text-xs mt-0.5 ${schedule===opt.id?"text-slate-400":"text-slate-500"}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
          {schedule==="immediate"&&<p className="mt-2 text-xs text-amber-400 bg-amber-400/8 border border-amber-400/15 rounded-lg px-3 py-2">Immediate patching will cause unplanned downtime.</p>}
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">SAP stop sequence</Label>
          <div className="flex gap-3">
            {([{id:"auto",label:"Automatic",sub:"Ascelios stops SAP"},{id:"manual",label:"Manual",sub:"I will stop SAP first"}] as const).map(opt => (
              <button key={opt.id} onClick={() => setSapStop(opt.id)} className={`flex-1 p-3 rounded-xl border text-left transition-all ${sapStop===opt.id?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                <p className={`text-sm font-medium ${sapStop===opt.id?"text-brand-accent":"text-white"}`}>{opt.label}</p>
                <p className={`text-xs mt-0.5 ${sapStop===opt.id?"text-slate-400":"text-slate-500"}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-1">
          <div><p className="mb-0.5">Est. downtime</p><p className="text-white">2–4 hours</p></div>
          <div><p className="mb-0.5">Rollback</p><p className="text-white">Snapshot taken before patching</p></div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button onClick={async () => { setState("submitting"); await new Promise(r=>setTimeout(r,1400)); setState("done"); }} disabled={state==="submitting"} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[120px]">
          {state==="submitting"?"Queuing…":"Schedule Patch"}
        </Button>
      </div>
    </>
  );
}

function KernelPatchModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const [target, setTarget] = useState(kernelVersionOptions[0]);
  const [state, setState] = useState<ModalState>("form");
  if (state==="done") return <DoneState message={`Kernel patch queued for ${instance.name}. Est. downtime: 1–2 hours.`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="SAP Kernel Patching" sub={`${instance.name} · ${instance.sapVersion}`} severity="info" onClose={onClose}/>
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3"><p className="text-slate-500 mb-1">Current kernel</p><p className="text-white font-mono">{instance.kernelVersion}</p></div>
          <div className="bg-brand-primary/8 border border-brand-primary/20 rounded-xl px-4 py-3"><p className="text-slate-500 mb-1">Available patches</p><p className="text-brand-accent font-medium">3 versions</p></div>
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Target kernel version</Label>
          {kernelVersionOptions.map(v => (
            <button key={v} onClick={()=>setTarget(v)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all mb-2 ${target===v?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
              <span className={`text-sm font-mono ${target===v?"text-brand-accent":"text-white"}`}>{v.replace(" (current)","").replace(" (latest)","")}</span>
              {v.includes("latest")&&<span className="font-mono text-[9px] uppercase text-emerald-400 border border-emerald-400/30 rounded-full px-1.5 py-0.5">Latest</span>}
              {v.includes("current")&&<span className="font-mono text-[9px] uppercase text-slate-500 border border-slate-500/30 rounded-full px-1.5 py-0.5">Current</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button onClick={async()=>{setState("submitting");await new Promise(r=>setTimeout(r,1400));setState("done");}} disabled={state==="submitting"||target.includes("current")} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[120px]">
          {state==="submitting"?"Queuing…":"Apply Patch"}
        </Button>
      </div>
    </>
  );
}

function ShutdownSAPModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const [timeout_, setTimeout_] = useState<"300"|"600"|"900">("600");
  const [confirmed, setConfirmed] = useState(false);
  const [state, setState] = useState<ModalState>("form");
  if (state==="done") return <DoneState message={`SAP shutdown initiated on ${instance.name}. HANA database will remain running.`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="Shutdown SAP" sub={`${instance.name} · app layer only`} severity="warning" onClose={onClose}/>
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Stops all SAP application services. <strong>HANA database remains running.</strong> All active user sessions will be terminated.</p>
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Graceful shutdown timeout</Label>
          <div className="flex gap-2">
            {([["300","5 min"],["600","10 min"],["900","15 min"]] as const).map(([v,l])=>(
              <button key={v} onClick={()=>setTimeout_(v)} className={`flex-1 py-2 rounded-lg text-sm border transition-all ${timeout_===v?"bg-amber-400/15 border-amber-400/50 text-amber-300":"bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}>{l}</button>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-0.5 accent-amber-400"/>
          <span className="text-sm text-slate-300 leading-relaxed">I understand this will terminate all active user sessions on <span className="text-white font-medium">{instance.name}</span>.</span>
        </label>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!confirmed||state==="submitting"} onClick={async()=>{setState("submitting");await new Promise(r=>setTimeout(r,1500));setState("done");}} className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[130px]">
          {state==="submitting"?"Stopping…":"Shutdown SAP"}
        </Button>
      </div>
    </>
  );
}

function ShutdownOSModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const [state, setState] = useState<ModalState>("form");
  if (state==="done") return <DoneState message={`OS shutdown initiated on ${instance.name}. Host will power off within 2 minutes.`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="Shutdown OS" sub={`${instance.name} · ${instance.osVersion}`} severity="danger" onClose={onClose}/>
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <div className="bg-red-500/8 border border-red-500/25 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-red-400 shrink-0 mt-0.5"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4.5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p className="text-xs text-red-300 leading-relaxed"><strong>Destructive.</strong> SAP and HANA must both be fully stopped before proceeding. Host will be unavailable until manually started.</p>
        </div>
        {["All SAP application services have been stopped","SAP HANA database has been shut down","No active backup or patching jobs are running"].map(item=>(
          <label key={item} className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" className="mt-0.5 accent-red-400 shrink-0"/>
            <span className="text-xs text-slate-300 leading-relaxed">{item}</span>
          </label>
        ))}
        <div>
          <Label htmlFor="os-confirm" className="text-xs text-slate-400 mb-1.5 block">Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">{instance.name}</span> to confirm</Label>
          <Input id="os-confirm" value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder={instance.name} className="bg-white/5 border-red-500/30 focus-visible:border-red-500 text-white placeholder:text-slate-700 font-mono"/>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-red-500/20 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={confirmText!==instance.name||state==="submitting"} onClick={async()=>{setState("submitting");await new Promise(r=>setTimeout(r,1500));setState("done");}} className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 min-w-[130px]">
          {state==="submitting"?"Shutting down…":"Shutdown OS"}
        </Button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   SAP OPERATION MODALS  (ticket + approval flow)
───────────────────────────────────────────────────────── */

function ClientCopyModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [step, setStep] = useState<"form"|"review">("form");
  const [source, setSource] = useState(sapClients[0]);
  const [targetClient, setTargetClient] = useState("");
  const [targetDesc, setTargetDesc] = useState("");
  const [profile, setProfile] = useState(copyProfiles[0].id);
  const [justification, setJustification] = useState("");
  const [reqDate, setReqDate] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const canReview = !!targetClient && !!targetDesc && !!justification;
  if (state==="done") return <TicketCreatedState ticketId={ticketId} operation={`Client Copy · ${source} → ${targetClient} (${targetDesc})`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="Client Copy Request" sub={`${instance.name} · ${instance.sapVersion}`} severity="info" onClose={onClose}/>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        {step==="form" ? (
          <>
            <ApprovalNotice/>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-400 mb-1.5 block">Source client</Label>
                <select value={source} onChange={e=>setSource(e.target.value)} className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary appearance-none">
                  {sapClients.map(c=><option key={c} value={c} className="bg-[#0d1f2d]">{c}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="target-client" className="text-xs text-slate-400 mb-1.5 block">Target client number</Label>
                <Input id="target-client" value={targetClient} onChange={e=>setTargetClient(e.target.value)} placeholder="e.g. 400" className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary font-mono"/>
              </div>
            </div>
            <div>
              <Label htmlFor="target-desc" className="text-xs text-slate-400 mb-1.5 block">Target client description</Label>
              <Input id="target-desc" value={targetDesc} onChange={e=>setTargetDesc(e.target.value)} placeholder="e.g. UAT Training Client" className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary"/>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Copy profile</Label>
              <div className="space-y-2">
                {copyProfiles.map(p=>(
                  <button key={p.id} onClick={()=>setProfile(p.id)} className={`w-full p-3 rounded-xl border text-left transition-all ${profile===p.id?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                    <p className={`text-sm font-mono font-medium ${profile===p.id?"text-brand-accent":"text-white"}`}>{p.label}</p>
                    <p className={`text-xs mt-0.5 ${profile===p.id?"text-slate-400":"text-slate-500"}`}>{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="cc-just" className="text-xs text-slate-400 mb-1.5 block">Business justification</Label>
              <textarea id="cc-just" rows={2} value={justification} onChange={e=>setJustification(e.target.value)} placeholder="Describe why this client copy is needed…" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary resize-none"/>
            </div>
            <div>
              <Label htmlFor="cc-date" className="text-xs text-slate-400 mb-1.5 block">Requested execution date <span className="text-slate-600">(optional)</span></Label>
              <Input id="cc-date" type="date" value={reqDate} onChange={e=>setReqDate(e.target.value)} className="bg-white/5 border-white/15 text-white focus-visible:border-brand-primary max-w-[180px]"/>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-1">
              <ReviewRow label="Instance" value={instance.name}/>
              <ReviewRow label="Source client" value={source}/>
              <ReviewRow label="Target client" value={`${targetClient} — ${targetDesc}`}/>
              <ReviewRow label="Copy profile" value={`${profile} — ${copyProfiles.find(p=>p.id===profile)?.desc}`}/>
              <ReviewRow label="Justification" value={justification}/>
              {reqDate && <ReviewRow label="Requested date" value={reqDate}/>}
            </div>
            <div className="bg-amber-400/6 border border-amber-400/15 rounded-xl px-4 py-3 text-xs text-amber-300">
              <strong>Final confirmation: </strong>Submitting will create ticket <span className="font-mono">{ticketId}</span> and lock source client {source} for the duration of the copy. Ascelios must approve before execution begins.
            </div>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-between items-center shrink-0">
        <Button variant="outline" onClick={step==="review"?()=>setStep("form"):onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">
          {step==="review"?"← Back":"Cancel"}
        </Button>
        {step==="form" ? (
          <Button disabled={!canReview} onClick={()=>setStep("review")} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Review Request →</Button>
        ) : (
          <Button onClick={()=>{setState("submitting");setTimeout(()=>{const ticket=createTicket({title:`Client Copy · ${source} → ${targetClient}`,type:"sap-operation",detail:{source,targetClient,targetDesc,profile,justification,preferredDate:reqDate}});setTicketId(ticket.id);setState("done");},1400);}} disabled={state==="submitting"} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[140px]">
            {state==="submitting"?"Creating ticket…":"Create Ticket"}
          </Button>
        )}
      </div>
    </>
  );
}

function TransportMoveModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [step, setStep] = useState<"form"|"review">("form");
  const [transports, setTransports] = useState("");
  const [route, setRoute] = useState(transportRoutes[1]);
  const [priority, setPriority] = useState<"Normal"|"High"|"Emergency">("Normal");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const tList = transports.split("\n").map(s=>s.trim()).filter(Boolean);
  const canReview = tList.length > 0;
  if (state==="done") return <TicketCreatedState ticketId={ticketId} operation={`Transport Move · ${route} · ${tList.length} request${tList.length!==1?"s":""}`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="Transport Move" sub={`${instance.name} · ${instance.sapVersion}`} severity="info" onClose={onClose}/>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        {step==="form" ? (
          <>
            <ApprovalNotice/>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Transport route</Label>
              <div className="grid grid-cols-2 gap-2">
                {transportRoutes.map(r=>(
                  <button key={r} onClick={()=>setRoute(r)} className={`p-2.5 rounded-lg border text-xs text-left transition-all ${route===r?"bg-brand-primary/15 border-brand-primary text-brand-accent":"bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="tr-list" className="text-xs text-slate-400 mb-1.5 block">Transport request numbers <span className="text-slate-600">(one per line)</span></Label>
              <textarea id="tr-list" rows={4} value={transports} onChange={e=>setTransports(e.target.value)} placeholder={"DEVK900001\nDEVK900002"} className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-primary resize-none"/>
              {tList.length>0 && <p className="text-xs text-slate-500 mt-1">{tList.length} transport{tList.length!==1?"s":""} identified</p>}
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Priority</Label>
              <div className="flex gap-2">
                {(["Normal","High","Emergency"] as const).map(p=>(
                  <button key={p} onClick={()=>setPriority(p)} className={`flex-1 py-2 rounded-lg text-sm border transition-all ${priority===p?p==="Emergency"?"bg-red-500/15 border-red-500/50 text-red-300":p==="High"?"bg-amber-400/15 border-amber-400/50 text-amber-300":"bg-brand-primary/15 border-brand-primary text-brand-accent":"bg-white/3 border-white/10 text-slate-400 hover:border-white/20"}`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="tr-notes" className="text-xs text-slate-400 mb-1.5 block">Notes <span className="text-slate-600">(optional)</span></Label>
              <textarea id="tr-notes" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Import sequence, dependencies, rollback plan…" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary resize-none"/>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-1">
              <ReviewRow label="Instance" value={instance.name}/>
              <ReviewRow label="Route" value={route}/>
              <ReviewRow label="Transports" value={<span className="font-mono text-xs">{tList.join(", ")}</span>}/>
              <ReviewRow label="Priority" value={priority}/>
              {notes && <ReviewRow label="Notes" value={notes}/>}
            </div>
            <div className="bg-amber-400/6 border border-amber-400/15 rounded-xl px-4 py-3 text-xs text-amber-300">
              <strong>Final confirmation: </strong>Ticket <span className="font-mono">{ticketId}</span> will be created. Ascelios must approve before imports are executed.
            </div>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-between shrink-0">
        <Button variant="outline" onClick={step==="review"?()=>setStep("form"):onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">{step==="review"?"← Back":"Cancel"}</Button>
        {step==="form" ? (
          <Button disabled={!canReview} onClick={()=>setStep("review")} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Review Request →</Button>
        ) : (
          <Button onClick={()=>{setState("submitting");setTimeout(()=>{const ticket=createTicket({title:`Transport Move · ${route} · ${tList.length} transport${tList.length!==1?"s":""}`,type:"sap-operation",detail:{route,transports:tList,priority}});setTicketId(ticket.id);setState("done");},1400);}} disabled={state==="submitting"} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[140px]">
            {state==="submitting"?"Creating ticket…":"Create Ticket"}
          </Button>
        )}
      </div>
    </>
  );
}

function SystemRefreshModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [step, setStep] = useState<"form"|"review">("form");
  const [target, setTarget] = useState("QAS — Quality Assurance");
  const [scope, setScope] = useState<"full"|"delta">("full");
  const [reqDate, setReqDate] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  if (state==="done") return <TicketCreatedState ticketId={ticketId} operation={`System Refresh · PRD → ${target} · ${scope==="full"?"Full refresh":"Delta"}`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="System Refresh" sub={`Source: ${instance.name} (PRD)`} severity="warning" onClose={onClose}/>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        {step==="form" ? (
          <>
            <ApprovalNotice/>
            <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <p>A full refresh will <strong>overwrite all data on the target system</strong>. Confirm target users have been notified and data has been exported if needed.</p>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Target system</Label>
              {["QAS — Quality Assurance","DEV — Development","SBX — Sandbox"].map(s=>(
                <button key={s} onClick={()=>setTarget(s)} className={`w-full p-3 mb-2 rounded-xl border text-left text-sm transition-all ${target===s?"bg-brand-primary/15 border-brand-primary text-brand-accent":"bg-white/3 border-white/10 text-white hover:border-white/20"}`}>{s}</button>
              ))}
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Refresh scope</Label>
              <div className="grid grid-cols-2 gap-3">
                {([{id:"full",label:"Full Refresh",desc:"Complete copy of all data from PRD"},{id:"delta",label:"Delta Only",desc:"Configuration and customizing only"}] as const).map(opt=>(
                  <button key={opt.id} onClick={()=>setScope(opt.id)} className={`p-3 rounded-xl border text-left transition-all ${scope===opt.id?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                    <p className={`text-sm font-medium ${scope===opt.id?"text-brand-accent":"text-white"}`}>{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${scope===opt.id?"text-slate-400":"text-slate-500"}`}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="sr-date" className="text-xs text-slate-400 mb-1.5 block">Requested execution date</Label>
              <Input id="sr-date" type="date" value={reqDate} onChange={e=>setReqDate(e.target.value)} className="bg-white/5 border-white/15 text-white focus-visible:border-brand-primary max-w-[180px]"/>
            </div>
            <div>
              <Label htmlFor="sr-notes" className="text-xs text-slate-400 mb-1.5 block">Pre-refresh activities / notes</Label>
              <textarea id="sr-notes" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Stop background jobs, export user master, notify users…" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary resize-none"/>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-1">
              <ReviewRow label="Source" value={`${instance.name} (PRD)`}/>
              <ReviewRow label="Target" value={target}/>
              <ReviewRow label="Scope" value={scope==="full"?"Full Refresh — all data":"Delta — config and customizing only"}/>
              {reqDate && <ReviewRow label="Requested date" value={reqDate}/>}
              {notes && <ReviewRow label="Pre-refresh notes" value={notes}/>}
            </div>
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300">
              <strong>Final confirmation: </strong>Ticket <span className="font-mono">{ticketId}</span> will be created. Target system <strong>{target}</strong> will be overwritten. Ascelios must approve before execution.
            </div>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-between shrink-0">
        <Button variant="outline" onClick={step==="review"?()=>setStep("form"):onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">{step==="review"?"← Back":"Cancel"}</Button>
        {step==="form" ? (
          <Button onClick={()=>setStep("review")} className="bg-brand-primary hover:bg-brand-accent text-white">Review Request →</Button>
        ) : (
          <Button onClick={()=>{setState("submitting");setTimeout(()=>{const ticket=createTicket({title:`System Refresh · PRD → ${target} · ${scope==="full"?"Full":"Delta"}`,type:"sap-operation",detail:{target,scope,preferredDate:reqDate,preNotes:notes}});setTicketId(ticket.id);setState("done");},1400);}} disabled={state==="submitting"} className="bg-amber-500 hover:bg-amber-400 text-white min-w-[140px]">
            {state==="submitting"?"Creating ticket…":"Create Ticket"}
          </Button>
        )}
      </div>
    </>
  );
}

function HANARevisionModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [step, setStep] = useState<"form"|"review">("form");
  const [target, setTarget] = useState(hanaRevisions[0]);
  const [window_, setWindow_] = useState<"maintenance"|"immediate">("maintenance");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  if (state==="done") return <TicketCreatedState ticketId={ticketId} operation={`HANA Revision Upgrade · ${instance.hanaRevision} → ${target.replace(" (latest)","")}`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="HANA Revision Upgrade" sub={`${instance.name} · current: ${instance.hanaRevision}`} severity="info" onClose={onClose}/>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        {step==="form" ? (
          <>
            <ApprovalNotice/>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3"><p className="text-slate-500 mb-1">Current revision</p><p className="text-white font-mono">{instance.hanaRevision}</p></div>
              <div className="bg-brand-primary/8 border border-brand-primary/20 rounded-xl px-4 py-3"><p className="text-slate-500 mb-1">Latest available</p><p className="text-brand-accent font-mono">{hanaRevisions[0].replace(" (latest)","")}</p></div>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Target revision</Label>
              {hanaRevisions.map(r=>(
                <button key={r} onClick={()=>setTarget(r)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all mb-2 ${target===r?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                  <span className={`text-sm font-mono ${target===r?"text-brand-accent":"text-white"}`}>{r.replace(" (current)","").replace(" (latest)","")}</span>
                  {r.includes("latest")&&<span className="font-mono text-[9px] uppercase text-emerald-400 border border-emerald-400/30 rounded-full px-1.5 py-0.5">Latest</span>}
                  {r.includes("current")&&<span className="font-mono text-[9px] uppercase text-slate-500 border border-slate-500/30 rounded-full px-1.5 py-0.5">Current</span>}
                </button>
              ))}
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Downtime window</Label>
              <div className="grid grid-cols-2 gap-3">
                {([{id:"maintenance",label:"Maintenance window",sub:"Next scheduled window"},{id:"immediate",label:"Immediate",sub:"During agreed RTO"}] as const).map(opt=>(
                  <button key={opt.id} onClick={()=>setWindow_(opt.id)} className={`p-3 rounded-xl border text-left transition-all ${window_===opt.id?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                    <p className={`text-sm font-medium ${window_===opt.id?"text-brand-accent":"text-white"}`}>{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${window_===opt.id?"text-slate-400":"text-slate-500"}`}>{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-1">
              <ReviewRow label="Instance" value={instance.name}/>
              <ReviewRow label="Current revision" value={<span className="font-mono">{instance.hanaRevision}</span>}/>
              <ReviewRow label="Target revision" value={<span className="font-mono">{target.replace(" (latest)","")}</span>}/>
              <ReviewRow label="Downtime window" value={window_==="maintenance"?"Next maintenance window":"Immediate"}/>
            </div>
            <div className="bg-amber-400/6 border border-amber-400/15 rounded-xl px-4 py-3 text-xs text-amber-300">
              <strong>Final confirmation: </strong>Ticket <span className="font-mono">{ticketId}</span> will be created. SAP and HANA will be stopped during the upgrade. Pre-upgrade backup is taken automatically.
            </div>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-between shrink-0">
        <Button variant="outline" onClick={step==="review"?()=>setStep("form"):onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">{step==="review"?"← Back":"Cancel"}</Button>
        {step==="form" ? (
          <Button disabled={target.includes("current")} onClick={()=>setStep("review")} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Review Request →</Button>
        ) : (
          <Button onClick={()=>{setState("submitting");setTimeout(()=>{const ticket=createTicket({title:`HANA Revision Upgrade · ${instance.hanaRevision} → ${target.replace(" (latest)","")}`,type:"sap-operation",detail:{currentRevision:instance.hanaRevision,targetRevision:target.replace(" (latest)",""),downtimeWindow:window_}});setTicketId(ticket.id);setState("done");},1400);}} disabled={state==="submitting"} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[140px]">
            {state==="submitting"?"Creating ticket…":"Create Ticket"}
          </Button>
        )}
      </div>
    </>
  );
}

function SupportPackModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [step, setStep] = useState<"form"|"review">("form");
  const [target, setTarget] = useState(spLevels[0]);
  const [stack, setStack] = useState<"abap"|"java"|"both">("abap");
  const [window_, setWindow_] = useState<"maintenance"|"agreed">("maintenance");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  if (state==="done") return <TicketCreatedState ticketId={ticketId} operation={`Support Pack Update · ${instance.spLevel} → ${target.replace(" (latest)","")}`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="Support Pack Update" sub={`${instance.name} · current: ${instance.spLevel}`} severity="info" onClose={onClose}/>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        {step==="form" ? (
          <>
            <ApprovalNotice/>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Target support package level</Label>
              {spLevels.map(s=>(
                <button key={s} onClick={()=>setTarget(s)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all mb-2 ${target===s?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                  <span className={`text-xs font-mono ${target===s?"text-brand-accent":"text-white"}`}>{s.replace(" (current)","").replace(" (latest)","")}</span>
                  {s.includes("latest")&&<span className="font-mono text-[9px] uppercase text-emerald-400 border border-emerald-400/30 rounded-full px-1.5 py-0.5">Latest</span>}
                  {s.includes("current")&&<span className="font-mono text-[9px] uppercase text-slate-500 border border-slate-500/30 rounded-full px-1.5 py-0.5">Current</span>}
                </button>
              ))}
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Stack</Label>
              <div className="flex gap-2">
                {(["abap","java","both"] as const).map(s=>(
                  <button key={s} onClick={()=>setStack(s)} className={`flex-1 py-2 rounded-lg text-sm border transition-all capitalize ${stack===s?"bg-brand-primary/15 border-brand-primary text-brand-accent":"bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}>{s==="both"?"ABAP + Java":s.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Maintenance window</Label>
              <div className="grid grid-cols-2 gap-3">
                {([{id:"maintenance",label:"Standard window",sub:"Next scheduled maintenance"},{id:"agreed",label:"Agreed date",sub:"To be confirmed in ticket"}] as const).map(opt=>(
                  <button key={opt.id} onClick={()=>setWindow_(opt.id)} className={`p-3 rounded-xl border text-left transition-all ${window_===opt.id?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                    <p className={`text-sm font-medium ${window_===opt.id?"text-brand-accent":"text-white"}`}>{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${window_===opt.id?"text-slate-400":"text-slate-500"}`}>{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-1">
              <ReviewRow label="Instance" value={instance.name}/>
              <ReviewRow label="Current SP" value={<span className="font-mono text-xs">{instance.spLevel}</span>}/>
              <ReviewRow label="Target SP" value={<span className="font-mono text-xs">{target.replace(" (latest)","")}</span>}/>
              <ReviewRow label="Stack" value={stack==="both"?"ABAP + Java":stack.toUpperCase()}/>
              <ReviewRow label="Window" value={window_==="maintenance"?"Standard maintenance window":"To be agreed in ticket"}/>
            </div>
            <div className="bg-amber-400/6 border border-amber-400/15 rounded-xl px-4 py-3 text-xs text-amber-300">
              <strong>Final confirmation: </strong>Ticket <span className="font-mono">{ticketId}</span> will be created. Application downtime required during stack upgrade. Ascelios must approve before execution.
            </div>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-between shrink-0">
        <Button variant="outline" onClick={step==="review"?()=>setStep("form"):onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">{step==="review"?"← Back":"Cancel"}</Button>
        {step==="form" ? (
          <Button disabled={target.includes("current")} onClick={()=>setStep("review")} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Review Request →</Button>
        ) : (
          <Button onClick={()=>{setState("submitting");setTimeout(()=>{const ticket=createTicket({title:`Support Pack Update · ${instance.spLevel} → ${target.replace(" (latest)","")}`,type:"sap-operation",detail:{currentSP:instance.spLevel,targetSP:target.replace(" (latest)",""),stack,maintenanceWindow:window_}});setTicketId(ticket.id);setState("done");},1400);}} disabled={state==="submitting"} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[140px]">
            {state==="submitting"?"Creating ticket…":"Create Ticket"}
          </Button>
        )}
      </div>
    </>
  );
}

function SAPAddonModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [step, setStep] = useState<"form"|"review">("form");
  const [addonName, setAddonName] = useState("");
  const [version, setVersion] = useState("");
  const [priority, setPriority] = useState<"Normal"|"High">("Normal");
  const [justification, setJustification] = useState("");
  const [compatChecked, setCompatChecked] = useState(false);
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const canReview = !!addonName && !!version && !!justification && compatChecked;
  if (state==="done") return <TicketCreatedState ticketId={ticketId} operation={`SAP Addon Request · ${addonName} ${version}`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="SAP Addon Request" sub={`${instance.name} · ${instance.sapVersion}`} severity="info" onClose={onClose}/>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        {step==="form" ? (
          <>
            <ApprovalNotice/>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addon-name" className="text-xs text-slate-400 mb-1.5 block">Addon / product name</Label>
                <Input id="addon-name" value={addonName} onChange={e=>setAddonName(e.target.value)} placeholder="e.g. SAP Fiori Apps" className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary"/>
              </div>
              <div>
                <Label htmlFor="addon-ver" className="text-xs text-slate-400 mb-1.5 block">Version / release</Label>
                <Input id="addon-ver" value={version} onChange={e=>setVersion(e.target.value)} placeholder="e.g. 1.0.0" className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary font-mono"/>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Priority</Label>
              <div className="flex gap-2">
                {(["Normal","High"] as const).map(p=>(
                  <button key={p} onClick={()=>setPriority(p)} className={`flex-1 py-2 rounded-lg text-sm border transition-all ${priority===p?p==="High"?"bg-amber-400/15 border-amber-400/50 text-amber-300":"bg-brand-primary/15 border-brand-primary text-brand-accent":"bg-white/3 border-white/10 text-slate-400 hover:border-white/20"}`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="addon-just" className="text-xs text-slate-400 mb-1.5 block">Business justification</Label>
              <textarea id="addon-just" rows={3} value={justification} onChange={e=>setJustification(e.target.value)} placeholder="Describe the business need and the use case for this addon…" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary resize-none"/>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={compatChecked} onChange={e=>setCompatChecked(e.target.checked)} className="mt-0.5 accent-brand-primary shrink-0"/>
              <span className="text-xs text-slate-300 leading-relaxed">I have verified this addon is compatible with <span className="text-white font-medium">{instance.sapVersion}</span> and is available through official SAP channels.</span>
            </label>
          </>
        ) : (
          <>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-1">
              <ReviewRow label="Instance" value={instance.name}/>
              <ReviewRow label="Addon" value={`${addonName} ${version}`}/>
              <ReviewRow label="Priority" value={priority}/>
              <ReviewRow label="Justification" value={justification}/>
            </div>
            <div className="bg-amber-400/6 border border-amber-400/15 rounded-xl px-4 py-3 text-xs text-amber-300">
              <strong>Final confirmation: </strong>Ticket <span className="font-mono">{ticketId}</span> will be created. Ascelios will validate compatibility and plan the installation. Approval required before proceeding.
            </div>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-between shrink-0">
        <Button variant="outline" onClick={step==="review"?()=>setStep("form"):onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">{step==="review"?"← Back":"Cancel"}</Button>
        {step==="form" ? (
          <Button disabled={!canReview} onClick={()=>setStep("review")} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Review Request →</Button>
        ) : (
          <Button onClick={()=>{setState("submitting");setTimeout(()=>{const ticket=createTicket({title:`SAP Addon Request · ${addonName} ${version}`,type:"sap-operation",detail:{addonName,version,priority,justification}});setTicketId(ticket.id);setState("done");},1400);}} disabled={state==="submitting"} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[140px]">
            {state==="submitting"?"Creating ticket…":"Create Ticket"}
          </Button>
        )}
      </div>
    </>
  );
}

function UpgradeRequestModal({ instance, onClose }: { instance: SAPInstance; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [step, setStep] = useState<"form"|"review">("form");
  const [target, setTarget] = useState(upgradeTargets[0]);
  const [approach, setApproach] = useState(upgradeApproaches[0].id);
  const [goLive, setGoLive] = useState("");
  const [drivers, setDrivers] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const canReview = !!goLive && !!drivers;
  if (state==="done") return <TicketCreatedState ticketId={ticketId} operation={`Upgrade Request · ${instance.sapVersion} → ${target}`} onClose={onClose}/>;
  return (
    <>
      <ModalHeader title="Upgrade Request" sub={`${instance.name} · current: ${instance.sapVersion}`} severity="info" onClose={onClose}/>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        {step==="form" ? (
          <>
            <ApprovalNotice/>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Target SAP release</Label>
              <div className="space-y-2">
                {upgradeTargets.map(t=>(
                  <button key={t} onClick={()=>setTarget(t)} disabled={t.includes("current")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${target===t?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"} disabled:opacity-40 disabled:cursor-not-allowed`}>
                    <span className={`text-sm ${target===t?"text-brand-accent":"text-white"}`}>{t.replace(" (current)","")}</span>
                    {t.includes("current")&&<span className="font-mono text-[9px] uppercase text-slate-500 border border-slate-500/30 rounded-full px-1.5 py-0.5">Current</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Upgrade approach</Label>
              <div className="space-y-2">
                {upgradeApproaches.map(a=>(
                  <button key={a.id} onClick={()=>setApproach(a.id)} className={`w-full p-3 rounded-xl border text-left transition-all ${approach===a.id?"bg-brand-primary/15 border-brand-primary":"bg-white/3 border-white/10 hover:border-white/20"}`}>
                    <p className={`text-sm font-medium ${approach===a.id?"text-brand-accent":"text-white"}`}>{a.label}</p>
                    <p className={`text-xs mt-0.5 ${approach===a.id?"text-slate-400":"text-slate-500"}`}>{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="upg-golive" className="text-xs text-slate-400 mb-1.5 block">Target go-live date</Label>
              <Input id="upg-golive" type="date" value={goLive} onChange={e=>setGoLive(e.target.value)} className="bg-white/5 border-white/15 text-white focus-visible:border-brand-primary max-w-[180px]"/>
            </div>
            <div>
              <Label htmlFor="upg-drivers" className="text-xs text-slate-400 mb-1.5 block">Business drivers</Label>
              <textarea id="upg-drivers" rows={2} value={drivers} onChange={e=>setDrivers(e.target.value)} placeholder="Maintenance expiry, new functionality needed, compliance requirements…" className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary resize-none"/>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-1">
              <ReviewRow label="Instance" value={instance.name}/>
              <ReviewRow label="Current release" value={instance.sapVersion}/>
              <ReviewRow label="Target release" value={target}/>
              <ReviewRow label="Approach" value={upgradeApproaches.find(a=>a.id===approach)?.label??approach}/>
              <ReviewRow label="Target go-live" value={goLive}/>
              <ReviewRow label="Business drivers" value={drivers}/>
            </div>
            <div className="bg-brand-primary/8 border border-brand-primary/20 rounded-xl px-4 py-3 text-xs text-slate-400">
              <strong className="text-white">Final confirmation: </strong>Ticket <span className="font-mono text-brand-accent">{ticketId}</span> will be created. An Ascelios consultant will prepare a project proposal and upgrade roadmap within 5 business days.
            </div>
          </>
        )}
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-between shrink-0">
        <Button variant="outline" onClick={step==="review"?()=>setStep("form"):onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">{step==="review"?"← Back":"Cancel"}</Button>
        {step==="form" ? (
          <Button disabled={!canReview} onClick={()=>setStep("review")} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Review Request →</Button>
        ) : (
          <Button onClick={()=>{setState("submitting");setTimeout(()=>{const ticket=createTicket({title:`Upgrade Request · ${instance.sapVersion} → ${target}`,type:"sap-operation",detail:{currentRelease:instance.sapVersion,targetRelease:target,approach,goLiveDate:goLive,businessDrivers:drivers}});setTicketId(ticket.id);setState("done");},1400);}} disabled={state==="submitting"} className="bg-brand-primary hover:bg-brand-accent text-white min-w-[140px]">
            {state==="submitting"?"Creating ticket…":"Create Ticket"}
          </Button>
        )}
      </div>
    </>
  );
}

/* ── Action tile ─────────────────────────────────────── */

function ActionTile({ label, sub, severity = "info", icon, onClick }: {
  label: string; sub: string; severity?: Severity; icon: React.ReactNode; onClick: () => void;
}) {
  const style = severityStyle[severity];
  return (
    <button onClick={onClick} className={`group flex flex-col items-center gap-2.5 px-3 py-5 transition-all border border-transparent rounded-xl ${style.card}`}>
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${style.icon}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-current">{icon}</svg>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-white leading-snug">{label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{sub}</p>
      </div>
    </button>
  );
}

/* ── Widget ───────────────────────────────────────────── */

export function SAPManagementWidget() {
  const [selectedInstance, setSelectedInstance] = useState<SAPInstance>(sapInstances[0]);
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  function closeModal() { setActiveAction(null); }

  return (
    <>
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-sm font-semibold text-white">Manage SAP Instance</p>
            <p className="text-xs text-slate-500 mt-0.5">Operations on your SAP landscape</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${selectedInstance.status==="active"?"bg-emerald-400":selectedInstance.status==="stopped"?"bg-slate-500":"bg-amber-400"}`}/>
            <select value={selectedInstance.id} onChange={e=>{const i=sapInstances.find(x=>x.id===e.target.value);if(i)setSelectedInstance(i);}} className="bg-white/5 border border-white/15 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer">
              {sapInstances.map(i=><option key={i.id} value={i.id} className="bg-[#0d1f2d]">{i.name}</option>)}
            </select>
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 py-2.5 border-b border-white/5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          {[
            {label:"Version", value:selectedInstance.sapVersion},
            {label:"Kernel",  value:selectedInstance.kernelVersion},
            {label:"HANA",    value:selectedInstance.hanaRevision},
            {label:"SP",      value:selectedInstance.spLevel.replace("SAPK-","").replace(/INSAPHANA$/,"")},
            {label:"OS",      value:selectedInstance.osVersion.replace("SUSE Linux Enterprise","SLES")},
          ].map(({label,value})=>(
            <span key={label} className="flex items-center gap-1"><span className="text-slate-600">{label}:</span><span className="text-slate-400 font-mono">{value}</span></span>
          ))}
        </div>

        {/* Server Operations */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Server Operations</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
            {serverActions.map(a=>(
              <ActionTile key={a.id} label={a.label} sub={a.sub} severity={a.severity} icon={a.icon} onClick={()=>setActiveAction(a.id)}/>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/8 my-1"/>

        {/* SAP Operations */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">SAP Operations</p>
            <span className="font-mono text-[9px] text-brand-accent border border-brand-accent/30 rounded-full px-1.5 py-0.5 uppercase tracking-wide">Creates ticket · requires approval</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1">
            {sapActions.map(a=>(
              <ActionTile key={a.id} label={a.label} sub={a.sub} severity="info" icon={a.icon} onClick={()=>setActiveAction(a.id)}/>
            ))}
          </div>
        </div>
      </div>

      {/* Server modals */}
      <Modal open={activeAction==="start-server"}  onClose={closeModal}><StartServerModal  instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="reboot-server"} onClose={closeModal}><RebootServerModal instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="os-patch"}      onClose={closeModal}><OSPatchModal      instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="kernel-patch"}  onClose={closeModal}><KernelPatchModal  instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="shutdown-sap"}  onClose={closeModal}><ShutdownSAPModal  instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="shutdown-os"}   onClose={closeModal}><ShutdownOSModal   instance={selectedInstance} onClose={closeModal}/></Modal>

      {/* SAP operation modals */}
      <Modal open={activeAction==="client-copy"}     onClose={closeModal}><ClientCopyModal     instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="transport-move"}  onClose={closeModal}><TransportMoveModal  instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="system-refresh"}  onClose={closeModal}><SystemRefreshModal  instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="hana-revision"}   onClose={closeModal}><HANARevisionModal   instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="support-pack"}    onClose={closeModal}><SupportPackModal    instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="sap-addon"}       onClose={closeModal}><SAPAddonModal       instance={selectedInstance} onClose={closeModal}/></Modal>
      <Modal open={activeAction==="upgrade-request"} onClose={closeModal}><UpgradeRequestModal instance={selectedInstance} onClose={closeModal}/></Modal>
    </>
  );
}
