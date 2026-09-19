"use client";
import {
  useCallback, useEffect, useMemo, useRef, useState,
  type KeyboardEvent, type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useTickets } from "@/lib/tickets/ticket-context";
import { useTenants } from "@/lib/onboarding/tenant-context";
import { askAssistant } from "@/lib/chat/engine";
import { cn } from "@/lib/utils";
import type { Ticket, TicketType, Role, PortalAction } from "@/lib/tickets/types";
import { hasPermission } from "@/lib/auth/permissions";

/* ── Pages registry ─────────────────────────────────────────── */

interface PageEntry {
  path: string;
  label: string;
  keywords: string;
  gate?: PortalAction;
}

const PAGES: PageEntry[] = [
  { path: "/portal/dashboard",      label: "Dashboard",       keywords: "home overview" },
  { path: "/portal/tickets",        label: "Tickets",         keywords: "issues approval" },
  { path: "/portal/tenants",        label: "Tenants",         keywords: "workspaces cloud provisioning" },
  { path: "/portal/infrastructure", label: "Infrastructure",  keywords: "resources servers vm" },
  { path: "/portal/billing",        label: "Billing",         keywords: "invoices funds spend" },
  { path: "/portal/backups",        label: "Backups",         keywords: "snapshots restore" },
  { path: "/portal/services",       label: "Services",        keywords: "subscriptions contracts" },
  { path: "/portal/compliance",     label: "Compliance",      keywords: "audit security controls" },
  { path: "/portal/migration",      label: "Migration",       keywords: "phases journey" },
  { path: "/portal/documents",      label: "Documents",       keywords: "files contracts" },
  { path: "/portal/admin/users",    label: "Users (admin)",   keywords: "team accounts roles permissions", gate: "manage:users" },
  { path: "/portal/settings",       label: "Settings",        keywords: "profile preferences" },
];

/* ── Slash-command registry ─────────────────────────────────── */

interface CommandSpec {
  trigger: string;         // e.g. "/approve"
  syntax: string;          // shown in help: "/approve TKT-XXXX"
  desc: string;
}

const COMMANDS: CommandSpec[] = [
  { trigger: "/help",      syntax: "/help",                       desc: "List all commands" },
  { trigger: "/go",        syntax: "/go <page>",                  desc: "Navigate to a page" },
  { trigger: "/approve",   syntax: "/approve TKT-XXXX",           desc: "Approve a ticket (your role's stage)" },
  { trigger: "/reject",    syntax: "/reject TKT-XXXX [reason]",   desc: "Reject a ticket with optional reason" },
  { trigger: "/comment",   syntax: "/comment TKT-XXXX <text>",    desc: "Add a comment to a ticket" },
  { trigger: "/ticket",    syntax: "/ticket <type> <title>",      desc: "Create a ticket (type: support|provision|sap|infra|billing)" },
  { trigger: "/provision", syntax: "/provision <cloud> <detail>", desc: "Submit a provision request" },
  { trigger: "/tenant",    syntax: "/tenant <name>",              desc: "Show tenant status" },
  { trigger: "/ask",       syntax: "/ask <question>",             desc: "Ask the assistant" },
];

/* ── Result model ───────────────────────────────────────────── */

type ResultKind = "command" | "page" | "ticket" | "tenant" | "ask";

interface Result {
  id: string;
  kind: ResultKind;
  icon: ReactNode;
  primary: ReactNode;
  secondary?: string;
  hint: string;
  disabled?: boolean;
  disabledReason?: string;
  run: () => void | Promise<void>;
}

/* ── Icons ──────────────────────────────────────────────────── */

const SlashIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 2L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const PageIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 1.5h5L11 5v7.5H3v-11Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M8 1.5V5h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);
const TicketIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M12 9.3a1.2 1.2 0 0 1-1.2 1.2H3.5L1.2 12.8V2.7A1.2 1.2 0 0 1 2.5 1.5h8.3A1.2 1.2 0 0 1 12 2.7v6.6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);
const TenantIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.3L1.3 4.4 7 7.5l5.7-3.1L7 1.3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M1.3 7L7 10.1 12.7 7M1.3 9.6 7 12.7l5.7-3.1" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);
const AskIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 11.5l-1.5 1.5V3.7A1.2 1.2 0 0 1 2.7 2.5h8.6A1.2 1.2 0 0 1 12.5 3.7v6.6a1.2 1.2 0 0 1-1.2 1.2H3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.6 6.4c0-1 .8-1.7 1.7-1.7s1.7.7 1.7 1.7c0 .8-1.7 1.2-1.7 2.1M7.2 9.7v0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

