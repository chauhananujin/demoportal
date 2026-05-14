# Ascelios Marketing Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the public-facing Ascelios marketing website: homepage, SAP/Cloud service pages, case studies, about, and contact form — all SEO-optimized via Next.js App Router SSG/SSR.

**Architecture:** Next.js 14 monorepo with a `(marketing)` route group for all public pages. Sanity CMS drives service page and case study content so non-technical editors can update copy without code changes. Tailwind CSS + shadcn/ui for the UI layer; Teal Dark brand palette applied globally via CSS variables.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Sanity v3, Vercel (deployment), Vitest (unit), Playwright (E2E)

---

## File Map

```
ascelios/
├── app/
│   ├── layout.tsx                          # Root layout: fonts, global CSS, metadata
│   ├── (marketing)/
│   │   ├── layout.tsx                      # Marketing layout: Nav + Footer wrapper
│   │   ├── page.tsx                        # Homepage
│   │   ├── services/
│   │   │   ├── page.tsx                    # Services overview
│   │   │   ├── sap/page.tsx                # SAP services landing
│   │   │   ├── sap/[slug]/page.tsx         # Individual SAP service (dynamic, from Sanity)
│   │   │   ├── cloud/page.tsx              # Cloud services landing
│   │   │   └── cloud/[slug]/page.tsx       # Individual Cloud service (dynamic, from Sanity)
│   │   ├── case-studies/
│   │   │   ├── page.tsx                    # Case studies index (filterable)
│   │   │   └── [slug]/page.tsx             # Individual case study
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   └── api/
│       └── contact/route.ts                # Contact form submission handler
├── components/
│   ├── marketing/
│   │   ├── nav.tsx                         # Top navigation bar
│   │   ├── footer.tsx                      # Site footer
│   │   ├── hero.tsx                        # Homepage hero section
│   │   ├── services-grid.tsx               # 3-column service card grid
│   │   ├── client-logos.tsx                # Logos bar
│   │   ├── why-ascelios.tsx                # 4-differentiator section
│   │   ├── case-study-card.tsx             # Card used in index + homepage
│   │   └── contact-form.tsx                # Lead/quote request form
│   └── ui/                                 # shadcn/ui primitives (button, input, card, etc.)
├── lib/
│   ├── sanity/
│   │   ├── client.ts                       # Sanity client (read-only, CDN)
│   │   └── queries.ts                      # GROQ query functions
│   └── validations/
│       └── contact.ts                      # Zod schema for contact form
├── sanity/
│   ├── sanity.config.ts                    # Sanity Studio config
│   └── schema/
│       ├── index.ts                        # Schema registry
│       ├── service.ts                      # Service document type
│       ├── caseStudy.ts                    # Case study document type
│       └── post.ts                         # Blog post type (v2-ready, not surfaced in UI)
├── styles/
│   └── globals.css                         # Tailwind directives + CSS custom properties
├── middleware.ts                           # Placeholder (Clerk added in Plan 2)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `styles/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Bootstrap Next.js project**

```bash
cd /Users/achauhan/claudeproject/gstacksuper
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*" \
  --no-git
```

Answer prompts: use defaults. This creates `app/`, `public/`, `tailwind.config.ts`, `tsconfig.json`, `package.json`.

- [ ] **Step 2: Install dependencies**

```bash
npm install @sanity/client @sanity/image-url next-sanity zod react-hook-form @hookform/resolvers
npm install -D vitest @vitejs/plugin-react jsdom @playwright/test vitest-environment-jsdom
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Then add needed primitives:

```bash
npx shadcn@latest add button input textarea card badge label
```

- [ ] **Step 4: Set CSS custom properties for the Teal Dark brand palette**

Replace the contents of `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 215 25% 10%;
    --card: 0 0% 100%;
    --card-foreground: 215 25% 10%;
    --primary: 197 87% 37%;      /* #0891B2 */
    --primary-foreground: 0 0% 100%;
    --secondary: 197 75% 42%;    /* #06B6D4 */
    --secondary-foreground: 215 25% 10%;
    --muted: 215 20% 65%;        /* #94A3B8 */
    --muted-foreground: 215 25% 40%;
    --border: 214 32% 91%;
    --radius: 0.5rem;

    /* Brand dark palette */
    --brand-bg: 210 47% 12%;     /* #0D1F2D */
    --brand-surface: 210 49% 15%;/* #0A2940 */
    --brand-accent: 187 96% 42%; /* #06B6D4 */
    --brand-accent-light: 188 92% 70%; /* #67E8F9 */
  }
}

