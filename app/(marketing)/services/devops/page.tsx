import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "DevOps as a Service" };

const pillars = [
  { id: "day1",      label: "Day 1 — Setup & Automation" },
  { id: "day2",      label: "Day 2 — Managed Operations" },
  { id: "devsecops", label: "DevSecOps" },
];

const day1Services = [
  {
    title: "CI/CD Pipeline Implementation",
    body: "We design and implement continuous integration and delivery pipelines tailored to your stack — automating builds, tests, and deployments so your team ships faster with fewer manual steps.",
    tools: ["GitHub Actions", "GitLab CI", "AWS CodePipeline", "Azure Pipelines"],
  },
  {
    title: "Infrastructure as Code",
    body: "We codify your entire cloud infrastructure using Terraform and cloud-native IaC tools — making environments reproducible, version-controlled, and deployable in minutes instead of days.",
    tools: ["Terraform", "AWS CDK", "Pulumi", "Bicep"],
  },
  {
    title: "Monitoring & Observability Setup",
    body: "We establish metrics collection, distributed tracing, and log aggregation from day one — giving your team full visibility into system health, performance bottlenecks, and error rates across every service.",
    tools: ["Prometheus", "Grafana", "Datadog", "OpenTelemetry"],
  },
  {
    title: "Container & Kubernetes Orchestration",
    body: "We containerize your applications and configure Kubernetes clusters — handling namespacing, RBAC, auto-scaling, and networking so your services run reliably at any scale.",
    tools: ["Kubernetes", "Docker", "Helm", "EKS / AKS / GKE"],
  },
];

const day2Services = [
  {
    title: "24/7 On-Call & Incident Response",
    body: "Our engineers are on rotation around the clock. With aggressive SLA targets and battle-tested runbooks, we respond to incidents fast — minimizing downtime and protecting your customers' experience.",
  },
  {
    title: "Reliability Engineering (SRE)",
    body: "We define and track SLOs, manage error budgets, and run post-mortems that actually drive change. Our SRE practice shifts the team from firefighting to building for long-term reliability.",
  },
  {
    title: "Backup, Recovery & Business Continuity",
    body: "We automate backup schedules, validate restores regularly, and document recovery procedures so that when the unexpected happens, recovery is a drill — not a crisis.",
  },
  {
    title: "FinOps & Cost Optimization",
    body: "We continuously right-size workloads, identify idle resources, and implement spend governance policies — turning cloud bills from a surprise into a managed, predictable line item.",
  },
];

const devSecOpsItems = [
  {
    title: "Static Analysis & Dependency Scanning",
    body: "Security gates built directly into every pipeline — SAST, SCA, and container image scanning run automatically on every commit, so vulnerabilities are caught before they reach production.",
  },
  {
    title: "Secrets Management",
    body: "We remove hardcoded secrets from codebases and implement centralized secrets management using Vault or cloud-native services — with automated rotation and least-privilege access policies.",
  },
  {
    title: "Infrastructure Security Auditing",
    body: "We assess your cloud configuration against CIS benchmarks and compliance frameworks (SOC 2, ISO 27001, GDPR), producing actionable remediation plans and automating controls where possible.",
  },
  {
    title: "Compliance by Default",
    body: "Policy-as-code enforcement with tools like OPA and Sentinel means compliance checks run in the pipeline, not as a quarterly audit — giving you continuous, auditable evidence of adherence.",
  },
];

const benefits = [
  {
    icon: "⚡",
    title: "Faster time-to-market",
    body: "Ready-made pipelines and expert configuration get you shipping in days, not months. No hiring cycle, no months of toolchain buildout.",
  },
  {
    icon: "💰",
    title: "Lower cost than in-house",
    body: "Subscribe to the capability you need today. No full-time salaries, no tooling licenses, no on-call burnout tax. Scale spend up or down as projects change.",
  },
  {
    icon: "🎯",
    title: "Focus on your product",
    body: "Hand off CI servers, Kubernetes clusters, and 3am pages to engineers who do this every day. Your team focuses on features, not infrastructure.",
  },
  {
    icon: "🔒",
    title: "Security built in, not bolted on",
    body: "DevSecOps practices embedded from day one — automated scanning, secrets management, and compliance controls running in every pipeline.",
  },
  {
    icon: "📈",
    title: "Scales with you",
    body: "Whether you're a startup moving fast or an enterprise with hundreds of services, we adjust the scope to fit — platform engineering for your stage.",
  },
  {
    icon: "🛡️",
    title: "Always up to date",
    body: "We keep your toolchain current — security patches, version upgrades, and best-practice evolutions applied continuously, not at your next sprint.",
  },
];

