import Link from "next/link";

export const metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Our Services</h1>
      <p className="text-slate-500 text-lg max-w-2xl mb-12">
        End-to-end SAP, BTP, Data, AI &amp; Analytics, Cloud, and DevOps expertise — from initial implementation to fully managed day-two operations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/services/sap" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">🔷</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">SAP Services</h2>
          <p className="text-slate-500">Basis administration, HANA, S/4HANA migrations, and managed services across your entire SAP landscape.</p>
        </Link>
        <Link href="/services/data" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">🧬</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">Data Services</h2>
          <p className="text-slate-500">Advisory, BW/4HANA conversions, BW-to-cloud data warehouse migrations, and a Datasphere-powered Gen AI accelerator.</p>
        </Link>
        <Link href="/services/btp" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">🧩</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">SAP BTP</h2>
          <p className="text-slate-500">Clean-core extensions, Integration Suite, PI/PO migration, and AI on BTP — built composable and upgrade-safe.</p>
        </Link>
        <Link href="/services/ai-analytics" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">🧠</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">AI &amp; Analytics</h2>
          <p className="text-slate-500">Strategy, generative AI, predictive ML, business intelligence, and decision intelligence — governed and outcome-led.</p>
        </Link>
        <Link href="/services/cloud" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">☁️</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">Cloud Services</h2>
          <p className="text-slate-500">Infrastructure design, migration from on-prem, and managed cloud operations across AWS, Azure, and GCP.</p>
        </Link>
        <Link href="/services/devops" className="group block rounded-2xl border border-slate-200 hover:border-brand-primary p-8 transition-all hover:shadow-md">
          <span className="text-4xl mb-4 block">⚙️</span>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-primary mb-2">DevOps as a Service</h2>
          <p className="text-slate-500">CI/CD pipelines, Infrastructure as Code, 24/7 managed operations, and DevSecOps — delivered as a subscription.</p>
        </Link>
      </div>
    </div>
  );
}
