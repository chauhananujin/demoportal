import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "AI & Analytics" };

const capabilities = [
  {
    title: "AI & Data Strategy",
    body: "Define an enterprise AI and analytics roadmap aligned to outcomes — value cases, data foundations, operating model, and a 12-month investment plan.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 6v4M20 30v4M6 20h4M30 20h4M10 10l3 3M27 27l3 3M30 10l-3 3M13 27l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Generative AI & Agents",
    body: "Design, build, and scale generative AI applications and autonomous agents — grounded in your enterprise data with guardrails, evals, and governance.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 8l2.5 6L29 16l-6.5 2L20 24l-2.5-6L11 16l6.5-2L20 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M30 26l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Predictive & Machine Learning",
    body: "Forecasting, churn, propensity, demand, and risk models — built MLOps-first so they keep performing in production, not just in notebooks.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M6 30l6-8 5 5 7-12 6 9 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="22" r="1.5" fill="currentColor"/>
        <circle cx="17" cy="27" r="1.5" fill="currentColor"/>
        <circle cx="24" cy="15" r="1.5" fill="currentColor"/>
        <circle cx="30" cy="24" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: "Business Intelligence & Visualization",
    body: "Modern BI on Power BI, Tableau, Looker, and SAC — semantic models, self-service governance, and executive dashboards your leaders actually use.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="20" width="4" height="9" fill="currentColor"/>
        <rect x="18" y="14" width="4" height="15" fill="currentColor"/>
        <rect x="25" y="17" width="4" height="12" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: "Customer & Marketing Analytics",
    body: "360° customer view, segmentation, lifetime value, next-best-action, and journey analytics — connected to activation in Salesforce, Adobe, or your CDP.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="15" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 32c1.5-5 5.5-8 11-8s9.5 3 11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="32" cy="10" r="2" fill="currentColor"/>
        <circle cx="8" cy="10" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: "Operations & Supply Chain Analytics",
    body: "Demand forecasting, inventory optimization, predictive maintenance, and digital-twin analytics across plants, logistics, and field operations.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="3" fill="currentColor"/>
        <path d="M20 9v4M20 27v4M9 20h4M27 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Risk, Finance & Compliance Analytics",
    body: "Fraud detection, AML, credit risk, and regulatory reporting analytics — explainable models, audit trails, and bias monitoring for regulated industries.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 6l12 5v9c0 7-5 12-12 14-7-2-12-7-12-14v-9l12-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Data Science Platform & MLOps",
    body: "Engineer the platform behind the models — feature stores, model registries, CI/CD for ML, monitoring, and responsible-AI controls on Databricks, Vertex, or Azure ML.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="6" y="10" width="11" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="23" y="10" width="11" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17 20h6M21 17l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Responsible AI & Governance",
    body: "AI policy, model risk management, bias and toxicity testing, lineage, and EU AI Act / NIST AI RMF readiness — so adoption scales safely.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="10" y="18" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 18v-4a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="20" cy="25" r="2" fill="currentColor"/>
      </svg>
    ),
  },
];

const stats = [
  { number: "3x",    label: "Average ROI within 18 months on production AI use cases delivered with Ascelios" },
  { number: "200+",  label: "Production models and Gen AI assistants deployed across regulated industries" },
  { number: "45 d",  label: "From use case selection to a governed, evaluated AI pilot in production" },
];

const certs = [
  "Databricks Champion Partner",
  "Microsoft AI & ML Specialization",
  "Google Cloud AI/ML Specialization",
  "AWS Machine Learning Competency",
  "SAP Datasphere & Joule Certified",
];

