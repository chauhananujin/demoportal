"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ── Types ───────────────────────────────────────────── */

type Provider = "AWS" | "Azure";
type SAPProduct = "s4hana" | "ecc" | "hana" | "btp";
type Architecture = "single" | "multi";
type OS = "sles15" | "rhel8";
type HSRMode = "SYNC" | "SYNCMEM" | "ASYNC";
type HAPlacement = "same-az" | "cross-az";
type HATier = "two-tier" | "three-tier";

interface InstanceType { id: string; label: string; spec: string; price: string; tag: string }
interface NodeConfig { instanceId: string; storageTb: number }
interface HAConfig {
  enabled:    boolean;
  hsrMode:    HSRMode;
  placement:  HAPlacement;
  tier:       HATier;
}
interface MultiConfig {
  ascs: NodeConfig;
  pas:  NodeConfig;
  aas:  NodeConfig & { count: number };
  db:   NodeConfig;
  ha:   HAConfig;
}

/* ── Static data ─────────────────────────────────────── */

const sapProducts: { id: SAPProduct; label: string; sub: string; desc: string }[] = [
  {
    id: "s4hana",
    label: "SAP S/4HANA",
    sub: "2023 · 2022 · 2021",
    desc: "Next-generation ERP on SAP HANA in-memory database. Supports both Greenfield and system conversion deployments.",
  },
  {
    id: "ecc",
    label: "SAP ECC 6.0",
    sub: "EHP 8 with AnyDB",
    desc: "Classic SAP ERP with support for Oracle, SQL Server, DB2, and MaxDB. Ideal for migration-ready landscapes.",
  },
  {
    id: "hana",
    label: "SAP HANA",
    sub: "2.0 SPS 07+",
    desc: "Standalone in-memory platform for analytics, data warehousing, or as a database layer for any SAP application.",
  },
  {
    id: "btp",
    label: "SAP BTP",
    sub: "Cloud Foundry · Kyma",
    desc: "Business Technology Platform runtime for extensions, integrations, and analytics on top of your SAP core.",
  },
];

const appInstanceTypes: InstanceType[] = [
  { id: "8x64",   label: "8 vCPU / 64 GB",   spec: "8 vCPU · 64 GB RAM · 256 GB SSD",   price: "~$380/mo",  tag: "Dev / Sandbox" },
  { id: "16x128", label: "16 vCPU / 128 GB",  spec: "16 vCPU · 128 GB RAM · 512 GB SSD", price: "~$820/mo",  tag: "QA / Test" },
  { id: "32x256", label: "32 vCPU / 256 GB",  spec: "32 vCPU · 256 GB RAM · 1 TB SSD",   price: "~$1,900/mo", tag: "Production" },
  { id: "64x512", label: "64 vCPU / 512 GB",  spec: "64 vCPU · 512 GB RAM · 2 TB SSD",   price: "~$3,600/mo", tag: "Large Prod" },
  { id: "custom", label: "Custom",             spec: "Ascelios will size with you",         price: "Custom",    tag: "Any scale" },
];

const ascsInstanceTypes: InstanceType[] = [
  { id: "2x8",  label: "2 vCPU / 8 GB",  spec: "2 vCPU · 8 GB RAM · 64 GB SSD",   price: "~$60/mo",  tag: "Standard" },
  { id: "4x16", label: "4 vCPU / 16 GB", spec: "4 vCPU · 16 GB RAM · 128 GB SSD", price: "~$110/mo", tag: "HA ready" },
];

const dbInstanceTypes: InstanceType[] = [
  { id: "16x256",   label: "16 vCPU / 256 GB",  spec: "16 vCPU · 256 GB RAM HANA · 1 TB SSD",   price: "~$1,200/mo", tag: "Small Prod" },
  { id: "32x512",   label: "32 vCPU / 512 GB",  spec: "32 vCPU · 512 GB RAM HANA · 2 TB SSD",   price: "~$2,400/mo", tag: "Medium Prod" },
  { id: "64x1024",  label: "64 vCPU / 1 TB",    spec: "64 vCPU · 1 TB RAM HANA · 4 TB SSD",     price: "~$4,600/mo", tag: "Large Prod" },
  { id: "128x2048", label: "128 vCPU / 2 TB",   spec: "128 vCPU · 2 TB RAM HANA · 8 TB SSD",    price: "~$9,000/mo", tag: "Enterprise" },
  { id: "custom",   label: "Custom HANA sizing", spec: "Ascelios will size with you",              price: "Custom",     tag: "Any scale" },
];