body {
  @apply bg-background text-foreground;
}
```

- [ ] **Step 5: Configure Tailwind to expose brand tokens**

Open `tailwind.config.ts` and extend colors:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0D1F2D",
          surface: "#0A2940",
          primary: "#0891B2",
          accent: "#06B6D4",
          "accent-light": "#67E8F9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 6: Write root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Ascelios", template: "%s | Ascelios" },
  description: "Enterprise Cloud and SAP support services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:3000`. No TypeScript errors. Ctrl+C to stop.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with Tailwind + shadcn/ui + brand tokens"
```

---

## Task 2: Sanity CMS Setup

**Files:**
- Create: `sanity/sanity.config.ts`
- Create: `sanity/schema/index.ts`
- Create: `sanity/schema/service.ts`
- Create: `sanity/schema/caseStudy.ts`
- Create: `sanity/schema/post.ts`
- Create: `lib/sanity/client.ts`
- Create: `lib/sanity/queries.ts`
- Create: `.env.local` (gitignored)

- [ ] **Step 1: Create a Sanity project**

Go to [sanity.io/manage](https://sanity.io/manage), create a new project named `ascelios`. Note the **Project ID** and **Dataset** (default: `production`).

- [ ] **Step 2: Install Sanity Studio**

```bash
npm install sanity @sanity/vision
```

- [ ] **Step 3: Write Sanity config**

Create `sanity/sanity.config.ts`:

```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schema";

export default defineConfig({
  name: "ascelios",
  title: "Ascelios CMS",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
```

- [ ] **Step 4: Write Service schema**

Create `sanity/schema/service.ts`:

```ts
import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({
      name: "category",
      type: "string",
      options: { list: ["sap", "cloud"], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "icon", type: "string", description: "Emoji or icon name" }),
  ],
});
```

- [ ] **Step 5: Write CaseStudy schema**

Create `sanity/schema/caseStudy.ts`:

```ts
import { defineField, defineType } from "sanity";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "client", type: "string" }),
    defineField({
      name: "industry",
      type: "string",
      options: { list: ["manufacturing", "retail", "finance", "healthcare", "other"] },
    }),
    defineField({
      name: "services",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["sap-implementation", "sap-support", "cloud-infra", "cloud-migration", "managed", "custom-dev"] },
    }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "publishedAt", type: "datetime" }),
  ],
});
```

- [ ] **Step 6: Write Post schema (v2-ready, not surfaced)**

Create `sanity/schema/post.ts`:

```ts
import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "publishedAt", type: "datetime" }),
  ],
});
```

- [ ] **Step 7: Register schema types**

Create `sanity/schema/index.ts`:

```ts
import { service } from "./service";
import { caseStudy } from "./caseStudy";
import { post } from "./post";

export const schemaTypes = [service, caseStudy, post];
```

- [ ] **Step 8: Write Sanity client**

Create `lib/sanity/client.ts`:

```ts
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});
```

- [ ] **Step 9: Write GROQ queries**

Create `lib/sanity/queries.ts`:

```ts
import { sanityClient } from "./client";

export type Service = {
  _id: string;
  title: string;
  slug: { current: string };
  category: "sap" | "cloud";
  summary: string;
  icon: string;
};

export type CaseStudy = {
  _id: string;
  title: string;
  slug: { current: string };
  client: string;
  industry: string;
  services: string[];
  summary: string;
  publishedAt: string;
};

export async function getServicesByCategory(category: "sap" | "cloud"): Promise<Service[]> {
  return sanityClient.fetch(
    `*[_type == "service" && category == $category] | order(title asc) { _id, title, slug, category, summary, icon }`,
    { category }
  );
}

