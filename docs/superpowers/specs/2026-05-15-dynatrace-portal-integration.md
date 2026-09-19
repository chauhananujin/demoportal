# Dynatrace ↔ Client Portal Integration — Design Spec

## Goal

Let each Ascelios customer see live performance, health, and incident data for their own services inside `/portal/monitoring` (and a summary on `/portal/dashboard`), without leaving the portal and without exposing data from other tenants. Dynatrace stays the source of truth and the heavy-lift UI for deep investigation; the portal hosts native summary views and deep-links into Dynatrace where appropriate.

## Architecture (one-paragraph version)

Each Ascelios tenant is mapped to a Dynatrace **Management Zone** (MZ) inside a single Dynatrace SaaS environment. The Next.js portal calls Dynatrace's REST + Grail APIs **server-side only** via a Next.js Route Handler proxy. The proxy authenticates as an Ascelios service principal using OAuth 2.0 client credentials, retrieves an access token, then issues every query with the `managementZone(<id>)` filter or `--scope=mz:<id>` so a customer can never see another tenant's data. Responses are cached briefly (60–120s) in a server-side store, then returned to the React UI as plain JSON. No Dynatrace token ever reaches the browser.

**Tech:** Next.js Route Handlers, React Server Components for the summary cards, an in-memory + Redis cache (later), Dynatrace OAuth 2.0 client credentials, Dynatrace Grail / Metrics v2 / Problems v2 / Davis APIs, TypeScript strict.

---

## 1. Auth Model

### Dynatrace side

- One **Dynatrace SaaS environment** for all Ascelios customers (multi-tenant via Management Zones).
- One **Ascelios service principal** with an OAuth client (`Settings → Identity & Access → OAuth clients`).
- Scopes the client needs:
  | Scope | Used for |
  |---|---|
  | `storage:metrics:read` | Metrics v2 + Grail metric queries |
  | `storage:problems:read` | Problems API |
  | `storage:logs:read` | Log Monitoring queries |
  | `storage:bizevents:read` | Optional — business events / SAP correlation |
  | `storage:events:read` | Events feed (deployments, custom annotations) |
  | `environment-api:entities:read` | Entity catalogue (hosts, services, processes) |
  | `environment-api:management-zones:read` | List MZs (admin-only operations) |

- Tokens are minted at request time via `https://sso.dynatrace.com/sso/oauth2/token` with grant_type `client_credentials`. Cache the token in-memory until ~60s before expiry (default 5 min).

### Ascelios portal side

Credentials live in env vars, **never** in a client component:

```
DYNATRACE_ENV_URL=https://abc12345.live.dynatrace.com
DYNATRACE_SSO_URL=https://sso.dynatrace.com
DYNATRACE_OAUTH_CLIENT_ID=...
DYNATRACE_OAUTH_CLIENT_SECRET=...
DYNATRACE_OAUTH_ACCOUNT_URN=urn:dtaccount:...
```

For local dev / staging / prod, separate Dynatrace OAuth clients each scoped to the same envs. Production secrets in the deploy platform's secret store (Vercel env vars, AWS Secrets Manager — match whatever the deploy target uses).

### Customer → Management Zone mapping

Today the `Tenant` model lives in `lib/onboarding/tenant-context.tsx`. Extend it with:

```ts
export interface Tenant {
  // existing fields…
  dynatrace?: {
    managementZoneId: string;     // e.g. "1234567890123456789"
    managementZoneName: string;   // e.g. "ascelios-acme-prod"
    onboardedAt: string;          // ISO date
  };
}
```

Provisioning a new tenant in onboarding kicks off an MZ-creation step (initially a manual back-office action, later automated via the Dynatrace Settings API).

---

## 2. Server Proxy Architecture

### Route layout

```
app/api/dynatrace/
  ├── _lib/
  │   ├── token.ts            # OAuth token broker (caches access token)
  │   ├── client.ts           # fetch wrapper, adds Authorization + retries
  │   ├── mz.ts               # resolveTenantMz(req) → ManagementZone | 401
  │   └── cache.ts            # tiny LRU; later, Redis or unstorage
  ├── summary/route.ts        # GET /api/dynatrace/summary
  ├── problems/route.ts       # GET /api/dynatrace/problems?status=open
  ├── hosts/route.ts          # GET /api/dynatrace/hosts
  ├── metrics/route.ts        # GET /api/dynatrace/metrics?metric=...&from=...
  ├── topology/route.ts       # GET /api/dynatrace/topology (Smartscape)
  └── logs/route.ts           # POST /api/dynatrace/logs (Grail DQL query)
```

