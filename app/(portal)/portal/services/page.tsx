export const metadata = { title: "Services" };

const services = [
  {
    name: "SAP Managed Services",
    tier: "Enterprise",
    status: "operational",
    description: "Full lifecycle SAP S/4HANA managed operations including basis, monitoring, patching, and 24/7 incident response.",
    since: "Feb 1, 2026",
    renewsOn: "Jun 1, 2026",
    monthlyFee: "$2,000",
  },
  {
    name: "Cloud Operations — AWS",
    tier: "Advanced",
    status: "operational",
    description: "Managed AWS infrastructure covering EC2, RDS, EKS, and networking. Includes FinOps reporting and SRE on-call.",
    since: "Feb 1, 2026",
    renewsOn: "Jun 1, 2026",
    monthlyFee: "$1,400",
  },
  {
    name: "DevOps as a Service",
    tier: "Standard",
    status: "operational",
    description: "CI/CD pipeline management, IaC maintenance (Terraform), container operations, and security scanning.",
    since: "Mar 1, 2026",
    renewsOn: "Jun 1, 2026",
    monthlyFee: "$800",
  },
];

const statusBadge: Record<string, { color: string; dot: string }> = {
  operational: { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  degraded:    { color: "text-amber-400 bg-amber-400/10 border-amber-400/20",       dot: "bg-amber-400" },
  outage:      { color: "text-red-400 bg-red-400/10 border-red-400/20",             dot: "bg-red-400" },
};

export default function ServicesPage() {
  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-semibold text-white mb-8">Active Services</h1>

      <div className="space-y-4">
        {services.map((s) => {
          const badge = statusBadge[s.status];
          return (
            <div key={s.name} className="bg-brand-surface border border-white/8 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">{s.name}</h2>
                  <p className="text-sm text-slate-400">{s.description}</p>
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ml-4 ${badge.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {s.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tier</p>
                  <p className="text-white">{s.tier}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Monthly fee</p>
                  <p className="text-white">{s.monthlyFee}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Since</p>
                  <p className="text-white">{s.since}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Renews</p>
                  <p className="text-white">{s.renewsOn}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