export async function getServiceBySlug(slug: string): Promise<Service & { body: unknown[] }> {
  return sanityClient.fetch(
    `*[_type == "service" && slug.current == $slug][0] { _id, title, slug, category, summary, icon, body }`,
    { slug }
  );
}

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  return sanityClient.fetch(
    `*[_type == "caseStudy"] | order(publishedAt desc) { _id, title, slug, client, industry, services, summary, publishedAt }`
  );
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy & { body: unknown[] }> {
  return sanityClient.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0] { _id, title, slug, client, industry, services, summary, publishedAt, body }`,
    { slug }
  );
}
```

- [ ] **Step 10: Add environment variables**

Create `.env.local` (already in `.gitignore` from Next.js scaffold):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

Replace `your_project_id_here` with the actual project ID from sanity.io/manage.

- [ ] **Step 11: Write unit tests for query functions**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
```

Create `lib/sanity/queries.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  sanityClient: { fetch: vi.fn() },
}));

import { sanityClient } from "./client";
import { getServicesByCategory, getAllCaseStudies } from "./queries";

const mockServices = [
  { _id: "1", title: "SAP Implementation", slug: { current: "sap-implementation" }, category: "sap", summary: "We implement SAP.", icon: "🔷" },
];

describe("getServicesByCategory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches services filtered by category", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockServices);
    const result = await getServicesByCategory("sap");
    expect(result).toEqual(mockServices);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("category == $category"),
      { category: "sap" }
    );
  });
});

