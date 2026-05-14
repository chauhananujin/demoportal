export function ClientLogos() {
  const clients = ["Acme Corp", "GlobalTech", "NexusMfg", "RetailCo", "FinServ Ltd"];
  return (
    <section className="py-12 px-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-8">Trusted by</p>
        <div className="flex flex-wrap justify-center gap-10">
          {clients.map((c) => (
            <span key={c} className="text-slate-300 font-bold text-lg tracking-wide">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
