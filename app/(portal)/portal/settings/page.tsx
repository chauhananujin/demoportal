export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-8">Settings</h1>

      {/* Profile */}
      <section className="bg-brand-surface border border-white/8 rounded-xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-white mb-4">Company Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Company Name", value: "Acme Corp" },
            { label: "Account ID", value: "ACC-00412" },
            { label: "Primary Email", value: "admin@acmecorp.com" },
            { label: "Phone", value: "+1 (555) 012-3456" },
            { label: "Country", value: "United States" },
            { label: "Timezone", value: "America/New_York" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-slate-500 mb-1">{f.label}</p>
              <p className="text-white">{f.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-brand-surface border border-white/8 rounded-xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-white mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { label: "Ticket updates", on: true },
            { label: "Invoice and billing", on: true },
            { label: "Service status alerts", on: true },
            { label: "Monthly reports", on: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{n.label}</span>
              <div className={`w-9 h-5 rounded-full relative ${n.on ? "bg-brand-primary" : "bg-white/10"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${n.on ? "left-4" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-brand-surface border border-white/8 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Security</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Two-factor authentication</span>
            <span className="font-mono text-[10px] uppercase text-emerald-400 border border-emerald-400/30 rounded-full px-2 py-0.5">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Last password change</span>
            <span className="text-slate-500">Mar 15, 2026</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Active sessions</span>
            <span className="text-slate-500">2 devices</span>
          </div>
        </div>
      </section>
    </div>
  );
}
