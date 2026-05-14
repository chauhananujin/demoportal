import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-surface mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="text-brand-accent font-bold text-lg mb-3">Ascelios</p>
          <p className="text-slate-400 text-sm">Enterprise Cloud & SAP Partner</p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">SAP Services</p>
          <ul className="space-y-2">
            {["Implementation", "Support & Maintenance", "Custom Development"].map((s) => (
              <li key={s}><span className="text-slate-400 text-sm">{s}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Cloud Services</p>
          <ul className="space-y-2">
            {["Infrastructure", "Migration", "Managed Services"].map((s) => (
              <li key={s}><span className="text-slate-400 text-sm">{s}</span></li>
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
