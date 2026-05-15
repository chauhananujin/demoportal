"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/lib/tickets/ticket-context";

/* ── Types ─────────────────────────────────────────────── */

type SnapStatus = "available" | "syncing" | "creating" | "deleting";
type PolicyStatus = "active" | "syncing" | "not-configured";
type SnapFilter = "all" | "db" | "vm" | "hana" | "etcd" | "storage";

interface Snapshot {
  id: string; name: string; resource: string; cloud: string;
  type: string; filterKey: SnapFilter; created: string; age: string;
  size: string; status: SnapStatus;
}

interface BackupPolicy {
  resource: string; cloud: string; type: string;
  schedule: string; retention: string; nextRun: string;
  status: PolicyStatus; lastRun: string;
}

/* ── Mock data ─────────────────────────────────────────── */

const snapshots: Snapshot[] = [
  { id: "snap-001", name: "auto-20260514-0300",  resource: "analytics-postgres", cloud: "GCP",   type: "DB Snapshot",          filterKey: "db",      created: "Today 03:00 UTC",      age: "8h ago",       size: "38 GB",  status: "available" },
  { id: "snap-002", name: "etcd-20260514-0300",  resource: "prod-eks-cluster",   cloud: "AWS",   type: "etcd Backup",          filterKey: "etcd",    created: "Today 03:00 UTC",      age: "8h ago",       size: "2.1 GB", status: "available" },
  { id: "snap-003", name: "hana-full-20260514",  resource: "prod-s4hana-eu",     cloud: "Azure", type: "HANA Full Backup",     filterKey: "hana",    created: "Today 01:00 UTC",      age: "10h ago",      size: "95 GB",  status: "available" },
  { id: "snap-004", name: "replica-sync-0514",   resource: "backup-storage",     cloud: "Azure", type: "Cross-Region Copy",    filterKey: "storage", created: "Today 02:15 UTC",      age: "9h ago",       size: "12 TB",  status: "syncing"   },
  { id: "snap-005", name: "auto-20260513-0300",  resource: "analytics-postgres", cloud: "GCP",   type: "DB Snapshot",          filterKey: "db",      created: "Yesterday 03:00 UTC",  age: "1 day ago",    size: "37 GB",  status: "available" },
  { id: "snap-006", name: "etcd-20260513-0300",  resource: "prod-eks-cluster",   cloud: "AWS",   type: "etcd Backup",          filterKey: "etcd",    created: "Yesterday 03:00 UTC",  age: "1 day ago",    size: "2.0 GB", status: "available" },
  { id: "snap-007", name: "hana-full-20260513",  resource: "prod-s4hana-eu",     cloud: "Azure", type: "HANA Full Backup",     filterKey: "hana",    created: "Yesterday 01:00 UTC",  age: "1 day ago",    size: "94 GB",  status: "available" },
  { id: "snap-008", name: "weekly-20260512",     resource: "dev-vm-fleet",       cloud: "AWS",   type: "VM Snapshot",          filterKey: "vm",      created: "May 12 00:00 UTC",     age: "2 days ago",   size: "180 GB", status: "available" },
  { id: "snap-009", name: "auto-20260512-0300",  resource: "analytics-postgres", cloud: "GCP",   type: "DB Snapshot",          filterKey: "db",      created: "May 12 03:00 UTC",     age: "2 days ago",   size: "37 GB",  status: "available" },
  { id: "snap-010", name: "etcd-20260512-0300",  resource: "prod-eks-cluster",   cloud: "AWS",   type: "etcd Backup",          filterKey: "etcd",    created: "May 12 03:00 UTC",     age: "2 days ago",   size: "2.0 GB", status: "available" },
  { id: "snap-011", name: "manual-20260501",     resource: "analytics-postgres", cloud: "GCP",   type: "DB Snapshot (manual)", filterKey: "db",      created: "May 1 14:32 UTC",      age: "13 days ago",  size: "35 GB",  status: "available" },
  { id: "snap-012", name: "hana-incr-20260514",  resource: "prod-s4hana-eu",     cloud: "Azure", type: "HANA Incremental",     filterKey: "hana",    created: "Today 07:00 UTC",      age: "4h ago",       size: "8 GB",   status: "creating"  },
  { id: "snap-013", name: "final-20260115",      resource: "sap-s4-sandbox-01",  cloud: "Azure", type: "Final Snapshot",       filterKey: "hana",    created: "Jan 15 09:00 UTC",     age: "119 days ago", size: "45 GB",  status: "available" },
];