const kgServices = [
  {
    title: "Enterprise Ontology Design",
    body: "Domain-driven ontologies (OWL/SKOS/SHACL) that align finance, supply-chain, customer, and product semantics across SAP, MDM, and operational systems.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="30" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="20" cy="32" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 13l-8 11M20 13l8 11M12 28l7 3M28 28l-7 3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Knowledge Graph Engineering",
    body: "Build, populate, and operate property and RDF graphs on Neo4j, TigerGraph, GraphDB, Stardog, Neptune — with entity resolution and schema evolution baked in.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="8" cy="14" r="2.5" fill="currentColor"/>
        <circle cx="20" cy="8" r="2.5" fill="currentColor"/>
        <circle cx="32" cy="14" r="2.5" fill="currentColor"/>
        <circle cx="14" cy="28" r="2.5" fill="currentColor"/>
        <circle cx="26" cy="28" r="2.5" fill="currentColor"/>
        <path d="M8 14l12-6M20 8l12 6M8 14l6 14M32 14l-6 14M14 28h12M20 8v0" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    title: "Semantic Data Fabric",
    body: "Federated query and virtualization over SAP, lakehouse, and SaaS sources — a single semantic layer with GraphQL/SPARQL endpoints for analytics and AI.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="6" y="8" width="28" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6" y="17" width="28" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6" y="26" width="28" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 14v3M22 14v3M30 14v3M14 23v3M22 23v3M30 23v3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "GraphRAG & Semantic Search",
    body: "Retrieval that reasons — combine vector embeddings with graph traversal so LLM answers cite the right entity, relationship, and document with provenance.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="17" cy="17" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M24 24l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="13" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="20" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="17" cy="20" r="1.5" fill="currentColor"/>
        <path d="M13 14l7 0M13 14l4 6M20 14l-3 6" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    title: "Entity Resolution & Master Graph",
    body: "Probabilistic + rule-based entity resolution across customer, supplier, product, and asset records — collapsing duplicates into a trusted master graph.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="14" cy="20" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="26" cy="20" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 16v8" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Reasoning & Inference",
    body: "OWL reasoners, SHACL validation, and graph algorithms (community, centrality, pathfinding) to surface non-obvious relationships — fraud rings, supply risk, compliance gaps.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 6c-5 0-9 4-9 9 0 3 1.5 5.5 4 7v4h10v-4c2.5-1.5 4-4 4-7 0-5-4-9-9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M15 30h10M16 33h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const solutions = [
  {
    badge: "Discover",
    title: "AI Value Discovery Sprint",
    desc: "A 4-week sprint to identify, prioritize, and business-case the top AI and analytics opportunities across your organization.",
    features: [
      "Use case inventory & scoring",
      "Value, feasibility & risk model",
      "Data readiness assessment",
      "12-month AI roadmap",
    ],
  },
  {
    badge: "Build",
    title: "Generative AI Studio",
    desc: "Stand up a secure Gen AI platform with RAG, agents, and evals — connected to your SAP, CRM, and document repositories.",
    features: [
      "Enterprise-grade LLM gateway",
      "RAG on your enterprise data",
      "Agentic workflows & tool use",
      "Eval, observability & guardrails",
    ],
  },
  {
    badge: "Scale",
    title: "Decision Intelligence Suite",
    desc: "Productionize predictive and prescriptive models with MLOps, monitoring, and embedded decision APIs in your business apps.",
    features: [
      "Feature store & model registry",
      "CI/CD for ML & re-training",
      "Drift, bias & cost monitoring",
      "Embedded decisioning APIs",
    ],
  },
];

const consoleMetrics = [
  { label: "Models in Production",  value: "47",      ok: true },
  { label: "Eval Pass Rate",        value: "98.2%",   ok: true },
  { label: "Tokens / day",          value: "12.4 M",  ok: null },
  { label: "Drift Alerts (24h)",    value: "2",       ok: false },
  { label: "Avg Latency p95",       value: "812 ms",  ok: null },
  { label: "Guardrail Blocks",      value: "143",     ok: true },
];

const alerts = [
  { chip: "DEPLOYED", chipOk: "ok",   text: "Forecast model FCST_EU_Q3 promoted to prod — MAPE 4.2% (target 6%)",     time: "08:46" },
  { chip: "RUNNING",  chipOk: "info", text: "Gen AI assistant ‘FinOps Copilot’ handled 612 sessions today",            time: "11:20" },
  { chip: "WATCH",    chipOk: "warn", text: "Drift detected on churn model v3.1 — feature ‘nps_30d’ shift 0.18",       time: "14:12" },
  { chip: "HEALTHY",  chipOk: "ok",   text: "Responsible AI scan passed for 18/18 deployed models — no bias flags",   time: "14:42" },
];

const chipColors: Record<string, string> = {
  ok:   "bg-green-500/15 text-green-400",
  warn: "bg-yellow-400/15 text-yellow-300",
  info: "bg-brand-primary/20 text-brand-accent",
};

const metricValueColor = (ok: boolean | null) =>
  ok === true ? "text-green-400" : ok === false ? "text-yellow-300" : "text-white";

export default function AIAnalyticsServicesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-brand-accent mb-5">
              AI &amp; Analytics
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white mb-6">
              Turn data into<br />better decisions.
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mb-10">
              Strategy, generative AI, machine learning, and decision intelligence — engineered to run in production, governed end-to-end, and measured in business outcomes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-6">
                  Start an AI Discovery
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
              <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Ascelios — AI Operations Console</span>
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
                {["Databricks", "Vertex AI", "Azure ML", "OpenAI", "Claude"].map((b) => (
                  <span key={b} className="font-mono text-[10px] px-2 py-1 rounded-full border border-white/15 text-slate-500">{b}</span>
                ))}
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                Models operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust logos ───────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-10">Built on the AI platforms enterprises trust</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {["Databricks", "Snowflake", "Azure ML", "Vertex AI", "OpenAI", "Anthropic"].map((name) => (
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
            From strategy<br />to scaled AI in production.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mb-16">
            Nine integrated capabilities that take an AI ambition from a workshop whiteboard to a governed, measurable, value-generating system.
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

      {/* ── Knowledge Graphs & Semantic Technologies ─────────────── */}
      <section id="knowledge-graphs" className="bg-slate-50 py-24 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">Spotlight</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Knowledge Graphs<br />&amp; Semantic Technologies.
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mb-16">
            Connect the dots across SAP, documents, master data, and operational systems — so AI can reason about your enterprise, not just retrieve from it. Ontologies, RDF/property graphs, GraphRAG, and inference engines, productionized.
          </p>

          {/* Service tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {kgServices.map((s) => (
              <div key={s.title} className="bg-white rounded-lg border border-slate-200 p-6 hover:border-brand-primary hover:shadow-md transition-all group">
                <div className="text-brand-primary mb-4">{s.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          {/* Architecture diagrams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Diagram 1 — Knowledge Graph Reference Architecture */}
            <figure className="bg-white rounded-xl border border-slate-200 p-6">
              <figcaption className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400 mb-1">Reference Architecture</p>
                <h3 className="text-lg font-semibold text-slate-900">Enterprise Knowledge Graph</h3>
              </figcaption>
              <svg viewBox="0 0 640 360" className="w-full h-auto" role="img" aria-label="Enterprise knowledge graph architecture diagram">
                <defs>
                  <marker id="kg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
                  </marker>
                  <linearGradient id="kg-band" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0EA5A1" stopOpacity="0.12"/>
                    <stop offset="100%" stopColor="#0EA5A1" stopOpacity="0.02"/>
                  </linearGradient>
                </defs>

                {/* Lane 1 — Sources */}
                <text x="20" y="22" fontFamily="ui-monospace,monospace" fontSize="10" fill="#94a3b8" letterSpacing="1">SOURCES</text>
                {["SAP S/4HANA", "MDM / MDG", "Documents", "Data Lake", "SaaS APIs"].map((s, i) => (
                  <g key={s}>
                    <rect x="20" y={40 + i * 50} width="120" height="36" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
                    <text x="80" y={62 + i * 50} fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f172a" textAnchor="middle">{s}</text>
                  </g>
                ))}

                {/* Lane 2 — Ingest & Map */}
                <text x="170" y="22" fontFamily="ui-monospace,monospace" fontSize="10" fill="#94a3b8" letterSpacing="1">INGEST &amp; MAP</text>
                <rect x="170" y="40" width="130" height="266" rx="8" fill="url(#kg-band)" stroke="#a5e0de"/>
                <text x="235" y="62" fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="600">R2RML / RML</text>
                <text x="235" y="82" fontFamily="Inter,system-ui,sans-serif" fontSize="10" fill="#475569" textAnchor="middle">Source-to-ontology mapping</text>
                <line x1="180" y1="98" x2="290" y2="98" stroke="#cbd5e1"/>
                <text x="235" y="120" fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="600">Entity Resolution</text>
                <text x="235" y="138" fontFamily="Inter,system-ui,sans-serif" fontSize="10" fill="#475569" textAnchor="middle">Dedup &amp; linking</text>
                <line x1="180" y1="154" x2="290" y2="154" stroke="#cbd5e1"/>
                <text x="235" y="176" fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="600">NLP Extraction</text>
                <text x="235" y="194" fontFamily="Inter,system-ui,sans-serif" fontSize="10" fill="#475569" textAnchor="middle">Entities &amp; relations</text>
                <line x1="180" y1="210" x2="290" y2="210" stroke="#cbd5e1"/>
                <text x="235" y="232" fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="600">SHACL Validation</text>
                <text x="235" y="250" fontFamily="Inter,system-ui,sans-serif" fontSize="10" fill="#475569" textAnchor="middle">Shapes &amp; quality</text>
                <line x1="180" y1="266" x2="290" y2="266" stroke="#cbd5e1"/>
                <text x="235" y="288" fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="600">Provenance</text>

                {/* Lane 3 — Graph + Ontology */}
                <text x="330" y="22" fontFamily="ui-monospace,monospace" fontSize="10" fill="#94a3b8" letterSpacing="1">GRAPH PLATFORM</text>
                <rect x="330" y="40" width="150" height="160" rx="10" fill="#0EA5A1" fillOpacity="0.08" stroke="#0EA5A1" strokeOpacity="0.5"/>
                <text x="405" y="62" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fill="#0f172a" textAnchor="middle" fontWeight="600">Knowledge Graph</text>
                {/* Tiny graph */}
                <g transform="translate(345 78)">
                  <circle cx="20" cy="20" r="6" fill="#0EA5A1"/>
                  <circle cx="60" cy="14" r="6" fill="#0EA5A1"/>
                  <circle cx="100" cy="26" r="6" fill="#0EA5A1"/>
                  <circle cx="32" cy="60" r="6" fill="#0EA5A1"/>
                  <circle cx="78" cy="64" r="6" fill="#0EA5A1"/>
                  <circle cx="110" cy="80" r="6" fill="#0EA5A1"/>
                  <path d="M20 20l40-6M60 14l40 12M20 20l12 40M60 14l18 50M100 26l-22 38M78 64l32 16M32 60l46 4" stroke="#0EA5A1" strokeWidth="1.2" fill="none"/>
                </g>
                <text x="405" y="178" fontFamily="ui-monospace,monospace" fontSize="10" fill="#475569" textAnchor="middle">Neo4j · GraphDB · Neptune</text>

                <rect x="330" y="216" width="150" height="44" rx="8" fill="#fff" stroke="#cbd5e1"/>
                <text x="405" y="234" fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="600">Ontology Layer</text>
                <text x="405" y="250" fontFamily="ui-monospace,monospace" fontSize="10" fill="#64748b" textAnchor="middle">OWL · SKOS · SHACL</text>

                <rect x="330" y="270" width="150" height="36" rx="8" fill="#fff" stroke="#cbd5e1"/>
                <text x="405" y="293" fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="600">Reasoner &amp; Inference</text>

                {/* Lane 4 — Consumption */}
                <text x="510" y="22" fontFamily="ui-monospace,monospace" fontSize="10" fill="#94a3b8" letterSpacing="1">CONSUMPTION</text>
                {[
                  ["SPARQL / Cypher", "Query"],
                  ["GraphQL API", "Apps"],
                  ["GraphRAG", "Gen AI"],
                  ["BI &amp; Analytics", "Dashboards"],
                  ["Embeddings", "ML"],
                ].map(([label, sub], i) => (
                  <g key={label}>
                    <rect x="510" y={40 + i * 50} width="120" height="36" rx="6" fill="#fff" stroke="#cbd5e1"/>
                    <text x="570" y={58 + i * 50} fontFamily="Inter,system-ui,sans-serif" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="600">{label}</text>
                    <text x="570" y={72 + i * 50} fontFamily="ui-monospace,monospace" fontSize="9" fill="#64748b" textAnchor="middle">{sub}</text>
                  </g>
                ))}

                {/* Arrows */}
                <line x1="140" y1="170" x2="170" y2="170" stroke="#475569" strokeWidth="1.2" markerEnd="url(#kg-arrow)"/>
                <line x1="300" y1="170" x2="330" y2="170" stroke="#475569" strokeWidth="1.2" markerEnd="url(#kg-arrow)"/>
                <line x1="480" y1="170" x2="510" y2="170" stroke="#475569" strokeWidth="1.2" markerEnd="url(#kg-arrow)"/>

                {/* Governance band */}
                <rect x="20" y="324" width="610" height="26" rx="6" fill="#0f172a"/>
                <text x="325" y="341" fontFamily="ui-monospace,monospace" fontSize="11" fill="#94a3b8" textAnchor="middle" letterSpacing="1">GOVERNANCE · LINEAGE · ACCESS CONTROL · CATALOG</text>
              </svg>
            </figure>

            {/* Diagram 2 — GraphRAG Pattern */}
            <figure className="bg-white rounded-xl border border-slate-200 p-6">
              <figcaption className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400 mb-1">Pattern</p>
                <h3 className="text-lg font-semibold text-slate-900">GraphRAG: grounded, citable answers</h3>
              </figcaption>
              <svg viewBox="0 0 640 360" className="w-full h-auto" role="img" aria-label="GraphRAG architecture diagram">
                <defs>
                  <marker id="gr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
                  </marker>
                </defs>

                {/* User */}
                <rect x="20" y="160" width="110" height="50" rx="8" fill="#0f172a"/>
                <text x="75" y="182" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="600">User Question</text>
                <text x="75" y="200" fontFamily="ui-monospace,monospace" fontSize="10" fill="#94a3b8" textAnchor="middle">natural language</text>

                {/* Orchestrator */}
                <rect x="170" y="140" width="140" height="90" rx="10" fill="#0EA5A1" fillOpacity="0.1" stroke="#0EA5A1"/>
                <text x="240" y="166" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fill="#0f172a" textAnchor="middle" fontWeight="700">Orchestrator</text>
                <text x="240" y="186" fontFamily="ui-monospace,monospace" fontSize="10" fill="#475569" textAnchor="middle">intent → plan</text>
                <text x="240" y="204" fontFamily="ui-monospace,monospace" fontSize="10" fill="#475569" textAnchor="middle">rewrite + decompose</text>
                <text x="240" y="222" fontFamily="ui-monospace,monospace" fontSize="10" fill="#475569" textAnchor="middle">guardrails</text>

                {/* Retrieval — vector */}
                <rect x="350" y="40" width="160" height="70" rx="8" fill="#fff" stroke="#cbd5e1"/>
                <text x="430" y="62" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fill="#0f172a" textAnchor="middle" fontWeight="600">Vector Retrieval</text>
                <text x="430" y="80" fontFamily="ui-monospace,monospace" fontSize="10" fill="#64748b" textAnchor="middle">semantic chunks</text>
                <text x="430" y="96" fontFamily="ui-monospace,monospace" fontSize="10" fill="#64748b" textAnchor="middle">pgvector · Qdrant</text>

                {/* Retrieval — graph */}
                <rect x="350" y="140" width="160" height="90" rx="8" fill="#fff" stroke="#cbd5e1"/>
                <text x="430" y="162" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fill="#0f172a" textAnchor="middle" fontWeight="600">Graph Traversal</text>
                <text x="430" y="180" fontFamily="ui-monospace,monospace" fontSize="10" fill="#64748b" textAnchor="middle">SPARQL / Cypher</text>
                {/* mini graph */}
                <g transform="translate(370 188)">
                  <circle cx="10" cy="15" r="4" fill="#0EA5A1"/>
                  <circle cx="55" cy="8" r="4" fill="#0EA5A1"/>
                  <circle cx="95" cy="22" r="4" fill="#0EA5A1"/>
                  <circle cx="40" cy="34" r="4" fill="#0EA5A1"/>
                  <path d="M10 15l45-7M55 8l40 14M10 15l30 19M55 8l-15 26M95 22l-55 12" stroke="#0EA5A1" strokeWidth="1" fill="none"/>
                </g>

                {/* Reasoner */}
                <rect x="350" y="260" width="160" height="70" rx="8" fill="#fff" stroke="#cbd5e1"/>
                <text x="430" y="282" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fill="#0f172a" textAnchor="middle" fontWeight="600">Reasoner</text>
                <text x="430" y="300" fontFamily="ui-monospace,monospace" fontSize="10" fill="#64748b" textAnchor="middle">OWL · rules · paths</text>
                <text x="430" y="316" fontFamily="ui-monospace,monospace" fontSize="10" fill="#64748b" textAnchor="middle">policy &amp; ACL</text>

                {/* LLM */}
                <rect x="540" y="140" width="80" height="90" rx="10" fill="#0f172a"/>
                <text x="580" y="178" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fill="#fff" textAnchor="middle" fontWeight="700">LLM</text>
                <text x="580" y="198" fontFamily="ui-monospace,monospace" fontSize="9" fill="#94a3b8" textAnchor="middle">Claude</text>
                <text x="580" y="212" fontFamily="ui-monospace,monospace" fontSize="9" fill="#94a3b8" textAnchor="middle">GPT · Gemini</text>

                {/* Answer */}
                <rect x="490" y="266" width="130" height="60" rx="8" fill="#0EA5A1"/>
                <text x="555" y="288" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">Cited Answer</text>
                <text x="555" y="306" fontFamily="ui-monospace,monospace" fontSize="10" fill="#e0f2f1" textAnchor="middle">+ provenance</text>

                {/* Arrows */}
                <line x1="130" y1="185" x2="170" y2="185" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)"/>
                <line x1="310" y1="170" x2="350" y2="75" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)" fill="none"/>
                <line x1="310" y1="185" x2="350" y2="185" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)"/>
                <line x1="310" y1="200" x2="350" y2="295" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)" fill="none"/>
                <line x1="510" y1="75" x2="555" y2="140" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)" fill="none"/>
                <line x1="510" y1="185" x2="540" y2="185" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)"/>
                <line x1="510" y1="295" x2="555" y2="266" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)" fill="none"/>
                <line x1="580" y1="230" x2="555" y2="266" stroke="#475569" strokeWidth="1.2" markerEnd="url(#gr-arrow)" fill="none"/>
              </svg>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Vector retrieval finds the right passages; graph traversal finds the right <em>entities and relationships</em>. The reasoner enforces policy and follows paths. The LLM composes — and every claim links back to a graph node or document.
              </p>
            </figure>
          </div>

          {/* Use cases strip */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              ["Customer 360", "Unify customers across SAP, CRM, support, and product telemetry into a single resolvable identity graph."],
              ["Supply Chain Risk", "Trace tier-1 → tier-N suppliers, parts, and geographies to surface disruption and concentration risk."],
              ["Financial Crime", "Detect rings of related entities across accounts, transactions, and beneficial ownership."],
              ["Regulatory Reasoning", "Map controls, obligations, and evidence — answer auditor questions with traceable citations."],
            ].map(([t, b]) => (
              <div key={t} className="bg-white border border-slate-200 rounded-lg p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-primary mb-2">Use case</p>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">{t}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="bg-brand-surface py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">Why Ascelios AI</p>
          <h2 className="text-5xl font-semibold tracking-tight text-white leading-none mb-4">
            Outcomes-first.<br />Responsibly delivered.
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mb-16">
            We pair business strategists with data scientists and MLOps engineers — so every model we ship is tied to a P&amp;L line and a control framework.
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
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Packaged programs for every AI move.</h2>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:border-brand-primary hover:text-brand-primary">
                Talk to an AI architect
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
        <h2 className="text-3xl font-semibold text-white mb-4">Start with a free AI value discovery.</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Tell us where you want AI to move the needle. Our AI strategists and engineers will return a prioritized roadmap and a first pilot scoped — no commitment required.
        </p>
        <Link href="/contact">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-8">
            Request a Discovery
          </Button>
        </Link>
      </section>
    </>
  );
}
