import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "SAP BTP Services" };

const services = [
  {
    badge: "Strategy",
    title: "BTP Advisory Services",
    points: [
      "Platform capability assessment",
      "Extension vs. clean-core analysis",
      "Integration architecture design",
      "Technology roadmap planning",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    badge: "Accelerate",
    title: "SAP BTP Starter Pack",
    points: [
      "Rapid BTP environment setup",
      "Pre-built integration templates",
      "Developer enablement workshops",
      "First use-case in 30 days",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    badge: "Migration",
    title: "SAP PI/PO Migration",
    points: [
      "Full PI/PO interface inventory",
      "Automated iFlow generation",
      "CPI / IS performance validation",
      "Cutover & hypercare support",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h12M12 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="6" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    badge: "Modernize",
    title: "SAP BW Migration",
    points: [
      "BW/4HANA system conversion",
      "InfoProvider redesign & clean-up",
      "BEx to SAC migration",
      "Performance & TCO optimization",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 6h8M8 18h8M6 8v8M18 8v8" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

const pillars = [
  {
    title: "Clean Core, Composable Extensions",
    body: "Build ABAP RAP, CAP, or Kyma side-by-side extensions that keep your S/4HANA core upgrade-safe and ready for RISE.",
  },
  {
    title: "Integration Suite — Beyond PI/PO",
    body: "Migrate from PI/PO to SAP Integration Suite with auto-converted iFlows, API governance, and event-driven patterns.",
  },
  {
    title: "Build & Automation",
    body: "Low-code apps with SAP Build, process automation with Build Process Automation, and Work Zone for business-grade UX.",
  },
  {
    title: "AI & Joule on BTP",
    body: "Govern generative AI on BTP — Joule, AI Foundation, and grounded RAG patterns that respect SAP authorizations.",
  },
];

const stats = [
  { number: "30 d",  label: "From discovery to first production-grade BTP use case in flight" },
  { number: "70%",   label: "Average effort reduction migrating PI/PO interfaces to Integration Suite" },
  { number: "100%",  label: "Clean-core compliant — every extension reviewed against SAP guardrails" },
];

const certs = [
  "SAP Build Certified",
  "SAP Integration Suite Specialization",
  "SAP BTP Solution Architect",
  "SAP CAP Developer",
  "SAP Joule Partner",
];

const consoleMetrics = [
  { label: "BTP Subaccounts",     value: "12",      ok: null },
  { label: "iFlows Healthy",      value: "248/250", ok: true },
  { label: "API Calls / day",     value: "8.4 M",   ok: null },
  { label: "Extension Apps",      value: "34",      ok: null },
  { label: "Failed Integrations", value: "2",       ok: false },
  { label: "Joule Sessions",      value: "1,128",   ok: true },
];

const alerts = [
  { chip: "DEPLOYED",  chipOk: "ok",   text: "CAP service vendor-portal-v2 deployed to BTP Kyma — prod traffic ramped", time: "09:02" },
  { chip: "SCHEDULED", chipOk: "info", text: "PI/PO interface ZHR_EMP_REPL automated cut-over — Friday 22:00 UTC",      time: "11:45" },
  { chip: "WATCH",     chipOk: "warn", text: "iFlow CPI_S4_FI_POSTING retry rate above threshold — 4 retries / hour",    time: "14:18" },
  { chip: "HEALTHY",   chipOk: "ok",   text: "Joule on BTP answered 1,128 grounded queries — zero auth violations",     time: "14:42" },
];

const chipColors: Record<string, string> = {
  ok:   "bg-green-500/15 text-green-400",
  warn: "bg-yellow-400/15 text-yellow-300",
  info: "bg-brand-primary/20 text-brand-accent",
};

const metricValueColor = (ok: boolean | null) =>
  ok === true ? "text-green-400" : ok === false ? "text-yellow-300" : "text-white";

export default function BtpServicesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-brand-accent mb-5">
              SAP Business Technology Platform
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white mb-6">
              Extend, integrate,<br />and innovate on BTP.
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mb-10">
              Build clean, composable extensions on SAP BTP without compromising your core ERP — from advisory and starter packs to PI/PO and BW modernization.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-6">
                  Plan Your BTP Roadmap
                </Button>
              </Link>
              <Link href="#services" className="text-slate-400 hover:text-white text-sm border-b border-slate-600 hover:border-white transition-colors self-center pb-px">
                Explore services →
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
              <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Ascelios — BTP Operations</span>
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
                {["Integration Suite", "CAP", "Kyma", "Build", "Joule"].map((b) => (
                  <span key={b} className="font-mono text-[10px] px-2 py-1 rounded-full border border-white/15 text-slate-500">{b}</span>
                ))}
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                Platform operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust logos ───────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-10">Native to the SAP BTP ecosystem</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {["Integration Suite", "CAP", "Build", "Kyma", "Joule", "Datasphere"].map((name) => (
              <span key={name} className="text-slate-300 font-semibold text-lg tracking-wide hover:text-slate-400 transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── BTP Services ──────────────────────────────────────────── */}
      <section id="services" className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">BTP Services</p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
              Advisory, accelerators,<br />and modernization moves.
            </h2>
            <p className="text-slate-500 text-lg max-w-sm">
              Four packaged services that take you from BTP strategy to a production-grade extension landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <div key={s.title} className="group rounded-2xl p-6 border border-slate-200 hover:border-brand-primary/40 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/20 transition-colors">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-mono tracking-wider text-brand-primary/70 uppercase border border-brand-primary/30 px-2 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-4 leading-snug">{s.title}</h3>
                <ul className="flex flex-col gap-2">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-[12.5px] text-slate-500">
                      <span className="text-brand-primary/60 mt-0.5 flex-shrink-0">›</span>{pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars / Why BTP ─────────────────────────────────────── */}
      <section className="bg-brand-surface py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">Why Ascelios on BTP</p>
          <h2 className="text-5xl font-semibold tracking-tight text-white leading-none mb-4">
            Clean core.<br />Composable everything.
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mb-16">
            Every extension we build is RISE-ready and upgrade-safe — no more custom code blocking your next S/4HANA release.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white/4 border border-white/8 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.body}</p>
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

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4">Lock in your BTP roadmap.</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Share your current extension and integration landscape. Our BTP architects will design a clean-core path — and your first use case in 30 days.
        </p>
        <Link href="/contact">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-8">
            Talk to a BTP Architect
          </Button>
        </Link>
      </section>
    </>
  );
}
