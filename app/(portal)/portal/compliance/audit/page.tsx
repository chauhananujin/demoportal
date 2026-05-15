import { Button } from "@/components/ui/button";
import { ComplianceSubNav } from "@/components/portal/compliance-subnav";

export const metadata = { title: "Security Audit" };

/* ── Data ─────────────────────────────────────────────── */

const auditLog = [
  { id: "EVT-8812", ts: "2026-05-14 09:42:11", type: "Config Change",    actor: "terraform-ci",       resource: "prod-eks-cluster / node-group-a", detail: "Node count scaled 3 → 5",               status: "success" },
  { id: "EVT-8811", ts: "2026-05-14 08:15:03", type: "Login",            actor: "j.mueller@acme.com", resource: "Portal — Azure SSO",              detail: "MFA verified · Berlin, DE",             status: "success" },
  { id: "EVT-8810", ts: "2026-05-14 07:58:44", type: "Login Failed",     actor: "unknown",            resource: "Portal — API key auth",           detail: "Invalid API key · 5 attempts",          status: "blocked" },
  { id: "EVT-8809", ts: "2026-05-13 22:10:30", type: "Permission Grant",  actor: "a.smith@acme.com",  resource: "AWS IAM · prod",                  detail: "s3:GetObject added to svc-backup-role", status: "success" },
  { id: "EVT-8808", ts: "2026-05-13 18:34:12", type: "Data Access",      actor: "analytics-svc",      resource: "GCP · analytics-postgres",        detail: "SELECT on transactions table (50 M rows)", status: "success" },
  { id: "EVT-8807", ts: "2026-05-13 16:50:05", type: "Secret Rotation",  actor: "vault-agent",        resource: "HashiCorp Vault · prod",          detail: "DB credential auto-rotated",            status: "success" },
  { id: "EVT-8806", ts: "2026-05-13 14:22:48", type: "Config Change",    actor: "p.nguyen@acme.com",  resource: "Azure NSG · westeurope",          detail: "Inbound rule 3389 (RDP) blocked",       status: "success" },
  { id: "EVT-8805", ts: "2026-05-13 11:05:17", type: "API Key Created",  actor: "a.smith@acme.com",   resource: "Portal API",                      detail: "Read-only key for monitoring integration", status: "success" },
  { id: "EVT-8804", ts: "2026-05-12 23:00:00", type: "Backup",           actor: "ascelios-ops",       resource: "SAP HANA · prod-s4hana-eu",       detail: "Full HANA backup completed (842 GB)",   status: "success" },
  { id: "EVT-8803", ts: "2026-05-12 18:44:32", type: "Login Failed",     actor: "l.chen@acme.com",    resource: "Portal — password auth",          detail: "Wrong password · account locked 15 min",status: "failed" },
];

const vulnScans = [
  {
    tool: "Snyk Code",
    target: "Application repositories",
    lastScan: "May 14, 2026 · 06:00 UTC",
    critical: 0, high: 2, medium: 8, low: 14, info: 31,
    status: "clean",
  },
  {
    tool: "Trivy",
    target: "Container images (prod-eks-cluster)",
    lastScan: "May 14, 2026 · 06:15 UTC",
    critical: 0, high: 1, medium: 5, low: 22, info: 47,
    status: "clean",
  },
  {
    tool: "AWS Security Hub",
    target: "AWS prod accounts",
    lastScan: "May 14, 2026 · 05:00 UTC",
    critical: 0, high: 2, medium: 6, low: 9, info: 18,
    status: "clean",
  },
  {
    tool: "Microsoft Defender",
    target: "Azure subscriptions",
    lastScan: "May 14, 2026 · 05:30 UTC",
    critical: 0, high: 0, medium: 3, low: 7, info: 12,
    status: "clean",
  },
  {
    tool: "GCP Security Command Center",
    target: "GCP project · analytics",
    lastScan: "May 13, 2026 · 22:00 UTC",
    critical: 0, high: 1, medium: 2, low: 4, info: 9,
    status: "clean",
  },
];

const accessReviews = [
  { subject: "svc-terraform-prod",   type: "Service Account", provider: "AWS",   access: "AdministratorAccess",     lastUsed: "2 hours ago",    risk: "high",   action: "Review required" },
  { subject: "a.smith@acme.com",     type: "Human User",      provider: "Portal", access: "Admin",                   lastUsed: "1 day ago",      risk: "medium", action: "Review required" },
  { subject: "svc-backup-role",      type: "Service Account", provider: "AWS",   access: "S3 + RDS full",           lastUsed: "4 hours ago",    risk: "low",    action: "Compliant" },
  { subject: "read-only-monitoring", type: "Service Account", provider: "Portal", access: "Read-only",               lastUsed: "30 min ago",     risk: "low",    action: "Compliant" },
  { subject: "j.mueller@acme.com",   type: "Human User",      provider: "Portal", access: "Standard User",           lastUsed: "2 hours ago",    risk: "low",    action: "Compliant" },
  { subject: "svc-legacy-etl",       type: "Service Account", provider: "GCP",   access: "BigQuery Admin",           lastUsed: "94 days ago",    risk: "high",   action: "Stale — disable" },
];

const securityReports = [
  { name: "External Penetration Test — Q1 2026",       date: "Mar 28, 2026", provider: "NCC Group",     severity: "2 medium · 4 low",  status: "reviewed" },
  { name: "Cloud Security Posture Assessment — Apr 2026", date: "Apr 30, 2026", provider: "Ascelios SecOps", severity: "1 high · 6 medium", status: "reviewed" },
  { name: "SOC 2 Type II Readiness Report",              date: "Apr 15, 2026", provider: "Deloitte",       severity: "—",                 status: "reviewed" },
  { name: "ISO 27001 Gap Analysis",                      date: "Mar 1, 2026",  provider: "BSI Group",      severity: "7 gaps identified", status: "reviewed" },
  { name: "HANA DB Security Review",                     date: "Feb 20, 2026", provider: "Ascelios SAP",   severity: "3 medium",          status: "reviewed" },
];