Every handler runs the same skeleton:

```ts
export async function GET(req: NextRequest) {
  const session = await getPortalSession(req);                // existing auth
  if (!session) return Response.json({error: "unauth"}, {status: 401});

  const mz = await resolveTenantMz(session);                  // pulled from Tenant
  if (!mz) return Response.json({error: "no_dt_tenant"}, {status: 404});

  const token = await getDynatraceToken();                    // cached
  const cacheKey = `dt:summary:${mz.managementZoneId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return Response.json(cached);

  const data = await dtClient.get(`/api/v2/problems`, {
    token, query: { managementZone: mz.managementZoneId, status: "open" },
  });

  const shaped = pickSummaryFields(data);
  await cache.set(cacheKey, shaped, { ttl: 60 });
  return Response.json(shaped);
}
```

### Critical rules

1. **MZ filter is non-negotiable.** Every Dynatrace call MUST include the tenant's `managementZone` query param or DQL `| filter dt.management_zones contains "<id>"`. A central `dtClient.get(...)` wrapper enforces this — calls without an MZ throw at construction time. This is the single point of multi-tenancy enforcement.
2. **No tokens to the browser.** Auth flows only over `Authorization: Bearer …` between Next server → Dynatrace. Browser only sees the JSON the route returns.
3. **Rate-limit defense.** Dynatrace API has per-token request budgets. The cache TTLs below are sized to keep us well within limits even for a refreshing dashboard.
4. **Soft failure.** If Dynatrace is down or returns 5xx, the summary card renders a "Metrics unavailable" state — never blocks the page or surfaces raw errors to the user.

### Cache TTLs

| Endpoint | TTL | Reason |
|---|---|---|
| `/summary` | 60 s | Dashboard polls every 30–60 s |
| `/problems` | 30 s | Latency matters during incidents |
| `/hosts` | 5 min | Inventory changes slowly |
| `/metrics` (rolling 1 h) | 60 s | Matches Dynatrace's natural granularity |
| `/topology` | 10 min | Smartscape is expensive; rare changes |
| `/logs` | none | DQL queries are user-initiated |

---

## 3. Dynatrace APIs we'd hit

| API | Endpoint | Used for |
|---|---|---|
| **Problems v2** | `GET /api/v2/problems?managementZone=<id>&status=OPEN` | Open problems count, list with severity/impact |
| **Problems v2 detail** | `GET /api/v2/problems/{id}` | Full root-cause when user drills in |
| **Metrics v2** | `GET /api/v2/metrics/query?metricSelector=...&entitySelector=mzId(<id>)` | All charts — host CPU, service response time, error rate |
| **Entities v2** | `GET /api/v2/entities?entitySelector=type(HOST),mzId(<id>)` | Host & service inventory |
| **Smartscape (Grail DQL)** | `POST /platform/storage/query/v1/query:execute` with `fetch dt.entity.host \| filter dt.management_zones contains "<id>"` | Topology visualisation |
| **Davis Events v2** | `GET /api/v2/events?managementZone=<id>` | Deployment & change-impact feed |
| **Synthetic Monitoring v2** | `GET /api/v2/synthetic/monitors?managementZone=<id>` | "Synthetic checks passing" stats |

### Specific signals for the portal cards

These are the 6 cards already mocked on `/portal/monitoring`. Each maps to a single concrete Dynatrace query:

| Card | Query (pseudo-DQL where appropriate) |
|---|---|
| **Monitored Hosts** | `GET /api/v2/entities?entitySelector=type(HOST),mzId(<id>)` → length |
| **Active Containers** | `GET /api/v2/entities?entitySelector=type(CONTAINER_GROUP_INSTANCE),mzId(<id>)` → length |
| **Open Problems** | `GET /api/v2/problems?managementZone=<id>&status=OPEN` → totalCount |
| **MTTR (30d avg)** | Grail: `fetch dt.davis.problems \| filter dt.management_zones contains "<id>" and start > now() - 30d \| summarize avg = avg(end - start)` |
| **Events / second** | Grail: `fetch dt.events \| filter dt.management_zones contains "<id>" \| summarize ev_per_s = count() / 60, by: {bin(timestamp, 1m)}` → last bin |
| **Coverage** | computed: `(hosts_with_oneagent / total_hosts) * 100` from `/api/v2/entities` |

### Recent activity feed

Combined Grail query over `dt.davis.problems` + `dt.events` filtered to the MZ, sorted by timestamp, limited to ~10. Chip color comes from `event.kind` (RESOLVED / INVESTIGATING / DEPLOYED / HEALTHY).

---

## 4. Portal UI Changes

### `/portal/monitoring` — replace mock data with live

- The mock arrays at the top of `app/(portal)/portal/monitoring/page.tsx` (`consoleMetrics`, `alerts`) get replaced with a `useDynatraceSummary()` hook that fetches `/api/dynatrace/summary` (which itself returns `{ metrics, alerts }`).
- The hook uses **SWR** (or React Query) with `refreshInterval: 30000`. On error → keep last known value, badge the section as "stale" with the last-fetch timestamp.
- Sparklines pull last-1h-by-minute data from `/api/dynatrace/metrics`.
- The two Dynatrace reference screenshots stay — they become "Inside the platform" marketing visuals. The big change is the new live "Operator workflow, real screens" panel above them.

### `/portal/dashboard` — add a Monitoring summary card

New card in the existing stats row showing **Open Problems** + **MTTR (30d)**. Clickable → routes to `/portal/monitoring`. Uses the same `useDynatraceSummary()` hook so we're not paying for two fetches.

### `/portal/tenants/[id]` (future)

Per-tenant detail page surfacing only that tenant's MZ slice — hosts, services, recent alerts. Same API, different `tenantId` resolved server-side.

### Deep-link to Dynatrace for investigation

Every problem in our list has a `dt_problem_id`. The "View in Dynatrace" link goes to `https://<env>.live.dynatrace.com/ui/problems/<dt_problem_id>` and the customer SSOs into Dynatrace using their existing IdP (Azure AD, Okta) which we already pre-provision them into during onboarding.

