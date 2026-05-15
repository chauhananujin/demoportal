"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useTickets } from "@/lib/tickets/ticket-context";
import type { Ticket, TicketType } from "@/lib/tickets/types";

/* ── Static data ─────────────────────────────────────────── */

const RESOURCES = [
  { name: "prod-eks-cluster",    type: "EKS Cluster",     cloud: "AWS",   region: "eu-west-1",   status: "active",       cpu: 62, mem: 71, uptime: "99.97%" },
  { name: "analytics-postgres",  type: "RDS PostgreSQL",  cloud: "AWS",   region: "eu-west-1",   status: "active",       cpu: 34, mem: 58, uptime: "99.99%" },
  { name: "dev-vm-fleet",        type: "VM Fleet",        cloud: "Azure", region: "westeurope",  status: "active",       cpu: 28, mem: 45, uptime: "99.90%" },
  { name: "ci-runner-pool",      type: "Runner Pool",     cloud: "AWS",   region: "us-east-1",   status: "active",       cpu: 55, mem: 60, uptime: "99.85%" },
  { name: "backup-storage",      type: "S3 Bucket",       cloud: "AWS",   region: "eu-west-1",   status: "active",       cpu:  2, mem:  8, uptime: "100%"   },
  { name: "prod-s4hana-eu",      type: "SAP S/4HANA",     cloud: "Azure", region: "westeurope",  status: "active",       cpu: 45, mem: 78, uptime: "99.95%" },
  { name: "sap-s4-sandbox-02",   type: "SAP S/4HANA",     cloud: "Azure", region: "westeurope",  status: "provisioning", cpu:  0, mem:  0, uptime: "–"      },
];

const CLOUD_REGIONS: Record<string, string[]> = {
  AWS:   ["eu-west-1 (Ireland)", "us-east-1 (N. Virginia)", "ap-southeast-1 (Singapore)"],
  Azure: ["westeurope (Netherlands)", "eastus (Virginia)", "southeastasia (Singapore)"],
  GCP:   ["europe-west1 (Belgium)", "us-central1 (Iowa)", "asia-east1 (Taiwan)"],
};

