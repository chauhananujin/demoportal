import { Button } from "@/components/ui/button";
import { ComplianceSubNav } from "@/components/portal/compliance-subnav";

export const metadata = { title: "Compliance" };

/* ── Data ─────────────────────────────────────────────── */

const frameworks = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    score: 94,
    status: "compliant",
    controls: { passed: 112, failed: 4, inReview: 6, notTested: 0 },
    lastAssessed: "Apr 30, 2026",
    nextAudit: "Oct 31, 2026",
    auditor: "Deloitte",
    desc: "Security, Availability, Confidentiality trust service criteria",
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    score: 88,
    status: "compliant",
    controls: { passed: 98, failed: 7, inReview: 9, notTested: 0 },
    lastAssessed: "Mar 15, 2026",
    nextAudit: "Mar 15, 2027",
    auditor: "BSI Group",
    desc: "Information security management system (ISMS)",
  },
  {
    id: "gdpr",
    name: "GDPR",
    score: 91,
    status: "compliant",
    controls: { passed: 41, failed: 2, inReview: 3, notTested: 1 },
    lastAssessed: "Feb 28, 2026",
    nextAudit: "Feb 28, 2027",
    auditor: "Internal DPO",
    desc: "EU General Data Protection Regulation — Article 32 technical controls",
  },
  {
    id: "cis",
    name: "CIS Benchmarks",
    score: 79,
    status: "partial",
    controls: { passed: 183, failed: 28, inReview: 16, notTested: 5 },
    lastAssessed: "May 10, 2026",
    nextAudit: "Aug 10, 2026",
    auditor: "Ascelios SecOps",
    desc: "CIS L1 & L2 hardening — AWS, Azure, Kubernetes, RHEL, SLES",
  },
  {
    id: "pci",
    name: "PCI DSS 4.0",
    score: 0,
    status: "not-applicable",
    controls: { passed: 0, failed: 0, inReview: 0, notTested: 0 },
    lastAssessed: "—",
    nextAudit: "—",
    auditor: "—",
    desc: "Payment Card Industry Data Security Standard",
  },
];

const recentFindings = [
  {
    id: "FND-0041",
    title: "MFA not enforced on 2 service accounts",
    framework: "SOC 2 / ISO 27001",
    severity: "high",
    status: "open",
    resource: "IAM — AWS prod",
    detected: "May 12, 2026",
  },
  {
    id: "FND-0040",
    title: "Unencrypted EBS snapshot found in us-east-1",
    framework: "SOC 2",
    severity: "high",
    status: "remediated",
    resource: "AWS · us-east-1",
    detected: "May 8, 2026",
  },
  {
    id: "FND-0039",
    title: "CIS K8s Benchmark 1.2.11 — admission controllers incomplete",
    framework: "CIS Benchmarks",
    severity: "medium",
    status: "in-review",
    resource: "prod-eks-cluster",
    detected: "May 10, 2026",
  },
  {
    id: "FND-0038",
    title: "TLS 1.0/1.1 enabled on internal API gateway",
    framework: "ISO 27001",
    severity: "medium",
    status: "remediated",
    resource: "Azure API Mgmt",
    detected: "Apr 28, 2026",
  },
  {
    id: "FND-0037",
    title: "GDPR Art. 30 processing register not updated for new analytics pipeline",
    framework: "GDPR",
    severity: "medium",
    status: "open",
    resource: "Data Platform · GCP",
    detected: "Apr 22, 2026",
  },
  {
    id: "FND-0036",
    title: "CloudTrail log retention below 365-day policy",
    framework: "SOC 2",
    severity: "low",
    status: "remediated",
    resource: "AWS · eu-west-1",
    detected: "Apr 15, 2026",
  },
];

