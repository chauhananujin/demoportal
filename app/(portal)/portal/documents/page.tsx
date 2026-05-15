export const metadata = { title: "Documents" };

const docs = [
  { name: "Master Service Agreement",          category: "Legal",     date: "Feb 1, 2026",  size: "284 KB" },
  { name: "SAP Managed Services Scope of Work", category: "Contract",  date: "Feb 1, 2026",  size: "412 KB" },
  { name: "Cloud Operations SLA",               category: "Contract",  date: "Feb 1, 2026",  size: "198 KB" },
  { name: "DevOps as a Service Agreement",      category: "Contract",  date: "Mar 1, 2026",  size: "221 KB" },
  { name: "April 2026 FinOps Report",           category: "Report",    date: "May 3, 2026",  size: "1.2 MB" },
  { name: "Q1 2026 Service Review",             category: "Report",    date: "Apr 5, 2026",  size: "3.4 MB" },
  { name: "Infrastructure Architecture Diagram","category": "Technical", date: "Feb 12, 2026", size: "890 KB" },
  { name: "Runbook — SAP Basis Operations",     category: "Technical", date: "Mar 20, 2026", size: "542 KB" },
];

const categoryColor: Record<string, string> = {
  Legal:     "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Contract:  "text-brand-accent bg-brand-accent/10 border-brand-accent/20",
  Report:    "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Technical: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

export default function DocumentsPage() {
  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-semibold text-white mb-8">Documents</h1>

      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <p className="text-sm text-slate-400">{docs.length} documents</p>
        </div>
        <div className="divide-y divide-white/5">
          {docs.map((d) => (
            <div key={d.name} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors cursor-pointer group">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-500 shrink-0" aria-hidden="true">
                <path d="M9 1H3.667A1.333 1.333 0 0 0 2.333 2.333V13.667A1.333 1.333 0 0 0 3.667 15h8.666A1.333 1.333 0 0 0 13.667 13.667V5.667L9 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M9 1v4.667h4.667" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium group-hover:text-brand-accent transition-colors truncate">{d.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{d.date} · {d.size}</p>
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${categoryColor[d.category]}`}>
                {d.category}
              </span>
              <button className="text-xs text-slate-600 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                ↓ Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