/* ── Style maps ───────────────────────────────────────── */

const eventStatusStyle: Record<string, string> = {
  success: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  failed:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  blocked: "text-red-400 bg-red-400/10 border-red-400/20",
};

const eventTypeStyle: Record<string, string> = {
  "Config Change":    "text-brand-accent",
  "Login":            "text-emerald-400",
  "Login Failed":     "text-red-400",
  "Permission Grant": "text-violet-400",
  "Data Access":      "text-sky-400",
  "Secret Rotation":  "text-amber-400",
  "API Key Created":  "text-slate-400",
  "Backup":           "text-slate-400",
};

const riskStyle: Record<string, string> = {
  high:   "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

/* ── Helpers ──────────────────────────────────────────── */

function VulnPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-semibold ${count > 0 ? color : "text-slate-600"}`}>{count}</span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

const totalVulns = vulnScans.reduce(
  (s, v) => ({ critical: s.critical + v.critical, high: s.high + v.high, medium: s.medium + v.medium, low: s.low + v.low }),
  { critical: 0, high: 0, medium: 0, low: 0 }
);

/* ── Page ─────────────────────────────────────────────── */

export default function SecurityAuditPage() {
  return (
    <div className="px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Security Audit</h1>
          <p className="text-slate-500 text-sm mt-1">Audit trail, vulnerability scans, access reviews, and security reports</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent text-white text-sm">
          ↓ Export Audit Log
        </Button>
      </div>

      <ComplianceSubNav />

      {/* Vuln summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Critical",  count: totalVulns.critical, color: "text-red-500",    sub: "Requires immediate action" },
          { label: "High",      count: totalVulns.high,     color: "text-red-400",    sub: "Remediate within 7 days" },
          { label: "Medium",    count: totalVulns.medium,   color: "text-amber-400",  sub: "Remediate within 30 days" },
          { label: "Low / Info",count: totalVulns.low,      color: "text-slate-400",  sub: "Best-effort remediation" },
        ].map((s) => (
          <div key={s.label} className="bg-brand-surface border border-white/8 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-2xl font-semibold mb-1 ${s.count > 0 && s.label !== "Low / Info" ? s.color : s.count > 0 ? s.color : "text-slate-600"}`}>
              {s.count}
            </p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Vulnerability scans */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-white">Vulnerability Scans</p>
          <span className="text-xs text-slate-500">Automated · runs every 6 hours</span>
        </div>
        <div className="divide-y divide-white/5">
          {vulnScans.map((scan) => (
            <div key={scan.tool} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{scan.tool}</p>
                <p className="text-xs text-slate-500 mt-0.5">{scan.target} · {scan.lastScan}</p>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <VulnPill count={scan.critical} label="Crit"   color="text-red-500" />
                <VulnPill count={scan.high}     label="High"   color="text-red-400" />
                <VulnPill count={scan.medium}   label="Med"    color="text-amber-400" />
                <VulnPill count={scan.low}      label="Low"    color="text-slate-400" />
                <VulnPill count={scan.info}     label="Info"   color="text-slate-500" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shrink-0">
                {scan.critical + scan.high === 0 ? "Clean" : "Action needed"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Audit log + Access reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

        {/* Audit log */}
        <div className="lg:col-span-3 bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-white">Audit Log</p>
            <span className="text-xs text-slate-500">Last 10 events · 90-day retention</span>
          </div>
          <div className="divide-y divide-white/5">
            {auditLog.map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-xs font-medium ${eventTypeStyle[evt.type] ?? "text-slate-400"}`}>{evt.type}</span>
                    <span className="text-xs text-slate-600">{evt.ts}</span>
                  </div>
                  <p className="text-sm text-white truncate">{evt.detail}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{evt.actor} → {evt.resource}</p>
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${eventStatusStyle[evt.status]}`}>
                  {evt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Access reviews */}
        <div className="lg:col-span-2 bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-white">Access Review</p>
            <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/20">
              2 action required
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {accessReviews.map((ar) => (
              <div key={ar.subject} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <p className="text-sm text-white font-mono truncate">{ar.subject}</p>
                  <span className={`font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border shrink-0 ${riskStyle[ar.risk]}`}>
                    {ar.risk}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{ar.type} · {ar.provider} · {ar.access}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-600">Last used: {ar.lastUsed}</span>
                  <span className={`text-xs font-medium ${ar.action.includes("required") || ar.action.includes("disable") ? "text-amber-400" : "text-emerald-400"}`}>
                    {ar.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Reports */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-white">Security Reports</p>
          <Button variant="outline" className="text-xs h-7 border-white/15 text-slate-300 hover:text-white hover:bg-white/5">
            + Request Report
          </Button>
        </div>
        <div className="divide-y divide-white/5">
          {securityReports.map((r) => (
            <div key={r.name} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-slate-500 shrink-0" aria-hidden="true">
                <path d="M9 1H3.667A1.333 1.333 0 0 0 2.333 2.333V13.667A1.333 1.333 0 0 0 3.667 15h8.666A1.333 1.333 0 0 0 13.667 13.667V5.667L9 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M9 1v4.667h4.667" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium group-hover:text-brand-accent transition-colors">{r.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.provider} · {r.date}</p>
              </div>
              <span className="text-xs text-slate-500 shrink-0">{r.severity}</span>
              <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shrink-0">
                {r.status}
              </span>
              <button className="text-xs text-slate-600 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                ↓ PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