/* ── Helpers ────────────────────────────────────────────────── */

const TICKET_TYPE_ALIAS: Record<string, TicketType> = {
  support: "support",
  provision: "provision",
  sap: "sap-operation",
  "sap-operation": "sap-operation",
  infra: "infra-operation",
  "infra-operation": "infra-operation",
  billing: "billing",
};

function parseTicketId(s: string): string | null {
  const m = s.match(/\bTKT-?\d+\b/i);
  if (!m) return null;
  const raw = m[0].toUpperCase();
  return raw.startsWith("TKT-") ? raw : raw.replace("TKT", "TKT-");
}

function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q);
  // Cheap subsequence check
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i++;
    if (i === q.length) return 30;
  }
  return 0;
}

/* ── Component ──────────────────────────────────────────────── */

interface ChatTurn { role: "user" | "bot"; text: string; ts: number; }

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { tickets, createTicket, approveStage1, approveStage2, rejectTicket, addNote } = useTickets();
  const { tenants } = useTenants();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [flash, setFlash] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [mode, setMode] = useState<"search" | "chat">("search");
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const role: Role | "guest" = user?.role ?? "guest";

  // Open / close shortcut
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      const isCmdK = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset state when opening or route changes
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setMode("search");
      setFlash(null);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function close() {
    setOpen(false);
  }

  function showFlash(kind: "ok" | "error", text: string) {
    setFlash({ kind, text });
    setTimeout(() => setFlash(null), 2200);
  }

  /* ── Command runners ──────────────────────────────────────── */

  const runGoto = useCallback((path: string) => {
    router.push(path);
    close();
  }, [router]);

  const runApprove = useCallback((ticketId: string) => {
    const t = tickets.find((x) => x.id === ticketId);
    if (!t) { showFlash("error", `${ticketId} not found.`); return; }
    if (t.status === "approved" || t.status === "rejected") {
      showFlash("error", `${ticketId} is already ${t.status}.`); return;
    }
    if (t.status === "pending_manager") {
      if (!hasPermission(role as Role, "approve:stage1")) { showFlash("error", "You can't approve at this stage."); return; }
      approveStage1(ticketId, "Approved via ⌘K");
      showFlash("ok", `${ticketId} approved (stage 1).`);
    } else if (t.status === "pending_admin") {
      if (!hasPermission(role as Role, "approve:stage2")) { showFlash("error", "Only admins can approve stage 2."); return; }
      approveStage2(ticketId, "Approved via ⌘K");
      showFlash("ok", `${ticketId} approved (stage 2).`);
    }
  }, [tickets, role, approveStage1, approveStage2]);

  const runReject = useCallback((ticketId: string, reason: string) => {
    const t = tickets.find((x) => x.id === ticketId);
    if (!t) { showFlash("error", `${ticketId} not found.`); return; }
    if (!hasPermission(role as Role, "reject:ticket")) { showFlash("error", "You can't reject tickets."); return; }
    rejectTicket(ticketId, reason || "Rejected via ⌘K");
    showFlash("ok", `${ticketId} rejected.`);
  }, [tickets, role, rejectTicket]);

  const runComment = useCallback((ticketId: string, text: string) => {
    const t = tickets.find((x) => x.id === ticketId);
    if (!t) { showFlash("error", `${ticketId} not found.`); return; }
    if (!text) { showFlash("error", "Comment text required."); return; }
    addNote(ticketId, text);
    showFlash("ok", `Comment added to ${ticketId}.`);
  }, [tickets, addNote]);

  const runCreateTicket = useCallback((typeAlias: string, title: string) => {
    const type = TICKET_TYPE_ALIAS[typeAlias.toLowerCase()];
    if (!type) { showFlash("error", `Unknown type "${typeAlias}". Use: support, provision, sap, infra, billing.`); return; }
    if (!title || title.length < 5) { showFlash("error", "Title must be at least 5 characters."); return; }
    if (!hasPermission(role as Role, "create:ticket")) { showFlash("error", "You can't create tickets."); return; }
    const t = createTicket({ title, type, detail: { source: "command-palette" } });
    showFlash("ok", `${t.id} created.`);
    setTimeout(() => router.push("/portal/tickets"), 600);
    close();
  }, [createTicket, role, router]);

  const runProvision = useCallback((cloud: string, detail: string) => {
    const cloudKey = cloud.toUpperCase();
    if (!["AWS", "AZURE", "GCP"].includes(cloudKey)) {
      showFlash("error", `Unknown cloud "${cloud}". Use AWS, Azure, or GCP.`);
      return;
    }
    if (!detail) { showFlash("error", "Describe what to provision."); return; }
    if (!hasPermission(role as Role, "request:provision")) { showFlash("error", "You can't submit provision requests."); return; }
    const t = createTicket({
      title: `Provision request — ${detail} (${cloudKey})`,
      type: "provision",
      detail: { cloud: cloudKey, request: detail, source: "command-palette" },
    });
    showFlash("ok", `${t.id} created.`);
    setTimeout(() => router.push("/portal/tickets"), 600);
    close();
  }, [createTicket, role, router]);

  const runAsk = useCallback((question: string) => {
    const q = question.trim();
    if (!q) return;
    const reply = askAssistant(q, { role, tickets, tenants });
    setChat((prev) => [
      ...prev,
      { role: "user", text: q, ts: Date.now() },
      { role: "bot",  text: reply, ts: Date.now() },
    ]);
    setMode("chat");
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 20);
  }, [role, tickets, tenants]);

  /* ── Result generation ────────────────────────────────────── */

  const results = useMemo<Result[]>(() => {
    const q = query.trim();
    const out: Result[] = [];

    // 1. Slash-command mode
    if (q.startsWith("/")) {
      const [head, ...restParts] = q.slice(1).split(/\s+/);
      const cmd = (head ?? "").toLowerCase();
      const rest = restParts.join(" ").trim();

      // Auto-complete commands that don't fully match
      const matched = COMMANDS.filter((c) => c.trigger.slice(1).startsWith(cmd));

      // Specific parsed actions
      const ticketId = parseTicketId(rest);

      if (cmd === "help" || (!cmd && matched.length === COMMANDS.length)) {
        for (const c of COMMANDS) {
          out.push({
            id: `help-${c.trigger}`,
            kind: "command",
            icon: SlashIcon,
            primary: <span><span className="font-mono text-brand-accent">{c.syntax}</span></span>,
            secondary: c.desc,
            hint: "Insert",
            run: () => { setQuery(`${c.trigger} `); setTimeout(() => inputRef.current?.focus(), 0); },
          });
        }
      } else if (cmd === "go") {
        const filterText = rest.toLowerCase();
        const filtered = PAGES
          .filter((p) => !p.gate || (user && hasPermission(user.role, p.gate)))
          .filter((p) => !filterText || p.label.toLowerCase().includes(filterText) || p.keywords.includes(filterText));
        for (const p of filtered) {
          out.push({
            id: `goto-${p.path}`,
            kind: "page",
            icon: PageIcon,
            primary: <>Go to <span className="text-white font-medium">{p.label}</span></>,
            secondary: p.path,
            hint: "Open",
            run: () => runGoto(p.path),
          });
        }
      } else if (cmd === "approve") {
        if (ticketId) {
          const t = tickets.find((x) => x.id === ticketId);
          out.push({
            id: `approve-${ticketId}`,
            kind: "command",
            icon: SlashIcon,
            primary: <>Approve <span className="font-mono text-brand-accent">{ticketId}</span></>,
            secondary: t ? `${t.title} (${t.status.replace("_", " ")})` : "Ticket not found",
            hint: "Approve",
            disabled: !t,
            run: () => runApprove(ticketId),
          });
        } else {
          // List actionable pending tickets for this role
          const actionable = tickets.filter((t) => {
            if (t.status === "pending_manager") return hasPermission(role as Role, "approve:stage1");
            if (t.status === "pending_admin")   return hasPermission(role as Role, "approve:stage2");
            return false;
          });
          for (const t of actionable.slice(0, 6)) {
            out.push({
              id: `approve-${t.id}`,
              kind: "command",
              icon: SlashIcon,
              primary: <>Approve <span className="font-mono text-brand-accent">{t.id}</span></>,
              secondary: `${t.title} · ${t.status.replace("_", " ")}`,
              hint: "Approve",
              run: () => runApprove(t.id),
            });
          }
          if (actionable.length === 0) {
            out.push({
              id: "approve-empty",
              kind: "command",
              icon: SlashIcon,
              primary: <>No tickets awaiting your approval.</>,
              hint: "—",
              disabled: true,
              run: () => {},
            });
          }
        }
      } else if (cmd === "reject") {
        if (ticketId) {
          // Reason is anything after the ticket id
          const idIdx = rest.toUpperCase().indexOf(ticketId);
          const reason = rest.slice(idIdx + ticketId.length).trim();
          out.push({
            id: `reject-${ticketId}`,
            kind: "command",
            icon: SlashIcon,
            primary: <>Reject <span className="font-mono text-brand-accent">{ticketId}</span>{reason && <> · <span className="text-slate-400 italic">{reason}</span></>}</>,
            secondary: tickets.find((t) => t.id === ticketId)?.title ?? "Ticket not found",
            hint: "Reject",
            disabled: !tickets.find((t) => t.id === ticketId),
            run: () => runReject(ticketId, reason),
          });
        } else {
          out.push({
            id: "reject-syntax",
            kind: "command",
            icon: SlashIcon,
            primary: <span className="font-mono text-slate-400">/reject TKT-XXXX [reason]</span>,
            secondary: "Type a ticket ID to reject.",
            hint: "—",
            disabled: true,
            run: () => {},
          });
        }
      } else if (cmd === "comment") {
        if (ticketId) {
          const idIdx = rest.toUpperCase().indexOf(ticketId);
          const text = rest.slice(idIdx + ticketId.length).trim();
          out.push({
            id: `comment-${ticketId}`,
            kind: "command",
            icon: SlashIcon,
            primary: <>Comment on <span className="font-mono text-brand-accent">{ticketId}</span></>,
            secondary: text ? `"${text}"` : "(type comment text after the ticket ID)",
            hint: "Post",
            disabled: !text || !tickets.find((t) => t.id === ticketId),
            run: () => runComment(ticketId, text),
          });
        } else {
          out.push({
            id: "comment-syntax",
            kind: "command",
            icon: SlashIcon,
            primary: <span className="font-mono text-slate-400">/comment TKT-XXXX text…</span>,
            secondary: "Type a ticket ID and a comment.",
            hint: "—",
            disabled: true,
            run: () => {},
          });
        }
      } else if (cmd === "ticket") {
        const [typeAlias, ...titleParts] = restParts;
        const title = titleParts.join(" ").trim();
        out.push({
          id: "ticket-create",
          kind: "command",
          icon: SlashIcon,
          primary: <>Create ticket{typeAlias ? <> · <span className="text-brand-accent">{typeAlias}</span></> : null}</>,
          secondary: title || "Type: support|provision|sap|infra|billing then a title",
          hint: "Create",
          disabled: !typeAlias || !title || title.length < 5,
          run: () => runCreateTicket(typeAlias, title),
        });
      } else if (cmd === "provision") {
        const [cloud, ...detailParts] = restParts;
        const detail = detailParts.join(" ").trim();
        out.push({
          id: "provision-create",
          kind: "command",
          icon: SlashIcon,
          primary: <>Submit provision request{cloud ? <> · <span className="text-brand-accent">{cloud.toUpperCase()}</span></> : null}</>,
          secondary: detail || "Cloud (AWS|Azure|GCP), then what to provision",
          hint: "Submit",
          disabled: !cloud || !detail,
          run: () => runProvision(cloud, detail),
        });
      } else if (cmd === "tenant") {
        const name = rest.toLowerCase();
        const matched = tenants.filter((t) => !name || t.name.toLowerCase().includes(name));
        for (const t of matched.slice(0, 6)) {
          out.push({
            id: `tenant-${t.id}`,
            kind: "tenant",
            icon: TenantIcon,
            primary: <>{t.name} <span className="text-slate-500 font-mono text-[10px]">{t.provider.toUpperCase()}</span></>,
            secondary: `${t.status} · ${t.region}`,
            hint: "View",
            run: () => runGoto("/portal/tenants"),
          });
        }
        if (matched.length === 0) {
          out.push({
            id: "tenant-empty",
            kind: "tenant",
            icon: TenantIcon,
            primary: <>No tenants match.</>,
            hint: "—",
            disabled: true,
            run: () => {},
          });
        }
      } else if (cmd === "ask") {
        out.push({
          id: "ask-direct",
          kind: "ask",
          icon: AskIcon,
          primary: <>Ask: <span className="text-white">{rest || "…"}</span></>,
          secondary: "Get an inline answer from the assistant",
          hint: "Ask",
          disabled: !rest,
          run: () => runAsk(rest),
        });
      } else {
        // Unknown command — show closest matches
        for (const c of matched.slice(0, 6)) {
          out.push({
            id: `cmd-${c.trigger}`,
            kind: "command",
            icon: SlashIcon,
            primary: <span><span className="font-mono text-brand-accent">{c.syntax}</span></span>,
            secondary: c.desc,
            hint: "Insert",
            run: () => { setQuery(`${c.trigger} `); setTimeout(() => inputRef.current?.focus(), 0); },
          });
        }
        if (matched.length === 0) {
          out.push({
            id: "cmd-unknown",
            kind: "command",
            icon: SlashIcon,
            primary: <>Unknown command. Try <span className="font-mono text-brand-accent">/help</span>.</>,
            hint: "—",
            disabled: true,
            run: () => {},
          });
        }
      }

      return out;
    }

    // 2. Free search mode

    if (!q) {
      // Empty state — suggestions
      const suggestions: PageEntry[] = [
        PAGES.find((p) => p.path === "/portal/tickets")!,
        PAGES.find((p) => p.path === "/portal/tenants")!,
        PAGES.find((p) => p.path === "/portal/dashboard")!,
      ];
      for (const p of suggestions) {
        out.push({
          id: `goto-${p.path}`,
          kind: "page",
          icon: PageIcon,
          primary: <>Go to <span className="text-white font-medium">{p.label}</span></>,
          secondary: p.path,
          hint: "Open",
          run: () => runGoto(p.path),
        });
      }
      // Suggested slash commands
      for (const c of COMMANDS.slice(1, 4)) {
        out.push({
          id: `tip-${c.trigger}`,
          kind: "command",
          icon: SlashIcon,
          primary: <span><span className="font-mono text-brand-accent">{c.syntax}</span></span>,
          secondary: c.desc,
          hint: "Insert",
          run: () => { setQuery(`${c.trigger} `); setTimeout(() => inputRef.current?.focus(), 0); },
        });
      }
      return out;
    }

    // Direct ticket-id hit
    const tid = parseTicketId(q);
    if (tid) {
      const t = tickets.find((x) => x.id === tid);
      if (t) {
        out.push({
          id: `t-${tid}`,
          kind: "ticket",
          icon: TicketIcon,
          primary: <>Open <span className="font-mono text-brand-accent">{tid}</span></>,
          secondary: t.title,
          hint: "Open",
          run: () => runGoto("/portal/tickets"),
        });
      }
    }

    // Pages
    const visiblePages = PAGES.filter((p) => !p.gate || (user && hasPermission(user.role, p.gate)));
    const pageHits = visiblePages
      .map((p) => ({ p, score: Math.max(fuzzyScore(q, p.label), fuzzyScore(q, p.keywords)) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    for (const { p } of pageHits) {
      out.push({
        id: `page-${p.path}`,
        kind: "page",
        icon: PageIcon,
        primary: <>Go to <span className="text-white font-medium">{p.label}</span></>,
        secondary: p.path,
        hint: "Open",
        run: () => runGoto(p.path),
      });
    }

    // Tickets (by title)
    const ticketHits = tickets
      .map((t) => ({ t, score: Math.max(fuzzyScore(q, t.id), fuzzyScore(q, t.title)) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    for (const { t } of ticketHits) {
      out.push({
        id: `ticket-${t.id}`,
        kind: "ticket",
        icon: TicketIcon,
        primary: <><span className="font-mono text-brand-accent">{t.id}</span> · {t.title}</>,
        secondary: t.status.replace("_", " "),
        hint: "Open",
        run: () => runGoto("/portal/tickets"),
      });
    }

    // Tenants
    const tenantHits = tenants
      .map((t) => ({ t, score: fuzzyScore(q, t.name) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    for (const { t } of tenantHits) {
      out.push({
        id: `ten-${t.id}`,
        kind: "tenant",
        icon: TenantIcon,
        primary: <>{t.name} <span className="text-slate-500 font-mono text-[10px]">{t.provider.toUpperCase()}</span></>,
        secondary: `${t.status} · ${t.region}`,
        hint: "Open",
        run: () => runGoto("/portal/tenants"),
      });
    }

    // Always-on "Ask" fallback
    out.push({
      id: "ask-fallback",
      kind: "ask",
      icon: AskIcon,
      primary: <>Ask: <span className="text-white">&ldquo;{q}&rdquo;</span></>,
      secondary: "Get an inline answer from the assistant",
      hint: "Ask",
      run: () => runAsk(q),
    });

    return out;
  }, [query, tickets, tenants, user, role, runGoto, runApprove, runReject, runComment, runCreateTicket, runProvision, runAsk]);

  // Keep cursor in range
  useEffect(() => {
    if (cursor >= results.length) setCursor(Math.max(0, results.length - 1));
  }, [results.length, cursor]);

  // Keep cursor visible
  useEffect(() => {
    if (!listRef.current) return;
    const row = listRef.current.querySelector<HTMLDivElement>(`[data-row="${cursor}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[cursor];
      if (r && !r.disabled) r.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (mode === "chat" && chat.length > 0) {
        setMode("search");
      } else {
        close();
      }
    }
  }

  if (!open || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-label="Command palette"
        className="fixed top-[12vh] left-1/2 -translate-x-1/2 z-[81] w-[min(640px,92vw)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: "#0b1e2e", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header / input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/8">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-500 shrink-0" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onInputKey}
            placeholder={mode === "chat" ? "Ask a follow-up…" : "Search, run a /command, or ask a question…"}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">esc</kbd>
        </div>

        {/* Flash */}
        {flash && (
          <div className={cn(
            "px-4 py-2 text-xs border-b",
            flash.kind === "ok"
              ? "bg-emerald-400/8 border-emerald-400/15 text-emerald-300"
              : "bg-red-400/8 border-red-400/15 text-red-300",
          )}>
            {flash.text}
          </div>
        )}

        {/* Body — search mode */}
        {mode === "search" && (
          <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
            {results.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-slate-500">No matches. Type <span className="font-mono text-brand-accent">/help</span> for commands.</p>
            )}
            {results.map((r, i) => {
              const active = i === cursor;
              return (
                <div
                  key={r.id}
                  data-row={i}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => { if (!r.disabled) r.run(); }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                    active && !r.disabled && "bg-white/5",
                    r.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <span className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                    active ? "bg-brand-primary/20 text-brand-accent" : "bg-white/5 text-slate-400",
                  )}>
                    {r.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-200 truncate">{r.primary}</div>
                    {r.secondary && <div className="text-[11px] text-slate-500 truncate font-mono">{r.secondary}</div>}
                  </div>
                  <span className={cn(
                    "shrink-0 font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded",
                    active && !r.disabled ? "text-brand-accent border border-brand-accent/30" : "text-slate-600 border border-white/8",
                  )}>
                    {active && !r.disabled ? "⏎ " + r.hint : r.hint}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Body — chat mode */}
        {mode === "chat" && (
          <div className="max-h-[52vh] overflow-y-auto px-4 py-4 space-y-3">
            {chat.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                  m.role === "user"
                    ? "bg-brand-primary text-white rounded-br-sm"
                    : "bg-white/6 border border-white/8 text-slate-300 rounded-bl-sm",
                )}>
                  <p className="whitespace-pre-wrap">{renderMd(m.text)}</p>
                </div>
              </div>
            ))}
            {/* Tap-to-search return */}
            <button
              type="button"
              onClick={() => setMode("search")}
              className="text-[11px] text-slate-500 hover:text-white transition-colors"
            >
              ← Back to commands
            </button>
          </div>
        )}

        {/* Footer hints */}
        <div className="border-t border-white/8 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="border border-white/10 rounded px-1.5 py-0.5">↑↓</kbd> navigate</span>
            <span><kbd className="border border-white/10 rounded px-1.5 py-0.5">⏎</kbd> run</span>
            <span><kbd className="border border-white/10 rounded px-1.5 py-0.5">/</kbd> commands</span>
          </div>
          <span>⌘K · {results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </>
  );
}

/* ── Tiny markdown renderer (bold + italic + line breaks) ──── */

function renderMd(text: string): ReactNode {
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*"))
        return <em key={j} className="text-slate-400 not-italic">{p.slice(1, -1)}</em>;
      return <span key={j}>{p}</span>;
    });
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}
