"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ── Types ───────────────────────────────────────────── */

type Provider = "AWS" | "Azure" | "GCP";
type ResourceType = {
  id: string;
  label: string;
  desc: string;
  providers: Provider[];
  icon: React.ReactNode;
};
type Size = { id: string; label: string; spec: string; price: string };

/* ── Static data ─────────────────────────────────────── */

const providers: { id: Provider; name: string; color: string }[] = [
  { id: "AWS",   name: "Amazon Web Services", color: "text-amber-400 border-amber-400/30 bg-amber-400/5" },
  { id: "Azure", name: "Microsoft Azure",     color: "text-sky-400 border-sky-400/30 bg-sky-400/5" },
  { id: "GCP",   name: "Google Cloud",        color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5" },
];

const resourceTypes: ResourceType[] = [
  {
    id: "kubernetes",
    label: "Kubernetes Cluster",
    desc: "Managed EKS / AKS / GKE cluster with auto-scaling node groups.",
    providers: ["AWS", "Azure", "GCP"],
    icon: (
      <path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    ),
  },
  {
    id: "vm",
    label: "Virtual Machine",
    desc: "Single or group of compute instances with OS of your choice.",
    providers: ["AWS", "Azure", "GCP"],
    icon: (
      <>
        <rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="12.5" cy="4.5" r="1" fill="currentColor"/>
        <circle cx="12.5" cy="11.5" r="1" fill="currentColor"/>
      </>
    ),
  },
  {
    id: "database",
    label: "Managed Database",
    desc: "PostgreSQL, MySQL, or MSSQL with automated backups and failover.",
    providers: ["AWS", "Azure", "GCP"],
    icon: (
      <>
        <ellipse cx="8" cy="5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 5v6a5 2 0 0 0 10 0V5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 8a5 2 0 0 0 10 0" stroke="currentColor" strokeWidth="1.4"/>
      </>
    ),
  },
  {
    id: "sap-deployment",
    label: "SAP Deployment",
    desc: "Full SAP S/4HANA, ECC, or HANA landscape — single or multi-node with per-role sizing.",
    providers: ["AWS", "Azure"],
    icon: (
      <>
        <rect x="2" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 9h4M6 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: "sap",
    label: "SAP Sandbox",
    desc: "Pre-configured SAP S/4HANA or BTP sandbox — quick spin-up for dev and test.",
    providers: ["AWS", "Azure"],
    icon: (
      <>
        <rect x="2" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: "storage",
    label: "Object Storage",
    desc: "S3 / Blob / GCS bucket with lifecycle policies and optional CDN.",
    providers: ["AWS", "Azure", "GCP"],
    icon: (
      <>
        <path d="M2 6l6-4 6 4v8l-6 2-6-2V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M2 6l6 4 6-4M8 10v6" stroke="currentColor" strokeWidth="1.4"/>
      </>
    ),
  },
  {
    id: "loadbalancer",
    label: "Load Balancer",
    desc: "Application or network load balancer with SSL termination.",
    providers: ["AWS", "Azure", "GCP"],
    icon: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 8h6M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  },
];

const regionsByProvider: Record<Provider, string[]> = {
  AWS:   ["us-east-1 (N. Virginia)", "us-west-2 (Oregon)", "eu-west-1 (Ireland)", "eu-central-1 (Frankfurt)", "ap-southeast-1 (Singapore)"],
  Azure: ["westeurope (Amsterdam)", "northeurope (Dublin)", "eastus (Virginia)", "eastus2 (Virginia)", "southeastasia (Singapore)"],
  GCP:   ["europe-west1 (Belgium)", "europe-west4 (Netherlands)", "us-central1 (Iowa)", "us-east1 (South Carolina)", "asia-southeast1 (Singapore)"],
};

const sizesByType: Record<string, Size[]> = {
  kubernetes: [
    { id: "small",  label: "Small",    spec: "2 nodes · 2 vCPU / 8 GB each",    price: "~$180/mo" },
    { id: "medium", label: "Medium",   spec: "3 nodes · 4 vCPU / 16 GB each",   price: "~$420/mo" },
    { id: "large",  label: "Large",    spec: "5 nodes · 8 vCPU / 32 GB each",   price: "~$980/mo" },
    { id: "custom", label: "Custom",   spec: "Ascelios will size with you",      price: "Custom" },
  ],
  vm: [
    { id: "small",  label: "Small",    spec: "2 vCPU / 4 GB RAM",               price: "~$40/mo" },
    { id: "medium", label: "Medium",   spec: "4 vCPU / 16 GB RAM",              price: "~$120/mo" },
    { id: "large",  label: "Large",    spec: "8 vCPU / 32 GB RAM",              price: "~$260/mo" },
    { id: "custom", label: "Custom",   spec: "Describe your requirements",       price: "Custom" },
  ],
  database: [
    { id: "small",  label: "Dev / Test", spec: "2 vCPU / 8 GB · 100 GB SSD",   price: "~$80/mo" },
    { id: "medium", label: "Production", spec: "4 vCPU / 16 GB · 500 GB SSD",  price: "~$210/mo" },
    { id: "large",  label: "HA Cluster", spec: "8 vCPU / 32 GB · 1 TB SSD × 2",price: "~$580/mo" },
    { id: "custom", label: "Custom",     spec: "Describe your requirements",     price: "Custom" },
  ],
  sap: [
    { id: "sandbox",    label: "Sandbox",    spec: "16 vCPU / 128 GB · HANA Express",  price: "~$900/mo" },
    { id: "dev",        label: "Development",spec: "32 vCPU / 256 GB · SAP S/4HANA",   price: "~$2,200/mo" },
    { id: "production", label: "Production", spec: "64 vCPU / 512 GB · SAP S/4HANA",  price: "~$4,800/mo" },
    { id: "custom",     label: "Custom",     spec: "Describe your requirements",        price: "Custom" },
  ],
  storage: [
    { id: "small",  label: "Starter",  spec: "Up to 1 TB · LRS",               price: "~$25/mo" },
    { id: "medium", label: "Standard", spec: "Up to 10 TB · ZRS",              price: "~$100/mo" },
    { id: "large",  label: "Archive",  spec: "Up to 100 TB · GRS + Glacier",   price: "~$380/mo" },
    { id: "custom", label: "Custom",   spec: "Describe your requirements",      price: "Custom" },
  ],
  loadbalancer: [
    { id: "basic",    label: "Basic",    spec: "Layer-4 / TCP+UDP",             price: "~$20/mo" },
    { id: "standard", label: "Standard", spec: "Layer-7 / HTTP + SSL term.",    price: "~$55/mo" },
    { id: "waf",      label: "WAF",      spec: "Layer-7 + WAF rules + DDoS",    price: "~$180/mo" },
    { id: "custom",   label: "Custom",   spec: "Describe your requirements",    price: "Custom" },
  ],
};

const STEPS = ["Provider", "Resource", "Configure", "Review"];

/* ── Component ───────────────────────────────────────── */

export default function ProvisionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [resourceType, setResourceType] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const selectedType = resourceTypes.find((r) => r.id === resourceType);
  const availableSizes = resourceType ? (sizesByType[resourceType] ?? []) : [];
  const selectedSize = availableSizes.find((s) => s.id === size);
  const availableRegions = provider ? regionsByProvider[provider] : [];

  function next() {
    if (resourceType === "sap-deployment") {
      router.push(`/portal/infrastructure/new/sap?provider=${provider ?? ""}`);
      return;
    }
    setStep((s) => s + 1);
  }
  function back() { setStep((s) => s - 1); }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSubmitting(false);
    setDone(true);
  }

  /* ── Success ── */
  if (done) {
    return (
      <div className="px-8 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-sm w-full bg-brand-surface border border-white/8 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Request submitted</h2>
          <p className="text-slate-400 text-sm mb-1">
            <span className="text-white font-medium font-mono">{name}</span> will be provisioned by the Ascelios team.
          </p>
          <p className="text-slate-500 text-xs mb-1">Provider: {provider} · {selectedType?.label}</p>
          <p className="text-slate-500 text-xs mb-8">Estimated delivery: <span className="text-brand-accent">within 4 hours</span></p>
          <div className="flex flex-col gap-2">
            <Link href="/portal/infrastructure">
              <Button className="w-full bg-brand-primary hover:bg-brand-accent text-white">
                View Infrastructure
              </Button>
            </Link>
            <Link href="/portal/infrastructure/new">
              <Button variant="outline" className="w-full border-white/15 text-slate-300 hover:text-white hover:bg-white/5">
                Provision Another
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Wizard ── */
  return (
    <div className="px-8 py-8">
      {/* Back */}
      <Link href="/portal/infrastructure" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M8.5 11L4.5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Infrastructure
      </Link>

      <h1 className="text-2xl font-semibold text-white mb-2">Provision a Resource</h1>
      <p className="text-slate-400 text-sm mb-8">
        Tell Ascelios what you need — we&apos;ll configure, deploy, and hand it back to you managed.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-2 ${i < step ? "cursor-pointer" : ""}`} onClick={() => { if (i < step) setStep(i); }}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                i < step  ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-400" :
                i === step ? "bg-brand-primary text-white" :
                "bg-white/5 border border-white/15 text-slate-500"
              }`}>
                {i < step ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? "text-white font-medium" : i < step ? "text-slate-400" : "text-slate-600"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-px mx-3 ${i < step ? "bg-emerald-400/30" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-3xl">

        {/* Step 0: Provider */}
        {step === 0 && (
          <div>
            <p className="text-sm font-semibold text-white mb-4">Choose a cloud provider</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProvider(p.id); setResourceType(null); setSize(null); setRegion(""); }}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    provider === p.id
                      ? `${p.color} border-current`
                      : "bg-brand-surface border-white/10 hover:border-white/25"
                  }`}
                >
                  <p className={`text-lg font-bold mb-1 ${provider === p.id ? "" : "text-white"}`}>{p.id}</p>
                  <p className={`text-xs ${provider === p.id ? "opacity-80" : "text-slate-500"}`}>{p.name}</p>
                </button>
              ))}
            </div>
            <Button
              disabled={!provider}
              onClick={next}
              className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40"
            >
              Continue →
            </Button>
          </div>
        )}

        {/* Step 1: Resource type */}
        {step === 1 && provider && (
          <div>
            <p className="text-sm font-semibold text-white mb-1">Choose a resource type</p>
            <p className="text-xs text-slate-500 mb-5">Showing resources available on {provider}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {resourceTypes
                .filter((r) => r.providers.includes(provider))
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setResourceType(r.id); setSize(null); }}
                    className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                      resourceType === r.id
                        ? "bg-brand-primary/15 border-brand-primary text-brand-accent"
                        : "bg-brand-surface border-white/10 hover:border-white/25 text-white"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      resourceType === r.id ? "bg-brand-primary/20" : "bg-white/5"
                    }`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-current" aria-hidden="true">
                        {r.icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{r.label}</p>
                      <p className={`text-xs leading-relaxed ${resourceType === r.id ? "opacity-70" : "text-slate-500"}`}>{r.desc}</p>
                    </div>
                  </button>
                ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={back} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">
                ← Back
              </Button>
              <Button
                disabled={!resourceType}
                onClick={next}
                className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && resourceType && provider && (
          <div className="space-y-6">
            <p className="text-sm font-semibold text-white mb-4">Configure your {selectedType?.label}</p>

            {/* Name */}
            <div>
              <Label htmlFor="res-name" className="text-xs text-slate-400 mb-1.5 block">Resource name</Label>
              <Input
                id="res-name"
                placeholder={`e.g. prod-${resourceType}-01`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary font-mono max-w-sm"
              />
              <p className="text-xs text-slate-600 mt-1.5">Lowercase letters, numbers, and hyphens only.</p>
            </div>

            {/* Region */}
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Region</Label>
              <div className="flex flex-wrap gap-2">
                {availableRegions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      region === r
                        ? "bg-brand-primary/20 border-brand-primary text-brand-accent"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Size / Tier</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      size === s.id
                        ? "bg-brand-primary/15 border-brand-primary"
                        : "bg-brand-surface border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${size === s.id ? "text-brand-accent" : "text-white"}`}>{s.label}</p>
                      <span className={`text-xs font-mono ${size === s.id ? "text-brand-accent" : "text-slate-400"}`}>{s.price}</span>
                    </div>
                    <p className={`text-xs ${size === s.id ? "text-slate-400" : "text-slate-500"}`}>{s.spec}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="res-notes" className="text-xs text-slate-400 mb-1.5 block">Additional requirements <span className="text-slate-600">(optional)</span></Label>
              <textarea
                id="res-notes"
                rows={3}
                placeholder="Specific OS, engine version, tags, peering requirements…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={back} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">
                ← Back
              </Button>
              <Button
                disabled={!name || !region || !size}
                onClick={next}
                className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40"
              >
                Review →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <p className="text-sm font-semibold text-white mb-5">Review your request</p>

            <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden mb-6">
              {[
                { label: "Cloud Provider",  value: provider },
                { label: "Resource Type",   value: selectedType?.label },
                { label: "Name",            value: <span className="font-mono">{name}</span> },
                { label: "Region",          value: region },
                { label: "Size",            value: `${selectedSize?.label} — ${selectedSize?.spec}` },
                { label: "Est. cost",       value: selectedSize?.price },
                ...(notes ? [{ label: "Notes", value: notes }] : []),
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className={`flex items-start gap-4 px-6 py-4 text-sm ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <span className="text-slate-500 w-32 shrink-0">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-brand-primary/8 border border-brand-primary/20 rounded-xl px-5 py-4 mb-6 text-sm text-slate-400">
              <p className="text-white font-medium mb-1">What happens next</p>
              The Ascelios engineering team will review your request, provision the resource using Terraform, run health checks, and notify you when it is live — typically <span className="text-brand-accent">within 4 hours</span> during business hours.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={back} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[160px]"
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