const policies: BackupPolicy[] = [
  { resource: "analytics-postgres", cloud: "GCP",   type: "DB Snapshot",             schedule: "Daily 03:00 UTC",     retention: "30 days",  nextRun: "Tomorrow 03:00",    status: "active",          lastRun: "Today 03:00" },
  { resource: "prod-eks-cluster",   cloud: "AWS",   type: "etcd Full Backup",        schedule: "Daily 03:00 UTC",     retention: "30 days",  nextRun: "Tomorrow 03:00",    status: "active",          lastRun: "Today 03:00" },
  { resource: "prod-s4hana-eu",     cloud: "Azure", type: "HANA Full + Incremental", schedule: "Daily 01:00 / 07:00", retention: "14 days",  nextRun: "Tomorrow 01:00",    status: "active",          lastRun: "Today 07:00" },
  { resource: "dev-vm-fleet",       cloud: "AWS",   type: "VM Snapshot",             schedule: "Weekly Sun 00:00",    retention: "4 weeks",  nextRun: "May 19 00:00",      status: "active",          lastRun: "May 12 00:00" },
  { resource: "backup-storage",     cloud: "Azure", type: "Cross-Region Replication",schedule: "Continuous",          retention: "90 days",  nextRun: "Continuous",        status: "syncing",         lastRun: "Today 02:15" },
  { resource: "ci-runner-pool",     cloud: "AWS",   type: "No policy configured",    schedule: "—",                   retention: "—",        nextRun: "—",                 status: "not-configured",  lastRun: "—" },
];

/* ── Helpers ───────────────────────────────────────────── */

const cloudColor: Record<string, string> = { AWS: "text-amber-400", Azure: "text-sky-400", GCP: "text-emerald-400" };

const statusStyle: Record<SnapStatus, string> = {
  available: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  syncing:   "text-sky-400 bg-sky-400/10 border-sky-400/20",
  creating:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  deleting:  "text-red-400 bg-red-400/10 border-red-400/20",
};

const policyStatusStyle: Record<PolicyStatus, string> = {
  active:          "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  syncing:         "text-sky-400 bg-sky-400/10 border-sky-400/20",
  "not-configured":"text-slate-500 bg-slate-500/10 border-slate-500/20",
};

const filterLabels: { id: SnapFilter; label: string }[] = [
  { id: "all",     label: "All" },
  { id: "db",      label: "Database" },
  { id: "etcd",    label: "etcd" },
  { id: "hana",    label: "HANA" },
  { id: "vm",      label: "VM" },
  { id: "storage", label: "Storage" },
];

const totalSizeGB = snapshots.reduce((sum, s) => {
  const n = parseFloat(s.size.replace(/[^0-9.]/g, ""));
  const unit = s.size.includes("TB") ? 1024 : 1;
  return sum + n * unit;
}, 0);

/* ── Restore / Delete Modals ───────────────────────────── */

function RestoreModal({ snap, onClose }: { snap: Snapshot; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const valid = confirm.toLowerCase() === "restore";

  if (done) return (
    <div className="px-6 py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17 7H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM14 7V5a2 2 0 0 0-4 0v2" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <p className="text-white font-semibold mb-1">Restore Ticket Created</p>
      <p className="text-brand-accent font-mono text-sm mb-2">{ticketId}</p>
      <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto leading-relaxed">An Ascelios engineer will review and approve this request before any restore operation begins.</p>
      <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
        <Link href="/portal/tickets"><Button className="w-full bg-brand-primary hover:bg-brand-accent text-white text-sm">View Ticket</Button></Link>
        <Button variant="outline" onClick={onClose} className="w-full border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-sm">Close</Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-start justify-between px-6 py-4 border-b border-amber-400/20 shrink-0">
        <div><p className="text-base font-semibold text-white">Restore Snapshot</p><p className="text-xs text-slate-500 mt-0.5">{snap.resource} · {snap.name}</p></div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
      </div>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <div className="bg-brand-accent/6 border border-brand-accent/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-brand-accent shrink-0 mt-0.5"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4.5v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <p className="text-slate-400"><span className="text-brand-accent font-medium">Approval required. </span>Submitting creates a change-management ticket. An Ascelios engineer must approve before any restore begins.</p>
        </div>
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Restoring will overwrite current data on <strong>{snap.resource}</strong> with the state from <strong>{snap.created}</strong>. All changes since that time will be lost.</p>
        </div>
        <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-1.5 text-xs">
          {[{ l: "Snapshot", v: snap.name }, { l: "Resource", v: snap.resource }, { l: "Created", v: snap.created }, { l: "Size", v: snap.size }].map(({ l, v }) => (
            <div key={l} className="flex gap-3"><span className="text-slate-500 w-20 shrink-0">{l}</span><span className="text-slate-300 font-mono">{v}</span></div>
          ))}
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">restore</span> to confirm</p>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="restore" className="w-full bg-white/5 border border-amber-400/20 focus:border-amber-400 text-white text-sm rounded-lg px-3 py-2 outline-none font-mono placeholder:text-slate-700" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid} onClick={async () => {
          const t = createTicket({ title: `Restore ${snap.resource} from ${snap.name}`, type: "infra-operation", detail: { snapshot: snap.name, resource: snap.resource, created: snap.created } });
          setTicketId(t.id);
          setDone(true);
        }} className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[130px]">
          Create Restore Ticket
        </Button>
      </div>
    </>
  );
}