const regionsByProvider: Record<Provider, string[]> = {
  AWS:   ["us-east-1 (N. Virginia)", "us-west-2 (Oregon)", "eu-west-1 (Ireland)", "eu-central-1 (Frankfurt)", "ap-southeast-1 (Singapore)"],
  Azure: ["westeurope (Amsterdam)", "northeurope (Dublin)", "eastus (Virginia)", "eastus2 (Virginia)", "southeastasia (Singapore)"],
};

const osOptions: { id: OS; label: string; sub: string }[] = [
  { id: "sles15", label: "SUSE Linux Enterprise 15 SP5", sub: "SAP-certified · Recommended" },
  { id: "rhel8",  label: "Red Hat Enterprise Linux 8.9",  sub: "SAP-certified · Supported" },
];

const hsrModes: { id: HSRMode; label: string; desc: string; tag: string; recommended?: boolean }[] = [
  {
    id: "SYNC",
    label: "SYNC",
    desc: "Secondary acknowledges only after log has been written to both primary and secondary. Zero data loss on failover.",
    tag: "Zero RPO",
    recommended: true,
  },
  {
    id: "SYNCMEM",
    label: "SYNCMEM",
    desc: "Secondary acknowledges after log is in-memory on the secondary — before persistence. Higher throughput, minimal data loss risk.",
    tag: "Near-zero RPO",
  },
  {
    id: "ASYNC",
    label: "ASYNC",
    desc: "Primary does not wait for secondary acknowledgement. No replication latency impact, but data loss is possible on sudden failover.",
    tag: "DR / geo-replication",
  },
];

const haPlacementOptions: { id: HAPlacement; label: string; desc: string; recommended?: boolean }[] = [
  {
    id: "cross-az",
    label: "Different Availability Zones",
    desc: "Primary and secondary in separate AZs. Protects against full AZ outages. Slight additional replication latency (~2 ms). Recommended for production.",
    recommended: true,
  },
  {
    id: "same-az",
    label: "Same Availability Zone",
    desc: "Both nodes in the same AZ. Lower replication latency, but no protection against AZ-level failures. Suitable for cost-sensitive workloads.",
  },
];

const haTierOptions: { id: HATier; label: string; desc: string }[] = [
  {
    id: "two-tier",
    label: "Two-Tier (Primary + Secondary)",
    desc: "Standard HA setup: one primary HANA node with one synchronous secondary. Automatic failover via Pacemaker.",
  },
  {
    id: "three-tier",
    label: "Three-Tier (Primary + Secondary + DR)",
    desc: "Adds a third ASYNC replica in a separate region for disaster recovery. Failover to secondary is automatic; DR promotion is manual.",
  },
];

const STEPS = ["Product", "Architecture", "Nodes", "Cloud & Region", "Review"];

/* ── Helpers ─────────────────────────────────────────── */

function priceNum(p: string) {
  const m = p.replace(/[~$,]/g, "").replace("/mo", "");
  return parseFloat(m) || 0;
}

function totalEstimate(arch: Architecture, single: NodeConfig | null, multi: MultiConfig | null) {
  if (arch === "single" && single) {
    const t = appInstanceTypes.find((i) => i.id === single.instanceId);
    return t ? `~$${priceNum(t.price).toLocaleString()}/mo` : "Custom pricing";
  }
  if (arch === "multi" && multi) {
    const ascsT = ascsInstanceTypes.find((i) => i.id === multi.ascs.instanceId);
    const pasT  = appInstanceTypes.find((i) => i.id === multi.pas.instanceId);
    const aasT  = appInstanceTypes.find((i) => i.id === multi.aas.instanceId);
    const dbT   = dbInstanceTypes.find((i) => i.id === multi.db.instanceId);
    const items = [ascsT, pasT, dbT].map((t) => priceNum(t?.price ?? "0"));
    const aasTotal = priceNum(aasT?.price ?? "0") * multi.aas.count;
    const haFactor = multi.ha.enabled ? (multi.ha.tier === "three-tier" ? 2.2 : 1.6) : 1;
    const sum = (items[0] + items[1] + items[2] + aasTotal) * haFactor;
    if ([ascsT, pasT, dbT].some((t) => !t) || (multi.aas.count > 0 && !aasT)) return "Custom pricing";
    return `~$${Math.round(sum / 100) * 100 > 0 ? (Math.round(sum / 100) * 100).toLocaleString() : sum.toLocaleString()}/mo`;
  }
  return "—";
}

