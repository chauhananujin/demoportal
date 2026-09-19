# Auth, RBAC & Ticket Approval Workflow — Design Spec

## Goal

Add secure mock authentication, role-based access control, and a two-stage ticket approval workflow to the Ascelios client portal. All actions (provisioning, SAP operations, billing) create tickets that must be approved by a Manager (stage 1) then an Admin (stage 2) before execution — satisfying SOX compliance audit requirements.

## Architecture

Context + localStorage persistence. No real backend. `AuthContext` and `TicketContext` are React contexts that hydrate from localStorage on mount and sync writes back to it. The portal layout gate-checks auth on render and redirects unauthenticated users to `/portal/login`.

**Tech:** Next.js App Router, React Context, localStorage, TypeScript strict mode, Tailwind/brand tokens.

---

## 1. Authentication Layer

### Demo Accounts

| Email | Password | Role |
|---|---|---|
| user@acmecorp.com | demo1234 | user |
| manager@acmecorp.com | demo1234 | manager |
| admin@acmecorp.com | demo1234 | admin |

Accounts stored as a constant in `lib/auth/accounts.ts`. Never fetched from a server.

### Session Storage

localStorage key `ascelios_session` stores:
```ts
{ email: string; role: "user" | "manager" | "admin"; loginAt: string }
```

### AuthContext (`lib/auth/auth-context.tsx`)

```ts
interface AuthUser {
  email: string;
  role: "user" | "manager" | "admin";
  loginAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<"ok" | "invalid">;
  logout: () => void;
}
```

Wraps the portal layout. On mount reads `ascelios_session`; on login writes it; on logout removes it and calls `router.push("/portal/login")`.

### Login Page (`app/(portal)/portal/login/page.tsx`)

- Full-screen dark form, brand-consistent styling
- Email + password fields
- On submit: calls `login()`, on "invalid" shows inline error
- On success: `router.push("/portal/dashboard")`
- "Demo accounts" hint box showing all three accounts and passwords

### Portal Layout Gate

`app/(portal)/layout.tsx` is a server component — it wraps children in `<AuthProvider>` and `<TicketProvider>` and includes a `<PortalAuthGate>` client component.

`PortalAuthGate` (`components/portal/portal-auth-gate.tsx`) is a `"use client"` component that uses `useAuth()` and `usePathname()`. If `user` is null and pathname is not `/portal/login`, it redirects to `/portal/login`. This avoids an infinite redirect loop since the login page is inside the same route group.

### Sidebar Updates

Replace hardcoded account block with:
- User email (truncated)
- Role badge colour-coded: `slate` = User, `amber` = Manager, `red` = Admin
- Logout button (calls `logout()`)

---

## 2. RBAC / Permissions

### Role Definitions

```ts
type Role = "user" | "manager" | "admin";

type PortalAction =
  | "view:tickets"
  | "update:ticket"
  | "create:ticket"
  | "approve:stage1"    // manager approval
  | "approve:stage2"    // admin final approval
  | "reject:ticket"
  | "request:provision"
  | "request:sap-operation"
  | "request:add-funds";
```

### Permissions Map (`lib/auth/permissions.ts`)

| Action | user | manager | admin |
|---|---|---|---|
| view:tickets | ✅ | ✅ | ✅ |
| update:ticket | ✅ | ✅ | ✅ |
| create:ticket | ✅ | ✅ | ✅ |
| approve:stage1 | ❌ | ✅ | ✅ |
| approve:stage2 | ❌ | ❌ | ✅ |
| reject:ticket | ❌ | ✅ | ✅ |
| request:provision | ✅ | ✅ | ✅ |
| request:sap-operation | ✅ | ✅ | ✅ |
| request:add-funds | ❌ | ✅ | ✅ |

### `usePermission` Hook (`lib/auth/use-permission.ts`)

```ts
function usePermission(action: PortalAction): boolean
```

Returns `true` if the current user's role has the given permission. Used throughout portal to show/hide/disable UI elements.

---

## 3. Ticket Workflow

### Ticket State Machine

```
pending_manager → pending_admin → approved
              ↘ rejected
                             ↘ rejected
```

All tickets start at `pending_manager` when created.

### Ticket Data Shape

