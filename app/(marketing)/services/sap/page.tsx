import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "SAP Services" };

const metrics = [
  { label: "System Availability", value: "99.97%", ok: true },
  { label: "HANA DB Response",    value: "42 ms",  ok: true },
  { label: "Active Instances",    value: "48",     ok: null },
  { label: "Batch Jobs Today",    value: "1,284",  ok: null },
  { label: "Critical Alerts",     value: "0",      ok: true },
  { label: "Transport Queue",     value: "12",     ok: false },
];

const alerts = [
  { chip: "RESOLVED",  chipOk: "ok",   text: "S/4HANA production system patched — Kernel 7.93 applied",                time: "09:14" },
  { chip: "SCHEDULED", chipOk: "info", text: "System copy for QA refresh — PRD → QAS — planned 22:00",                time: "14:00" },
  { chip: "WATCH",     chipOk: "warn", text: "Transport queue backlog — 12 requests pending import to PRD",            time: "14:38" },
  { chip: "HEALTHY",   chipOk: "ok",   text: "HANA memory utilization 61% — within threshold on all nodes",           time: "14:42" },
];

const capabilities = [
  {
    title: "SAP Basis Administration",
    body: "Complete system administration for SAP ECC, S/4HANA, and NetWeaver — covering installation, configuration, transport management, and kernel upgrades.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13 20h14M13 14h8M13 26h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "SAP HANA Management",
    body: "In-memory database administration including performance tuning, backup strategies, scale-out configurations, and multi-tenant database container management.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <ellipse cx="20" cy="14" rx="12" ry="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 14v6c0 2.76 5.37 5 12 5s12-2.24 12-5v-6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 20v6c0 2.76 5.37 5 12 5s12-2.24 12-5v-6" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Cloud Migration",
    body: "Lift-and-shift, re-platform, and RISE with SAP migration programs on AWS, Azure, and Google Cloud — with brownfield and greenfield paths available.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 28c0-5.52 3.58-10 8-10s8 4.48 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="28" cy="16" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M25 16h6M28 13v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Performance Optimization",
    body: "End-to-end analysis of system bottlenecks — ABAP workload, database query tuning, buffer optimization, and infrastructure right-sizing for peak performance.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 8v6M20 26v6M8 20h6M26 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: "Security & Compliance",
    body: "SAP authorization concept design, role management, SoD conflict resolution, GDPR data masking, and audit-ready compliance documentation for regulated industries.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 8l10 5v10l-10 5-10-5V13l10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M20 28v-9M14 11.5l6 3 6-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "24/7 Monitoring",
    body: "Round-the-clock proactive system monitoring with automated alerting, escalation workflows, and a dedicated response team with <2-hour SLA on critical issues.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 14v6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const stats = [
  { number: "99.9%",  label: "Guaranteed system uptime across all managed SAP landscapes" },
  { number: "<2hr",   label: "Critical incident response SLA — 24 hours a day, 365 days a year" },
  { number: "500+",   label: "Successful SAP migrations and cloud transformations delivered" },
];

const certs = [
  "SAP Certified Technology Associate",
  "AWS Advanced Partner",
  "Microsoft Azure SAP Partner",
  "ISO 27001 Certified",
  "RISE with SAP Authorized",
];

const solutions = [
  {
    badge: "Managed Services",
    title: "SAP Managed Services",
    desc: "A fully managed operational model for your entire SAP landscape — from Basis to application layer.",
    features: [
      "24/7 proactive system monitoring",
      "Monthly patching & kernel updates",
      "Transport management & CTS+",
      "Dedicated senior Basis engineer",
    ],
  },
  {
    badge: "Cloud Infrastructure",
    title: "Cloud Infrastructure",
    desc: "SAP-certified cloud environments on AWS, Azure, and GCP — architected for performance, resilience, and cost efficiency.",
    features: [
      "Infrastructure-as-Code with Terraform",
      "SAP HANA Large Instance & VMs",
      "Auto-scaling & reserved capacity",
      "FinOps cost optimization reviews",
    ],
  },
  {
    badge: "Business Continuity",
    title: "Disaster Recovery",
    desc: "End-to-end backup, recovery, and high-availability architecture so your SAP systems survive — and recover — from anything.",
    features: [
      "HANA System Replication (HSR)",
      "Pacemaker HA cluster configuration",
      "Automated backup validation & testing",
      "RPO < 15 min · RTO < 1 hour",
    ],
  },
];

const chipColors: Record<string, string> = {
  ok:   "bg-green-500/15 text-green-400",
  warn: "bg-yellow-400/15 text-yellow-300",
  info: "bg-brand-primary/20 text-brand-accent",
};

const metricValueColor = (ok: boolean | null) =>
  ok === true ? "text-green-400" : ok === false ? "text-yellow-300" : "text-white";

export default function SapServicesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-brand-accent mb-5">
              SAP Basis &amp; Cloud Support
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white mb-6">
              Enterprise SAP.<br />Expertly Managed.
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mb-10">
              End-to-end SAP Basis administration, HANA database management, and cloud migration — delivered by certified architects with zero-compromise reliability.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-6">
                  Request a Free Assessment
                </Button>
              </Link>
              <Link href="#capabilities" className="text-slate-400 hover:text-white text-sm border-b border-slate-600 hover:border-white transition-colors self-center pb-px">
                Explore services →
              </Link>
            </div>
          </div>

          {/* Right: SAP Console Mockup */}
          <div className="rounded-xl border border-brand-surface bg-brand-surface/60 backdrop-blur p-6">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Ascelios — System Monitor</span>
              <span className="font-mono text-[11px] text-slate-600">14:42:07 UTC</span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {metrics.map((m) => (
                <div key={m.label} className="bg-white/5 border border-white/8 rounded-lg p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500 mb-1">{m.label}</p>
                  <p className={`text-xl font-semibold leading-none ${metricValueColor(m.ok)}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Alert rows */}
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

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/6">
              <div className="flex gap-2 flex-wrap">
                {["S/4HANA 2023", "BTP", "AWS", "Azure", "RISE"].map((b) => (
                  <span key={b} className="font-mono text-[10px] px-2 py-1 rounded-full border border-white/15 text-slate-500">{b}</span>
                ))}
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust logos ───────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-10">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {["SAP", "AWS", "Microsoft Azure", "Google Cloud", "IBM", "Deloitte"].map((name) => (
              <span key={name} className="text-slate-300 font-semibold text-lg tracking-wide hover:text-slate-400 transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ──────────────────────────────────────────── */}
      <section id="capabilities" className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">Our Services</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Everything SAP demands,<br />always delivered.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mb-16">
            From day-one Basis setup to 24/7 production monitoring — our certified engineers handle every layer of your SAP landscape.
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

      {/* ── Stats / Why Ascelios SAP ──────────────────────────────── */}
      <section className="bg-brand-surface py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">Why Ascelios</p>
          <h2 className="text-5xl font-semibold tracking-tight text-white leading-none mb-4">
            Zero-downtime migrations.<br />Certified expertise.
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mb-16">
            Our delivery model is built around continuity — every migration, upgrade, and patching cycle is engineered so your business never stops.
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
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Tailored for every SAP challenge.</h2>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:border-brand-primary hover:text-brand-primary">
                View all solutions
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
        <h2 className="text-3xl font-semibold text-white mb-4">Start with a free SAP assessment.</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Tell us about your SAP landscape. Our architects will map a path to reduce complexity and improve performance — no commitment required.
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