/* ── Sub-components ──────────────────────────────────── */

function InstanceCard({ item, selected, onClick }: { item: InstanceType; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all w-full ${
        selected
          ? "bg-brand-primary/15 border-brand-primary"
          : "bg-brand-surface border-white/10 hover:border-white/25"
      }`}
    >
      <div className="flex items-start justify-between mb-1 gap-2">
        <p className={`text-sm font-medium leading-tight ${selected ? "text-brand-accent" : "text-white"}`}>{item.label}</p>
        <span className={`font-mono text-xs shrink-0 ${selected ? "text-brand-accent" : "text-slate-400"}`}>{item.price}</span>
      </div>
      <p className={`text-xs leading-relaxed ${selected ? "text-slate-400" : "text-slate-500"}`}>{item.spec}</p>
      <span className={`inline-block mt-2 text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded border ${
        selected ? "text-brand-accent border-brand-accent/30 bg-brand-accent/5" : "text-slate-600 border-white/10"
      }`}>{item.tag}</span>
    </button>
  );
}

function StorageSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const options = [0.5, 1, 2, 4, 8, 16];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
            value === v
              ? "bg-brand-primary/20 border-brand-primary text-brand-accent"
              : "bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
          }`}
        >
          {v < 1 ? `${v * 1000} GB` : `${v} TB`}
        </button>
      ))}
    </div>
  );
}

/* ── Architecture diagram ────────────────────────────── */

function SingleNodeDiagram({ selected }: { selected: boolean }) {
  return (
    <div className={`p-5 rounded-xl border transition-all ${selected ? "border-brand-primary bg-brand-primary/5" : "border-white/10"}`}>
      <div className="flex flex-col items-center gap-1 mb-4">
        <div className={`w-36 border rounded-lg px-3 py-2 text-center text-xs font-mono ${selected ? "border-brand-primary/40 text-brand-accent bg-brand-primary/10" : "border-white/15 text-slate-400 bg-white/3"}`}>
          SAP App Server
        </div>
        <div className="w-px h-3 bg-white/15" />
        <div className={`w-36 border rounded-lg px-3 py-2 text-center text-xs font-mono ${selected ? "border-brand-primary/40 text-brand-accent bg-brand-primary/10" : "border-white/15 text-slate-400 bg-white/3"}`}>
          SAP HANA DB
        </div>
        <p className={`text-[10px] mt-1 ${selected ? "text-brand-accent/60" : "text-slate-600"}`}>co-located on same host</p>
      </div>
      <p className={`text-xs font-medium mb-1 ${selected ? "text-white" : "text-slate-300"}`}>Single Node</p>
      <p className={`text-xs leading-relaxed ${selected ? "text-slate-400" : "text-slate-500"}`}>
        All SAP components — application server and HANA database — run on a single large host. Simpler to operate; ideal for dev, test, and small production workloads.
      </p>
    </div>
  );
}

