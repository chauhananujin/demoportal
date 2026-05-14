import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Cloud Services" };

const pillars = [
  { id: "assessment",     label: "Cloud Assessment" },
  { id: "technology",     label: "Cloud Technology" },
  { id: "managed",        label: "Cloud Managed Services" },
];

const assessmentServices = [
  {
    title: "Cloud Assessment & Optimization",
    body: "We evaluate and optimize your cloud investments using advanced tools and methodologies to get a clear picture of your cloud landscape — covering cost efficiency, performance, security, and compliance. Whether you are starting your cloud journey or refining an existing setup, we deliver the insights you need for a resilient, scalable, future-ready environment.",
  },
  {
    title: "Cloud FinOps",
    body: "By integrating financial accountability into cloud operations, our FinOps practice ensures every dollar spent delivers maximum value. We build a culture of cost-awareness and continuous improvement — enabling financial discipline and operational excellence across your cloud environments.",
  },
  {
    title: "Infrastructure Advisory",
    body: "Our advisory services guide your business in designing, implementing, and optimizing cloud environments. We deliver expert strategies tailored to your specific needs, ensuring efficient use of cloud resources and alignment with business goals — so you can navigate cloud adoption with confidence.",
  },
];

const technologyServices = [
  {
    title: "Cloud Native Architecture",
    body: "We help you shift from 'how do we move to the cloud' to 'how do we use cloud natively to enable innovation.' Our cloud native engineers give your business new levels of agility, efficiency, and speed — unlocking the full potential of cloud-first design.",
  },
  {
    title: "Cloud Modernization",
    body: "Our modernization expertise enables your business to revamp legacy systems while enhancing agility and scalability. By migrating to the cloud, you leverage advanced technologies, optimize costs, and improve performance — ensuring resilience and competitiveness in the digital age.",
  },
  {
    title: "Cloud Security",
    body: "We embed security into your cloud environment from the ground up — automating controls, aligning with compliance requirements, and delivering continuous protection through engineering-led execution. AWS, Azure, and Google Cloud recognize Ascelios as a top-tier security partner.",
  },
  {
    title: "Compliance & Risk Management",
    body: "We help you identify, assess, and mitigate risks across enterprise cloud environments. Our compliance services ensure adherence to industry regulations and standards — safeguarding your organization against legal and operational setbacks.",
  },
];

const managedCapabilities = [
  "Ongoing cloud operations",
  "AIOps and ITSM automation",
  "Site reliability engineering (SRE)",
  "FinOps and cost optimization",
  "Security operations (SecOps)",
  "24/7 infrastructure and application support",
];

const partners = [
  {
    name: "Amazon Web Services",
    abbr: "AWS",
    tier: "Advanced Tier Services Partner",
    desc: "From large-scale migrations to cloud-native development, we architect and operate AWS environments built for enterprise demand.",
  },
  {
    name: "Microsoft Azure",
    abbr: "Azure",
    tier: "Advanced Specializations × 5",
    desc: "Kubernetes, web app modernization, DevOps with GitHub, analytics, and cloud security — validated Azure expertise across the full stack.",
  },
  {
    name: "Google Cloud",
    abbr: "GCP",
    tier: "Premier Partner",
    desc: "We design and deliver data-driven cloud platforms on Google Cloud, with recognized engineering depth across compute, data, and AI workloads.",
  },
];

const stats = [
  { value: "200+",  label: "Cloud projects delivered" },
  { value: "3",     label: "Hyperscaler advanced partnerships" },
  { value: "99.9%", label: "Managed services uptime SLA" },
  { value: "24/7",  label: "Operations & incident response" },
];

const caseStudies = [
  {
    client: "Global Manufacturing Co.",
    headline: "Migrated 300-node SAP landscape to AWS — zero downtime, 40% infrastructure cost reduction.",
    tags: ["AWS", "SAP", "Cloud Migration"],
  },
  {
    client: "European Retail Group",
    headline: "Re-architected e-commerce platform on Azure with cloud-native microservices, cutting deployment time from weeks to hours.",
    tags: ["Azure", "Cloud Native", "DevOps"],
  },
  {
    client: "Financial Services Firm",
    headline: "Built a compliant, multi-region GCP data platform supporting real-time analytics across 50M daily transactions.",
    tags: ["GCP", "FinOps", "Compliance"],
  },
];