describe("getAllCaseStudies", () => {
  it("fetches all case studies", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue([]);
    const result = await getAllCaseStudies();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

- [ ] **Step 12: Run tests**

```bash
npm run test -- --run
```

Expected: 2 tests pass.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: add Sanity CMS schemas and GROQ query helpers"
```

---

## Task 3: Marketing Layout — Nav + Footer

**Files:**
- Create: `app/(marketing)/layout.tsx`
- Create: `components/marketing/nav.tsx`
- Create: `components/marketing/footer.tsx`

- [ ] **Step 1: Write Nav component**

Create `components/marketing/nav.tsx`:

```tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/services/sap", label: "SAP Services" },
  { href: "/services/cloud", label: "Cloud Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-surface">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-brand-accent font-bold text-xl tracking-tight">
          Ascelios
        </Link>
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-accent text-white">
          <Link href="/portal/dashboard">Client Login</Link>
        </Button>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Write Footer component**

Create `components/marketing/footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-surface mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="text-brand-accent font-bold text-lg mb-3">Ascelios</p>
          <p className="text-slate-400 text-sm">Enterprise Cloud & SAP Partner</p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">SAP Services</p>
          <ul className="space-y-2">
            {["Implementation", "Support & Maintenance", "Custom Development"].map((s) => (
              <li key={s}><span className="text-slate-400 text-sm">{s}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Cloud Services</p>
          <ul className="space-y-2">
            {["Infrastructure", "Migration", "Managed Services"].map((s) => (
              <li key={s}><span className="text-slate-400 text-sm">{s}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Company</p>
          <ul className="space-y-2">
            {[["About", "/about"], ["Case Studies", "/case-studies"], ["Contact", "/contact"]].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-slate-400 text-sm hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-surface">
        <p className="max-w-7xl mx-auto px-6 py-4 text-slate-500 text-xs">
          © {new Date().getFullYear()} Ascelios. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Write marketing layout**

Create `app/(marketing)/layout.tsx`:

```tsx
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Verify layout renders**

```bash
npm run dev
```

Visit `http://localhost:3000`. Expected: dark nav with "Ascelios" logo and links visible, footer at bottom. No console errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add marketing layout with nav and footer"
```

---

## Task 4: Homepage

**Files:**
- Create: `app/(marketing)/page.tsx`
- Create: `components/marketing/hero.tsx`
- Create: `components/marketing/services-grid.tsx`
- Create: `components/marketing/client-logos.tsx`
- Create: `components/marketing/why-ascelios.tsx`

- [ ] **Step 1: Write Hero component**

Create `components/marketing/hero.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-brand-bg to-brand-surface py-28 px-6 text-center">
      <p className="text-brand-accent-light text-sm font-semibold tracking-widest uppercase mb-4">
        Cloud + SAP Expertise
      </p>
      <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
        Your Enterprise<br />Cloud & SAP Partner
      </h1>
      <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
        End-to-end services from implementation and migration to 24/7 managed support — across SAP and all major cloud platforms.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-accent text-white font-semibold">
          <Link href="/contact">Get a Quote</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-brand-primary text-brand-accent-light hover:bg-brand-surface">
          <Link href="/services/sap">Our Services</Link>
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write ServicesGrid component**

Create `components/marketing/services-grid.tsx`:

```tsx
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const services = [
  { icon: "🔷", title: "SAP Services", description: "Implementation, migrations, support, and custom development for SAP S/4HANA and BTP.", href: "/services/sap" },
  { icon: "☁️", title: "Cloud Infrastructure", description: "Design, deploy, and manage AWS, Azure, and GCP environments built for enterprise scale.", href: "/services/cloud" },
  { icon: "🛠️", title: "Managed Support", description: "24/7 monitoring, incident response, and ongoing optimization so your team can focus on the business.", href: "/contact" },
];

export function ServicesGrid() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full border-slate-200 hover:border-brand-primary transition-colors hover:shadow-md">
                <CardHeader>
                  <span className="text-3xl mb-2 block">{s.icon}</span>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">{s.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">{s.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write ClientLogos component**

Create `components/marketing/client-logos.tsx`:

```tsx
export function ClientLogos() {
  const clients = ["Acme Corp", "GlobalTech", "NexusMfg", "RetailCo", "FinServ Ltd"];
  return (
    <section className="py-12 px-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-8">Trusted by</p>
        <div className="flex flex-wrap justify-center gap-10">
          {clients.map((c) => (
            <span key={c} className="text-slate-300 font-bold text-lg tracking-wide">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write WhyAscelios component**

Create `components/marketing/why-ascelios.tsx`:

```tsx
const differentiators = [
  { icon: "🏆", title: "Certified Expertise", body: "SAP Certified Partner. AWS, Azure, and GCP Advanced tiers. Verified credentials, not just claims." },
  { icon: "⚡", title: "Fast Response SLA", body: "Critical issues acknowledged in under 1 hour, 24/7/365. No voicemail trees, no ticket queues at 3am." },
  { icon: "🔭", title: "Full-Stack Ownership", body: "We cover both SAP and cloud — one partner for the entire stack, no finger-pointing between vendors." },
  { icon: "📈", title: "Outcome-Focused", body: "Fixed-fee engagements and clear KPIs. We're accountable to results, not billable hours." },
];

export function WhyAscelios() {
  return (
    <section className="py-20 px-6 bg-brand-bg">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Why Ascelios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((d) => (
            <div key={d.title} className="bg-brand-surface rounded-xl p-6 border border-brand-surface hover:border-brand-primary transition-colors">
              <span className="text-2xl mb-3 block">{d.icon}</span>
              <h3 className="text-white font-semibold mb-2">{d.title}</h3>
              <p className="text-slate-400 text-sm">{d.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Assemble homepage**

Create `app/(marketing)/page.tsx`:

```tsx
import { Hero } from "@/components/marketing/hero";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { ClientLogos } from "@/components/marketing/client-logos";
import { WhyAscelios } from "@/components/marketing/why-ascelios";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <ClientLogos />
      <WhyAscelios />
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">Tell us about your environment and we'll put together a tailored proposal within 48 hours.</p>
        <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-accent text-white font-semibold">
          <Link href="/contact">Request a Quote</Link>
        </Button>
      </section>
    </>
  );
}
```

- [ ] **Step 6: Verify homepage**

```bash
npm run dev
```

Visit `http://localhost:3000`. Expected: dark hero with headline and CTAs, white service grid, logos bar, dark "Why Ascelios" section, white CTA block, footer.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build homepage — hero, services grid, logos, differentiators"
```

---

## Task 5: Services Pages

**Files:**
- Create: `app/(marketing)/services/page.tsx`
- Create: `app/(marketing)/services/sap/page.tsx`
- Create: `app/(marketing)/services/sap/[slug]/page.tsx`
- Create: `app/(marketing)/services/cloud/page.tsx`
- Create: `app/(marketing)/services/cloud/[slug]/page.tsx`

- [ ] **Step 1: Write services overview page**

Create `app/(marketing)/services/page.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Our Services</h1>
      <p className="text-slate-500 text-lg max-w-2xl mb-12">
        End-to-end SAP and cloud expertise — from initial implementation to day-two managed operations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/services/sap" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">🔷</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">SAP Services</h2>
          <p className="text-slate-500">Implementation, migration, support, and custom development for SAP S/4HANA and BTP environments.</p>
        </Link>
        <Link href="/services/cloud" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">☁️</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">Cloud Services</h2>
          <p className="text-slate-500">Infrastructure design, migration from on-prem, and managed cloud operations across AWS, Azure, and GCP.</p>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write SAP services landing page (dynamic from Sanity)**

Create `app/(marketing)/services/sap/page.tsx`:

```tsx
import { getServicesByCategory } from "@/lib/sanity/queries";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = { title: "SAP Services" };

export default async function SapServicesPage() {
  const services = await getServicesByCategory("sap");
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">SAP Services</h1>
      <p className="text-slate-500 text-lg max-w-2xl mb-12">
        Certified SAP implementation, migration, ongoing support, and custom development.
      </p>
      {services.length === 0 ? (
        <p className="text-slate-400">Services coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s._id} href={`/services/sap/${s.slug.current}`}>
              <Card className="h-full hover:border-brand-primary hover:shadow-md transition-all">
                <CardHeader>
                  <span className="text-3xl mb-2 block">{s.icon ?? "🔷"}</span>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">{s.summary}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write SAP service detail page**

Create `app/(marketing)/services/sap/[slug]/page.tsx`:

```tsx
import { getServiceBySlug, getServicesByCategory } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function generateStaticParams() {
  const services = await getServicesByCategory("sap");
  return services.map((s) => ({ slug: s.slug.current }));
}

export default async function SapServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);
  if (!service) notFound();
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-brand-primary text-sm font-semibold uppercase tracking-widest mb-3">SAP Services</p>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">{service.title}</h1>
      <p className="text-slate-500 text-lg mb-10">{service.summary}</p>
      <div className="prose prose-slate max-w-none mb-12">
        {/* Portable Text renderer added when @portabletext/react is installed */}
        <p className="text-slate-400 italic">Full service description managed in Sanity CMS.</p>
      </div>
      <Button asChild className="bg-brand-primary hover:bg-brand-accent text-white">
        <Link href="/contact">Get a Quote for {service.title}</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Replicate for Cloud (same pattern)**

Create `app/(marketing)/services/cloud/page.tsx` — copy the SAP page, change category to `"cloud"` and heading to "Cloud Services":

```tsx
import { getServicesByCategory } from "@/lib/sanity/queries";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = { title: "Cloud Services" };

export default async function CloudServicesPage() {
  const services = await getServicesByCategory("cloud");
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Cloud Services</h1>
      <p className="text-slate-500 text-lg max-w-2xl mb-12">
        AWS, Azure, and GCP — infrastructure, migration, and managed operations.
      </p>
      {services.length === 0 ? (
        <p className="text-slate-400">Services coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s._id} href={`/services/cloud/${s.slug.current}`}>
              <Card className="h-full hover:border-brand-primary hover:shadow-md transition-all">
                <CardHeader>
                  <span className="text-3xl mb-2 block">{s.icon ?? "☁️"}</span>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">{s.summary}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

Create `app/(marketing)/services/cloud/[slug]/page.tsx`:

```tsx
import { getServiceBySlug, getServicesByCategory } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function generateStaticParams() {
  const services = await getServicesByCategory("cloud");
  return services.map((s) => ({ slug: s.slug.current }));
}

export default async function CloudServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);
  if (!service) notFound();
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-brand-primary text-sm font-semibold uppercase tracking-widest mb-3">Cloud Services</p>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">{service.title}</h1>
      <p className="text-slate-500 text-lg mb-10">{service.summary}</p>
      <div className="prose prose-slate max-w-none mb-12">
        <p className="text-slate-400 italic">Full service description managed in Sanity CMS.</p>
      </div>
      <Button asChild className="bg-brand-primary hover:bg-brand-accent text-white">
        <Link href="/contact">Get a Quote for {service.title}</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Verify services pages**

```bash
npm run dev
```

Visit `http://localhost:3000/services`. Expected: two large cards for SAP and Cloud. Click each — expected: heading visible, "Services coming soon" placeholder (no Sanity content yet). No 404 or TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add services overview, SAP and cloud service pages (Sanity-driven)"
```

---

## Task 6: Case Studies Page

**Files:**
- Create: `app/(marketing)/case-studies/page.tsx`
- Create: `app/(marketing)/case-studies/[slug]/page.tsx`
- Create: `components/marketing/case-study-card.tsx`

- [ ] **Step 1: Write CaseStudyCard component**

Create `components/marketing/case-study-card.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CaseStudy } from "@/lib/sanity/queries";

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/case-studies/${study.slug.current}`} className="group block rounded-xl border border-slate-200 hover:border-brand-primary hover:shadow-md transition-all p-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {study.services.map((s) => (
          <Badge key={s} variant="secondary" className="text-xs capitalize">{s.replace(/-/g, " ")}</Badge>
        ))}
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors mb-2">{study.title}</h3>
      <p className="text-slate-500 text-sm mb-3">{study.summary}</p>
      <p className="text-xs text-slate-400">{study.client} · {study.industry}</p>
    </Link>
  );
}
```

- [ ] **Step 2: Write case studies index page**

Create `app/(marketing)/case-studies/page.tsx`:

```tsx
import { getAllCaseStudies } from "@/lib/sanity/queries";
import { CaseStudyCard } from "@/components/marketing/case-study-card";

export const metadata = { title: "Case Studies" };

export default async function CaseStudiesPage() {
  const studies = await getAllCaseStudies();
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Case Studies</h1>
      <p className="text-slate-500 text-lg max-w-2xl mb-12">Real results for real enterprises.</p>
      {studies.length === 0 ? (
        <p className="text-slate-400">Case studies coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studies.map((s) => <CaseStudyCard key={s._id} study={s} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write case study detail page**

Create `app/(marketing)/case-studies/[slug]/page.tsx`:

```tsx
import { getCaseStudyBySlug, getAllCaseStudies } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export async function generateStaticParams() {
  const studies = await getAllCaseStudies();
  return studies.map((s) => ({ slug: s.slug.current }));
}

export default async function CaseStudyDetailPage({ params }: { params: { slug: string } }) {
  const study = await getCaseStudyBySlug(params.slug);
  if (!study) notFound();
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="flex flex-wrap gap-2 mb-6">
        {study.services.map((s) => (
          <Badge key={s} variant="secondary" className="capitalize">{s.replace(/-/g, " ")}</Badge>
        ))}
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-3">{study.title}</h1>
      <p className="text-slate-400 text-sm mb-8">{study.client} · {study.industry}</p>
      <p className="text-slate-600 text-lg mb-10">{study.summary}</p>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-400 italic">Full case study managed in Sanity CMS.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Visit `http://localhost:3000/case-studies`. Expected: heading + "Case studies coming soon" placeholder. No errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add case studies index and detail pages"
```

---

## Task 7: About Page

**Files:**
- Create: `app/(marketing)/about/page.tsx`

- [ ] **Step 1: Write about page**

Create `app/(marketing)/about/page.tsx`:

```tsx
export const metadata = { title: "About" };

const certs = ["SAP Certified Partner", "AWS Advanced Tier", "Microsoft Azure Expert MSP", "Google Cloud Partner"];

const stats = [
  { value: "200+", label: "Enterprise Clients" },
  { value: "15yr", label: "Industry Experience" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "24/7", label: "Support Coverage" },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="max-w-3xl mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">About Ascelios</h1>
        <p className="text-slate-500 text-lg mb-4">
          Ascelios was founded to solve a problem every enterprise IT leader knows: SAP and cloud are deeply intertwined, but most vendors only do one. The result is finger-pointing, misaligned timelines, and costs that spiral.
        </p>
        <p className="text-slate-500 text-lg">
          We built a team that covers the full stack — SAP certified architects and cloud engineers working in the same room. One partner, full accountability, better outcomes.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {stats.map((s) => (
          <div key={s.label} className="bg-brand-bg rounded-xl p-6 text-center">
            <p className="text-brand-accent-light text-3xl font-extrabold mb-1">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Certifications</h2>
        <div className="flex flex-wrap gap-3">
          {certs.map((c) => (
            <span key={c} className="bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-full border border-slate-200">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Visit `http://localhost:3000/about`. Expected: story text, stats grid with teal numbers, certifications pills. No errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add about page with stats and certifications"
```

---

## Task 8: Contact Form

**Files:**
- Create: `app/(marketing)/contact/page.tsx`
- Create: `components/marketing/contact-form.tsx`
- Create: `lib/validations/contact.ts`
- Create: `app/api/contact/route.ts`

- [ ] **Step 1: Write validation schema**

Create `lib/validations/contact.ts`:

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company name is required"),
  message: z.string().min(10, "Please provide more detail (at least 10 characters)"),
  services: z.array(z.string()).min(1, "Select at least one service"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

- [ ] **Step 2: Write failing test for validation schema**

Create `lib/validations/contact.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { contactSchema } from "./contact";

describe("contactSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactSchema.safeParse({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "Acme Corp",
      message: "We need help migrating to SAP S/4HANA.",
      services: ["sap-implementation"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      email: "jane@acme.com",
      company: "",
      message: "Help us please.",
      services: ["cloud-infra"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects short message", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      email: "jane@acme.com",
      company: "Acme",
      message: "Help",
      services: ["cloud-infra"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty services", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      email: "jane@acme.com",
      company: "Acme",
      message: "We need cloud help.",
      services: [],
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails (schema not yet written)**

```bash
npm run test -- --run lib/validations/contact.test.ts
```

Expected: FAIL — `contactSchema` not found.

- [ ] **Step 4: Verify tests pass (schema already written in Step 1)**

```bash
npm run test -- --run lib/validations/contact.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Write API route**

Create `app/api/contact/route.ts`:

```ts
import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  // TODO in production: send email via Resend/SendGrid and/or write lead to Supabase
  console.log("New contact submission:", parsed.data);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6: Write API route test**

Create `app/api/contact/route.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  it("returns 200 for valid data", async () => {
    const res = await POST(makeRequest({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "Acme Corp",
      message: "We need SAP implementation help.",
      services: ["sap-implementation"],
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("returns 400 for invalid data", async () => {
    const res = await POST(makeRequest({ name: "J", email: "bad", company: "", message: "", services: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });
});
```

- [ ] **Step 7: Run all tests**

```bash
npm run test -- --run
```

Expected: All tests pass (validation + API route).

- [ ] **Step 8: Write ContactForm component**

Create `components/marketing/contact-form.tsx`:

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const serviceOptions = [
  { value: "sap-implementation", label: "SAP Implementation" },
  { value: "sap-support", label: "SAP Support & Maintenance" },
  { value: "cloud-infra", label: "Cloud Infrastructure" },
  { value: "cloud-migration", label: "Cloud Migration" },
  { value: "managed", label: "Managed Services" },
  { value: "custom-dev", label: "Custom Development" },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { services: [] },
  });

  const selectedServices = watch("services");

  function toggleService(value: string) {
    const current = selectedServices ?? [];
    setValue(
      "services",
      current.includes(value) ? current.filter((s) => s !== value) : [...current, value],
      { shouldValidate: true }
    );
  }

  async function onSubmit(data: ContactFormData) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-slate-900 mb-2">Thanks — we'll be in touch.</p>
        <p className="text-slate-500">Expect a response within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Jane Smith" className="mt-1" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Work Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="jane@company.com" className="mt-1" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" {...register("company")} placeholder="Acme Corp" className="mt-1" />
        {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
      </div>
      <div>
        <Label>Services Interested In</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {serviceOptions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => toggleService(s.value)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                selectedServices?.includes(s.value)
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "border-slate-200 text-slate-600 hover:border-brand-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services.message}</p>}
      </div>
      <div>
        <Label htmlFor="message">Tell us about your project</Label>
        <Textarea id="message" {...register("message")} rows={5} placeholder="Describe your current environment and what you're looking to achieve..." className="mt-1" />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary hover:bg-brand-accent text-white font-semibold">
        {isSubmitting ? "Sending..." : "Request a Quote"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 9: Write contact page**

Create `app/(marketing)/contact/page.tsx`:

```tsx
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Let's Talk</h1>
        <p className="text-slate-500 text-lg mb-8">
          Tell us about your environment and goals. We'll put together a tailored proposal within 48 hours.
        </p>
        <div className="space-y-4">
          {[
            ["📧", "hello@ascelios.com"],
            ["📞", "+1 (800) 000-0000"],
            ["⏰", "24/7 support for existing clients"],
          ].map(([icon, text]) => (
            <p key={text} className="text-slate-600 flex items-center gap-3">
              <span>{icon}</span> {text}
            </p>
          ))}
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
```

- [ ] **Step 10: Verify contact form**

```bash
npm run dev
```

Visit `http://localhost:3000/contact`. Fill in the form. Submit. Expected: success message. Check terminal for logged submission. Validation errors show on empty/bad fields.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add contact page with validated lead form and API route"
```

---

## Task 9: Playwright E2E Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/marketing.spec.ts`

- [ ] **Step 1: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Install Playwright browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 3: Write E2E tests**

Create `e2e/marketing.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("homepage loads with hero and CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /enterprise/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get a Quote" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Our Services" })).toBeVisible();
});

test("nav links work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("heading", { name: /about ascelios/i })).toBeVisible();
});

test("contact form validates and submits", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Request a Quote" }).click();
  await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();

  await page.fill("#name", "Jane Smith");
  await page.fill("#email", "jane@acme.com");
  await page.fill("#company", "Acme Corp");
  await page.getByRole("button", { name: "SAP Implementation" }).click();
  await page.fill("#message", "We need help migrating to SAP S/4HANA on Azure.");
  await page.getByRole("button", { name: "Request a Quote" }).click();
  await expect(page.getByText("Thanks — we'll be in touch.")).toBeVisible();
});

test("services page loads SAP and Cloud sections", async ({ page }) => {
  await page.goto("/services");
  await expect(page.getByRole("heading", { name: "SAP Services" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cloud Services" })).toBeVisible();
});
```

- [ ] **Step 4: Run E2E tests**

```bash
npx playwright test
```

Expected: 4 tests pass. If contact form submission fails (API route 500), check `npm run dev` terminal for errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add Playwright E2E tests for marketing site golden paths"
```

---

## Task 10: GitHub Actions CI + Vercel Deploy

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `vercel.json`

- [ ] **Step 1: Write CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run test -- --run
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: E2E tests
        run: npx playwright test
        env:
          NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
          NEXT_PUBLIC_SANITY_DATASET: production
```

- [ ] **Step 2: Write Vercel config**

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci"
}
```

- [ ] **Step 3: Add environment variables to GitHub and Vercel**

In GitHub repo → Settings → Secrets:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` = your Sanity project ID

In Vercel project → Settings → Environment Variables:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` = your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` = `production`

- [ ] **Step 4: Push to main and verify CI passes**

```bash
git add -A
git commit -m "ci: add GitHub Actions workflow and Vercel config"
git push origin main
```

Expected: GitHub Actions run passes all steps. Vercel deploys successfully.

---

## Self-Review Notes

- All spec marketing pages are covered: homepage ✓, services (SAP + Cloud) ✓, case studies ✓, about ✓, contact ✓
- Sanity CMS schema covers services, case studies, and blog (post) — matches spec
- Contact form has both client-side (React Hook Form + Zod) and server-side (API route Zod) validation — matches spec
- Teal Dark brand palette applied via CSS variables and Tailwind tokens — matches visual identity decision
- E2E tests cover: homepage load, nav, contact form validation + submission, services page
- Portal and auth are Plan 2 — `middleware.ts` is a placeholder, "Client Login" links to `/portal/dashboard`