function MultiNodeDiagram({ selected }: { selected: boolean }) {
  const c = selected ? "border-brand-primary/40 text-brand-accent bg-brand-primary/10" : "border-white/15 text-slate-400 bg-white/3";
  const line = "w-px h-3 bg-white/15 mx-auto";
  return (
    <div className={`p-5 rounded-xl border transition-all ${selected ? "border-brand-primary bg-brand-primary/5" : "border-white/10"}`}>
      <div className="flex flex-col items-center gap-1 mb-4">
        <div className={`w-28 border rounded-lg px-2 py-1.5 text-center text-[10px] font-mono ${c}`}>ASCS Node</div>
        <div className={line} />
        <div className="flex items-center gap-2">
          <div className={`w-24 border rounded-lg px-2 py-1.5 text-center text-[10px] font-mono ${c}`}>PAS Node</div>
          <span className={`text-[10px] ${selected ? "text-slate-500" : "text-slate-700"}`}>+</span>
          <div className={`w-24 border rounded-lg px-2 py-1.5 text-center text-[10px] font-mono ${c}`}>AAS ×n</div>
        </div>
        <div className={line} />
        <div className={`w-28 border rounded-lg px-2 py-1.5 text-center text-[10px] font-mono ${c}`}>HANA DB Node</div>
      </div>
      <p className={`text-xs font-medium mb-1 ${selected ? "text-white" : "text-slate-300"}`}>Multi Node</p>
      <p className={`text-xs leading-relaxed ${selected ? "text-slate-400" : "text-slate-500"}`}>
        Distributed landscape with dedicated nodes per role: ASCS for central services, PAS and optional AAS for application load, and a separate HANA database node. Supports HA clustering.
      </p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */

function SAPWizardInner() {
  const params = useSearchParams();
  const initialProvider = (params.get("provider") as Provider | null) ?? null;

  const [step, setStep]   = useState(0);
  const [product, setProduct] = useState<SAPProduct | null>(null);
  const [arch, setArch]   = useState<Architecture | null>(null);
  const [os, setOs]       = useState<OS>("sles15");
  const [name, setName]   = useState("");
  const [provider, setProvider] = useState<Provider | null>(initialProvider);
  const [region, setRegion]     = useState("");

  /* single-node state */
  const [singleNode, setSingleNode] = useState<NodeConfig>({ instanceId: "", storageTb: 1 });

  /* multi-node state */
  const [multi, setMulti] = useState<MultiConfig>({
    ascs: { instanceId: "2x8",  storageTb: 0.5 },
    pas:  { instanceId: "",     storageTb: 1 },
    aas:  { instanceId: "",     storageTb: 1, count: 0 },
    db:   { instanceId: "",     storageTb: 2 },
    ha: {
      enabled:   false,
      hsrMode:   "SYNC",
      placement: "cross-az",
      tier:      "two-tier",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);

  const selectedProduct = sapProducts.find((p) => p.id === product);
  const availableRegions = provider ? regionsByProvider[provider] : [];

  const canAdvanceNodes =
    arch === "single"
      ? !!singleNode.instanceId
      : !!multi.ascs.instanceId && !!multi.pas.instanceId && !!multi.db.instanceId;

  const canAdvanceCloud = !!provider && !!region && !!name;

  function patchMulti(role: keyof Omit<MultiConfig, "ha">, patch: Partial<NodeConfig & { count: number }>) {
    setMulti((prev) => ({ ...prev, [role]: { ...prev[role], ...patch } }));
  }

  function patchHA(patch: Partial<HAConfig>) {
    setMulti((prev) => ({ ...prev, ha: { ...prev.ha, ...patch } }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSubmitting(false);
    setDone(true);
  }

  /* ── Success ── */
  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-sm w-full bg-brand-surface border border-white/8 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">SAP deployment requested</h2>
          <p className="text-slate-400 text-sm mb-1">
            <span className="text-white font-mono font-medium">{name}</span> — {selectedProduct?.label} · {arch === "single" ? "Single Node" : "Multi Node"}
          </p>
          <p className="text-slate-500 text-xs mb-1">{provider} · {region}</p>
          <p className="text-slate-500 text-xs mb-8">
            Est. delivery: <span className="text-brand-accent">within 8 business hours</span>
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/portal/infrastructure">
              <Button className="w-full bg-brand-primary hover:bg-brand-accent text-white">View Infrastructure</Button>
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

  return (
    <div className="px-8 py-8">
      {/* Back */}
      <Link href="/portal/infrastructure/new" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M8.5 11L4.5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Provision Resource
      </Link>

      {/* Title */}
      <div className="flex items-start gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-brand-accent" aria-hidden="true">
            <rect x="2" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M6 9h4M6 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">SAP Deployment</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure a certified SAP landscape — Ascelios provisions, certifies, and hands it back managed.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center shrink-0">
            <div
              className={i < step ? "cursor-pointer" : ""}
              onClick={() => { if (i < step) setStep(i); }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step   ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-400" :
                  i === step ? "bg-brand-primary text-white" :
                               "bg-white/5 border border-white/15 text-slate-500"
                }`}>
                  {i < step ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-sm hidden sm:block whitespace-nowrap ${
                  i === step ? "text-white font-medium" : i < step ? "text-slate-400" : "text-slate-600"
                }`}>{label}</span>
              </div>
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 h-px mx-3 shrink-0 ${i < step ? "bg-emerald-400/30" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      <div className="max-w-4xl">

        {/* ── Step 0: Product ── */}
        {step === 0 && (
          <div>
            <p className="text-sm font-semibold text-white mb-4">Which SAP product do you want to deploy?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {sapProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProduct(p.id)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    product === p.id
                      ? "bg-brand-primary/15 border-brand-primary"
                      : "bg-brand-surface border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <p className={`text-sm font-semibold ${product === p.id ? "text-brand-accent" : "text-white"}`}>{p.label}</p>
                    <span className={`font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0 ${
                      product === p.id ? "text-brand-accent border-brand-accent/30" : "text-slate-600 border-white/10"
                    }`}>{p.sub}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${product === p.id ? "text-slate-400" : "text-slate-500"}`}>{p.desc}</p>
                </button>
              ))}
            </div>
            <Button disabled={!product} onClick={() => setStep(1)} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">
              Continue →
            </Button>
          </div>
        )}

        {/* ── Step 1: Architecture ── */}
        {step === 1 && (
          <div>
            <p className="text-sm font-semibold text-white mb-1">Choose a deployment architecture</p>
            <p className="text-xs text-slate-500 mb-5">{selectedProduct?.label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button onClick={() => setArch("single")}>
                <SingleNodeDiagram selected={arch === "single"} />
              </button>
              <button onClick={() => setArch("multi")}>
                <MultiNodeDiagram selected={arch === "multi"} />
              </button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">← Back</Button>
              <Button disabled={!arch} onClick={() => setStep(2)} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Configure Nodes →</Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Node configuration ── */}
        {step === 2 && arch === "single" && (
          <div className="space-y-7">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">Configure your single node</p>
              <p className="text-xs text-slate-500">Application server and HANA database share this instance.</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Instance type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {appInstanceTypes.map((t) => (
                  <InstanceCard
                    key={t.id}
                    item={t}
                    selected={singleNode.instanceId === t.id}
                    onClick={() => setSingleNode((p) => ({ ...p, instanceId: t.id }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Data storage (HANA data + log volumes)</p>
              <StorageSlider value={singleNode.storageTb} onChange={(v) => setSingleNode((p) => ({ ...p, storageTb: v }))} />
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Operating system</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {osOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setOs(o.id)}
                    className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                      os === o.id ? "bg-brand-primary/15 border-brand-primary" : "bg-brand-surface border-white/10 hover:border-white/25"
                    }`}
                  >
                    <p className={`text-sm font-medium mb-1 ${os === o.id ? "text-brand-accent" : "text-white"}`}>{o.label}</p>
                    <p className={`text-xs ${os === o.id ? "text-slate-400" : "text-slate-500"}`}>{o.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">← Back</Button>
              <Button disabled={!canAdvanceNodes} onClick={() => setStep(3)} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Cloud & Region →</Button>
            </div>
          </div>
        )}

        {step === 2 && arch === "multi" && (
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">Configure each node role</p>
              <p className="text-xs text-slate-500">Each role runs on a dedicated host. Size them independently based on expected workload.</p>
            </div>

            {/* ASCS */}
            <section className="bg-brand-surface border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                  <span className="text-violet-400 text-[10px] font-bold">CS</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">ASCS — Central Services</p>
                  <p className="text-xs text-slate-500">Message server + Enqueue server. 1 node (+ HA standby if enabled).</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ascsInstanceTypes.map((t) => (
                  <InstanceCard key={t.id} item={t} selected={multi.ascs.instanceId === t.id} onClick={() => patchMulti("ascs", { instanceId: t.id })} />
                ))}
              </div>
            </section>

            {/* PAS */}
            <section className="bg-brand-surface border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
                  <span className="text-sky-400 text-[10px] font-bold">PA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">PAS — Primary Application Server</p>
                  <p className="text-xs text-slate-500">Primary dialog, batch, and update work processes. Always 1 node.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {appInstanceTypes.map((t) => (
                  <InstanceCard key={t.id} item={t} selected={multi.pas.instanceId === t.id} onClick={() => patchMulti("pas", { instanceId: t.id })} />
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2">PAS data storage</p>
                <StorageSlider value={multi.pas.storageTb} onChange={(v) => patchMulti("pas", { storageTb: v })} />
              </div>
            </section>

            {/* AAS */}
            <section className="bg-brand-surface border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <span className="text-amber-400 text-[10px] font-bold">AA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AAS — Additional Application Servers <span className="text-slate-500 font-normal">(optional)</span></p>
                  <p className="text-xs text-slate-500">Scale-out dialog work processes. Add 0–5 identical AAS nodes.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Label className="text-xs text-slate-400 shrink-0">AAS node count</Label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => patchMulti("aas", { count: Math.max(0, multi.aas.count - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/15 text-white flex items-center justify-center hover:bg-white/10 transition-colors text-sm"
                  >−</button>
                  <span className="text-white font-semibold w-4 text-center">{multi.aas.count}</span>
                  <button
                    onClick={() => patchMulti("aas", { count: Math.min(5, multi.aas.count + 1) })}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/15 text-white flex items-center justify-center hover:bg-white/10 transition-colors text-sm"
                  >+</button>
                </div>
                {multi.aas.count === 0 && <span className="text-xs text-slate-600">No AAS — add if you need scale-out</span>}
              </div>

              {multi.aas.count > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-3">Instance type per AAS node ({multi.aas.count}×)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {appInstanceTypes.map((t) => (
                      <InstanceCard key={t.id} item={t} selected={multi.aas.instanceId === t.id} onClick={() => patchMulti("aas", { instanceId: t.id })} />
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* DB */}
            <section className="bg-brand-surface border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                  <span className="text-emerald-400 text-[10px] font-bold">DB</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">HANA Database Node</p>
                  <p className="text-xs text-slate-500">SAP HANA in-memory database. 1 node (+ HA secondary if enabled).</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {dbInstanceTypes.map((t) => (
                  <InstanceCard key={t.id} item={t} selected={multi.db.instanceId === t.id} onClick={() => patchMulti("db", { instanceId: t.id })} />
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">HANA data + log volumes</p>
                <StorageSlider value={multi.db.storageTb} onChange={(v) => patchMulti("db", { storageTb: v })} />
              </div>
            </section>

            {/* HANA HA */}
            <section className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
              {/* Toggle header */}
              <div className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-semibold text-white mb-1">HANA High Availability</p>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    HANA System Replication (HSR) with Pacemaker cluster and cloud-native STONITH fencing. Required for production SLAs.
                  </p>
                </div>
                <button
                  onClick={() => patchHA({ enabled: !multi.ha.enabled })}
                  className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${multi.ha.enabled ? "bg-brand-primary" : "bg-white/10"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${multi.ha.enabled ? "left-6" : "left-1"}`} />
                </button>
              </div>

              {multi.ha.enabled && (
                <div className="border-t border-white/8 px-5 py-5 space-y-6">

                  {/* HSR Replication Mode */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                      HSR Replication Mode
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {hsrModes.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => patchHA({ hsrMode: m.id })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            multi.ha.hsrMode === m.id
                              ? "bg-brand-primary/15 border-brand-primary"
                              : "bg-white/3 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-mono text-sm font-bold ${multi.ha.hsrMode === m.id ? "text-brand-accent" : "text-white"}`}>
                              {m.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {m.recommended && (
                                <span className="font-mono text-[9px] uppercase tracking-wide text-emerald-400 border border-emerald-400/30 rounded-full px-1.5 py-0.5">
                                  Recommended
                                </span>
                              )}
                              <span className={`font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${
                                multi.ha.hsrMode === m.id
                                  ? "text-brand-accent border-brand-accent/30"
                                  : "text-slate-600 border-white/10"
                              }`}>{m.tag}</span>
                            </div>
                          </div>
                          <p className={`text-xs leading-relaxed ${multi.ha.hsrMode === m.id ? "text-slate-400" : "text-slate-500"}`}>
                            {m.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Site placement */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Secondary Site Placement</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {haPlacementOptions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => patchHA({ placement: p.id })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            multi.ha.placement === p.id
                              ? "bg-brand-primary/15 border-brand-primary"
                              : "bg-white/3 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-sm font-medium ${multi.ha.placement === p.id ? "text-brand-accent" : "text-white"}`}>
                              {p.label}
                            </span>
                            {p.recommended && (
                              <span className="font-mono text-[9px] uppercase tracking-wide text-emerald-400 border border-emerald-400/30 rounded-full px-1.5 py-0.5">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${multi.ha.placement === p.id ? "text-slate-400" : "text-slate-500"}`}>
                            {p.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HA Tier */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Replication Topology</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {haTierOptions.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => patchHA({ tier: t.id })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            multi.ha.tier === t.id
                              ? "bg-brand-primary/15 border-brand-primary"
                              : "bg-white/3 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <p className={`text-sm font-medium mb-1.5 ${multi.ha.tier === t.id ? "text-brand-accent" : "text-white"}`}>{t.label}</p>
                          <p className={`text-xs leading-relaxed ${multi.ha.tier === t.id ? "text-slate-400" : "text-slate-500"}`}>{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary node & cluster info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                        Secondary HANA Node
                        {multi.ha.tier === "three-tier" && <span className="ml-1 text-slate-600">(+ tertiary DR)</span>}
                      </p>
                      <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-xs">Instance</span>
                          <span className="text-white font-mono text-xs">
                            {dbInstanceTypes.find((t) => t.id === multi.db.instanceId)?.label ?? <span className="text-slate-600">select DB node first</span>}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-xs">Replication</span>
                          <span className="font-mono text-xs text-brand-accent">{multi.ha.hsrMode} · logreplay</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-xs">Placement</span>
                          <span className="text-white text-xs">{multi.ha.placement === "cross-az" ? "Cross-AZ" : "Same AZ"}</span>
                        </div>
                        {multi.ha.tier === "three-tier" && (
                          <div className="flex items-center justify-between border-t border-white/8 pt-2">
                            <span className="text-slate-500 text-xs">DR tertiary</span>
                            <span className="font-mono text-xs text-amber-400">ASYNC · separate region</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5">
                        Secondary must match primary instance type for transparent failover.
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Cluster & Fencing</p>
                      <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 space-y-2">
                        {[
                          { label: "Cluster stack",   value: "Pacemaker + corosync" },
                          { label: "RA agent",        value: "SAPHanaSR / SAPHanaController" },
                          { label: "STONITH",         value: provider === "AWS" ? "fence_aws" : "fence_azure_arm" },
                          { label: "HANA hook",       value: "SAPHanaSR.py + ChkSrv.py" },
                          { label: "ASCS HA",         value: "ENSA2 (Enqueue Server 2)" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono text-slate-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cost note */}
                  <div className="bg-amber-400/6 border border-amber-400/15 rounded-xl px-4 py-3 text-xs text-amber-300">
                    <span className="font-semibold">Cost impact: </span>
                    {multi.ha.tier === "two-tier"
                      ? "Approx. +60% for secondary HANA node and ASCS standby."
                      : "Approx. +120% for secondary HANA node, ASCS standby, and async DR tertiary."}
                  </div>
                </div>
              )}
            </section>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">← Back</Button>
              <Button disabled={!canAdvanceNodes} onClick={() => setStep(3)} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Cloud & Region →</Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Cloud & Region ── */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-sm font-semibold text-white">Cloud provider and region</p>

            <div>
              <Label htmlFor="sap-name" className="text-xs text-slate-400 mb-1.5 block">Landscape name</Label>
              <Input
                id="sap-name"
                placeholder="e.g. prod-s4hana-eu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary font-mono max-w-xs"
              />
              <p className="text-xs text-slate-600 mt-1.5">Used as a prefix for all provisioned resources.</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Cloud provider</p>
              <div className="flex gap-4">
                {(["AWS", "Azure"] as Provider[]).map((p) => {
                  const color = p === "AWS" ? "text-amber-400 border-amber-400/30 bg-amber-400/5" : "text-sky-400 border-sky-400/30 bg-sky-400/5";
                  return (
                    <button
                      key={p}
                      onClick={() => { setProvider(p); setRegion(""); }}
                      className={`px-6 py-3.5 rounded-xl border font-semibold transition-all ${
                        provider === p ? color : "bg-brand-surface border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-600 mt-2">SAP certified on AWS and Azure. GCP available upon request.</p>
            </div>

            {provider && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Region</p>
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
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">← Back</Button>
              <Button disabled={!canAdvanceCloud} onClick={() => setStep(4)} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40">Review →</Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div>
            <p className="text-sm font-semibold text-white mb-5">Review your SAP deployment</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Config summary */}
              <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
                <p className="text-xs text-slate-500 uppercase tracking-wide px-5 py-3 border-b border-white/8">Configuration</p>
                {[
                  { label: "Product",       value: selectedProduct?.label },
                  { label: "Architecture",  value: arch === "single" ? "Single Node" : `Multi Node${multi.ha.enabled ? " · HA" : ""}` },
                  { label: "Landscape name",value: <span className="font-mono">{name}</span> },
                  { label: "Provider",      value: provider },
                  { label: "Region",        value: region },
                  { label: "OS",            value: osOptions.find((o) => o.id === os)?.label },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-4 px-5 py-3 border-b border-white/5 text-sm last:border-0">
                    <span className="text-slate-500 w-32 shrink-0">{label}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>

              {/* Node summary */}
              <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
                <p className="text-xs text-slate-500 uppercase tracking-wide px-5 py-3 border-b border-white/8">Nodes</p>
                {arch === "single" ? (
                  <div className="px-5 py-3 text-sm">
                    <p className="text-slate-500 text-xs mb-1">Single node</p>
                    <p className="text-white">{appInstanceTypes.find((i) => i.id === singleNode.instanceId)?.spec}</p>
                    <p className="text-slate-500 text-xs mt-1">+ {singleNode.storageTb < 1 ? `${singleNode.storageTb * 1000} GB` : `${singleNode.storageTb} TB`} data storage</p>
                  </div>
                ) : (
                  <>
                    {[
                      { role: "ASCS", types: ascsInstanceTypes, id: multi.ascs.instanceId, count: 1 + (multi.ha.enabled ? 1 : 0), suffix: multi.ha.enabled ? " (+ ENSA2 standby)" : "" },
                      { role: "PAS",  types: appInstanceTypes,  id: multi.pas.instanceId,  count: 1, suffix: "" },
                      ...(multi.aas.count > 0 ? [{ role: `AAS (×${multi.aas.count})`, types: appInstanceTypes, id: multi.aas.instanceId, count: multi.aas.count, suffix: "" }] : []),
                      { role: "HANA DB", types: dbInstanceTypes, id: multi.db.instanceId, count: 1 + (multi.ha.enabled ? (multi.ha.tier === "three-tier" ? 2 : 1) : 0), suffix: multi.ha.enabled ? (multi.ha.tier === "three-tier" ? " (primary + secondary + DR)" : " (primary + HSR secondary)") : "" },
                    ].map(({ role, types, id, count, suffix }) => (
                      <div key={role} className="flex items-start gap-3 px-5 py-3 border-b border-white/5 text-sm last:border-0">
                        <span className="text-slate-500 w-24 shrink-0 text-xs pt-0.5">{role}</span>
                        <div>
                          <span className="text-white">{count}× {types.find((t) => t.id === id)?.label ?? id}</span>
                          {suffix && <p className="text-slate-500 text-xs mt-0.5">{suffix}</p>}
                        </div>
                      </div>
                    ))}
                    {multi.ha.enabled && (
                      <div className="px-5 py-3 border-b border-white/5 space-y-1.5">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">HANA HA</p>
                        {[
                          { label: "HSR mode",    value: `${multi.ha.hsrMode} · logreplay` },
                          { label: "Topology",    value: haTierOptions.find((t) => t.id === multi.ha.tier)?.label ?? "" },
                          { label: "Placement",   value: multi.ha.placement === "cross-az" ? "Cross-AZ" : "Same AZ" },
                          { label: "STONITH",     value: provider === "AWS" ? "fence_aws" : "fence_azure_arm" },
                          { label: "Cluster",     value: "Pacemaker + SAPHanaSR + ENSA2" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-3 text-xs">
                            <span className="text-slate-500 w-20 shrink-0">{label}</span>
                            <span className="font-mono text-slate-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 bg-white/2">
                  <span className="text-xs text-slate-500">Estimated monthly cost</span>
                  <span className="text-sm font-semibold text-brand-accent">
                    {totalEstimate(arch!, arch === "single" ? singleNode : null, arch === "multi" ? multi : null)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-brand-primary/8 border border-brand-primary/20 rounded-xl px-5 py-4 mb-6 text-sm text-slate-400">
              <p className="text-white font-medium mb-1">What happens next</p>
              Ascelios will provision your SAP landscape using certified Terraform modules, run SAP system copy validation, and configure monitoring via Prometheus. Typical delivery is <span className="text-brand-accent">within 8 business hours</span>. You will receive a ticket and email confirmation once the system is live.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5">← Back</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="bg-brand-primary hover:bg-brand-accent text-white disabled:opacity-40 min-w-[180px]">
                {submitting ? "Submitting…" : "Submit SAP Request"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SAPDeploymentPage() {
  return (
    <Suspense fallback={<div className="px-8 py-8 text-slate-400">Loading…</div>}>
      <SAPWizardInner />
    </Suspense>
  );
}