const SERVICE_CATALOG: Record<string, Record<string, string[]>> = {
  AWS: {
    "Compute":    ["EC2 Instance", "EKS Cluster", "ECS Service", "Lambda Function", "Auto Scaling Group", "AWS Batch", "Lightsail Instance"],
    "Database":   ["RDS MySQL", "RDS PostgreSQL", "RDS Oracle", "RDS SQL Server", "Aurora MySQL", "Aurora PostgreSQL", "DynamoDB Table", "ElastiCache Redis", "ElastiCache Memcached", "DocumentDB", "Redshift Cluster", "Neptune"],
    "Storage":    ["S3 Bucket", "EBS Volume", "EFS File System", "FSx for Windows", "FSx for Lustre", "S3 Glacier Vault"],
    "Networking": ["VPC", "Application Load Balancer", "Network Load Balancer", "CloudFront Distribution", "Route 53 Hosted Zone", "API Gateway (REST)", "API Gateway (HTTP)", "Direct Connect", "Transit Gateway"],
    "Security":   ["IAM Role", "IAM Policy", "Secrets Manager Secret", "KMS Key", "WAF Web ACL", "GuardDuty Detector", "Security Hub", "ACM Certificate"],
    "Analytics":  ["EMR Cluster", "Athena Workgroup", "Kinesis Data Stream", "Kinesis Firehose", "Glue Job", "QuickSight Dataset", "AWS Lake Formation"],
    "DevOps":     ["CodePipeline", "CodeBuild Project", "CodeDeploy Application", "ECR Repository", "Systems Manager Parameter", "CloudFormation Stack"],
    "Messaging":  ["SQS Queue", "SNS Topic", "EventBridge Bus", "Amazon MQ Broker", "SES Configuration"],
    "SAP":        ["SAP S/4HANA on AWS", "SAP HANA DB on AWS", "SAP ECC on AWS", "SAP BTP on AWS", "SAP NetWeaver on AWS"],
    "AI / ML":    ["SageMaker Endpoint", "Bedrock Model Access", "Rekognition Project", "Comprehend Endpoint", "Textract"],
    "Monitoring": ["CloudWatch Dashboard", "CloudWatch Alarm", "CloudTrail Trail", "AWS Config Rule", "X-Ray Group"],
  },
  Azure: {
    "Compute":    ["Virtual Machine", "AKS Cluster", "App Service", "Azure Functions", "Container Instances", "Azure Batch Pool", "Azure Spring Apps"],
    "Database":   ["Azure SQL Database", "Azure SQL Managed Instance", "Cosmos DB Account", "Azure Database for PostgreSQL", "Azure Database for MySQL", "Azure Cache for Redis", "Azure Synapse Analytics", "Azure Databricks Workspace"],
    "Storage":    ["Blob Storage Account", "Azure Files Share", "Azure Managed Disk", "Data Lake Storage Gen2", "Azure Backup Vault"],
    "Networking": ["Virtual Network", "Azure Load Balancer", "Application Gateway", "Azure CDN Endpoint", "Azure DNS Zone", "ExpressRoute Circuit", "API Management", "Azure Firewall", "VPN Gateway"],
    "Security":   ["Azure AD / Entra ID Tenant", "Key Vault", "Defender for Cloud Plan", "Microsoft Sentinel Workspace", "Azure DDoS Protection", "Managed Identity"],
    "Analytics":  ["HDInsight Cluster", "Azure Data Factory", "Stream Analytics Job", "Azure Databricks Cluster", "Power BI Embedded", "Azure Purview Account"],
    "DevOps":     ["Azure DevOps Project", "Container Registry", "Azure Pipelines Agent Pool", "Azure Artifacts Feed"],
    "Messaging":  ["Service Bus Namespace", "Event Hub Namespace", "Event Grid Topic", "Azure Queue Storage", "Azure Notification Hub"],
    "SAP":        ["SAP S/4HANA on Azure", "SAP HANA on Azure", "SAP ECC on Azure", "SAP BTP on Azure", "SAP NetWeaver on Azure"],
    "AI / ML":    ["Azure OpenAI Service", "Cognitive Services", "Azure Machine Learning Workspace", "Azure Bot Service", "Form Recognizer"],
    "Monitoring": ["Azure Monitor Workspace", "Log Analytics Workspace", "Application Insights", "Azure Automation Account", "Azure Policy Initiative"],
  },
  GCP: {
    "Compute":    ["Compute Engine VM", "GKE Cluster", "Cloud Run Service", "Cloud Functions", "App Engine Application", "Cloud Batch Job", "Managed Instance Group"],
    "Database":   ["Cloud SQL MySQL", "Cloud SQL PostgreSQL", "Cloud Spanner Instance", "Bigtable Instance", "Firestore Database", "Memorystore Redis", "BigQuery Dataset", "AlloyDB Cluster"],
    "Storage":    ["Cloud Storage Bucket", "Persistent Disk", "Filestore Instance", "Cloud Storage Transfer"],
    "Networking": ["VPC Network", "Cloud Load Balancing", "Cloud CDN", "Cloud DNS Zone", "Cloud Interconnect", "API Gateway", "Cloud Armor Policy", "Cloud NAT"],
    "Security":   ["IAM Service Account", "Secret Manager Secret", "Cloud KMS Key Ring", "Cloud Armor Security Policy", "Security Command Center", "Certificate Manager"],
    "Analytics":  ["Dataproc Cluster", "Dataflow Job", "Pub/Sub Topic", "Looker Studio Report", "Cloud Composer Environment", "BigQuery Data Transfer"],
    "DevOps":     ["Cloud Build Trigger", "Artifact Registry Repository", "Cloud Deploy Pipeline", "Cloud Source Repository"],
    "Messaging":  ["Pub/Sub Topic", "Cloud Tasks Queue", "Eventarc Trigger"],
    "SAP":        ["SAP S/4HANA on GCP", "SAP HANA on GCP", "SAP ECC on GCP", "SAP BTP on GCP", "SAP NetWeaver on GCP"],
    "AI / ML":    ["Vertex AI Endpoint", "BigQuery ML Model", "Vision AI Product Set", "Natural Language AI", "Document AI Processor"],
    "Monitoring": ["Cloud Monitoring Dashboard", "Cloud Logging Sink", "Cloud Trace", "Cloud Profiler", "Error Reporting"],
  },
};

