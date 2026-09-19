"use client";
import Link from "next/link";
import { useTenants } from "@/lib/onboarding/tenant-context";
import { SERVICE_CATALOG, PROVISIONING_STAGES, type ServiceKey, type Tenant } from "@/lib/onboarding/types";
import { cn } from "@/lib/utils";

const PROVIDER_LABEL: Record<string, string> = {
  aws: "AWS", azure: "Azure", gcp: "Google Cloud",
};

const STATUS_STYLE = {
  provisioning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  active:       "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  failed:       "text-red-400 bg-red-400/10 border-red-400/20",
} as const;

function serviceLabels(keys: ServiceKey[]): string[] {
  return SERVICE_CATALOG.filter((s) => keys.includes(s.key)).map((s) => s.label);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function TenantRow({ t }: { t: Tenant }) {
  const lastIndex = PROVISIONING_STAGES.length - 1;
  const pct = Math.min(100, Math.round(((t.stageIndex + 1) / PROVISIONING_STAGES.length) * 100));
  const stageLabel = PROVISIONING_STAGES[Math.min(t.stageIndex, lastIndex)];

  return (
    <div className="bg-brand-surface border border-white/8 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-white font-semibold truncate">{t.name}</h3>
            <span className={cn(
              "font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border",
              STATUS_STYLE[t.status],
            )}>
              {t.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            {t.id} · {PROVIDER_LABEL[t.provider] ?? t.provider} · {t.region}
          </p>
        </div>
        <p className="text-xs text-slate-500 shrink-0">{fmtDate(t.createdAt)}</p>
      </div>

      {/* Progress */}
      {t.status === "provisioning" && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{stageLabel}</span>
            <span className="font-mono">{pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      {t.status === "active" && (
        <div className="mb-4 flex items-center gap-2 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          All systems operational
        </div>
      )}

      {/* Services */}
      <div className="flex flex-wrap gap-2">
        {serviceLabels(t.services).map((label) => (
          <span key={label} className="font-mono text-[10px] uppercase tracking-wide text-slate-400 border border-white/15 rounded-full px-2 py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between text-xs">
        <span className="text-slate-500">Agreement <span className="font-mono text-slate-400">{t.agreementId}</span></span>
        <span className="text-slate-500">{t.customerCompany}</span>
      </div>
    </div>
  );
}

export default function TenantsPage() {
  const { tenants } = useTenants();
  const provisioning = tenants.filter((t) => t.status === "provisioning");
  const active = tenants.filter((t) => t.status === "active");

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Customer Workspace</p>
          <h1 className="text-2xl font-semibold text-white">Tenants</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cloud workspaces provisioned for your subscription. Status updates live.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="text-sm text-brand-accent hover:text-brand-accent-light border-b border-brand-accent/40 hover:border-brand-accent-light pb-px"
        >
          + Add another tenant
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-brand-surface border border-white/8 rounded-xl px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500 mb-1">Total</p>
          <p className="text-2xl font-semibold text-white leading-none">{tenants.length}</p>
        </div>
        <div className="bg-brand-surface border border-white/8 rounded-xl px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500 mb-1">Provisioning</p>
          <p className="text-2xl font-semibold text-amber-400 leading-none">{provisioning.length}</p>
        </div>
        <div className="bg-brand-surface border border-white/8 rounded-xl px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500 mb-1">Active</p>
          <p className="text-2xl font-semibold text-emerald-400 leading-none">{active.length}</p>
        </div>
      </div>

      {tenants.length === 0 ? (
        <div className="bg-brand-surface border border-white/8 rounded-2xl p-10 text-center">
          <p className="text-slate-300 text-sm mb-2">No tenants yet.</p>
          <p className="text-slate-500 text-xs mb-5">Run the onboarding flow to create your first cloud tenant.</p>
          <Link
            href="/onboarding"
            className="inline-block bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Start onboarding →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((t) => <TenantRow key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}
