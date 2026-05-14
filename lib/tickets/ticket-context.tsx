"use client";
import {
  createContext, useContext, useEffect, useState,
  useCallback, type ReactNode,
} from "react";
import type { Ticket, CreateTicketInput, TicketApprovalStep } from "./types";
import { useAuth } from "@/lib/auth/auth-context";

const TICKETS_KEY = "ascelios_tickets";

const now = Date.now();
const SEED_TICKETS: Ticket[] = [
  {
    id: "TKT-0041",
    title: "S/4HANA transport failing in QA system",
    type: "support",
    requestedBy: "user@acmecorp.com",
    requestedByRole: "user",
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending_manager",
    managerApproval: null,
    adminApproval: null,
    detail: {},
    notes: [],
  },
  {
    id: "TKT-0039",
    title: "AWS RDS multi-AZ failover test request",
    type: "support",
    requestedBy: "manager@acmecorp.com",
    requestedByRole: "manager",
    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_manager",
    managerApproval: null,
    adminApproval: null,
    detail: {},
    notes: [],
  },
  {
    id: "TKT-0037",
    title: "Terraform state lock after failed apply",
    type: "support",
    requestedBy: "user@acmecorp.com",
    requestedByRole: "user",
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
    managerApproval: { by: "manager@acmecorp.com", at: new Date(now - 2.5 * 24 * 60 * 60 * 1000).toISOString(), note: "Approved", outcome: "approved" },
    adminApproval: { by: "admin@acmecorp.com", at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), note: "Approved", outcome: "approved" },
    detail: {},
    notes: [],
  },
  {
    id: "TKT-0035",
    title: "Monthly FinOps cost review — April",
    type: "support",
    requestedBy: "manager@acmecorp.com",
    requestedByRole: "manager",
    createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
    managerApproval: { by: "manager@acmecorp.com", at: new Date(now - 4.5 * 24 * 60 * 60 * 1000).toISOString(), note: "", outcome: "approved" },
    adminApproval: { by: "admin@acmecorp.com", at: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), note: "", outcome: "approved" },
    detail: {},
    notes: [],
  },
  {
    id: "TKT-0033",
    title: "BTP integration flow 500 errors on peak load",
    type: "support",
    requestedBy: "user@acmecorp.com",
    requestedByRole: "user",
    createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
    managerApproval: { by: "manager@acmecorp.com", at: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), note: "", outcome: "approved" },
    adminApproval: { by: "admin@acmecorp.com", at: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(), note: "", outcome: "approved" },
    detail: {},
    notes: [],
  },
];

interface TicketContextValue {
  tickets: Ticket[];
  createTicket: (input: CreateTicketInput) => Ticket;
  approveStage1: (id: string, note: string) => void;
  approveStage2: (id: string, note: string) => void;
  rejectTicket: (id: string, note: string) => void;
  addNote: (id: string, text: string) => void;
}

const TicketContext = createContext<TicketContextValue | null>(null);

function nextId(tickets: Ticket[]): string {
  const max = tickets.reduce((m, t) => {
    const n = parseInt(t.id.replace("TKT-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 41);
  return `TKT-${String(max + 1).padStart(4, "0")}`;
}

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (raw) {
      try {
        setTickets(JSON.parse(raw) as Ticket[]);
        return;
      } catch { /* ignore */ }
    }
    setTickets(SEED_TICKETS);
  }, []);

  function save(next: Ticket[]) {
    setTickets(next);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(next));
  }

  const createTicket = useCallback(
    (input: CreateTicketInput): Ticket => {
      const ticket: Ticket = {
        id: nextId(tickets),
        title: input.title,
        type: input.type,
        requestedBy: user?.email ?? "unknown",
        requestedByRole: user?.role ?? "user",
        createdAt: new Date().toISOString(),
        status: "pending_manager",
        managerApproval: null,
        adminApproval: null,
        detail: input.detail,
        notes: [],
      };
      const next = [...tickets, ticket];
      save(next);
      return ticket;
    },
    [tickets, user],
  );

  const approveStage1 = useCallback(
    (id: string, note: string) => {
      const step: TicketApprovalStep = {
        by: user?.email ?? "unknown",
        at: new Date().toISOString(),
        note,
        outcome: "approved",
      };
      save(
        tickets.map((t) =>
          t.id === id && t.status === "pending_manager"
            ? { ...t, status: "pending_admin", managerApproval: step }
            : t,
        ),
      );
    },
    [tickets, user],
  );

  const approveStage2 = useCallback(
    (id: string, note: string) => {
      const step: TicketApprovalStep = {
        by: user?.email ?? "unknown",
        at: new Date().toISOString(),
        note,
        outcome: "approved",
      };
      save(
        tickets.map((t) =>
          t.id === id && t.status === "pending_admin"
            ? { ...t, status: "approved", adminApproval: step }
            : t,
        ),
      );
    },
    [tickets, user],
  );

  const rejectTicket = useCallback(
    (id: string, note: string) => {
      const step: TicketApprovalStep = {
        by: user?.email ?? "unknown",
        at: new Date().toISOString(),
        note,
        outcome: "rejected",
      };
      save(
        tickets.map((t) => {
          if (t.id !== id) return t;
          if (t.status === "pending_manager")
            return { ...t, status: "rejected", managerApproval: step };
          if (t.status === "pending_admin")
            return { ...t, status: "rejected", adminApproval: step };
          return t;
        }),
      );
    },
    [tickets, user],
  );

  const addNote = useCallback(
    (id: string, text: string) => {
      const note = {
        by: user?.email ?? "unknown",
        at: new Date().toISOString(),
        text,
      };
      save(tickets.map((t) => (t.id === id ? { ...t, notes: [...t.notes, note] } : t)));
    },
    [tickets, user],
  );

  return (
    <TicketContext.Provider
      value={{ tickets, createTicket, approveStage1, approveStage2, rejectTicket, addNote }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets(): TicketContextValue {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used inside TicketProvider");
  return ctx;
}