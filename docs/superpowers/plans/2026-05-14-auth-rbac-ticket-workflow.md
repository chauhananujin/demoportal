# Auth, RBAC & Ticket Approval Workflow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mock authentication with three roles (User / Manager / Admin), role-based access control, and a two-stage SOX-compliant ticket approval workflow to the Ascelios client portal.

**Architecture:** Context + localStorage persistence. `AuthContext` (lib/auth) and `TicketContext` (lib/tickets) hydrate from localStorage on mount and sync every write back. A `PortalAuthGate` client component controls both the auth redirect and the portal shell layout (sidebar vs. full-screen). No real backend; all state is in-memory + localStorage.

**Tech Stack:** Next.js 16 App Router, React 19 context + hooks, TypeScript strict, Tailwind CSS v4 brand tokens, Vitest + jsdom for unit tests.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/tickets/types.ts` | Create | Ticket, Role, TicketApprovalStep, PortalAction types |
| `lib/auth/accounts.ts` | Create | Demo account constants |
| `lib/auth/permissions.ts` | Create | Role → action permissions map + `hasPermission()` |
| `lib/auth/permissions.test.ts` | Create | Unit tests for `hasPermission()` |
| `lib/auth/auth-context.tsx` | Create | AuthContext + AuthProvider + `useAuth()` |
| `lib/auth/use-permission.ts` | Create | `usePermission(action)` hook |
| `lib/tickets/ticket-context.tsx` | Create | TicketContext + TicketProvider + `useTickets()` |
| `app/(portal)/portal/login/page.tsx` | Create | Login page (full-screen, no sidebar) |
| `components/portal/portal-auth-gate.tsx` | Create | Auth gate + portal shell client component |
| `app/(portal)/layout.tsx` | Modify | Wrap with AuthProvider → TicketProvider → PortalAuthGate |
| `components/portal/sidebar.tsx` | Modify | Live user email + role badge + logout button |
| `app/(portal)/portal/tickets/page.tsx` | Modify | Full rebuild — live tickets, filters, expand, approvals |
| `app/(portal)/portal/infrastructure/page.tsx` | Modify | "Request Provisioning" framing |
| `app/(portal)/portal/billing/page.tsx` | Modify | Hide Add Funds for user role; wire to TicketContext |
| `components/portal/sap-management-widget.tsx` | Modify | Wire `createTicket()` from TicketContext in all SAP modals |

---

## Task 1: Types and Demo Accounts

**Files:**
- Create: `lib/tickets/types.ts`
- Create: `lib/auth/accounts.ts`

- [ ] **Step 1: Create ticket types**

```ts
// lib/tickets/types.ts
export type Role = "user" | "manager" | "admin";

export type PortalAction =
  | "view:tickets"
  | "update:ticket"
  | "create:ticket"
  | "approve:stage1"
  | "approve:stage2"
  | "reject:ticket"
  | "request:provision"
  | "request:sap-operation"
  | "request:add-funds";

export interface TicketApprovalStep {
  by: string;
  at: string;
  note: string;
  outcome: "approved" | "rejected";
}

export type TicketStatus = "pending_manager" | "pending_admin" | "approved" | "rejected";
export type TicketType = "provision" | "sap-operation" | "billing" | "support";

export interface TicketNote {
  by: string;
  at: string;
  text: string;
}

export interface Ticket {
  id: string;
  title: string;
  type: TicketType;
  requestedBy: string;
  requestedByRole: Role;
  createdAt: string;
  status: TicketStatus;
  managerApproval: TicketApprovalStep | null;
  adminApproval: TicketApprovalStep | null;
  detail: Record<string, unknown>;
  notes: TicketNote[];
}

