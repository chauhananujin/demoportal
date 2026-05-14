import Link from "next/link";

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