---

## 5. Multi-tenant Safety

The blast radius of getting MZ scoping wrong is "Customer A sees Customer B's incidents" — the worst-case privacy bug. Three layers of defense:

1. **Single chokepoint.** Only `dtClient.get()` / `dtClient.dql()` may hit Dynatrace. Both refuse to construct a request without an `mz` parameter. Unit-tested with a fuzzer that asserts every API surface refuses unscoped queries.
2. **Server-rendered checks.** Route handlers re-derive the MZ from the *session*, not from any client-supplied parameter. A malicious user passing `?managementZone=other-customer` in the URL is ignored.
3. **Dynatrace-side belt-and-braces.** The Ascelios service principal's permission set is bound to "all MZs read", but each customer's MZ has its own permission group containing only that customer's SSO users — so even if our proxy *did* leak, customers logging into Dynatrace directly still only see their MZ.

### Test plan (in spec, build later)

- Snapshot test: `dtClient.get("/api/v2/problems", {})` throws.
- Integration test (against Dynatrace sandbox): create 2 MZs with synthetic problems, query as each, assert zero overlap.
- E2E (Playwright): sign in as customer A, fetch `/api/dynatrace/problems`, assert all returned `dt.entity.management_zone` IDs equal A's MZ.

---

## 6. Phased Build Plan

### Phase 1 — Read-only summary (2 weeks)
- Server proxy + token broker + MZ resolver
- 1 endpoint: `/api/dynatrace/summary` returning the 6 cards + alerts feed
- Replace mock data on `/portal/monitoring` with live data
- Manual MZ assignment via Settings page (admin-only)

### Phase 2 — Metrics & charts (2 weeks)
- `/api/dynatrace/metrics` endpoint, supports any metric selector
- Replace sparklines with real 1-hour data
- New `/portal/monitoring/[entityId]` per-host/service detail page
- "View in Dynatrace" deep-link buttons