const upcomingAssessments = [
  { name: "CIS Benchmark re-scan",    date: "Aug 10, 2026", type: "Automated",  framework: "CIS" },
  { name: "SOC 2 Type II annual audit", date: "Oct 31, 2026", type: "External",   framework: "SOC 2" },
  { name: "ISO 27001 surveillance",   date: "Mar 15, 2027", type: "External",   framework: "ISO 27001" },
  { name: "GDPR annual review",       date: "Feb 28, 2027", type: "Internal",   framework: "GDPR" },
];

/* ── Style maps ───────────────────────────────────────── */

const frameworkStatusStyle: Record<string, { badge: string; ring: string; bar: string }> = {
  compliant:       { badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", ring: "text-emerald-400", bar: "bg-emerald-400" },
  partial:         { badge: "text-amber-400 bg-amber-400/10 border-amber-400/20",       ring: "text-amber-400",   bar: "bg-amber-400" },
  "not-applicable":{ badge: "text-slate-500 bg-slate-500/10 border-slate-500/20",       ring: "text-slate-500",   bar: "bg-slate-600" },
};

const severityStyle: Record<string, string> = {
  high:   "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low:    "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const findingStatusStyle: Record<string, string> = {
  open:       "text-red-400 bg-red-400/10 border-red-400/20",
  "in-review":"text-brand-accent bg-brand-accent/10 border-brand-accent/20",
  remediated: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

const assessmentTypeStyle: Record<string, string> = {
  Automated: "text-brand-accent bg-brand-accent/10 border-brand-accent/20",
  External:  "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Internal:  "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

/* ── Helpers ──────────────────────────────────────────── */

const totalControls = frameworks
  .filter((f) => f.status !== "not-applicable")
  .reduce((sum, f) => ({
    passed:    sum.passed    + f.controls.passed,
    failed:    sum.failed    + f.controls.failed,
    inReview:  sum.inReview  + f.controls.inReview,
    notTested: sum.notTested + f.controls.notTested,
  }), { passed: 0, failed: 0, inReview: 0, notTested: 0 });

const overallScore = Math.round(
  frameworks
    .filter((f) => f.status !== "not-applicable")
    .reduce((sum, f) => sum + f.score, 0) /
  frameworks.filter((f) => f.status !== "not-applicable").length
);

const openFindings   = recentFindings.filter((f) => f.status === "open").length;
const highFindings   = recentFindings.filter((f) => f.severity === "high" && f.status === "open").length;

/* ── Score ring (SVG) ─────────────────────────────────── */

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-white/8" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        className={color}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="36" y="40" textAnchor="middle" className="fill-white text-sm font-semibold" fontSize="14" fontWeight="600">
        {score}
      </text>
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────── */

export default function CompliancePage() {
  return (
    <div className="px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Compliance</h1>
          <p className="text-slate-500 text-sm mt-1">Security compliance posture across all active frameworks</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent text-white text-sm">
          ↓ Download Report
        </Button>
      </div>

      <ComplianceSubNav />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Overall Score",         value: `${overallScore}%`,                    color: "text-emerald-400",  sub: "Across 4 active frameworks" },
          { label: "Controls Passed",        value: totalControls.passed.toLocaleString(), color: "text-emerald-400",  sub: `${totalControls.failed} failed · ${totalControls.inReview} in review` },
          { label: "Open Findings",          value: String(openFindings),                  color: openFindings > 0 ? "text-red-400" : "text-emerald-400", sub: `${highFindings} high severity` },
          { label: "Next External Audit",    value: "Oct 2026",                            color: "text-slate-300",    sub: "SOC 2 Type II — Deloitte" },
        ].map((s) => (
          <div key={s.label} className="bg-brand-surface border border-white/8 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-2xl font-semibold mb-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Framework cards */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">Compliance Frameworks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {frameworks.map((f) => {
            const style = frameworkStatusStyle[f.status];
            const total = f.controls.passed + f.controls.failed + f.controls.inReview + f.controls.notTested;
            const passedPct = total > 0 ? (f.controls.passed / total) * 100 : 0;
            const failedPct = total > 0 ? (f.controls.failed / total) * 100 : 0;
            const reviewPct = total > 0 ? (f.controls.inReview / total) * 100 : 0;

            return (
              <div key={f.id} className={`bg-brand-surface border border-white/8 rounded-xl p-5 ${f.status === "not-applicable" ? "opacity-50" : ""}`}>
                {/* Top row */}
                <div className="flex items-start gap-4 mb-4">
                  {f.status !== "not-applicable" ? (
                    <ScoreRing score={f.score} color={style.ring} />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-full border-4 border-white/8 flex items-center justify-center shrink-0">
                      <span className="text-xs text-slate-600 font-mono">N/A</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{f.name}</p>
                      <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}>
                        {f.status === "not-applicable" ? "N/A" : f.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>

                {/* Control bar */}
                {f.status !== "not-applicable" && (
                  <div className="mb-4">
                    <div className="flex rounded-full overflow-hidden h-1.5 bg-white/8">
                      <div className="bg-emerald-400 transition-all" style={{ width: `${passedPct}%` }} />
                      <div className="bg-red-400 transition-all" style={{ width: `${failedPct}%` }} />
                      <div className="bg-amber-400 transition-all" style={{ width: `${reviewPct}%` }} />
                    </div>
                    <div className="flex gap-3 mt-2 text-[10px]">
                      <span className="text-emerald-400">{f.controls.passed} passed</span>
                      <span className="text-red-400">{f.controls.failed} failed</span>
                      <span className="text-amber-400">{f.controls.inReview} in review</span>
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-t border-white/8 pt-4">
                  <div><span className="text-slate-500">Last assessed </span><span className="text-slate-300">{f.lastAssessed}</span></div>
                  <div><span className="text-slate-500">Next audit </span><span className="text-slate-300">{f.nextAudit}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Auditor </span><span className="text-slate-300">{f.auditor}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Findings + Upcoming assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Findings */}
        <div className="lg:col-span-2 bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-white">Recent Findings</p>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${openFindings > 0 ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"}`}>
                {openFindings} open
              </span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {recentFindings.map((finding) => (
              <div key={finding.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium leading-snug mb-1">{finding.title}</p>
                  <p className="text-xs text-slate-500">{finding.id} · {finding.resource} · {finding.detected}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{finding.framework}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${severityStyle[finding.severity]}`}>
                    {finding.severity}
                  </span>
                  <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${findingStatusStyle[finding.status]}`}>
                    {finding.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Controls breakdown */}
          <div className="bg-brand-surface border border-white/8 rounded-xl p-5">
            <p className="text-sm font-semibold text-white mb-4">Controls Summary</p>
            <div className="space-y-3">
              {[
                { label: "Passed",    count: totalControls.passed,    color: "bg-emerald-400", text: "text-emerald-400" },
                { label: "Failed",    count: totalControls.failed,    color: "bg-red-400",     text: "text-red-400" },
                { label: "In Review", count: totalControls.inReview,  color: "bg-amber-400",   text: "text-amber-400" },
                { label: "Not Tested",count: totalControls.notTested, color: "bg-slate-600",   text: "text-slate-500" },
              ].map((row) => {
                const total2 = totalControls.passed + totalControls.failed + totalControls.inReview + totalControls.notTested;
                const pct = total2 > 0 ? (row.count / total2) * 100 : 0;
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-slate-400">{row.label}</span>
                      <span className={row.text}>{row.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className={`h-full rounded-full ${row.color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming assessments */}
          <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden flex-1">
            <p className="text-sm font-semibold text-white px-5 py-4 border-b border-white/8">Upcoming Assessments</p>
            <div className="divide-y divide-white/5">
              {upcomingAssessments.map((a) => (
                <div key={a.name} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-white font-medium truncate">{a.name}</p>
                    <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ml-2 ${assessmentTypeStyle[a.type]}`}>
                      {a.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{a.date} · {a.framework}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
