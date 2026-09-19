import type { Role, Ticket } from "@/lib/tickets/types";
import type { Tenant } from "@/lib/onboarding/types";
import { PROVISIONING_STAGES } from "@/lib/onboarding/types";

export interface AssistantContext {
  role: Role | "guest";
  tickets: Ticket[];
  tenants: Tenant[];
}

function relDate(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3.6e6;
  if (h < 1) return "just now";
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function statusLabel(s: string): string {
  if (s === "pending_manager") return "pending manager";
  if (s === "pending_admin") return "pending admin";
  return s;
}

const RESOURCES = [
  { name: "prod-eks-cluster",   type: "EKS Cluster",    cloud: "AWS",   region: "eu-west-1",   cpu: 62, mem: 71, uptime: "99.97%" },
  { name: "analytics-postgres", type: "RDS PostgreSQL", cloud: "AWS",   region: "eu-west-1",   cpu: 34, mem: 58, uptime: "99.99%" },
  { name: "dev-vm-fleet",       type: "VM Fleet",       cloud: "Azure", region: "westeurope",  cpu: 28, mem: 45, uptime: "99.90%" },
  { name: "ci-runner-pool",     type: "Runner Pool",    cloud: "AWS",   region: "us-east-1",   cpu: 55, mem: 60, uptime: "99.85%" },
  { name: "prod-s4hana-eu",     type: "SAP S/4HANA",    cloud: "Azure", region: "westeurope",  cpu: 45, mem: 78, uptime: "99.95%" },
];

/**
 * Single-turn intent matcher used by the command palette's "Ask" mode.
 * Returns a markdown-lite reply string. Doesn't manage conversational flows —
 * structured actions (approve/reject/provision/etc.) are slash commands instead.
 */
export function askAssistant(rawInput: string, ctx: AssistantContext): string {
  const raw = rawInput.trim();
  const m = raw.toLowerCase();

  // Greeting
  if (/^\s*(hi+|hello|hey|good (morning|afternoon|evening))\b/.test(m)) {
    return "Hi! Ask about tickets, tenants, infrastructure, migration, backups, or SAP — or hit `/` to see commands.";
  }

  // Tickets
  if (/\b(ticket|tickets|issue|tkt)\b/.test(m)) {
    const open   = ctx.tickets.filter(t => t.status !== "rejected" && t.status !== "approved");
    const closed = ctx.tickets.filter(t => t.status === "approved" || t.status === "rejected");
    if (!open.length) return "No active tickets right now. Full history on the Tickets page.";
    let out = `**${open.length} active ticket${open.length === 1 ? "" : "s"}:**\n\n`;
    for (const t of open.slice(0, 5)) out += `• **${t.id}** — ${t.title} *(${statusLabel(t.status)})*\n`;
    if (closed.length) {
      out += `\nRecent: ${closed.slice(0, 2).map(t => `**${t.id}** ${t.status === "approved" ? "✅" : "❌"} ${relDate(t.createdAt)}`).join(", ")}`;
    }
    return out;
  }

  // Tenants
  if (/\b(tenant|workspace|provisioning)\b/.test(m)) {
    if (ctx.tenants.length === 0) return "No tenants yet — start the onboarding flow to provision one.";
    const lastIndex = PROVISIONING_STAGES.length - 1;
    let out = `**${ctx.tenants.length} tenant${ctx.tenants.length === 1 ? "" : "s"}:**\n\n`;
    for (const t of ctx.tenants.slice(0, 6)) {
      if (t.status === "active") {
        out += `• **${t.name}** — ${t.provider.toUpperCase()} · ${t.region} · active ✅\n`;
      } else if (t.status === "provisioning") {
        const stage = PROVISIONING_STAGES[Math.min(t.stageIndex, lastIndex)];
        const pct = Math.round(((t.stageIndex + 1) / PROVISIONING_STAGES.length) * 100);
        out += `• **${t.name}** — ${t.provider.toUpperCase()} · ${stage} (${pct}%)\n`;
      } else {
        out += `• **${t.name}** — failed ❌\n`;
      }
    }
    return out;
  }

  // Performance / metrics
  if (/\b(metric|performance|cpu|memory|utiliz|health check)\b/.test(m)) {
    let out = "**Live metrics:**\n\n";
    for (const r of RESOURCES) {
      const cpuIcon = r.cpu > 80 ? "🔴" : r.cpu > 60 ? "🟡" : "🟢";
      const memIcon = r.mem > 80 ? "🔴" : r.mem > 60 ? "🟡" : "🟢";
      out += `• **${r.name}** — CPU ${cpuIcon} ${r.cpu}% · Mem ${memIcon} ${r.mem}% · ↑ ${r.uptime}\n`;
    }
    const alerts = RESOURCES.filter(r => r.cpu > 70 || r.mem > 80);
    out += alerts.length
      ? `\n⚠️ Elevated utilisation on **${alerts.map(r => r.name).join(", ")}**.`
      : "\nAll resources within normal range. ✅";
    return out;
  }

  // Infrastructure / resources
  if (/\b(infra(structure)?|resource|server|cluster|vm|fleet)\b/.test(m)) {
    let out = `**Infrastructure — ${RESOURCES.length} resources:**\n\n`;
    for (const r of RESOURCES) out += `• **${r.name}** — ${r.type} · ${r.cloud} ${r.region}\n`;
    return out;
  }

  // Migration
  if (/\b(migration|migrate|phase|journey)\b/.test(m)) {
    return "**Migration — 44% complete:**\n\n✅ Phase 1 · ✅ Phase 2 · ⏳ Phase 3 (62%) · ⬜ 4 · ⬜ 5 · ⬜ 6\n\nTarget: **Dec 2026**. Details on the Migration page.";
  }

  // Backups
  if (/\b(backup|snapshot|restore|retention)\b/.test(m)) {
    return "**Backups:**\n\n• 13 snapshots · 12.4 TB\n• 5/6 resources have active policies\n• Last: today 07:00 UTC · Next: tomorrow 01:00 UTC\n\n⚠️ **ci-runner-pool** has no backup policy.";
  }

  // SAP
  if (/\b(sap|hana|s\/4|s4hana)\b/.test(m)) {
    return "**SAP landscape:**\n\n• **prod-s4hana-eu** — Active · S/4HANA 2023 FPS01 · HANA 2.00.074\n• **sap-s4-sandbox-02** — Provisioning\n\nManage via Infrastructure → SAP Instance Management.";
  }

  // FinOps / cost — gated
  if (ctx.role !== "user" && /\b(cost|saving|optim|billing|finops|spend|budget)\b/.test(m)) {
    return "**FinOps — $1,709/mo identified savings:**\n\n1. Right-size EKS — $380/mo\n2. Delete unattached EBS — $94/mo\n3. S3 Intelligent-Tiering — $210/mo\n4. RDS reserved instances — $640/mo\n5. NAT → VPC Endpoints — $160/mo\n6. Compute Optimizer auto-scaling — $225/mo";
  }

  // Compliance
  if (/\b(compliance|security|audit)\b/.test(m)) {
    return "Compliance checks run daily. The Compliance page has audit reports, control status, and open findings.";
  }

  // Services
  if (/\b(service|contract|tier|subscription)\b/.test(m)) {
    return "**Active services:**\n\n• SAP Managed Services — Enterprise · renews Jun 1 2026\n• Cloud Operations (AWS) — Advanced · renews Jun 1 2026\n• DevOps as a Service — Standard · renews Jun 1 2026";
  }

  // Help fallback
  if (/\b(help|what can|capabilit)\b/.test(m)) {
    return "**Ask me about:**\n\n• Tickets · Tenants · Infrastructure · Metrics\n• Migration · Backups · SAP · Compliance · Services" +
      (ctx.role !== "user" ? "\n• FinOps · cost savings" : "") +
      "\n\nOr type `/` to see structured commands.";
  }

  return "I'm not sure about that. Try tickets, tenants, infrastructure, migration, backups, or SAP — or type `/` for commands.";
}