### Phase 3 — Automated provisioning (2 weeks)
- New customer onboarding creates Dynatrace MZ automatically via Settings API
- IdP federation: provision customer's SSO group with read-only access to that MZ
- Self-service "Reset alert rules" page in portal

### Phase 4 — Embedded deep-dive (1 week)
- Embed Dynatrace UI in iframe for Smartscape / full problem detail
- Uses Dynatrace's [embed token](https://docs.dynatrace.com) for signed, scoped iframes

### Phase 5 — Logs & DQL (2 weeks)
- DQL query endpoint with input sanitization
- Log search UI in portal (filters by host/service, time range, free-text)
- Saved queries per customer

---

## 7. Open Questions

1. **One Dynatrace tenant for everyone vs. one per customer?** Single environment + MZs is cheaper and matches how Dynatrace recommends partner-multi-tenant patterns. Per-customer environments give stronger isolation but blow up SKU costs by ~10x. **Default: single env + MZs.** Re-evaluate if any customer demands a dedicated env for compliance reasons.
2. **Do we sell this monitoring as a separate SKU or bundle?** Affects whether we expose pricing controls in the portal.
3. **Caching layer.** Phase-1 in-memory cache is fine for one Next.js instance. As soon as we deploy to Vercel/Fly with multiple regions, swap to Redis or `@vercel/kv`.
4. **What happens during a Dynatrace outage?** Decision: show "Metrics temporarily unavailable" with last-known values + timestamp. Don't fail the page.
5. **Customer self-service alert config?** Some customers want to tune their own alerting profiles. Phase 3 candidate, but requires careful permission design.
6. **Audit log.** Should every Dynatrace API call from a customer session be logged to our own audit trail (who queried what, when)? Probably yes for SOX. Adds a small write per request.

---

## 8. Files We'd Touch / Create

| File | Action |
|---|---|
| `lib/onboarding/types.ts` | Add `dynatrace` block to `Tenant` |
| `lib/onboarding/tenant-context.tsx` | Persist the new field |
| `lib/dynatrace/client.ts` | New — fetch wrapper + retry |
| `lib/dynatrace/token.ts` | New — OAuth broker |
| `lib/dynatrace/mz.ts` | New — resolveTenantMz |
| `lib/dynatrace/cache.ts` | New — in-memory LRU |
| `lib/dynatrace/types.ts` | New — DT response types |
| `app/api/dynatrace/summary/route.ts` | New endpoint |
| `app/api/dynatrace/problems/route.ts` | New endpoint |
| `app/api/dynatrace/metrics/route.ts` | New endpoint |
| `app/(portal)/portal/monitoring/page.tsx` | Replace mock arrays with live fetch |
| `app/(portal)/portal/dashboard/page.tsx` | Add Monitoring summary card |
| `app/(portal)/portal/settings/dynatrace/page.tsx` | New — admin MZ assignment UI |
| `.env.example` | Document `DYNATRACE_*` env vars |
| `lib/dynatrace/*.test.ts` | Unit + scoping tests |

Approx scope: **~2500 LOC** for Phase 1, including tests.

---

## 9. Non-goals

- We are NOT trying to replicate Dynatrace's full UI. Dashboards, alerting rules, custom dashboards stay in Dynatrace.
- We are NOT reselling Dynatrace as Ascelios software — the attribution stays visible in the UI and contractually we're a value-add operator on top of Dynatrace.
- No real-time WebSocket push from Dynatrace in Phase 1. SWR polling is good enough.
- No write-side operations (acknowledging problems, muting alerts) in Phase 1. Phase 5+ if customers ask.

---

## 10. Decision Required Before Phase 1 Starts

1. Confirm "single Dynatrace env + MZ-per-customer" architecture (Section 7, Q1).
2. Confirm caching strategy: in-memory for Phase 1, Redis for Phase 2+.
3. Confirm initial MZ assignment is manual (admin UI), not auto-provisioned (Phase 3 work).
4. Decide whether customer SSO into Dynatrace happens via Ascelios IdP (federation) or Dynatrace's own IdP (with us pre-creating accounts).

Once those four are locked, Phase 1 can start.
