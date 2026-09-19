"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTickets } from "@/lib/tickets/ticket-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { namespacesForCluster, type K8sNode, type K8sWorkload } from "@/lib/portal/kubernetes";

export type ActiveAction =
  | { kind: "scale" | "restart" | "delete"; workload: K8sWorkload }
  | { kind: "drain"; node: K8sNode }
  | { kind: "deploy"; clusterId: string }
  | null;

type ModalState = "form" | "submitting" | "done";

/* ── Shared modal atoms ──────────────────────────────────── */

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#0d1f2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, sub, onClose }: { title: string; sub?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between px-6 py-4 border-b border-white/8 shrink-0">
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 font-mono">{sub}</p>}
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors mt-0.5 shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

/** Shows exactly which cluster (and namespace, when applicable) an action will affect, before the user can confirm. */
function AffectedScope({ clusterName, namespace }: { clusterName: string; namespace?: string }) {
  return (
    <div className={`grid ${namespace ? "grid-cols-2" : "grid-cols-1"} gap-3 text-xs bg-white/3 border border-white/10 rounded-lg p-3`}>
      <div>
        <p className="text-slate-500 mb-0.5">Cluster</p>
        <p className="text-white font-mono">{clusterName}</p>
      </div>
      {namespace && (
        <div>
          <p className="text-slate-500 mb-0.5">Namespace</p>
          <p className="text-white font-mono">{namespace}</p>
        </div>
      )}
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

/* ── Action modals ───────────────────────────────────────── */

export function ScaleWorkloadModal({ workload, clusterName, onClose }: { workload: K8sWorkload; clusterName: string; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [target, setTarget] = useState(workload.desiredReplicas);
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");

  if (state === "done") {
    return <TicketCreatedState ticketId={ticketId} operation={`Scale ${workload.name} to ${target} replicas`} onClose={onClose} />;
  }
  return (
    <>
      <ModalHeader title="Scale Workload" sub={workload.name} onClose={onClose} />
      <div className="px-6 py-5 space-y-5 overflow-y-auto">
        <AffectedScope clusterName={clusterName} namespace={workload.namespace} />
        <div>
          <Label className="text-xs text-slate-400 mb-3 block">
            Target replicas: <span className="text-white font-semibold ml-1 font-mono">{target}</span>
          </Label>
          <input type="range" min={0} max={10} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-full accent-brand-primary" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>0</span><span>10</span></div>
        </div>
        <div className="bg-white/3 border border-white/10 rounded-lg p-2.5 text-xs">
          <p className="text-slate-500 mb-0.5">Change</p>
          <p className="text-white font-mono">{workload.desiredReplicas} → {target} replicas</p>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button
          disabled={target === workload.desiredReplicas || state === "submitting"}
          onClick={async () => {
            setState("submitting");
            const t = createTicket({
              title: `Scale ${workload.name} to ${target} replicas`,
              type: "infra-operation",
              detail: { resource: clusterName, workload: workload.name, namespace: workload.namespace, from: workload.desiredReplicas, to: target },
            });
            setTicketId(t.id);
            setState("done");
          }}
          className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[120px]"
        >
          {state === "submitting" ? "Submitting…" : "Request Scale"}
        </Button>
      </div>
    </>
  );
}

export function RestartWorkloadModal({ workload, clusterName, onClose }: { workload: K8sWorkload; clusterName: string; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");

  if (state === "done") {
    return <TicketCreatedState ticketId={ticketId} operation={`Rolling restart of ${workload.name}`} onClose={onClose} />;
  }
  return (
    <>
      <ModalHeader title="Rolling Restart" sub={workload.name} onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <AffectedScope clusterName={clusterName} namespace={workload.namespace} />
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Pods will be terminated and replaced one-by-one to preserve availability. Current replicas: <strong>{workload.readyReplicas}/{workload.desiredReplicas}</strong>.</p>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button
          disabled={state === "submitting"}
          onClick={async () => {
            setState("submitting");
            const t = createTicket({
              title: `Rolling restart — ${workload.name}`,
              type: "infra-operation",
              detail: { resource: clusterName, workload: workload.name, namespace: workload.namespace, operation: "rolling-restart" },
            });
            setTicketId(t.id);
            setState("done");
          }}
          className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[140px]"
        >
          {state === "submitting" ? "Submitting…" : "Request Restart"}
        </Button>
      </div>
    </>
  );
}

export function DeleteWorkloadModal({ workload, clusterName, onClose }: { workload: K8sWorkload; clusterName: string; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const valid = confirm === workload.name;

  if (state === "done") {
    return <TicketCreatedState ticketId={ticketId} operation={`Delete workload ${workload.name}`} onClose={onClose} />;
  }
  return (
    <>
      <ModalHeader title="Delete Workload" sub={workload.name} onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <AffectedScope clusterName={clusterName} namespace={workload.namespace} />
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-red-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>This permanently removes the <strong>{workload.kind}</strong> and all {workload.desiredReplicas} of its pods. This cannot be undone.</p>
        </div>
        <div>
          <Label htmlFor="delete-confirm" className="text-xs text-slate-400 mb-1.5 block">
            Type <span className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">{workload.name}</span> to confirm
          </Label>
          <input
            id="delete-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-400/50"
            placeholder={workload.name}
          />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-red-500/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button
          disabled={!valid || state === "submitting"}
          onClick={async () => {
            setState("submitting");
            const t = createTicket({
              title: `Delete workload ${workload.name}`,
              type: "infra-operation",
              detail: { resource: clusterName, workload: workload.name, namespace: workload.namespace, kind: workload.kind, operation: "delete" },
            });
            setTicketId(t.id);
            setState("done");
          }}
          className="bg-red-500 hover:bg-red-400 text-white disabled:opacity-40 min-w-[140px]"
        >
          {state === "submitting" ? "Submitting…" : "Request Delete"}
        </Button>
      </div>
    </>
  );
}

export function DrainNodeModal({ node, clusterName, onClose }: { node: K8sNode; clusterName: string; onClose: () => void }) {
  const { createTicket } = useTickets();
  const [checked, setChecked] = useState(false);
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");

  if (state === "done") {
    return <TicketCreatedState ticketId={ticketId} operation={`Cordon & drain ${node.name}`} onClose={onClose} />;
  }
  return (
    <>
      <ModalHeader title="Cordon & Drain Node" sub={node.name} onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <AffectedScope clusterName={clusterName} />
        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <p>Marks the node unschedulable and evicts its <strong>{node.pods}</strong> pods to other nodes. Pods without a replica elsewhere will be unavailable until rescheduled.</p>
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-brand-primary shrink-0" />
          <span className="text-xs text-slate-300 leading-relaxed">I&apos;ve confirmed remaining node capacity can absorb this node&apos;s workloads.</span>
        </label>
      </div>
      <div className="px-6 py-4 border-t border-amber-400/15 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button
          disabled={!checked || state === "submitting"}
          onClick={async () => {
            setState("submitting");
            const t = createTicket({
              title: `Cordon & drain ${node.name}`,
              type: "infra-operation",
              detail: { resource: clusterName, node: node.name, operation: "drain" },
            });
            setTicketId(t.id);
            setState("done");
          }}
          className="bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 min-w-[140px]"
        >
          {state === "submitting" ? "Submitting…" : "Request Drain"}
        </Button>
      </div>
    </>
  );
}

export function DeployWorkloadModal({ clusterId, clusterName, onClose }: { clusterId: string; clusterName: string; onClose: () => void }) {
  const { createTicket } = useTickets();
  const namespaces = namespacesForCluster(clusterId);
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState(namespaces[0]?.name ?? "default");
  const [image, setImage] = useState("");
  const [replicas, setReplicas] = useState(2);
  const [state, setState] = useState<ModalState>("form");
  const [ticketId, setTicketId] = useState("");
  const valid = name.trim().length > 0 && image.trim().length > 0;

  if (state === "done") {
    return <TicketCreatedState ticketId={ticketId} operation={`Deploy ${name} to ${namespace}`} onClose={onClose} />;
  }
  return (
    <>
      <ModalHeader title="Deploy Workload" onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto">
        <AffectedScope clusterName={clusterName} namespace={namespace} />
        <div>
          <Label className="text-xs text-slate-400 mb-1.5 block">Workload name</Label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-service"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-primary/50" />
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-1.5 block">Namespace</Label>
          <select value={namespace} onChange={(e) => setNamespace(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50">
            {namespaces.map((ns) => <option key={ns.id} value={ns.name}>{ns.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-1.5 block">Container image</Label>
          <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="ascelios/my-service:1.0.0"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-primary/50" />
        </div>
        <div>
          <Label className="text-xs text-slate-400 mb-3 block">Replicas: <span className="text-white font-semibold ml-1 font-mono">{replicas}</span></Label>
          <input type="range" min={1} max={10} value={replicas} onChange={(e) => setReplicas(Number(e.target.value))} className="w-full accent-brand-primary" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">Cancel</Button>
        <Button
          disabled={!valid || state === "submitting"}
          onClick={async () => {
            setState("submitting");
            const t = createTicket({
              title: `Deploy ${name} to ${namespace}`,
              type: "infra-operation",
              detail: { resource: clusterName, workload: name, namespace, image, replicas, operation: "deploy" },
            });
            setTicketId(t.id);
            setState("done");
          }}
          className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[120px]"
        >
          {state === "submitting" ? "Submitting…" : "Request Deploy"}
        </Button>
      </div>
    </>
  );
}

/** Renders whichever action modal is active. Centralizes the five k8s action modals for the dashboard page and the workload detail drawer. */
export function KubernetesActionModals({ action, clusterName, onClose }: { action: ActiveAction; clusterName: string; onClose: () => void }) {
  return (
    <>
      <Modal open={action?.kind === "deploy"} onClose={onClose}>
        {action?.kind === "deploy" && <DeployWorkloadModal clusterId={action.clusterId} clusterName={clusterName} onClose={onClose} />}
      </Modal>
      <Modal open={action?.kind === "scale"} onClose={onClose}>
        {action?.kind === "scale" && <ScaleWorkloadModal workload={action.workload} clusterName={clusterName} onClose={onClose} />}
      </Modal>
      <Modal open={action?.kind === "restart"} onClose={onClose}>
        {action?.kind === "restart" && <RestartWorkloadModal workload={action.workload} clusterName={clusterName} onClose={onClose} />}
      </Modal>
      <Modal open={action?.kind === "delete"} onClose={onClose}>
        {action?.kind === "delete" && <DeleteWorkloadModal workload={action.workload} clusterName={clusterName} onClose={onClose} />}
      </Modal>
      <Modal open={action?.kind === "drain"} onClose={onClose}>
        {action?.kind === "drain" && <DrainNodeModal node={action.node} clusterName={clusterName} onClose={onClose} />}
      </Modal>
    </>
  );
}
