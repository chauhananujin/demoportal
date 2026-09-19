import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-surface mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ascelios-logo.svg" alt="Ascelios" className="h-16 w-auto mb-3" />
          <p className="text-slate-400 text-sm">Enterprise Cloud & SAP Partner</p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">SAP & BTP</p>
          <ul className="space-y-2">
            {[["SAP Services", "/services/sap"], ["SAP BTP", "/services/btp"], ["Data Services", "/services/data"]].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-slate-400 text-sm hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Cloud, AI & DevOps</p>
          <ul className="space-y-2">
            {[["Cloud Services", "/services/cloud"], ["AI & Analytics", "/services/ai-analytics"], ["DevOps as a Service", "/services/devops"]].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-slate-400 text-sm hover:text-white transition-colors">{label}</Link>
              </li>
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
