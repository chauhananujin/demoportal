import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Data Services" };

const capabilities = [
  {
    title: "Data Advisory Services",
    body: "Strategic data governance, architecture consulting, and roadmap definition to maximize the value of your enterprise data assets.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="18" cy="18" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M25 25l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 18h8M14 14h6M14 22h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Legacy Data Platform Migration",
    body: "Safe, validated migration of legacy data warehouses and RDBMS platforms to modern cloud-native architectures with full lineage.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <ellipse cx="20" cy="14" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 14v6c0 2.76 5.37 5 12 5s12-2.24 12-5v-6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 20v6c0 2.76 5.37 5 12 5s12-2.24 12-5v-6" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "BW Migration to SAP HANA",
    body: "Accelerated migration of SAP BW landscapes to SAP BW/4HANA with minimal business disruption and complete data integrity validation.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="6" y="10" width="11" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="23" y="10" width="11" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17 20h6M21 17l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "BW to Cloud Data Warehouse",
    body: "Transform SAP BW to cloud-native data warehouses on Snowflake, BigQuery, or Azure Synapse for elastic scalability and lower TCO.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M10 24c-3 0-5-2-5-5s2-5 5-5c0-4 3-7 7-7s7 3 7 7c3 0 5 2 5 5s-2 5-5 5H10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M20 22v8M16 26l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Data Management & Operations",
    body: "Ongoing data quality management, MDM operations, data lifecycle governance, and real-time pipeline monitoring.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 32V18M16 32V10M24 32v-8M32 32V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="14" r="2" fill="currentColor"/>
        <circle cx="16" cy="6" r="2" fill="currentColor"/>
        <circle cx="24" cy="20" r="2" fill="currentColor"/>
        <circle cx="32" cy="10" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: "Generative AI Accelerator",
    body: "SAP Datasphere-powered AI accelerator integrating large language models into your SAP analytics and reporting workflows.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 8l2.5 6L29 16l-6.5 2L20 24l-2.5-6L11 16l6.5-2L20 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M30 26l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const stats = [
  { number: "5 PB+", label: "Enterprise data migrated to modern cloud warehouses across regulated industries" },
  { number: "60%",   label: "Average TCO reduction after BW to cloud data warehouse modernization" },
  { number: "30 d",  label: "From discovery to first production-grade data pipeline in flight" },
];

const certs = [
  "SAP Datasphere Certified",
  "Snowflake Select Partner",
  "Databricks Partner",
  "Google Cloud Data Analytics Specialization",
  "Azure Data & AI Specialization",
];

const solutions = [
  {
    badge: "Modernization",
    title: "BW/4HANA Conversion",
    desc: "A pre-built BW/4HANA conversion path with InfoProvider redesign, query remediation, and side-by-side validation.",
    features: [
      "Custom code & InfoProvider scan",
      "Side-by-side data reconciliation",
      "BEx → SAC migration playbook",
      "Cutover & hypercare runbook",
    ],
  },
  {
    badge: "Cloud DW",
    title: "BW → Cloud Data Warehouse",
    desc: "Move from SAP BW to Snowflake, BigQuery, or Synapse — keeping SAP semantics intact and unlocking elastic scale.",
    features: [
      "Semantic layer preservation",
      "CDC pipelines (SLT, Fivetran, Datasphere)",
      "Cost & performance benchmarking",
      "Analytics consumption refactor",
    ],
  },
  {
    badge: "Gen AI",
    title: "Datasphere Gen AI Accelerator",
    desc: "Add a governed LLM layer on top of SAP Datasphere — natural-language analytics, narrative reporting, and AI agents.",
    features: [
      "Datasphere + Joule integration",
      "Retrieval-augmented SAP semantics",
      "Guardrails & access governance",
      "First use case in 30 days",
    ],
  },
];

const consoleMetrics = [
  { label: "Pipelines Healthy",  value: "184/186", ok: true },
  { label: "Freshness SLA",      value: "99.6%",   ok: true },
  { label: "Rows Loaded / day",  value: "2.1 B",   ok: null },
  { label: "BW → HANA Progress", value: "78%",     ok: null },
  { label: "DQ Incidents",       value: "3",       ok: false },
  { label: "Storage Saved",      value: "41 TB",   ok: true },
];

const alerts = [
  { chip: "RESOLVED",  chipOk: "ok",   text: "Snowflake reload of SAP_FI cube completed — 412 M rows in 22 min", time: "08:46" },
  { chip: "SCHEDULED", chipOk: "info", text: "BW/4HANA cutover for cube 0SD_C03 scheduled — Saturday 02:00 UTC",  time: "11:20" },
  { chip: "WATCH",     chipOk: "warn", text: "Pipeline ORD_FCT lag 7 min above SLA — investigating SLT delta",     time: "14:12" },
  { chip: "HEALTHY",   chipOk: "ok",   text: "Datasphere AI accelerator answered 1,284 NL queries today",         time: "14:42" },
];

const chipColors: Record<string, string> = {
  ok:   "bg-green-500/15 text-green-400",
  warn: "bg-yellow-400/15 text-yellow-300",
  info: "bg-brand-primary/20 text-brand-accent",
};

const metricValueColor = (ok: boolean | null) =>
  ok === true ? "text-green-400" : ok === false ? "text-yellow-300" : "text-white";

export default function DataServicesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-brand-accent mb-5">
              Data Services
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white mb-6">
              Unlock the full value<br />of your SAP data.
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mb-10">
              From advisory to full migration — our data specialists help you extract, migrate, and monetize your enterprise data across SAP and modern cloud warehouses.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-6">
                  Request a Data Assessment
                </Button>
              </Link>
              <Link href="#capabilities" className="text-slate-400 hover:text-white text-sm border-b border-slate-600 hover:border-white transition-colors self-center pb-px">
                Explore capabilities →
              </Link>
            </div>
          </div>

          {/* Console mockup */}
          <div className="rounded-xl border border-brand-surface bg-brand-surface/60 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Ascelios — Data Platform Monitor</span>
              <span className="font-mono text-[11px] text-slate-600">14:42:07 UTC</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {consoleMetrics.map((m) => (
                <div key={m.label} className="bg-white/5 border border-white/8 rounded-lg p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500 mb-1">{m.label}</p>
                  <p className={`text-xl font-semibold leading-none ${metricValueColor(m.ok)}`}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-0 mb-5">
              {alerts.map((a) => (
                <div key={a.time} className="flex items-center gap-3 py-2.5 border-b border-white/6 last:border-0">
                  <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded-full ${chipColors[a.chipOk]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {a.chip}
                  </span>
                  <span className="text-xs text-slate-400 flex-1 leading-snug">{a.text}</span>
                  <span className="font-mono text-[10px] text-slate-600 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/6">
              <div className="flex gap-2 flex-wrap">
                {["BW/4HANA", "Datasphere", "Snowflake", "BigQuery", "Synapse"].map((b) => (
                  <span key={b} className="font-mono text-[10px] px-2 py-1 rounded-full border border-white/15 text-slate-500">{b}</span>
                ))}
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                Pipelines operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust logos ───────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-10">Built on the platforms enterprises trust</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {["SAP Datasphere", "Snowflake", "Databricks", "BigQuery", "Synapse", "Power BI"].map((name) => (
              <span key={name} className="text-slate-300 font-semibold text-lg tracking-wide hover:text-slate-400 transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ──────────────────────────────────────────── */}
      <section id="capabilities" className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">Our Capabilities</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            From advisory<br />to operationalized data.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mb-16">
            Strategic data governance, SAP-centric warehouse modernization, and a Gen AI layer that makes your data actually usable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-slate-200">
            {capabilities.map((cap, i) => (
              <div
                key={cap.title}
                className={`p-8 border-b border-slate-200 hover:bg-slate-50 transition-colors group
                  ${i % 3 !== 2 ? "lg:border-r" : ""}
                  ${i % 2 !== 1 ? "md:border-r lg:border-r-0" : "md:border-r-0"}
                  ${i % 3 !== 2 ? "lg:border-r border-slate-200" : ""}
                `}
              >
                <div className="text-slate-500 group-hover:text-brand-primary transition-colors mb-5">{cap.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{cap.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{cap.body}</p>
                <Link href="/contact" className="text-sm text-brand-primary border-b border-brand-primary hover:opacity-70 transition-opacity">
                  Learn more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="bg-brand-surface py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">Why Ascelios Data</p>
          <h2 className="text-5xl font-semibold tracking-tight text-white leading-none mb-4">
            SAP-fluent.<br />Cloud-native.
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mb-16">
            We understand the data inside SAP — and the cloud warehouses around it — so migrations preserve meaning, not just rows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/8 border border-white/8 rounded-lg overflow-hidden mb-14">
            {stats.map((s) => (
              <div key={s.number} className="bg-white/4 px-10 py-10">
                <p className="text-5xl font-semibold tracking-tight leading-none mb-3">
                  <span className="text-brand-accent">{s.number}</span>
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {certs.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 border border-white/15 rounded-full px-4 py-2">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7l3.5 3.5L12 3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions ─────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Solutions</p>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Packaged programs for every data move.</h2>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:border-brand-primary hover:text-brand-primary">
                Talk to a data architect
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solutions.map((s) => (
              <div key={s.title} className="bg-white rounded-lg p-8 border border-slate-200 hover:border-brand-primary hover:shadow-md transition-all flex flex-col">
                <span className="inline-flex font-mono text-[11px] uppercase tracking-wide text-brand-primary border border-brand-primary/40 rounded-full px-3 py-1 mb-6 w-fit">
                  {s.badge}
                </span>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm mb-6">{s.desc}</p>
                <hr className="border-slate-200 mb-6" />
                <ul className="space-y-3 flex-1 mb-8">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                      <svg className="shrink-0 mt-0.5 text-slate-900" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact">
                  <Button className="w-full bg-brand-primary hover:bg-brand-accent text-white">
                    Get started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4">Start with a free data assessment.</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Share your BW, warehouse, or analytics landscape. Our data architects will map a migration and modernization path — no commitment required.
        </p>
        <Link href="/contact">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-8">
            Request an Assessment
          </Button>
        </Link>
      </section>
    </>
  );
}