export interface CreateTicketInput {
  title: string;
  type: TicketType;
  detail: Record<string, unknown>;
}
```

- [ ] **Step 2: Create demo accounts**

```ts
// lib/auth/accounts.ts
import type { Role } from "@/lib/tickets/types";

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "user@acmecorp.com",    password: "demo1234", role: "user" },
  { email: "manager@acmecorp.com", password: "demo1234", role: "manager" },
  { email: "admin@acmecorp.com",   password: "demo1234", role: "admin" },
];
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add lib/tickets/types.ts lib/auth/accounts.ts
git commit -m "feat: add auth/ticket types and demo accounts"
```

---

## Task 2: Permissions

**Files:**
- Create: `lib/auth/permissions.ts`
- Create: `lib/auth/permissions.test.ts`
- Create: `lib/auth/use-permission.ts`

- [ ] **Step 1: Write failing tests**

```ts
// lib/auth/permissions.test.ts
import { describe, it, expect } from "vitest";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("user can view and create tickets", () => {
    expect(hasPermission("user", "view:tickets")).toBe(true);
    expect(hasPermission("user", "create:ticket")).toBe(true);
  });

  it("user cannot add funds or approve", () => {
    expect(hasPermission("user", "request:add-funds")).toBe(false);
    expect(hasPermission("user", "approve:stage1")).toBe(false);
    expect(hasPermission("user", "approve:stage2")).toBe(false);
    expect(hasPermission("user", "reject:ticket")).toBe(false);
  });

  it("manager can approve stage1 and reject but not stage2", () => {
    expect(hasPermission("manager", "approve:stage1")).toBe(true);
    expect(hasPermission("manager", "reject:ticket")).toBe(true);
    expect(hasPermission("manager", "approve:stage2")).toBe(false);
  });

  it("admin can approve both stages", () => {
    expect(hasPermission("admin", "approve:stage1")).toBe(true);
    expect(hasPermission("admin", "approve:stage2")).toBe(true);
    expect(hasPermission("admin", "reject:ticket")).toBe(true);
    expect(hasPermission("admin", "request:add-funds")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npx vitest run lib/auth/permissions.test.ts`
Expected: FAIL — "Cannot find module './permissions'"

- [ ] **Step 3: Implement permissions map**

```ts
// lib/auth/permissions.ts
import type { Role, PortalAction } from "@/lib/tickets/types";

const PERMISSIONS: Record<Role, PortalAction[]> = {
  user: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "request:provision",
    "request:sap-operation",
  ],
  manager: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "approve:stage1",
    "reject:ticket",
    "request:provision",
    "request:sap-operation",
    "request:add-funds",
  ],
  admin: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "approve:stage1",
    "approve:stage2",
    "reject:ticket",
    "request:provision",
    "request:sap-operation",
    "request:add-funds",
  ],
};

export function hasPermission(role: Role, action: PortalAction): boolean {
  return PERMISSIONS[role].includes(action);
}
```

- [ ] **Step 4: Run tests — confirm they pass**

Run: `npx vitest run lib/auth/permissions.test.ts`
Expected: PASS — 4 tests

- [ ] **Step 5: Implement usePermission hook**

```ts
// lib/auth/use-permission.ts
"use client";
import type { PortalAction } from "@/lib/tickets/types";
import { useAuth } from "./auth-context";
import { hasPermission } from "./permissions";

