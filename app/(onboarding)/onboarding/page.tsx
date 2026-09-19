"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserDirectory } from "@/lib/auth/user-directory";
import { useTickets } from "@/lib/tickets/ticket-context";
import { useTenants } from "@/lib/onboarding/tenant-context";
import {
  CLOUD_PROVIDERS, SERVICE_CATALOG, COMPANY_SIZES, INDUSTRIES,
  emptyDraft,
  type CloudProvider, type ServiceKey, type OnboardingDraft,
} from "@/lib/onboarding/types";

const DRAFT_KEY = "ascelios_onboarding_draft";

const STEPS = [
  { key: "company",   label: "Company" },
  { key: "admin",     label: "Admin user" },
  { key: "services",  label: "Services" },
  { key: "tenants",   label: "Cloud & tenants" },
  { key: "sign",      label: "Review & sign" },
] as const;

function readDraft(): OnboardingDraft {
  if (typeof window === "undefined") return emptyDraft();
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return emptyDraft();
  try {
    const parsed = JSON.parse(raw) as OnboardingDraft;
    return { ...emptyDraft(), ...parsed };
  } catch {
    return emptyDraft();
  }
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function OnboardingPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { createUser, users } = useUserDirectory();
  const { createTicket } = useTickets();
  const { createTenant, createAgreement } = useTenants();

  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft());
  const [hydrated, setHydrated] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ tenants: number; agreementId: string } | null>(null);

  // Hydrate the draft once on mount so refresh-on-step-3 doesn't lose data.
  useEffect(() => {
    setDraft(readDraft());
    setHydrated(true);
  }, []);

  // Persist draft on every change after hydration.
  useEffect(() => {
    if (!hydrated || done) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, hydrated, done]);

  const monthlyTotal = useMemo(
    () =>
      SERVICE_CATALOG
        .filter((s) => draft.services.includes(s.key))
        .reduce((acc, s) => acc + s.monthly, 0),
    [draft.services],
  );

  function update<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setStepError(null);
  }

  function validateStep(): string | null {
    const { step, company, admin, services, tenants, signedName, agreedTerms, agreedDpa } = draft;
    if (step === 0) {
      if (!company.name.trim()) return "Company name is required.";
      if (!company.industry)    return "Pick your industry.";
      if (!company.size)        return "Pick your company size.";
      if (!company.country.trim()) return "Country is required.";
    }
    if (step === 1) {
      if (!admin.fullName.trim()) return "Full name is required.";
      if (!isValidEmail(admin.email)) return "Enter a valid work email.";
      if (admin.password.length < 8) return "Password must be at least 8 characters.";
      if (users.some((u) => u.email === admin.email.trim().toLowerCase())) {
        return "An account with that email already exists. Try a different email or sign in.";
      }
    }
    if (step === 2) {
      if (services.length === 0) return "Pick at least one service.";
    }
    if (step === 3) {
      if (tenants.length === 0) return "Add at least one tenant.";
      for (const [i, t] of tenants.entries()) {
        if (!t.name.trim()) return `Tenant #${i + 1} needs a name.`;
      }
      const names = tenants.map((t) => t.name.trim().toLowerCase());
      if (new Set(names).size !== names.length) return "Tenant names must be unique.";
    }
    if (step === 4) {
      if (!signedName.trim() || signedName.trim().toLowerCase() !== admin.fullName.trim().toLowerCase()) {
        return "Type your full legal name exactly as entered in Step 2 to sign.";
      }
      if (!agreedTerms) return "You must accept the Master Services Agreement to continue.";
      if (!agreedDpa)   return "You must accept the Data Processing Addendum to continue.";
    }
    return null;
  }

  function goNext() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError(null);
    update("step", Math.min(STEPS.length - 1, draft.step + 1));
  }

  function goBack() {
    setStepError(null);
    update("step", Math.max(0, draft.step - 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setSubmitting(true);

    try {
      // 1. Create the admin user in the directory.
      const userResult = createUser({
        email: draft.admin.email,
        password: draft.admin.password,
        role: "admin",
        createdBy: "self-onboarding",
      });
      if (!userResult.ok) {
        setStepError(
          userResult.reason === "duplicate"
            ? "That email is already in use. Try signing in instead."
            : "Couldn't create your account. Check your email and password.",
        );
        setSubmitting(false);
        return;
      }

      // 2. Record the signed agreement.
      const agreement = createAgreement({
        signedName: draft.signedName.trim(),
        signedEmail: draft.admin.email,
        agreedTerms: draft.agreedTerms,
        agreedDpa: draft.agreedDpa,
        services: draft.services,
        monthlyTotal,
      });

      // 3. Create each tenant — kicks off simulated provisioning.
      for (const t of draft.tenants) {
        createTenant({
          name: t.name.trim(),
          provider: t.provider,
          region: t.region,
          services: draft.services,
          customerCompany: draft.company.name.trim(),
          customerEmail: draft.admin.email,
          agreementId: agreement.id,
        });
      }

      // 4. File an onboarding ticket so it shows up in the portal queue.
      // Note: createTicket reads the session user from localStorage, so we sign in first below;
      // but we want the ticket attributed to the new admin, so we set the session manually
      // BEFORE creating the ticket. The login() call below will overwrite with the same data.
      const session = {
        email: draft.admin.email.trim().toLowerCase(),
        role: "admin" as const,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem("ascelios_session", JSON.stringify(session));

      createTicket({
        title: `New customer onboarding — ${draft.company.name}`,
        type: "provision",
        detail: {
          company: draft.company,
          services: draft.services,
          tenants: draft.tenants,
          agreementId: agreement.id,
          monthlyTotal,
        },
      });

      // 5. Auto-login so the portal session is set via the auth context too.
      await login(draft.admin.email, draft.admin.password);

      // 6. Clear the draft & show success state, then redirect.
      localStorage.removeItem(DRAFT_KEY);
      setDone({ tenants: draft.tenants.length, agreementId: agreement.id });
      setTimeout(() => router.push("/portal/dashboard"), 1800);
    } catch (err) {
      console.error("Onboarding submit failed", err);
      setStepError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="min-h-screen bg-brand-bg" />;
  }

  if (done) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
        <div className="bg-brand-surface border border-white/8 rounded-2xl p-10 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l5 5L20 7" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">You&apos;re onboarded.</h2>
          <p className="text-slate-400 text-sm mb-4">
            {done.tenants} tenant{done.tenants === 1 ? "" : "s"} provisioning. Agreement {done.agreementId} signed.
          </p>
          <p className="text-slate-500 text-xs">Redirecting you to the portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Top bar */}
      <header className="border-b border-brand-surface">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" aria-label="Ascelios — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ascelios-logo.svg" alt="Ascelios" className="h-14 w-auto" />
          </Link>
          <Link href="/portal/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Already a customer? Sign in →
          </Link>
        </div>
      </header>

      {/* Stepper */}
      <div className="border-b border-brand-surface bg-brand-bg/60">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <ol className="flex items-center gap-2 text-xs">
            {STEPS.map((s, i) => {
              const state = i === draft.step ? "current" : i < draft.step ? "done" : "todo";
              return (
                <li key={s.key} className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[11px] shrink-0",
                      state === "done"    && "bg-brand-primary/20 border-brand-primary text-brand-accent",
                      state === "current" && "bg-brand-accent/20 border-brand-accent text-white",
                      state === "todo"    && "border-white/15 text-slate-500",
                    )}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span className={cn(
                    "truncate",
                    state === "current" ? "text-white" : state === "done" ? "text-brand-accent" : "text-slate-500",
                  )}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <span className="w-6 sm:w-10 h-px bg-white/10 mx-1 shrink-0" />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {draft.step === 0 && <CompanyStep draft={draft} update={update} />}
            {draft.step === 1 && <AdminStep   draft={draft} update={update} />}
            {draft.step === 2 && <ServicesStep draft={draft} update={update} monthlyTotal={monthlyTotal} />}
            {draft.step === 3 && <TenantsStep draft={draft} update={update} />}
            {draft.step === 4 && <SignStep    draft={draft} update={update} monthlyTotal={monthlyTotal} />}

            {stepError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {stepError}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={draft.step === 0 || submitting}
                className="text-sm text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
              {draft.step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? "Provisioning…" : "Sign & provision"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-brand-surface px-6 py-5">
        <p className="max-w-4xl mx-auto text-xs text-slate-600">
          Demo onboarding flow. Account data, tenants, and signed agreements are persisted to this browser&apos;s local storage. No real cloud resources are provisioned.
        </p>
      </footer>
    </div>
  );
}

/* ─── Step components ───────────────────────────────────────────────── */

type StepProps = {
  draft: OnboardingDraft;
  update: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
};

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="bg-brand-surface border border-white/8 rounded-2xl p-8">
      <h2 className="text-white text-xl font-semibold mb-1">{title}</h2>
      <p className="text-slate-400 text-sm mb-6">{subtitle}</p>
      {children}
    </section>
  );
}

function CompanyStep({ draft, update }: StepProps) {
  const c = draft.company;
  const set = (k: keyof typeof c, v: string) => update("company", { ...c, [k]: v });
  return (
    <StepShell title="Tell us about your company" subtitle="This is the legal entity Ascelios will contract with.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Company name">
          <input
            type="text"
            value={c.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Acme Corp"
            className={fieldClass}
          />
        </Field>
        <Field label="Country / region of headquarters">
          <input
            type="text"
            value={c.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="United States"
            className={fieldClass}
          />
        </Field>
        <Field label="Industry">
          <select value={c.industry} onChange={(e) => set("industry", e.target.value)} className={fieldClass}>
            <option value="">Select an industry…</option>
            {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-brand-bg">{i}</option>)}
          </select>
        </Field>
        <Field label="Company size">
          <select value={c.size} onChange={(e) => set("size", e.target.value)} className={fieldClass}>
            <option value="">Select…</option>
            {COMPANY_SIZES.map((s) => <option key={s} value={s} className="bg-brand-bg">{s} employees</option>)}
          </select>
        </Field>
      </div>
    </StepShell>
  );
}

function AdminStep({ draft, update }: StepProps) {
  const a = draft.admin;
  const set = (k: keyof typeof a, v: string) => update("admin", { ...a, [k]: v });
  return (
    <StepShell
      title="Create your admin account"
      subtitle="This account will own the workspace and can invite teammates later."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full legal name">
          <input
            type="text"
            value={a.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Jane Doe"
            className={fieldClass}
          />
        </Field>
        <Field label="Work email">
          <input
            type="email"
            value={a.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@acmecorp.com"
            className={fieldClass}
          />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <input
            type="password"
            value={a.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
            className={fieldClass}
          />
        </Field>
      </div>
    </StepShell>
  );
}

function ServicesStep({
  draft, update, monthlyTotal,
}: StepProps & { monthlyTotal: number }) {
  function toggle(key: ServiceKey) {
    const next = draft.services.includes(key)
      ? draft.services.filter((k) => k !== key)
      : [...draft.services, key];
    update("services", next);
  }
  return (
    <StepShell title="Pick your services" subtitle="Subscribe to one or more service lines. You can add more later.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SERVICE_CATALOG.map((s) => {
          const on = draft.services.includes(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggle(s.key)}
              className={cn(
                "text-left rounded-xl p-5 border transition-all flex flex-col gap-2",
                on
                  ? "bg-brand-primary/10 border-brand-primary"
                  : "bg-white/3 border-white/8 hover:border-white/20",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-white font-semibold text-sm">{s.label}</span>
                </div>
                <span className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center",
                  on ? "bg-brand-primary border-brand-primary" : "border-white/20",
                )}>
                  {on && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              <p className="text-xs font-mono text-brand-accent">${s.monthly.toLocaleString()}/mo</p>
            </button>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between text-sm">
        <span className="text-slate-400">Estimated monthly subscription</span>
        <span className="text-white font-semibold">${monthlyTotal.toLocaleString()}</span>
      </div>
    </StepShell>
  );
}

function TenantsStep({ draft, update }: StepProps) {
  const tenants = draft.tenants;

  function setTenant(i: number, patch: Partial<typeof tenants[number]>) {
    const next = tenants.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    update("tenants", next);
  }

  function addTenant() {
    if (tenants.length >= 3) return;
    update("tenants", [...tenants, { name: "", provider: "aws" as CloudProvider, region: "us-east-1" }]);
  }

  function removeTenant(i: number) {
    if (tenants.length <= 1) return;
    update("tenants", tenants.filter((_, idx) => idx !== i));
  }

  return (
    <StepShell
      title="Cloud providers & tenants"
      subtitle="A tenant is an isolated workspace on the cloud provider you choose. Most customers start with one — add more if you need separate dev/prod or multi-cloud."
    >
      <div className="space-y-3">
        {tenants.map((t, i) => {
          const provider = CLOUD_PROVIDERS.find((p) => p.key === t.provider)!;
          return (
            <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Tenant {i + 1}</p>
                {tenants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTenant(i)}
                    className="text-xs text-red-400/80 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Tenant name">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => setTenant(i, { name: e.target.value })}
                    placeholder="acme-prod"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Cloud provider">
                  <select
                    value={t.provider}
                    onChange={(e) => {
                      const provider = e.target.value as CloudProvider;
                      const region = CLOUD_PROVIDERS.find((p) => p.key === provider)!.regions[0];
                      setTenant(i, { provider, region });
                    }}
                    className={fieldClass}
                  >
                    {CLOUD_PROVIDERS.map((p) => (
                      <option key={p.key} value={p.key} className="bg-brand-bg">{p.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Region">
                  <select
                    value={t.region}
                    onChange={(e) => setTenant(i, { region: e.target.value })}
                    className={fieldClass}
                  >
                    {provider.regions.map((r) => (
                      <option key={r} value={r} className="bg-brand-bg">{r}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          );
        })}
        {tenants.length < 3 && (
          <button
            type="button"
            onClick={addTenant}
            className="w-full border border-dashed border-white/15 hover:border-brand-primary/50 hover:text-white rounded-xl py-3 text-sm text-slate-400 transition-colors"
          >
            + Add another tenant
          </button>
        )}
      </div>
    </StepShell>
  );
}

function SignStep({ draft, update, monthlyTotal }: StepProps & { monthlyTotal: number }) {
  const selectedServices = SERVICE_CATALOG.filter((s) => draft.services.includes(s.key));

  return (
    <StepShell
      title="Review & sign"
      subtitle="Review your subscription, then type your legal name to sign the Master Services Agreement and Data Processing Addendum."
    >
      {/* Summary */}
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <dt className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">Company</dt>
          <dd className="text-white">{draft.company.name || "—"}</dd>
          <dd className="text-slate-400 text-xs">{draft.company.industry} · {draft.company.size} · {draft.company.country}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">Admin</dt>
          <dd className="text-white">{draft.admin.fullName || "—"}</dd>
          <dd className="text-slate-400 text-xs font-mono">{draft.admin.email}</dd>
        </div>
      </dl>

      <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-4">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-3">Services</p>
        <ul className="space-y-2">
          {selectedServices.map((s) => (
            <li key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{s.icon} {s.label}</span>
              <span className="text-slate-400 font-mono text-xs">${s.monthly.toLocaleString()}/mo</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-white/8 mt-3 pt-3 flex items-center justify-between">
          <span className="text-slate-400 text-xs">Estimated total</span>
          <span className="text-white font-semibold">${monthlyTotal.toLocaleString()}/mo</span>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-6">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-3">Tenants to provision</p>
        <ul className="space-y-2">
          {draft.tenants.map((t, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-200">
                <span className="font-mono text-xs text-slate-500 mr-2">#{i + 1}</span>
                {t.name || "(unnamed)"}
              </span>
              <span className="text-slate-400 font-mono text-xs">{t.provider.toUpperCase()} · {t.region}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Agreement */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-5">
        <p className="text-white text-sm font-semibold mb-3">Agreement</p>
        <div className="space-y-3 text-xs text-slate-400 max-h-48 overflow-y-auto pr-2 leading-relaxed">
          <p>
            This Master Services Agreement (&quot;Agreement&quot;) governs the provision of Ascelios services by Ascelios to <strong className="text-slate-300">{draft.company.name || "the Customer"}</strong> for the duration of the subscription. Either party may terminate with 30 days&apos; written notice. Subscription fees are billed monthly in arrears.
          </p>
          <p>
            The Data Processing Addendum (&quot;DPA&quot;) applies where Ascelios processes personal data on behalf of the Customer. Ascelios will process data only on documented instructions, will implement appropriate technical and organizational measures, and will assist the Customer with data subject requests.
          </p>
          <p>
            By signing, the signatory represents they are authorized to bind the Customer. The signed agreement is identified by a hash recorded with the timestamp of signature.
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-start gap-2.5 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.agreedTerms}
              onChange={(e) => update("agreedTerms", e.target.checked)}
              className="mt-0.5 accent-brand-primary"
            />
            <span>I have read and agree to the Master Services Agreement.</span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.agreedDpa}
              onChange={(e) => update("agreedDpa", e.target.checked)}
              className="mt-0.5 accent-brand-primary"
            />
            <span>I have read and agree to the Data Processing Addendum (GDPR / DPF compliant).</span>
          </label>
        </div>
      </div>

      <Field label="Type your full legal name to sign" hint="Must match the name entered in Step 2.">
        <input
          type="text"
          value={draft.signedName}
          onChange={(e) => update("signedName", e.target.value)}
          placeholder={draft.admin.fullName || "Jane Doe"}
          className={cn(fieldClass, "italic")}
          style={{ fontFamily: '"Brush Script MT", "Snell Roundhand", cursive', fontSize: "1.25rem" }}
        />
      </Field>
    </StepShell>
  );
}

/* ─── Little helpers ────────────────────────────────────────────────── */

const fieldClass =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 transition-colors";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-600 mt-1 block">{hint}</span>}
    </label>
  );
}
