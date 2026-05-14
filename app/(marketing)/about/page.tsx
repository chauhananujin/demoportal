export const metadata = { title: "About" };

const certs = ["SAP Certified Partner", "AWS Advanced Tier", "Microsoft Azure Expert MSP", "Google Cloud Partner"];

const stats = [
  { value: "200+", label: "Enterprise Clients" },
  { value: "15yr", label: "Industry Experience" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "24/7", label: "Support Coverage" },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="max-w-3xl mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">About Ascelios</h1>
        <p className="text-slate-500 text-lg mb-4">
          Ascelios was founded to solve a problem every enterprise IT leader knows: SAP and cloud are deeply intertwined, but most vendors only do one. The result is finger-pointing, misaligned timelines, and costs that spiral.
        </p>
        <p className="text-slate-500 text-lg">
          We built a team that covers the full stack — SAP certified architects and cloud engineers working in the same room. One partner, full accountability, better outcomes.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {stats.map((s) => (
          <div key={s.label} className="bg-brand-bg rounded-xl p-6 text-center">
            <p className="text-brand-accent-light text-3xl font-extrabold mb-1">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Certifications</h2>
        <div className="flex flex-wrap gap-3">
          {certs.map((c) => (
            <span key={c} className="bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-full border border-slate-200">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