const toolchain = [
  { category: "CI/CD",              tools: ["GitHub Actions", "GitLab CI", "Azure Pipelines", "AWS CodePipeline"] },
  { category: "Infrastructure",     tools: ["Terraform", "Pulumi", "AWS CDK", "Bicep"] },
  { category: "Containers",         tools: ["Kubernetes", "Docker", "Helm", "Istio"] },
  { category: "Cloud Platforms",    tools: ["AWS", "Azure", "Google Cloud"] },
  { category: "Observability",      tools: ["Prometheus", "Grafana", "Datadog", "OpenTelemetry"] },
  { category: "Security",           tools: ["Vault", "Snyk", "OPA", "Trivy"] },
];

const stats = [
  { value: "100+", label: "Companies running on our DevOps platform" },
  { value: "50+",  label: "Certified DevOps engineers" },
  { value: "24/7", label: "On-call coverage, zero gaps" },
  { value: "Day 1", label: "Pipeline live — typical onboarding time" },
];

export default function DevOpsPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs tracking-widest uppercase text-brand-accent mb-5">
            DevOps as a Service
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white max-w-3xl mb-6">
            DevOps capabilities.<br />On demand.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-6">
            Access the tools, pipelines, and expert engineers of a world-class DevOps practice — without hiring a full team or maintaining complex in-house infrastructure. We implement, automate, and operate your entire delivery platform as a managed service.
          </p>
          <p className="text-slate-500 text-sm max-w-xl mb-10">
            From CI/CD setup and Infrastructure as Code on Day 1 to 24/7 on-call, SRE, and FinOps on Day 2 — subscribe to the DevOps capability you need, right now.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact">
              <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-6">
                Get started
              </Button>
            </Link>
            <Link href="#day1" className="text-slate-400 hover:text-white text-sm border-b border-slate-600 hover:border-white transition-colors self-center pb-px">
              See what&apos;s included →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pillar nav ────────────────────────────────────────────── */}
      <nav className="sticky top-16 z-30 bg-brand-bg border-b border-brand-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {pillars.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="shrink-0 px-6 py-4 text-sm text-slate-400 hover:text-white border-b-2 border-transparent hover:border-brand-accent transition-colors whitespace-nowrap"
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Day 1 ─────────────────────────────────────────────────── */}
      <section id="day1" className="bg-white py-24 px-6 scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Day 1</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Setup &amp; Automation
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mb-14">
            We hit the ground running — implementing CI/CD pipelines, Infrastructure as Code, monitoring, and container orchestration from day one.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {day1Services.map((s) => (
              <div key={s.title} className="border border-slate-200 rounded-lg p-8 hover:border-brand-primary hover:shadow-md transition-all group">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-brand-primary transition-colors mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{s.body}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tools.map((t) => (
                    <span key={t} className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Day 2 ─────────────────────────────────────────────────── */}
      <section id="day2" className="bg-brand-surface py-24 px-6 scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">Day 2</p>
          <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
            Managed Operations
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mb-14">
            Once the platform is live, we own the ongoing operations — reliability, cost, incidents, and recovery — so your team stays focused on building.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {day2Services.map((s) => (
              <div key={s.title} className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-brand-accent/40 transition-colors group">
                <h3 className="text-xl font-semibold text-white group-hover:text-brand-accent transition-colors mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DevSecOps ─────────────────────────────────────────────── */}
      <section id="devsecops" className="bg-slate-50 py-24 px-6 scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">DevSecOps</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Security built in, not bolted on.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mb-14">
            We embed security controls, compliance checks, and secrets management directly into every pipeline — so security keeps pace with development velocity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devSecOpsItems.map((s) => (
              <div key={s.title} className="bg-white border border-slate-200 rounded-lg p-8 hover:border-brand-primary hover:shadow-md transition-all group">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-brand-primary transition-colors mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Toolchain ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-10 text-center">Toolchain we work with</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {toolchain.map((group) => (
              <div key={group.category}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3">{group.category}</p>
                <ul className="space-y-2">
                  {group.tools.map((t) => (
                    <li key={t} className="text-sm text-slate-700 font-medium">{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">Why DevOps as a Service</p>
          <h2 className="text-4xl font-semibold tracking-tight text-white mb-14">
            The advantages are clear.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-brand-surface border border-brand-surface hover:border-brand-primary rounded-xl p-6 transition-colors">
                <span className="text-2xl mb-4 block">{b.icon}</span>
                <h3 className="text-white font-semibold mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="bg-brand-surface py-0 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8 border-x border-white/8">
            {stats.map((s) => (
              <div key={s.label} className="px-8 py-14 text-center">
                <p className="text-4xl font-semibold tracking-tight text-brand-accent mb-2">{s.value}</p>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4">Ready to hand off your DevOps?</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Tell us about your current setup. We&apos;ll put together a tailored Day 1 plan and have your first pipeline running within the week.
        </p>
        <Link href="/contact">
          <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-8">
            Get in touch
          </Button>
        </Link>
      </section>
    </>
  );
}