const TICKET_TYPE_MAP: Record<string, TicketType> = {
  "Support":        "support",
  "Provision":      "provision",
  "SAP Operation":  "sap-operation",
  "Infra Operation":"infra-operation",
  "Billing":        "billing",
};

/* ── Types ───────────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  ts: Date;
  quickReplies?: string[];
}

type CreateTicketFlow = {
  kind: "create-ticket";
  step: "type" | "title" | "detail" | "confirm";
  ticketType?: TicketType;
  title?: string;
  detail?: string;
};

type ProvisionFlow = {
  kind: "provision";
  step: "cloud" | "category" | "service" | "region" | "confirm";
  cloud?: string;
  category?: string;
  service?: string;
  region?: string;
};

type CommentFlow = {
  kind: "add-comment";
  step: "select" | "text";
  ticketId?: string;
};

type Flow = null | CreateTicketFlow | ProvisionFlow | CommentFlow;

/* ── Helpers ─────────────────────────────────────────────── */

function relDate(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3.6e6;
  if (h < 1) return "just now";
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function statusLabel(s: string) {
  if (s === "pending_manager") return "pending manager";
  if (s === "pending_admin") return "pending admin";
  return s;
}

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Response engine ─────────────────────────────────────── */

type Result = { reply: string; quickReplies?: string[]; nextFlow: Flow };

function processInput(
  raw: string,
  flow: Flow,
  role: string,
  tickets: Ticket[],
  createTicket: (i: { title: string; type: TicketType; detail: Record<string, unknown> }) => Ticket,
  addNote: (id: string, text: string) => void,
): Result {
  const m = raw.toLowerCase().trim();
  const isCancel = /^(cancel|stop|never ?mind|no thanks|abort|quit)$/.test(m);

  /* ── Active flow ── */
  if (flow) {
    if (isCancel) return { reply: "No problem — cancelled. Anything else I can help with?", nextFlow: null };

    if (flow.kind === "create-ticket") {
      if (flow.step === "type") {
        const key = Object.keys(TICKET_TYPE_MAP).find(k => k.toLowerCase() === m);
        if (!key) return { reply: "Please pick a ticket type:", quickReplies: Object.keys(TICKET_TYPE_MAP), nextFlow: flow };
        return {
          reply: `Got it — **${key}** ticket. What's the title or brief summary?`,
          nextFlow: { kind: "create-ticket", step: "title", ticketType: TICKET_TYPE_MAP[key] },
        };
      }

      if (flow.step === "title") {
        if (raw.trim().length < 5) return { reply: "Please provide a title (at least 5 characters).", nextFlow: flow };
        return {
          reply: "Any additional details? Type them or say **skip**.",
          nextFlow: { kind: "create-ticket", step: "detail", ticketType: flow.ticketType, title: raw.trim() },
        };
      }

      if (flow.step === "detail") {
        const detail = /^skip$/.test(m) ? "" : raw.trim();
        const typeLabel = Object.entries(TICKET_TYPE_MAP).find(([, v]) => v === flow.ticketType)?.[0] ?? flow.ticketType;
        return {
          reply: `Creating:\n\n• **Type:** ${typeLabel}\n• **Title:** ${flow.title}${detail ? `\n• **Detail:** ${detail}` : ""}\n\nConfirm?`,
          quickReplies: ["Yes, create ticket", "Cancel"],
          nextFlow: { kind: "create-ticket", step: "confirm", ticketType: flow.ticketType, title: flow.title, detail },
        };
      }

      if (flow.step === "confirm") {
        if (/yes|confirm|create/.test(m)) {
          const t = createTicket({ title: flow.title!, type: flow.ticketType!, detail: flow.detail ? { description: flow.detail } : {} });
          return { reply: `✅ Ticket **${t.id}** created!\n\n*${t.title}*\n\nStatus: pending manager approval. Track it on the Tickets page.`, nextFlow: null };
        }
        return { reply: "Ticket creation cancelled.", nextFlow: null };
      }
    }

    if (flow.kind === "provision") {
      if (flow.step === "cloud") {
        const cloud = Object.keys(SERVICE_CATALOG).find(c => c.toLowerCase() === m);
        if (!cloud) return { reply: "Please pick a cloud provider:", quickReplies: Object.keys(SERVICE_CATALOG), nextFlow: flow };
        const categories = Object.keys(SERVICE_CATALOG[cloud]);
        return {
          reply: `**${cloud}** — which service category?`,
          quickReplies: categories,
          nextFlow: { kind: "provision", step: "category", cloud },
        };
      }

      if (flow.step === "category") {
        const cloud = flow.cloud!;
        const categories = Object.keys(SERVICE_CATALOG[cloud]);
        const category = categories.find(c => c.toLowerCase() === m || m.replace(" / ", " ").includes(c.toLowerCase().replace(" / ", " ")));
        if (!category) return { reply: "Please select a service category:", quickReplies: categories, nextFlow: flow };
        const services = SERVICE_CATALOG[cloud][category];
        return {
          reply: `**${category}** on ${cloud} — which service?`,
          quickReplies: services,
          nextFlow: { kind: "provision", step: "service", cloud, category },
        };
      }

      if (flow.step === "service") {
        const cloud = flow.cloud!;
        const category = flow.category!;
        const services = SERVICE_CATALOG[cloud][category];
        const service = services.find(s => s.toLowerCase() === m) ?? raw.trim();
        return {
          reply: `**${service}** — which region?`,
          quickReplies: CLOUD_REGIONS[cloud],
          nextFlow: { kind: "provision", step: "region", cloud, category, service },
        };
      }

      if (flow.step === "region") {
        const opts = CLOUD_REGIONS[flow.cloud!] ?? [];
        const region = opts.find(r => r.toLowerCase().startsWith(m.split(" ")[0])) ?? raw.trim();
        return {
          reply: `Ready to submit:\n\n• **Service:** ${flow.service}\n• **Category:** ${flow.category}\n• **Cloud:** ${flow.cloud}\n• **Region:** ${region}\n\nThis creates a Provision ticket. Confirm?`,
          quickReplies: ["Yes, submit request", "Cancel"],
          nextFlow: { kind: "provision", step: "confirm", cloud: flow.cloud, category: flow.category, service: flow.service, region },
        };
      }

      if (flow.step === "confirm") {
        if (/yes|confirm|submit/.test(m)) {
          const t = createTicket({
            title: `Provision ${flow.service} on ${flow.cloud}`,
            type: "provision",
            detail: { service: flow.service, category: flow.category, cloud: flow.cloud, region: flow.region },
          });
          return { reply: `✅ Request **${t.id}** submitted!\n\n• *${flow.service}* on ${flow.cloud} (${flow.region})\n\nPending manager approval. Track it on the Tickets page.`, nextFlow: null };
        }
        return { reply: "Provision request cancelled.", nextFlow: null };
      }
    }

    if (flow.kind === "add-comment") {
      if (flow.step === "select") {
        const t = tickets.find(t => t.id.toUpperCase() === raw.trim().toUpperCase());
        if (!t) {
          const open = tickets.filter(t => t.status !== "rejected" && t.status !== "approved");
          return { reply: "Couldn't find that ticket. Pick from your active ones:", quickReplies: open.slice(0, 5).map(t => t.id), nextFlow: flow };
        }
        return { reply: `Adding a comment to **${t.id}** (*${t.title}*). What would you like to say?`, nextFlow: { kind: "add-comment", step: "text", ticketId: t.id } };
      }

      if (flow.step === "text") {
        if (raw.trim().length < 3) return { reply: "Please enter a comment (at least 3 characters).", nextFlow: flow };
        addNote(flow.ticketId!, raw.trim());
        return { reply: `✅ Comment added to **${flow.ticketId}**:\n\n*"${raw.trim()}"*`, nextFlow: null };
      }
    }
  }

  /* ── No flow — intent matching ── */

  if (/\b(creat|rais|open|new|submit).{0,10}ticket|ticket.{0,10}(creat|rais|new)\b/.test(m) || raw === "Create a ticket") {
    return { reply: "What type of ticket would you like to create?", quickReplies: Object.keys(TICKET_TYPE_MAP), nextFlow: { kind: "create-ticket", step: "type" } };
  }

  if (/\b(provision|deploy|spin.?up|launch).{0,15}(resource|cluster|vm|instance|database|storage|service)\b/.test(m) || raw === "Provision a resource") {
    return { reply: "Which cloud provider would you like to provision on?", quickReplies: Object.keys(SERVICE_CATALOG), nextFlow: { kind: "provision", step: "cloud" } };
  }

  if (/\b(add|leave|post).{0,8}(comment|note).{0,8}ticket|ticket.{0,8}(comment|note)\b/.test(m) || raw === "Add comment to ticket") {
    const open = tickets.filter(t => t.status !== "rejected" && t.status !== "approved");
    if (!open.length) return { reply: "No active tickets to comment on right now.", nextFlow: null };
    return { reply: "Which ticket would you like to add a comment to?", quickReplies: open.slice(0, 5).map(t => t.id), nextFlow: { kind: "add-comment", step: "select" } };
  }

  if (/\b(hi+|hello|hey|good (morning|afternoon|evening))\b/.test(m)) {
    return {
      reply: "Hi there! I'm your Ascelios assistant. I can help with tickets, infrastructure, provisioning, backups, migration, and SAP. What would you like to do?",
      quickReplies: ["Show open tickets", "Create a ticket", "Provision a resource", "Infrastructure health"],
      nextFlow: null,
    };
  }

  if (/\b(ticket|tickets|issue|tkt)\b/.test(m)) {
    const open = tickets.filter(t => t.status !== "rejected" && t.status !== "approved");
    const closed = tickets.filter(t => t.status === "approved" || t.status === "rejected");
    let reply = open.length ? `**${open.length} active ticket${open.length > 1 ? "s" : ""}:**\n\n` : "No active tickets right now.\n\n";
    for (const t of open.slice(0, 5)) reply += `• **${t.id}** — ${t.title} *(${statusLabel(t.status)})*\n`;
    if (closed.length) reply += `\nRecent: ${closed.slice(0, 2).map(t => `**${t.id}** ${t.status === "approved" ? "✅" : "❌"} ${relDate(t.createdAt)}`).join(", ")}`;
    reply += "\n\nFull list on the Tickets page.";
    return { reply, quickReplies: open.length ? ["Add comment to ticket", "Create a ticket"] : ["Create a ticket"], nextFlow: null };
  }

  if (/\b(metric|performance|cpu|memory|utiliz|health check)\b/.test(m) || raw === "Show performance metrics") {
    const active = RESOURCES.filter(r => r.status === "active");
    let reply = "**Current performance metrics:**\n\n";
    for (const r of active) {
      const cpuIcon = r.cpu > 80 ? "🔴" : r.cpu > 60 ? "🟡" : "🟢";
      const memIcon = r.mem > 80 ? "🔴" : r.mem > 60 ? "🟡" : "🟢";
      reply += `• **${r.name}** — CPU ${cpuIcon} ${r.cpu}% · Mem ${memIcon} ${r.mem}% · ↑ ${r.uptime}\n`;
    }
    const alerts = active.filter(r => r.cpu > 70 || r.mem > 80);
    reply += alerts.length ? `\n⚠️ Elevated utilisation on **${alerts.map(r => r.name).join(", ")}**. Visit the Infrastructure page for details.` : "\nAll resources within normal operating range. ✅";
    return { reply, nextFlow: null };
  }

  if (/\b(infra(structure)?|resource|server|cluster|vm|fleet)\b/.test(m) || raw === "Infrastructure health") {
    const active = RESOURCES.filter(r => r.status === "active");
    const prov = RESOURCES.filter(r => r.status === "provisioning");
    let reply = `**Infrastructure — ${active.length} active, ${prov.length} provisioning:**\n\n`;
    for (const r of active) reply += `• **${r.name}** — ${r.type} · ${r.cloud} ${r.region}\n`;
    if (prov.length) reply += `\nProvisioning: ${prov.map(r => `**${r.name}**`).join(", ")}`;
    return { reply, quickReplies: ["Show performance metrics", "Provision a resource"], nextFlow: null };
  }

  if (/\b(migration|migrate|phase|journey)\b/.test(m) || raw === "Migration status") {
    return {
      reply: "**Cloud Migration — 44% complete:**\n\n✅ Phase 1: Assessment & Discovery\n✅ Phase 2: Architecture & Planning\n⏳ Phase 3: Pilot Migration — **62%**\n⬜ Phase 4: Full Migration Wave 1\n⬜ Phase 5: Full Migration Wave 2\n⬜ Phase 6: Optimisation & Steady State\n\nTarget: **December 2026**. Full milestones on the Migration page.",
      nextFlow: null,
    };
  }

  if (/\b(backup|snapshot|restore|retention)\b/.test(m) || raw === "Backup status") {
    return {
      reply: "**Backup status:**\n\n• **13 snapshots** — 12.4 TB total\n• **5/6** resources have active policies\n• Last backup: Today 07:00 UTC *(HANA incremental)*\n• Next scheduled: Tomorrow 01:00 UTC *(HANA full)*\n\n⚠️ **ci-runner-pool** has no backup policy. Visit the Backups page to manage policies.",
      nextFlow: null,
    };
  }

  if (/\b(sap|hana|s\/4|s4hana)\b/.test(m)) {
    return {
      reply: "**SAP landscape:**\n\n• **prod-s4hana-eu** — Active · S/4HANA 2023 FPS01 · HANA 2.00.074\n• **sap-s4-sandbox-02** — Provisioning\n• **sap-s4-sandbox-01** — Terminated (snapshot retained)\n\nSAP operations available under Infrastructure → SAP Instance Management.",
      nextFlow: null,
    };
  }

  if (role !== "user" && /\b(cost|saving|optim|billing|finops|spend|budget)\b/.test(m)) {
    return {
      reply: "**FinOps — $1,709/mo identified savings:**\n\n1. Right-size EKS node groups — $380/mo\n2. Delete unattached EBS volumes — $94/mo\n3. S3 Intelligent-Tiering — $210/mo\n4. Reserved Instances for RDS — $640/mo\n5. NAT Gateway → VPC Endpoints — $160/mo\n6. Compute Optimizer auto-scaling — $225/mo\n\nFull details on the Dashboard.",
      nextFlow: null,
    };
  }

  if (/\b(compliance|security|audit)\b/.test(m)) {
    return { reply: "Compliance checks run daily. Visit the **Compliance** page for audit reports, control status, and open findings.", nextFlow: null };
  }

  if (/\b(service|contract|tier)\b/.test(m)) {
    return {
      reply: "**Active services:**\n\n• SAP Managed Services — Enterprise, renews Jun 1 2026\n• Cloud Operations (AWS) — Advanced, renews Jun 1 2026\n• DevOps as a Service — Standard, renews Jun 1 2026\n\nManage on the Services page.",
      nextFlow: null,
    };
  }

  if (/\b(help|what can|capabilit)\b/.test(m)) {
    return {
      reply: "**What I can help with:**\n\n• **View tickets** — see open tickets and status\n• **Create a ticket** — support, infra, SAP, billing\n• **Add comment** — annotate existing tickets\n• **Provision a resource** — submit new resource requests\n• **Infrastructure health** — status and live metrics\n• **Migration progress** — phase milestones\n• **Backup status** — snapshots and policy gaps\n• **SAP landscape** — system info and operations" +
        (role !== "user" ? "\n• **Cost optimisation** — FinOps recommendations" : "") +
        "\n\nJust ask in plain language!",
      quickReplies: ["Show open tickets", "Create a ticket", "Infrastructure health", "Provision a resource"],
      nextFlow: null,
    };
  }

  if (/\b(thank|thanks|cheers|great|perfect)\b/.test(m)) {
    return { reply: "You're welcome! Let me know if there's anything else I can help with.", nextFlow: null };
  }

  return {
    reply: "I'm not sure about that. Try asking about tickets, infrastructure, migration, backups, or SAP — or say **help** for a full list.",
    quickReplies: ["Show open tickets", "Infrastructure health", "Create a ticket"],
    nextFlow: null,
  };
}

/* ── Markdown-lite renderer ──────────────────────────────── */

function renderText(text: string) {
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*")) return <em key={j} className="text-slate-400 not-italic">{p.slice(1, -1)}</em>;
      return <span key={j}>{p}</span>;
    });
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}

