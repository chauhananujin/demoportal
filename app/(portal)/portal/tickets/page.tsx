// app/(portal)/portal/tickets/page.tsx
"use client";
import { useState } from "react";
import { useTickets } from "@/lib/tickets/ticket-context";
import { usePermission } from "@/lib/auth/use-permission";
import { cn } from "@/lib/utils";
import type { Ticket, TicketStatus, Role } from "@/lib/tickets/types";

type Filter = "all" | "pending" | "approved" | "rejected";

const STATUS_LABEL: Record<TicketStatus, string> = {
  pending_manager: "Awaiting Manager",
  pending_admin:   "Awaiting Admin",
  approved:        "Approved",
  rejected:        "Rejected",
};

const STATUS_STYLE: Record<TicketStatus, string> = {
  pending_manager: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  pending_admin:   "text-violet-400 bg-violet-400/10 border-violet-400/20",
  approved:        "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected:        "text-red-400 bg-red-400/10 border-red-400/20",
};

const TYPE_LABEL: Record<string, string> = {
  provision:          "Provision",
  "sap-operation":    "SAP Op",
  "infra-operation":  "Infra Op",
  billing:            "Billing",
  support:            "Support",
};

const ROLE_BADGE: Record<Role, string> = {
  user:    "text-slate-400 border-slate-400/30 bg-slate-400/10",
  manager: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  admin:   "text-red-400 border-red-400/30 bg-red-400/10",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TicketsPage() {
  const { tickets, createTicket, approveStage1, approveStage2, rejectTicket, addNote } = useTickets();
  const canApproveS1  = usePermission("approve:stage1");
  const canApproveS2  = usePermission("approve:stage2");
  const canReject     = usePermission("reject:ticket");
  const canUpdate     = usePermission("update:ticket");
  const canCreate     = usePermission("create:ticket");

  const [filter, setFilter]       = useState<Filter>("all");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [approvalNotes, setAN]    = useState<Record<string, string>>({});
  const [noteInputs, setNI]       = useState<Record<string, string>>({});

  const filtered = tickets.filter((t) => {
    if (filter === "pending")  return t.status === "pending_manager" || t.status === "pending_admin";
    if (filter === "approved") return t.status === "approved";
    if (filter === "rejected") return t.status === "rejected";
    return true;
  });

  const pendingCount = tickets.filter(
    (t) => t.status === "pending_manager" || t.status === "pending_admin"
  ).length;

  function handleNewTicket() {
    createTicket({ title: "Support request", type: "support", detail: {} });
  }

  function handleApproveS1(id: string) {
    approveStage1(id, approvalNotes[id] ?? "");
    setAN((n) => ({ ...n, [id]: "" }));
  }
  function handleApproveS2(id: string) {
    approveStage2(id, approvalNotes[id] ?? "");
    setAN((n) => ({ ...n, [id]: "" }));
  }
  function handleReject(id: string) {
    rejectTicket(id, approvalNotes[id] ?? "");
    setAN((n) => ({ ...n, [id]: "" }));
  }
  function handleAddNote(id: string) {
    const text = noteInputs[id]?.trim();
    if (!text) return;
    addNote(id, text);
    setNI((n) => ({ ...n, [id]: "" }));
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pendingCount} pending · {tickets.length} total
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleNewTicket}
            className="bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + New Ticket
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border capitalize",
              filter === f
                ? "bg-brand-primary/20 text-brand-accent border-brand-primary/40"
                : "text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">No tickets found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((ticket) => {
              const isExpanded = expanded === ticket.id;
              const isOpen =
                ticket.status === "pending_manager" || ticket.status === "pending_admin";

              return (
                <div key={ticket.id}>
                  {/* Summary row */}
                  <div
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ticket.id} · {TYPE_LABEL[ticket.type] ?? ticket.type} · {ticket.requestedBy} · {fmtRelative(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        "font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border",
                        STATUS_STYLE[ticket.status]
                      )}>
                        {STATUS_LABEL[ticket.status]}
                      </span>
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className={cn("text-slate-500 transition-transform shrink-0", isExpanded && "rotate-180")}
                      >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-6 pb-6 bg-white/2 border-t border-white/5">
                      {/* Timeline */}
                      <div className="pt-4 mb-5">
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-3 font-medium">
                          Approval Timeline
                        </p>
                        <div className="space-y-3">
                          <TimelineStep
                            label="Requested"
                            outcome="approved"
                            by={ticket.requestedBy}
                            role={ticket.requestedByRole}
                            at={fmtDate(ticket.createdAt)}
                            note=""
                          />
                          <TimelineStep
                            label="Manager Review"
                            outcome={ticket.managerApproval?.outcome}
                            by={ticket.managerApproval?.by}
                            role="manager"
                            at={ticket.managerApproval ? fmtDate(ticket.managerApproval.at) : undefined}
                            note={ticket.managerApproval?.note}
                          />
                          {/* Admin step: only shown after stage 1 resolves */}
                          {(ticket.status === "pending_admin" ||
                            ticket.status === "approved" ||
                            (ticket.status === "rejected" && ticket.adminApproval !== null)) && (
                            <TimelineStep
                              label="Admin Review"
                              outcome={ticket.adminApproval?.outcome}
                              by={ticket.adminApproval?.by}
                              role="admin"
                              at={ticket.adminApproval ? fmtDate(ticket.adminApproval.at) : undefined}
                              note={ticket.adminApproval?.note}
                            />
                          )}
                        </div>
                      </div>

                      {/* Notes history */}
                      {ticket.notes.length > 0 && (
                        <div className="mb-5">
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-medium">Notes</p>
                          <div className="space-y-2">
                            {ticket.notes.map((n, i) => (
                              <div key={i} className="bg-white/3 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">
                                  {n.by} · {fmtDate(n.at)}
                                </p>
                                <p className="text-sm text-slate-300">{n.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action area */}
                      {isOpen && (
                        <div className="border-t border-white/8 pt-4 space-y-4">
                          {/* Manager approval buttons */}
                          {canApproveS1 && ticket.status === "pending_manager" && (
                            <div>
                              <textarea
                                value={approvalNotes[ticket.id] ?? ""}
                                onChange={(e) => setAN((n) => ({ ...n, [ticket.id]: e.target.value }))}
                                placeholder="Optional approval note…"
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 resize-none mb-2"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveS1(ticket.id)}
                                  className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/30 transition-colors"
                                >
                                  Approve
                                </button>
                                {canReject && (
                                  <button
                                    onClick={() => handleReject(ticket.id)}
                                    className="px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Admin final approval buttons */}
                          {canApproveS2 && ticket.status === "pending_admin" && (
                            <div>
                              <textarea
                                value={approvalNotes[ticket.id] ?? ""}
                                onChange={(e) => setAN((n) => ({ ...n, [ticket.id]: e.target.value }))}
                                placeholder="Optional approval note…"
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 resize-none mb-2"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveS2(ticket.id)}
                                  className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/30 transition-colors"
                                >
                                  Final Approve
                                </button>
                                {canReject && (
                                  <button
                                    onClick={() => handleReject(ticket.id)}
                                    className="px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Add note — all roles */}
                          {canUpdate && (
                            <div className={cn(
                              "flex gap-2",
                              (canApproveS1 || canApproveS2) && "border-t border-white/5 pt-3"
                            )}>
                              <input
                                value={noteInputs[ticket.id] ?? ""}
                                onChange={(e) => setNI((n) => ({ ...n, [ticket.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") handleAddNote(ticket.id); }}
                                placeholder="Add a note…"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50"
                              />
                              <button
                                onClick={() => handleAddNote(ticket.id)}
                                disabled={!noteInputs[ticket.id]?.trim()}
                                className="px-3 py-1.5 bg-brand-primary/20 border border-brand-primary/30 text-brand-accent text-xs font-medium rounded-lg hover:bg-brand-primary/30 transition-colors disabled:opacity-40"
                              >
                                Add Note
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineStep({
  label, outcome, by, role, at, note,
}: {
  label: string;
  outcome: "approved" | "rejected" | undefined;
  by?: string;
  role?: Role | string;
  at?: string;
  note?: string;
}) {
  const isPending  = outcome === undefined;
  const isRejected = outcome === "rejected";

  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        "w-5 h-5 rounded-full border flex items-center justify-center text-[9px] shrink-0 mt-0.5",
        isPending  ? "border-slate-700 bg-slate-800" :
        isRejected ? "border-red-500/40 bg-red-500/10" :
                     "border-emerald-500/40 bg-emerald-500/10"
      )}>
        {isPending  ? <span className="text-slate-600">·</span> :
         isRejected ? <span className="text-red-400">✕</span> :
                      <span className="text-emerald-400">✓</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white font-medium">{label}</span>
          {role && !isPending && (
            <span className={cn(
              "font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border",
              ROLE_BADGE[role as Role] ?? ROLE_BADGE.user
            )}>{role}</span>
          )}
          {isPending && <span className="text-xs text-slate-500">Pending</span>}
          {isRejected && <span className="text-xs text-red-400">Rejected</span>}
        </div>
        {by && <p className="text-xs text-slate-500 mt-0.5">{by}{at ? ` · ${at}` : ""}</p>}
        {note && <p className="text-xs text-slate-400 italic mt-1">"{note}"</p>}
      </div>
    </div>
  );
}
