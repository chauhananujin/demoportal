"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function AddFundsPage() {
  const [selected, setSelected] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const amount = custom ? parseFloat(custom) || 0 : selected ?? 0;
  const fee = +(amount * 0.015).toFixed(2);
  const total = +(amount + fee).toFixed(2);

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustom(e.target.value);
    setSelected(null);
  }

  function handlePreset(value: number) {
    setSelected(value);
    setCustom("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="px-8 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-sm w-full bg-brand-surface border border-white/8 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Funds added</h2>
          <p className="text-slate-400 text-sm mb-1">
            <span className="text-emerald-400 font-semibold">${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> has been added to your account.
          </p>
          <p className="text-slate-500 text-xs mb-8">New balance: $1,740.00</p>
          <Link href="/portal/billing">
            <Button className="w-full bg-brand-primary hover:bg-brand-accent text-white">
              Back to Billing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      {/* Back */}
      <Link href="/portal/billing" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M8.5 11L4.5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Billing
      </Link>

      <h1 className="text-2xl font-semibold text-white mb-2">Add Funds</h1>
      <p className="text-slate-400 text-sm mb-8">
        Current balance: <span className="text-emerald-400 font-medium">$1,240.00</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        {/* Left: amount + card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount selection */}
          <div className="bg-brand-surface border border-white/8 rounded-xl p-6">
            <p className="text-sm font-semibold text-white mb-4">Select amount</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESET_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handlePreset(v)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    selected === v
                      ? "bg-brand-primary/20 border-brand-primary text-brand-accent"
                      : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                  }`}
                >
                  ${v.toLocaleString()}
                </button>
              ))}
            </div>
            <div>
              <Label htmlFor="custom-amount" className="text-xs text-slate-500 mb-1.5 block">
                Or enter custom amount (USD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <Input
                  id="custom-amount"
                  type="number"
                  min="10"
                  step="1"
                  placeholder="0.00"
                  value={custom}
                  onChange={handleCustomChange}
                  className="pl-7 bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Card details */}
          <div className="bg-brand-surface border border-white/8 rounded-xl p-6">
            <p className="text-sm font-semibold text-white mb-4">Payment method</p>

            {/* Saved cards */}
            <div className="space-y-2 mb-5">
              {[
                { label: "Visa •••• 4242", sub: "Expires 12/27", id: "visa" },
                { label: "Mastercard •••• 5555", sub: "Expires 09/26", id: "mc" },
              ].map((card) => (
                <label key={card.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="card"
                    defaultChecked={card.id === "visa"}
                    className="accent-brand-primary"
                  />
                  <div className="w-9 h-6 bg-white/10 rounded flex items-center justify-center shrink-0">
                    <span className="font-mono text-[9px] text-slate-300">{card.label.split(" ")[0].slice(0, 4).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-white">{card.label}</p>
                    <p className="text-xs text-slate-500">{card.sub}</p>
                  </div>
                </label>
              ))}
            </div>

            <details className="group">
              <summary className="text-xs text-brand-primary hover:text-brand-accent cursor-pointer list-none flex items-center gap-1 transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-open:rotate-90 transition-transform" aria-hidden="true">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add new card
              </summary>
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="card-name" className="text-xs text-slate-500 mb-1.5 block">Name on card</Label>
                  <Input id="card-name" placeholder="Jane Smith" className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary" />
                </div>
                <div>
                  <Label htmlFor="card-number" className="text-xs text-slate-500 mb-1.5 block">Card number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" maxLength={19} className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="card-expiry" className="text-xs text-slate-500 mb-1.5 block">Expiry</Label>
                    <Input id="card-expiry" placeholder="MM / YY" maxLength={7} className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary font-mono" />
                  </div>
                  <div>
                    <Label htmlFor="card-cvc" className="text-xs text-slate-500 mb-1.5 block">CVC</Label>
                    <Input id="card-cvc" placeholder="•••" maxLength={4} className="bg-white/5 border-white/15 text-white placeholder:text-slate-600 focus-visible:border-brand-primary font-mono" />
                  </div>
                </div>
              </div>
            </details>
          </div>

          <Button
            type="submit"
            disabled={amount < 10 || submitting}
            className="w-full bg-brand-primary hover:bg-brand-accent text-white font-medium py-2.5 disabled:opacity-40"
          >
            {submitting ? "Processing…" : `Pay $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </Button>
        </form>

        {/* Right: summary */}
        <div className="lg:pt-0">
          <div className="bg-brand-surface border border-white/8 rounded-xl p-6 sticky top-8">
            <p className="text-sm font-semibold text-white mb-5">Summary</p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Funds to add</span>
                <span className="text-white font-medium">
                  {amount > 0 ? `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processing fee (1.5%)</span>
                <span className="text-white">
                  {amount > 0 ? `$${fee.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
                <span className="text-white">Total charged</span>
                <span className="text-brand-accent">
                  {amount > 0 ? `$${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Current balance</span>
                <span className="text-emerald-400">$1,240.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Balance after top-up</span>
                <span className="text-white font-medium">
                  {amount > 0
                    ? `$${(1240 + amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : "$1,240.00"}
                </span>
              </div>
            </div>

            <p className="mt-5 text-[11px] text-slate-600 leading-relaxed">
              Funds are credited instantly and used to offset future invoices. Unused credits roll forward each billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