export function usePermission(action: PortalAction): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return hasPermission(user.role, action);
}
```

Note: `useAuth` does not exist yet — it will be created in Task 3. TypeScript will error until then; that's expected. Do not run `tsc` until after Task 3.

- [ ] **Step 6: Commit**

```bash
git add lib/auth/permissions.ts lib/auth/permissions.test.ts lib/auth/use-permission.ts
git commit -m "feat: add permissions map and usePermission hook"
```

---

## Task 3: AuthContext

**Files:**
- Create: `lib/auth/auth-context.tsx`

- [ ] **Step 1: Create AuthContext**

```tsx
// lib/auth/auth-context.tsx
"use client";
import {
  createContext, useContext, useEffect, useState,
  useCallback, type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/tickets/types";
import { DEMO_ACCOUNTS } from "./accounts";

const SESSION_KEY = "ascelios_session";

export interface AuthUser {
  email: string;
  role: Role;
  loginAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<"ok" | "invalid">;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw) as AuthUser); } catch { /* ignore corrupt data */ }
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<"ok" | "invalid"> => {
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email === email.trim().toLowerCase() && a.password === password,
      );
      if (!account) return "invalid";
      const session: AuthUser = {
        email: account.email,
        role: account.role,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return "ok";
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    router.push("/portal/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/auth/auth-context.tsx
git commit -m "feat: add AuthContext with localStorage session persistence"
```

---

## Task 4: TicketContext

**Files:**
- Create: `lib/tickets/ticket-context.tsx`

- [ ] **Step 1: Create TicketContext with seed data**

```tsx
// lib/tickets/ticket-context.tsx
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
  }, 4041);
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
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/tickets/ticket-context.tsx
git commit -m "feat: add TicketContext with localStorage persistence and seed data"
```

---

## Task 5: Login Page

**Files:**
- Create: `app/(portal)/portal/login/page.tsx`

- [ ] **Step 1: Create login page**

```tsx
// app/(portal)/portal/login/page.tsx
"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_ACCOUNTS } from "@/lib/auth/accounts";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result === "ok") {
      router.push("/portal/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-brand-accent font-bold text-2xl tracking-tight">Ascelios</span>
          <p className="text-slate-400 text-sm mt-1">Client Portal — Elios Login</p>
        </div>

        {/* Form card */}
        <div className="bg-brand-surface border border-white/8 rounded-2xl p-8 mb-4">
          <h1 className="text-lg font-semibold text-white mb-6">Sign in to your account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
                placeholder="you@acmecorp.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Demo accounts hint */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wide">Demo accounts</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => { setEmail(a.email); setPassword(a.password); setError(""); }}
                className="w-full flex items-center justify-between hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="text-xs text-brand-accent font-mono">{a.email}</span>
                <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                  a.role === "admin"
                    ? "text-red-400 border-red-400/30 bg-red-400/10"
                    : a.role === "manager"
                    ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                    : "text-slate-400 border-slate-400/30 bg-slate-400/10"
                }`}>{a.role}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Password for all accounts: <span className="font-mono text-slate-500">demo1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/(portal)/portal/login/page.tsx"
git commit -m "feat: add login page with demo account selector"
```

---

## Task 6: PortalAuthGate + Layout Update

**Files:**
- Create: `components/portal/portal-auth-gate.tsx`
- Modify: `app/(portal)/layout.tsx`

- [ ] **Step 1: Create PortalAuthGate**

This component handles three cases: (1) login page — render children full-screen without sidebar, (2) unauthenticated on any other route — return null while redirect fires, (3) authenticated — render portal shell (sidebar + main).

```tsx
// components/portal/portal-auth-gate.tsx
"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PortalSidebar } from "./sidebar";

export function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && pathname !== "/portal/login") {
      router.push("/portal/login");
    }
  }, [user, pathname, router]);

  // Login page: full-screen, no sidebar
  if (pathname === "/portal/login") {
    return <>{children}</>;
  }

  // Not yet authenticated — blank while redirect runs
  if (!user) return null;

  // Authenticated portal shell
  return (
    <div className="flex min-h-screen bg-[#0a1929]">
      <PortalSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Update portal layout**

Replace the entire contents of `app/(portal)/layout.tsx`:

```tsx
// app/(portal)/layout.tsx
import { AuthProvider } from "@/lib/auth/auth-context";
import { TicketProvider } from "@/lib/tickets/ticket-context";
import { PortalAuthGate } from "@/components/portal/portal-auth-gate";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TicketProvider>
        <PortalAuthGate>{children}</PortalAuthGate>
      </TicketProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Start dev server and test manually**

Run: `npm run dev`