function DeleteModal({ snap, onClose }: { snap: Snapshot; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const valid = confirm === snap.name;

  if (done) return (
    <div className="px-6 py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17 7H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM14 7V5a2 2 0 0 0-4 0v2" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <p className="text-white font-semibold mb-1">Deletion Ticket Created</p>
      <p className="text-brand-accent font-mono text-sm mb-2">{ticketId}</p>
      <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto leading-relaxed">An Ascelios engineer will review this request. Deletion requires explicit approval.</p>
      <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
        <Link href="/portal/tickets"><Button className="w-full bg-brand-primary hover:bg-brand-accent text-white text-sm">View Ticket</Button></Link>
        <Button variant="outline" onClick={onClose} className="w-full border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-sm">Close</Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-start justify-between px-6 py-4 border-b border-red-500/20 shrink-0">
        <div><p className="text-base font-semibold text-white">Delete Snapshot</p><p className="text-xs text-slate-500 mt-0.5">{snap.resource} · {snap.size}</p></div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
      </div>
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300 flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Deleting a snapshot is permanent and irreversible. Once deleted, the point-in-time recovery data will no longer be available.</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded text-[11px]">{snap.name}</span> to confirm</p>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={snap.name} className="w-full bg-white/5 border border-red-500/20 focus:border-red-500 text-white text-sm rounded-lg px-3 py-2 outline-none font-mono placeholder:text-slate-700" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-red-500/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button disabled={!valid} onClick={async () => {
          const t = createTicket({ title: `Delete snapshot ${snap.name} (${snap.resource})`, type: "infra-operation", detail: { snapshot: snap.name, resource: snap.resource, size: snap.size } });
          setTicketId(t.id);
          setDone(true);
        }} className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 min-w-[130px]">
          Create Deletion Ticket
        </Button>
      </div>
    </>
  );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-[#0d1f2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {children}
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────── */

export default function BackupsPage() {
  const [filter, setFilter] = useState<SnapFilter>("all");
  const [restoreSnap, setRestoreSnap] = useState<Snapshot | null>(null);
  const [deleteSnap, setDeleteSnap] = useState<Snapshot | null>(null);

  const visibleSnaps = filter === "all" ? snapshots : snapshots.filter(s => s.filterKey === filter);
  const availableCount = snapshots.filter(s => s.status === "available").length;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Backups & Snapshots</h1>
          <p className="text-slate-500 text-sm mt-1">
            Automated backup policies and point-in-time snapshots across all resources
          </p>
        </div>
        <Link href="/portal/tickets">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white text-sm">
            Request Backup Policy
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Snapshots",   value: String(snapshots.length), sub: `${availableCount} available`,      color: "text-brand-accent" },
          { label: "Storage Used",      value: `${(totalSizeGB / 1024).toFixed(1)} TB`, sub: "Across all snapshots",  color: "text-violet-400" },
          { label: "Last Backup",       value: "Today 07:00",   sub: "HANA incremental · prod-s4hana-eu",  color: "text-emerald-400" },
          { label: "Next Scheduled",    value: "01:00 UTC",     sub: "HANA full · Tomorrow",                color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-brand-surface border border-white/8 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Backup Policies */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-sm font-semibold text-white">Backup Policies</p>
            <p className="text-xs text-slate-500 mt-0.5">Automated schedules managed by Ascelios</p>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-2 py-0.5 uppercase tracking-wide">
            {policies.filter(p => p.status === "active" || p.status === "syncing").length} active
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {policies.map(p => (
            <div key={p.resource} className="px-6 py-4 flex items-center gap-4 hover:bg-white/3 transition-colors">
              {/* Resource */}
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-slate-400" aria-hidden="true">
                  <ellipse cx="8" cy="5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M3 5v6a5 2 0 0 0 10 0V5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M3 8a5 2 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm text-white font-medium font-mono">{p.resource}</p>
                  <span className={`text-[10px] font-mono ${cloudColor[p.cloud]}`}>{p.cloud}</span>
                </div>
                <p className="text-xs text-slate-500">{p.type}</p>
              </div>
              <div className="hidden md:flex items-center gap-6 text-xs">
                <div className="text-center">
                  <p className="text-slate-600 mb-0.5">Schedule</p>
                  <p className="text-slate-400 font-mono">{p.schedule}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 mb-0.5">Retention</p>
                  <p className="text-slate-400">{p.retention}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 mb-0.5">Last run</p>
                  <p className="text-slate-400">{p.lastRun}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 mb-0.5">Next run</p>
                  <p className="text-slate-400">{p.nextRun}</p>
                </div>
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${policyStatusStyle[p.status]}`}>
                {p.status === "not-configured" ? "not configured" : p.status}
              </span>
              {p.status === "not-configured" && (
                <Link href="/portal/tickets">
                  <Button className="bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-accent border border-brand-primary/30 text-xs h-7 px-3 shrink-0">
                    Configure
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Coverage callout */}
      <div className="bg-amber-400/6 border border-amber-400/20 rounded-xl px-5 py-4 flex items-start gap-3 mb-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true">
          <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-300 mb-0.5">Backup gap: ci-runner-pool</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <span className="font-mono text-white">ci-runner-pool</span> (2× c5.large spot) has no backup policy configured. Spot instances are ephemeral by design, but if persistent CI artefacts or configs are stored on-instance, data loss is possible.{" "}
            <Link href="/portal/tickets" className="text-brand-accent hover:text-white underline underline-offset-2 transition-colors">Request a backup policy →</Link>
          </p>
        </div>
      </div>

      {/* Snapshot list */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-sm font-semibold text-white">All Snapshots</p>
            <p className="text-xs text-slate-500 mt-0.5">{visibleSnaps.length} snapshot{visibleSnaps.length !== 1 ? "s" : ""} shown</p>
          </div>
          {/* Filters */}
          <div className="flex gap-1">
            {filterLabels.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  filter === f.id
                    ? "bg-brand-primary/20 border-brand-primary text-brand-accent"
                    : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_80px_100px_80px] gap-4 px-6 py-2 border-b border-white/5 text-[10px] text-slate-600 uppercase tracking-widest">
          <span>Snapshot name</span>
          <span>Resource</span>
          <span>Type</span>
          <span>Created</span>
          <span>Size</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y divide-white/5">
          {visibleSnaps.map(snap => (
            <div key={snap.id} className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr_1fr_80px_100px_80px] gap-2 lg:gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors items-center">
              <div>
                <p className="text-sm text-white font-mono truncate">{snap.name}</p>
                <p className="text-[11px] text-slate-600 lg:hidden">{snap.resource} · {snap.type} · {snap.age}</p>
              </div>
              <div className="hidden lg:flex items-center gap-1.5">
                <p className="text-sm text-slate-300 font-mono truncate">{snap.resource}</p>
                <span className={`text-[10px] font-mono ${cloudColor[snap.cloud]}`}>{snap.cloud}</span>
              </div>
              <p className="hidden lg:block text-xs text-slate-500">{snap.type}</p>
              <div className="hidden lg:block">
                <p className="text-xs text-slate-400">{snap.created}</p>
                <p className="text-[11px] text-slate-600">{snap.age}</p>
              </div>
              <p className="hidden lg:block text-xs text-slate-400 font-mono">{snap.size}</p>
              <span className={`hidden lg:inline-flex font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border w-fit items-center gap-1 ${statusStyle[snap.status]}`}>
                {(snap.status === "syncing" || snap.status === "creating") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                )}
                {snap.status}
              </span>
              {snap.status === "available" ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => setRestoreSnap(snap)}
                    className="px-2 py-1 text-[10px] text-brand-accent border border-brand-accent/30 bg-brand-accent/8 hover:bg-brand-accent/15 rounded transition-colors font-mono"
                    title="Restore"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => setDeleteSnap(snap)}
                    className="px-2 py-1 text-[10px] text-red-400 border border-red-400/20 bg-red-400/5 hover:bg-red-400/15 rounded transition-colors font-mono"
                    title="Delete"
                  >
                    Del
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-600 italic">{snap.status}</span>
              )}
            </div>
          ))}
        </div>

        {visibleSnaps.length === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-slate-500">No snapshots in this category.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={!!restoreSnap} onClose={() => setRestoreSnap(null)}>
        {restoreSnap && <RestoreModal snap={restoreSnap} onClose={() => setRestoreSnap(null)} />}
      </Modal>
      <Modal open={!!deleteSnap} onClose={() => setDeleteSnap(null)}>
        {deleteSnap && <DeleteModal snap={deleteSnap} onClose={() => setDeleteSnap(null)} />}
      </Modal>
    </div>
  );
}
