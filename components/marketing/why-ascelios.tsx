const differentiators = [
  { icon: "🏆", title: "Certified Expertise", body: "SAP Certified Partner. AWS, Azure, and GCP Advanced tiers. Verified credentials, not just claims." },
  { icon: "⚡", title: "Fast Response SLA", body: "Critical issues acknowledged in under 1 hour, 24/7/365. No voicemail trees, no ticket queues at 3am." },
  { icon: "🔭", title: "Full-Stack Ownership", body: "We cover both SAP and cloud — one partner for the entire stack, no finger-pointing between vendors." },
  { icon: "📈", title: "Outcome-Focused", body: "Fixed-fee engagements and clear KPIs. We're accountable to results, not billable hours." },
];

export function WhyAscelios() {
  return (
    <section className="py-20 px-6 bg-brand-bg">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Why Ascelios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((d) => (
            <div key={d.title} className="bg-brand-surface rounded-xl p-6 border border-brand-surface hover:border-brand-primary transition-colors">
              <span className="text-2xl mb-3 block">{d.icon}</span>
              <h3 className="text-white font-semibold mb-2">{d.title}</h3>
              <p className="text-slate-400 text-sm">{d.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