Open `http://localhost:3000/portal/dashboard` — should redirect to `/portal/login`.
Enter `user@acmecorp.com` / `demo1234` — should redirect to `/portal/dashboard`.
Refresh the page — should stay on dashboard (session persisted in localStorage).
Click "Sign out" (not yet wired — sidebar still shows hardcoded name, that is expected, it's done in Task 7).

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add components/portal/portal-auth-gate.tsx "app/(portal)/layout.tsx"
git commit -m "feat: add PortalAuthGate with auth redirect and portal shell"
```

---

## Task 7: Sidebar — Live Auth Data

**Files:**
- Modify: `components/portal/sidebar.tsx`

Read `components/portal/sidebar.tsx` before editing. The account block at the bottom (lines 133–143) shows hardcoded "Acme Corp". Replace the entire component file with the version below that uses `useAuth()`.

- [ ] **Step 1: Update sidebar to show live user and logout**

Replace the Account section at the bottom of the sidebar (lines 132–143, the `{/* Account */}` block through `</aside>`):

```tsx
      {/* Account */}
      <div className="px-4 py-4 border-t border-brand-surface">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-accent text-xs font-semibold shrink-0">
            {user?.email.slice(0, 2).toUpperCase() ?? "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{user?.email ?? ""}</p>
            <span className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${
              user?.role === "admin"
                ? "text-red-400 border-red-400/30 bg-red-400/10"
                : user?.role === "manager"
                ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                : "text-slate-400 border-slate-400/30 bg-slate-400/10"
            }`}>{user?.role ?? ""}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-slate-500 hover:text-white transition-colors py-1 px-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
```

Also add these two imports and the destructuring at the top of the component:
- Import: `import { useAuth } from "@/lib/auth/auth-context";`
- Inside `PortalSidebar()`, add before the return: `const { user, logout } = useAuth();`

The full updated file:

```tsx
// components/portal/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

const navItems = [
  {
    href: "/portal/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: "/portal/infrastructure",
    label: "Infrastructure",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="12.5" cy="4.5" r="1" fill="currentColor"/>
        <circle cx="12.5" cy="11.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/portal/tickets",
    label: "Tickets",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M14 10.667A1.333 1.333 0 0 1 12.667 12H4L1.333 14.667V3.333A1.333 1.333 0 0 1 2.667 2h10A1.333 1.333 0 0 1 14 3.333v7.334Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/services",
    label: "Services",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 1v14M2 4.5l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: "/portal/documents",
    label: "Documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M9 1H3.667A1.333 1.333 0 0 0 2.333 2.333V13.667A1.333 1.333 0 0 0 3.667 15h8.666A1.333 1.333 0 0 0 13.667 13.667V5.667L9 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M9 1v4.667h4.667M5.333 8.667h5.334M5.333 11.333h5.334M5.333 6H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/compliance",
    label: "Compliance",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.333L13.333 3.667v4c0 3.2-2.133 5.867-5.333 6.666C2.8 13.534.667 10.867.667 7.667v-4L8 1.333Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5.333 8l1.667 1.667L10.667 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/billing",
    label: "Billing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.333" y="3.333" width="13.333" height="9.333" rx="1.333" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1.333 6.667h13.333" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M4 9.667h2M4 11h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/portal/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.333" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 1.333V3M8 13v1.667M1.333 8H3M13 8h1.667M3.286 3.286l1.178 1.178M11.536 11.536l1.178 1.178M3.286 12.714l1.178-1.178M11.536 4.464l1.178-1.178" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-brand-bg border-r border-brand-surface flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center border-b border-brand-surface">
        <Link href="/" className="text-brand-accent font-bold text-lg tracking-tight">
          Ascelios
        </Link>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
          Portal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-brand-primary/15 text-brand-accent"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn("shrink-0", active ? "text-brand-accent" : "text-slate-500")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Account */}
      <div className="px-4 py-4 border-t border-brand-surface">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-accent text-xs font-semibold shrink-0">
            {user?.email.slice(0, 2).toUpperCase() ?? "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{user?.email ?? ""}</p>
            <span className={cn(
              "font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border inline-block mt-0.5",
              user?.role === "admin"
                ? "text-red-400 border-red-400/30 bg-red-400/10"
                : user?.role === "manager"
                ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                : "text-slate-400 border-slate-400/30 bg-slate-400/10"
            )}>{user?.role ?? ""}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-slate-500 hover:text-white transition-colors py-1 px-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Start dev server and verify sidebar**

Run: `npm run dev`

Login as `user@acmecorp.com`. Sidebar should show:
- "user@acmecorp.com" (truncated)
- Slate "user" role badge
- "Sign out →" button

Logout, login as `manager@acmecorp.com` — amber "manager" badge.
Logout, login as `admin@acmecorp.com` — red "admin" badge.
Click "Sign out →" — should redirect to `/portal/login`.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/portal/sidebar.tsx
git commit -m "feat: sidebar shows live auth user with role badge and logout"
```

---

## Task 8: Tickets Page Rebuild

**Files:**
- Modify: `app/(portal)/portal/tickets/page.tsx`

Replace the entire file with a client component that reads from `useTickets()` and renders the full approval workflow UI.

- [ ] **Step 1: Write the new tickets page**

```tsx
// app/(portal)/portal/tickets/page.tsx
"use client";
import { useState } from "react";
import { useTickets } from "@/lib/tickets/ticket-context";
import { useAuth } from "@/lib/auth/auth-context";
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
  provision:       "Provision",
  "sap-operation": "SAP Op",
  billing:         "Billing",
  support:         "Support",
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
  const { user } = useAuth();
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
                            outcome={
                              ticket.managerApproval
                                ? ticket.managerApproval.outcome
                                : undefined
                            }
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
                              outcome={
                                ticket.adminApproval
                                  ? ticket.adminApproval.outcome
                                  : undefined
                              }
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
                                  <span className={cn("font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full border mr-1.5", ROLE_BADGE[ticket.requestedByRole])}>
                                    {n.by.split("@")[0]}
                                  </span>
                                  {fmtDate(n.at)}
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
  const isApproved = outcome === "approved";
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
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Test in browser**

Run: `npm run dev`

Login as `user@acmecorp.com`:
- Tickets page shows 5 seed tickets
- "Awaiting Manager" badge on TKT-0041 and TKT-0039
- Click a row — timeline expands
- No Approve/Reject buttons visible (User role)
- Add Note input IS visible — type a note, press Enter or click Add Note — note appears

Login as `manager@acmecorp.com`:
- Expand TKT-0041 — Approve and Reject buttons visible
- Click Approve — status changes to "Awaiting Admin"
- Expand TKT-0037 (already approved) — no action buttons

Login as `admin@acmecorp.com`:
- Expand TKT-0041 (now pending_admin after manager approved) — "Final Approve" and "Reject" visible
- Click Final Approve — status changes to "Approved"

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add "app/(portal)/portal/tickets/page.tsx"
git commit -m "feat: rebuild tickets page with live approval workflow and role-based actions"
```

---

## Task 9: Infrastructure + Billing RBAC

**Files:**
- Modify: `app/(portal)/portal/infrastructure/page.tsx`
- Modify: `app/(portal)/portal/billing/page.tsx`

### Infrastructure page

- [ ] **Step 1: Rename provision button on infrastructure page**

In `app/(portal)/portal/infrastructure/page.tsx`, find all occurrences of `"Provision Resource"` and `"Provision new resource"` and update:
- Header button text: `"+ Provision Resource"` → `"+ Request Provisioning"`
- CTA card text: `"Provision new resource"` → `"Request new resource"`

Make the file a client component by adding `"use client";` at the top (before any imports) so `useTickets` can be used if needed in future. The provision workflow currently links to the new resource wizard — keep the `<Link href="/portal/infrastructure/new">` wrappers as-is (the wizard is the request form).

The only required change is cosmetic: the two button/text strings above.

Find these two strings in `app/(portal)/portal/infrastructure/page.tsx` and replace:

1. `+ Provision Resource` → `+ Request Provisioning`
2. `Provision new resource` → `Request new resource`

Also add `"use client";` as the first line of the file.

### Billing page

- [ ] **Step 2: Convert billing page to client component and gate Add Funds**

The billing page is currently a server component. Convert it to a client component and hide the Add Funds button/link for `user` role.

Add `"use client";` at the very top of `app/(portal)/portal/billing/page.tsx`.

Remove the `export const metadata = { title: "Billing" };` line (metadata exports are not allowed in client components).

Import `usePermission` at the top:
```tsx
import { usePermission } from "@/lib/auth/use-permission";
```

Inside `BillingPage()`, add:
```tsx
const canAddFunds = usePermission("request:add-funds");
```

Then wrap the Add Funds `<Link>` + `<Button>` in a conditional:
```tsx
{canAddFunds && (
  <Link href="/portal/billing/add-funds">
    <Button className="w-full bg-brand-primary hover:bg-brand-accent text-white text-sm">
      + Request Funds
    </Button>
  </Link>
)}
```

Change the button text from `"+ Add Funds"` to `"+ Request Funds"`.

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Test in browser**

Run: `npm run dev`

Login as `user@acmecorp.com`:
- Infrastructure page: button says "Request Provisioning"
- Billing page: Add Funds button is NOT visible

Login as `manager@acmecorp.com`:
- Billing page: "Request Funds" button IS visible

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add "app/(portal)/portal/infrastructure/page.tsx" "app/(portal)/portal/billing/page.tsx"
git commit -m "feat: RBAC on infrastructure and billing — request framing + role-gated add funds"
```

---

## Task 10: Wire SAP Operations to TicketContext

**Files:**
- Modify: `components/portal/sap-management-widget.tsx`

There are 7 SAP operation modals: `ClientCopyModal`, `TransportMoveModal`, `SystemRefreshModal`, `HANARevisionModal`, `SupportPackModal`, `SAPAddonModal`, `UpgradeRequestModal`. Each currently uses `const [ticketId] = useState(nextTicketId)` to generate a fake random ID. Replace this with a real `createTicket()` call so tickets appear in the Tickets page.

**Pattern to apply to every SAP modal (repeat for all 7):**

Old:
```tsx
const [ticketId] = useState(nextTicketId);
// ...submit handler:
setState("submitting");
setTimeout(() => setState("done"), 1500);
```

New:
```tsx
const { createTicket } = useTickets();
const [ticketId, setTicketId] = useState("");
// ...submit handler:
setState("submitting");
setTimeout(() => {
  const ticket = createTicket({ title: "...", type: "sap-operation", detail: { ...fields } });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

- [ ] **Step 1: Add useTickets import to sap-management-widget.tsx**

At the top of the file, add:
```tsx
import { useTickets } from "@/lib/tickets/ticket-context";
```

Also **delete** the `nextTicketId` function (line 170):
```tsx
function nextTicketId() { return `TKT-${String(Math.floor(4042 + Math.random() * 100)).padStart(4, "0")}`; }
```

- [ ] **Step 2: Update ClientCopyModal**

Find `ClientCopyModal`. Replace:
```tsx
const [ticketId] = useState(nextTicketId);
```
With:
```tsx
const { createTicket } = useTickets();
const [ticketId, setTicketId] = useState("");
```

Find the submit handler inside `ClientCopyModal` that calls `setState("submitting")` and `setTimeout(() => setState("done"), 1500)`. Replace the setTimeout body:
```tsx
setTimeout(() => {
  const ticket = createTicket({
    title: `Client Copy · ${source} → ${targetClient}`,
    type: "sap-operation",
    detail: { source, targetClient, targetDesc, profile, justification, preferredDate },
  });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

- [ ] **Step 3: Update TransportMoveModal**

Replace `const [ticketId] = useState(nextTicketId)` with the same `useTickets` + `useState("")` pattern.

Replace setTimeout body:
```tsx
setTimeout(() => {
  const ticket = createTicket({
    title: `Transport Move · ${route} · ${tList.length} transport${tList.length !== 1 ? "s" : ""}`,
    type: "sap-operation",
    detail: { route, transports: tList, priority },
  });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

`tList` is the array of transport numbers (parsed from the textarea in that modal).

- [ ] **Step 4: Update SystemRefreshModal**

Replace `const [ticketId] = useState(nextTicketId)` with pattern.

Replace setTimeout body:
```tsx
setTimeout(() => {
  const ticket = createTicket({
    title: `System Refresh · PRD → ${target} · ${scope === "full" ? "Full" : "Delta"}`,
    type: "sap-operation",
    detail: { target, scope, preferredDate, preNotes },
  });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

- [ ] **Step 5: Update HANARevisionModal**

Replace `const [ticketId] = useState(nextTicketId)` with pattern.

Replace setTimeout body:
```tsx
setTimeout(() => {
  const ticket = createTicket({
    title: `HANA Revision Upgrade · ${instance.hanaRevision} → ${targetRev}`,
    type: "sap-operation",
    detail: { currentRevision: instance.hanaRevision, targetRevision: targetRev, downtimeWindow },
  });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

`targetRev` and `downtimeWindow` are the local state variable names in that modal — use whatever names exist in the modal.

- [ ] **Step 6: Update SupportPackModal**

Replace `const [ticketId] = useState(nextTicketId)` with pattern.

Replace setTimeout body:
```tsx
setTimeout(() => {
  const ticket = createTicket({
    title: `Support Pack Update · ${instance.spLevel} → ${targetSP}`,
    type: "sap-operation",
    detail: { currentSP: instance.spLevel, targetSP, stack, maintenanceWindow },
  });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

- [ ] **Step 7: Update SAPAddonModal**

Replace `const [ticketId] = useState(nextTicketId)` with pattern.

Replace setTimeout body:
```tsx
setTimeout(() => {
  const ticket = createTicket({
    title: `SAP Addon Request · ${addonName} ${version}`,
    type: "sap-operation",
    detail: { addonName, version, priority, justification },
  });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

- [ ] **Step 8: Update UpgradeRequestModal**

Replace `const [ticketId] = useState(nextTicketId)` with pattern.

Replace setTimeout body:
```tsx
setTimeout(() => {
  const ticket = createTicket({
    title: `Upgrade Request · ${instance.sapVersion} → ${target}`,
    type: "sap-operation",
    detail: { currentRelease: instance.sapVersion, targetRelease: target, approach, goLiveDate, businessDrivers },
  });
  setTicketId(ticket.id);
  setState("done");
}, 1500);
```

- [ ] **Step 9: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 10: Test in browser**

Run: `npm run dev`

Login as `user@acmecorp.com`. Navigate to Infrastructure page. Open any SAP operation modal (e.g., Client Copy). Fill in required fields. Submit. The `TicketCreatedState` screen should show a real `TKT-XXXX` ID.

Navigate to Tickets page. The new ticket should appear at the top of the list with status "Awaiting Manager".

Login as `manager@acmecorp.com`. Navigate to Tickets. Expand the new ticket. Click Approve. Status changes to "Awaiting Admin".

Login as `admin@acmecorp.com`. Navigate to Tickets. Expand the ticket. Click Final Approve. Status changes to "Approved".

Refresh the page — all ticket states persist (localStorage).

Stop dev server.

- [ ] **Step 11: Commit**

```bash
git add components/portal/sap-management-widget.tsx
git commit -m "feat: wire SAP operation modals to TicketContext — tickets now persist in approval workflow"
```

---

## Self-Review Checklist

After writing this plan, checked against spec:

**Spec coverage:**
- ✅ Auth layer: demo accounts, AuthContext, localStorage session, login page
- ✅ RBAC: permissions map, usePermission hook, all permission levels
- ✅ TicketContext: createTicket, approveStage1/2, rejectTicket, addNote, localStorage persistence
- ✅ Two-stage approval: pending_manager → pending_admin → approved/rejected
- ✅ Login page: full-screen, demo account hint box, clickable prefill
- ✅ PortalAuthGate: handles login route passthrough + auth redirect + portal shell
- ✅ Sidebar: live user email + role badge + logout
- ✅ Tickets page: all tickets visible, filters, expand, approval actions, add note
- ✅ Infrastructure: button renamed to "Request Provisioning"
- ✅ Billing: "Request Funds" text, hidden for user role
- ✅ SAP widget: all 7 modals wired to createTicket

**No placeholders found.** All steps have complete code.

**Type consistency:** `TicketApprovalStep.outcome: "approved" | "rejected"` is defined in Task 1 and used consistently in Tasks 4, 8. `Role`, `PortalAction`, `Ticket`, `CreateTicketInput` all defined in Task 1 and referenced consistently throughout.