/* ── Typing indicator ────────────────────────────────────── */

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500" style={{ animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────── */

export function Chatbot() {
  const { user } = useAuth();
  const { tickets, createTicket, addNote } = useTickets();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [flow, setFlow] = useState<Flow>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 120); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: text.trim(), ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

    const { reply, quickReplies, nextFlow } = processInput(text.trim(), flow, user?.role ?? "user", tickets, createTicket, addNote);
    setFlow(nextFlow);
    setTyping(false);
    const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "bot", text: reply, ts: new Date(), quickReplies };
    setMessages(prev => [...prev, botMsg]);
    if (!open) setUnread(n => n + 1);
  }, [flow, user, open, tickets, createTicket, addNote]);

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); send(input); };

  const isEmpty = messages.length === 0;
  const lastBot = [...messages].reverse().find(m => m.role === "bot");
  const chips = isEmpty
    ? ["Show open tickets", "Create a ticket", "Provision a resource", "Infrastructure health"]
    : (lastBot?.quickReplies ?? []);

  return (
    <>
      <style>{`
        @keyframes chatDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        @keyframes chatSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-[70] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: 380, height: 560, background: "#0d1f2d", border: "1px solid rgba(255,255,255,0.08)", animation: "chatSlideUp 220ms ease-out both" }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-white/8" style={{ background: "#0b1e2e" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-brand-accent" aria-hidden="true">
                  <path d="M8 1a6 6 0 1 0 0 12A6 6 0 0 0 8 1Z" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5.5 7c.5-1.5 5-1.5 5 0s-2 3-2.5 3S5 8.5 5.5 7Z" fill="currentColor" opacity=".6"/>
                  <path d="M8 13v2M5 14.5l.5-1.5M11 14.5l-.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Ascelios Assistant</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" aria-label="Close chat">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {isEmpty && (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-brand-primary/15 border border-brand-primary/20 flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" className="text-brand-accent" aria-hidden="true">
                    <path d="M8 1a6 6 0 1 0 0 12A6 6 0 0 0 8 1Z" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5.5 7c.5-1.5 5-1.5 5 0s-2 3-2.5 3S5 8.5 5.5 7Z" fill="currentColor" opacity=".6"/>
                  </svg>
                </div>
                <p className="text-sm text-white font-medium mb-1">Hi {user?.email.split("@")[0] ?? "there"}!</p>
                <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                  I'm your Ascelios assistant. Ask anything about your infrastructure, tickets, or services.
                </p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-primary text-white rounded-br-sm"
                    : "bg-white/6 border border-white/8 text-slate-300 rounded-bl-sm"
                }`}>
                  <p>{renderText(msg.text)}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-white/50 text-right" : "text-slate-600"}`}>{fmt(msg.ts)}</p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white/6 border border-white/8 rounded-2xl rounded-bl-sm"><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {chips.length > 0 && !typing && (
            <div className="shrink-0 px-4 py-2 border-t border-white/5 overflow-y-auto flex flex-wrap gap-1.5" style={{ maxHeight: 116 }}>
              {chips.map(s => (
                <button key={s} onClick={() => send(s)} className="px-2.5 py-1 text-[11px] rounded-full border border-brand-primary/40 bg-brand-primary/10 text-brand-accent hover:bg-brand-primary/20 transition-colors whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="shrink-0 flex items-center gap-2 px-3 py-3 border-t border-white/8">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={flow ? "Type your response…" : "Ask anything…"}
              disabled={typing}
              className="flex-1 bg-white/5 border border-white/10 focus:border-brand-primary rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 transition-colors disabled:opacity-50"
            />
            <button type="submit" disabled={!input.trim() || typing} className="w-8 h-8 rounded-xl bg-brand-primary hover:bg-brand-accent disabled:opacity-40 flex items-center justify-center transition-colors shrink-0" aria-label="Send message">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M12 7L2 2l2 5-2 5 10-5Z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[70] rounded-full shadow-lg shadow-brand-primary/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ width: 52, height: 52, background: open ? "#1e3a5f" : "linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)", border: "1px solid rgba(255,255,255,0.15)" }}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white" aria-hidden="true">
              <path d="M17.5 12.5A2.5 2.5 0 0 1 15 15H6L2.5 18.5V5A2.5 2.5 0 0 1 5 2.5h10A2.5 2.5 0 0 1 17.5 5v7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M6.5 8h7M6.5 11h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border border-[#0a1929] text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