export default function CloudServicesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs tracking-widest uppercase text-brand-accent mb-5">
            Cloud Services
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white max-w-3xl mb-6">
            Advise. Design. Build.<br />Automate. Operate.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-10">
            We partner with clients to design, build, and operate reliable and secure cloud solutions — from initial assessment and cost optimization through to fully managed cloud operations on AWS, Azure, and GCP.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact">
              <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-6">
                Get in touch
              </Button>
            </Link>
            <Link href="#assessment" className="text-slate-400 hover:text-white text-sm border-b border-slate-600 hover:border-white transition-colors self-center pb-px">
              Explore services →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pillar tab nav ────────────────────────────────────────── */}
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

      {/* ── Cloud Assessment ─────────────────────────────────────── */}
      <section id="assessment" className="bg-white py-24 px-6 scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Cloud Assessment</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Start with clarity.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mb-14">
            Understand where you are, where the value is, and the fastest path to a resilient cloud foundation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessmentServices.map((s) => (
              <div key={s.title} className="border border-slate-200 rounded-lg p-8 hover:border-brand-primary hover:shadow-md transition-all group">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-brand-primary transition-colors mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.body}</p>
                <Link href="/contact" className="text-sm text-brand-primary border-b border-brand-primary hover:opacity-70 transition-opacity">
                  Learn more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cloud Technology ─────────────────────────────────────── */}
      <section id="technology" className="bg-slate-50 py-24 px-6 scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Cloud Technology</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Build for what&apos;s next.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mb-14">
            Modernize legacy systems, adopt cloud native patterns, and build secure, scalable platforms ready for AI-era workloads.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technologyServices.map((s) => (
              <div key={s.title} className="bg-white border border-slate-200 rounded-lg p-8 hover:border-brand-primary hover:shadow-md transition-all group">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-brand-primary transition-colors mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.body}</p>
                <Link href="/contact" className="text-sm text-brand-primary border-b border-brand-primary hover:opacity-70 transition-opacity">
                  Learn more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cloud Managed Services ────────────────────────────────── */}
      <section id="managed" className="bg-brand-surface py-24 px-6 scroll-mt-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">Cloud Managed Services</p>
            <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
              We run it.<br />You focus on the business.
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              From ongoing cloud operations to AIOps automation and 24/7 incident response, we take full operational ownership of your cloud environment — so your teams can focus on building, not firefighting.
            </p>
            <Link href="/contact">
              <Button className="bg-brand-primary hover:bg-brand-accent text-white font-medium px-6">
                Explore managed services
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {managedCapabilities.map((cap) => (
              <div key={cap} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg px-5 py-4">
                <svg className="shrink-0 mt-0.5 text-brand-accent" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm text-slate-300">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ──────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Cloud Partners</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-14">
            Deep expertise across all three hyperscalers.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((p) => (
              <div key={p.name} className="border border-slate-200 rounded-lg p-8 hover:border-brand-primary transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">{p.abbr}</span>
                  <span className="font-mono text-[11px] text-brand-primary border border-brand-primary/40 rounded-full px-3 py-1">{p.tier}</span>
                </div>
                <p className="text-slate-900 font-semibold mb-2">{p.name}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="bg-brand-bg py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 border border-white/8 rounded-lg overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/4 px-8 py-10 text-center">
                <p className="text-4xl font-semibold tracking-tight text-brand-accent mb-2">{s.value}</p>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Case Studies ──────────────────────────────────────────── */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Our Work</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Cloud transformations that delivered.</h2>
            </div>
            <Link href="/case-studies" className="text-sm text-brand-primary border-b border-brand-primary hover:opacity-70 transition-opacity">
              View all case studies →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((c) => (
              <div key={c.client} className="bg-white border border-slate-200 rounded-lg p-8 hover:border-brand-primary hover:shadow-md transition-all">
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.tags.map((t) => (
                    <span key={t} className="font-mono text-[10px] uppercase tracking-wide text-brand-primary border border-brand-primary/30 rounded-full px-2.5 py-1">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="font-semibold text-slate-400 text-xs uppercase tracking-wide mb-3">{c.client}</p>
                <p className="text-slate-900 font-medium leading-snug">{c.headline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="bg-brand-surface py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4">Ready to transform your cloud?</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Tell us about your environment. Our architects will put together a tailored cloud roadmap within 48 hours.
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