```ts
interface TicketApprovalStep {
  by: string;      // email
  at: string;      // ISO timestamp
  note: string;
}

interface Ticket {
  id: string;                        // TKT-XXXX
  title: string;
  type: "provision" | "sap-operation" | "billing" | "support";
  requestedBy: string;               // email
  requestedByRole: Role;
  createdAt: string;                 // ISO timestamp
  status: "pending_manager" | "pending_admin" | "approved" | "rejected";
  managerApproval: TicketApprovalStep | null;
  adminApproval: TicketApprovalStep | null;
  detail: Record<string, unknown>;   // action-specific payload
  notes: Array<{ by: string; at: string; text: string }>;
}
```

### TicketContext (`lib/tickets/ticket-context.tsx`)

```ts
interface TicketContextValue {
  tickets: Ticket[];
  createTicket: (input: CreateTicketInput) => Ticket;
  approveStage1: (id: string, note: string) => void;  // manager
  approveStage2: (id: string, note: string) => void;  // admin
  rejectTicket: (id: string, note: string) => void;   // manager or admin
  addNote: (id: string, text: string) => void;
}
```

localStorage key `ascelios_tickets` stores the full tickets array. On mount, hydrates from localStorage. Every mutating call syncs back.

`createTicket` generates the next `TKT-XXXX` id by finding the current max in the array.

### Approval Rules (enforced in context)

- `approveStage1`: only callable when `status === "pending_manager"`. Sets `managerApproval`, advances status to `pending_admin`.
- `approveStage2`: only callable when `status === "pending_admin"`. Sets `adminApproval`, advances status to `approved`.
- `rejectTicket`: callable at `pending_manager` or `pending_admin`. Sets appropriate approval step with note, sets status to `rejected`.

---

## 4. Tickets Page Rebuild

### Table View

Columns: **ID**, **Title**, **Type**, **Requested By**, **Status**, **Updated**

Status badges:
- `pending_manager` → amber "Awaiting Manager"
- `pending_admin` → violet "Awaiting Admin"
- `approved` → emerald "Approved"
- `rejected` → red "Rejected"

All three roles see all tickets.

### Ticket Detail Panel (expandable inline row)

Shows full approval timeline:
1. **Requested** — email, role badge, timestamp
2. **Manager Review** — pending / approved (name + time + note) / rejected
3. **Admin Review** — pending / approved (name + time + note) / rejected (only shown after stage 1 resolves)

**Action area (role-dependent):**
- Manager on `pending_manager` ticket: **Approve** / **Reject** buttons + optional note textarea
- Admin on `pending_admin` ticket: **Final Approve** / **Reject** buttons + optional note textarea
- All roles on any open ticket: **Add Note** textarea + submit

### Filters

Status filter pills: All / Pending / Approved / Rejected — client-side filter on the tickets array.

---

## 5. Portal-Wide Action Changes

### "Request" framing

All action buttons renamed to "Request [action]" to make clear they create a ticket:
- "Provision Resource" → "Request Provisioning"
- SAP operation buttons already go through ticket flow (built)
- "Add Funds" → "Request Funds" (hidden for `user` role via `usePermission`)

### Existing SAP ticket modals

No changes needed — the `TicketCreatedState` component already exists and displays correctly. Update the `nextTicketId()` helper to call `createTicket()` from `TicketContext` instead of generating a random ID, so the ticket actually appears in the tickets list.

---

## 6. File Structure

| File | Purpose |
|---|---|
| `lib/auth/accounts.ts` | Demo account constants |
| `lib/auth/auth-context.tsx` | AuthContext + AuthProvider |
| `lib/auth/permissions.ts` | Permissions map + PortalAction type |
| `lib/auth/use-permission.ts` | `usePermission(action)` hook |
| `lib/tickets/ticket-context.tsx` | TicketContext + TicketProvider |
| `lib/tickets/types.ts` | Ticket, Role, TicketApprovalStep types |
| `app/(portal)/portal/login/page.tsx` | Login page (renders without sidebar; auth gate skips redirect on this path) |
| `app/(portal)/layout.tsx` | Wrap children in AuthProvider + TicketProvider + PortalAuthGate |
| `components/portal/portal-auth-gate.tsx` | Client component — redirects to /portal/login if unauthenticated |
| `components/portal/sidebar.tsx` | Replace hardcoded user block with live auth data |
| `app/(portal)/portal/tickets/page.tsx` | Full rebuild — table + detail panel + approval actions |
| `app/(portal)/portal/infrastructure/page.tsx` | Rename provision button; connect to TicketContext |
| `app/(portal)/portal/billing/page.tsx` | Hide Add Funds for `user` role |
| `components/portal/sap-management-widget.tsx` | Wire `nextTicketId()` to `createTicket()` |
