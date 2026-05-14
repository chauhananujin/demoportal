# Ascelios — Website Design Spec

**Date:** 2026-05-14
**Status:** Approved

---

## Overview

Ascelios is a Cloud and SAP support services company serving enterprise and mid-market clients. The website has two distinct halves: a public marketing site to attract and convert prospects, and an authenticated client portal where existing clients manage support tickets, monitor service health, access documentation, and view billing.

---

## Services Offered

- SAP implementation & migrations
- SAP support & maintenance (ongoing)
- Cloud infrastructure (AWS / Azure / GCP)
- Cloud migration (on-prem to cloud)
- Managed cloud services / monitoring
- Custom development & integrations

---

## Target Audience

Both enterprise (500+ employees) and mid-market (50–500 employees) clients running or adopting SAP systems and cloud infrastructure.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Auth | Clerk (SSO + enterprise SAML) |
| Database | Supabase (PostgreSQL + RLS) |
| UI | Tailwind CSS + shadcn/ui |
| CMS | Sanity (marketing content) |
| Deployment | Vercel |
| Testing | Vitest + Playwright |
| CI | GitHub Actions |

Single monorepo. Marketing pages use SSR/SSG for SEO. Portal routes are server-rendered and protected by Clerk middleware.

---

## Architecture

```
ascelios/
├── app/
│   ├── (marketing)/          # Public pages — SSR/SSG, SEO optimized
│   │   ├── page.tsx           # Homepage
│   │   ├── services/          # SAP + Cloud sub-pages
│   │   ├── about/
│   │   ├── case-studies/
│   │   └── contact/
│   ├── (portal)/             # Authenticated — protected by Clerk middleware
│   │   ├── dashboard/
│   │   ├── tickets/
│   │   ├── status/
│   │   ├── docs/
│   │   └── billing/
│   └── api/                  # Next.js API routes
├── sanity/                   # CMS schema (marketing content)
└── supabase/                 # DB migrations, RLS policies
```

---

## Site Structure

### Public Marketing Site

- **Home** — hero, services overview, why Ascelios, client logos, CTA
- **Services / SAP** — implementation, ongoing support, custom dev (sub-pages per service)
- **Services / Cloud** — infrastructure, migration, managed services (sub-pages per service)
- **Case Studies** — filterable by industry and service type
- **About** — team, company story, certifications (SAP partner, AWS/Azure/GCP)
- **Contact** — lead form + "Request a Quote" flow
- **Blog** (optional) — Sanity-driven thought leadership for SEO

### Client Portal

- **Dashboard** — open tickets summary, service health, next invoice
- **Tickets** — submit new, list with filters, ticket detail + comment thread
- **Service Status** — real-time uptime per client environment
- **Documentation** — knowledge base, organized by product/topic, searchable
- **Billing** — invoice history, downloadable PDFs, payment status

### Auth Flow

- Public users → "Client Login" button → Clerk-hosted sign-in → `/portal/dashboard`
- Enterprise clients get SSO via SAML (Clerk native)
- Role-based access: `admin` (full portal access) and `member` (no billing)

---

## Visual Identity

**Color palette — Teal Dark:**

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0D1F2D` | Dark sections, nav, portal sidebar |
| Surface | `#0A2940` | Cards, panels |
| Primary | `#0891B2` | CTAs, active states, links |
| Accent | `#06B6D4` / `#67E8F9` | Highlights, icons, headings |
| Text primary | `#F8FAFC` | Headings on dark |
| Text muted | `#94A3B8` | Body on dark |
| Light bg | `#F8FAFC` | Marketing content sections |

Typography: Inter (system fallback). Headings bold/extrabold. Body regular.

---

## Homepage Layout

**Centered Dark Hero:**
- Full-width dark nav (logo left, links center, "Client Login" button right)
- Full-width dark hero: eyebrow label → bold headline → subtitle → dual CTAs (primary "Get a Quote" + secondary "Our Services")
- Light section: 3-column service cards (SAP Services, Cloud Solutions, Managed Support)
- Client logos bar ("Trusted by")
- Why Ascelios section (4 differentiators)
- Case study highlights
- Footer with links + contact info

---

## Portal Layout

**Sidebar navigation:**
- Fixed left sidebar (dark, `#0D1F2D`): Ascelios logo, nav items (Dashboard, Tickets, Status, Docs, Billing), user avatar + org name at bottom
- Top bar: page title + primary action button (contextual per page)
- Main content area: adapts per section

**Dashboard content:**
- 3-stat summary row: Open Tickets / Services Health / Next Invoice
- Recent tickets table (last 5, with status badges)
- Service status mini-panel

---

## Data Model

```sql
organizations     — id, name, clerk_org_id, tier (smb|enterprise)
users             — id, clerk_user_id, org_id, role (admin|member)
tickets           — id, org_id, title, description, status, priority, assignee_id, created_at, updated_at
ticket_comments   — id, ticket_id, author_id, body, created_at
services          — id, org_id, name, type (sap|cloud), environment
service_events    — id, service_id, status (up|degraded|down), message, timestamp
invoices          — id, org_id, amount, status (paid|unpaid|overdue), due_date, pdf_url
documents         — id, title, slug, category, content_mdx, visibility (public|org), org_id
```

Row-Level Security (RLS) on all tables. Users see only their org's data. Members cannot access the `invoices` table.

---

## Error Handling

- Auth errors → Clerk-handled redirect to `/sign-in`
- API errors → `{ error, code, message }` response shape; toast notifications in portal UI
- Service status failures → graceful degraded state (last known status + timestamp shown)
- Form validation → React Hook Form + Zod schemas on client and server
- 404 / 500 pages → branded, with links back to home or portal dashboard

---

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Utility functions, Zod schemas, data transforms |
| Integration | Vitest + Supabase CLI | API routes against local Supabase instance |
| E2E | Playwright | Sign-in, submit ticket, view invoice, service status |
| CI | GitHub Actions | lint → type-check → unit → integration → E2E on every PR |
