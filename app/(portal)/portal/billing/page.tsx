"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/lib/auth/use-permission";

const invoices = [
  { id: "INV-2026-004", date: "May 1, 2026",  amount: "$4,200.00", status: "paid",    services: "SAP Managed, Cloud Ops, DevOps" },
  { id: "INV-2026-003", date: "Apr 1, 2026",  amount: "$4,200.00", status: "paid",    services: "SAP Managed, Cloud Ops, DevOps" },
  { id: "INV-2026-002", date: "Mar 1, 2026",  amount: "$3,800.00", status: "paid",    services: "SAP Managed, Cloud Ops" },
  { id: "INV-2026-001", date: "Feb 1, 2026",  amount: "$3,800.00", status: "paid",    services: "SAP Managed, Cloud Ops" },
  { id: "INV-2025-012", date: "Jan 1, 2026",  amount: "$2,400.00", status: "paid",    services: "SAP Managed" },
];

const paymentMethods = [
  { type: "Visa", last4: "4242", expiry: "12/27", primary: true },
  { type: "Mastercard", last4: "5555", expiry: "09/26", primary: false },
];

const statusColor: Record<string, string> = {
  paid:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  overdue: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function BillingPage() {
  const canAddFunds = usePermission("request:add-funds");

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-semibold text-white mb-8">Billing</h1>

      {/* Balance + Next Invoice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-1 bg-brand-surface border border-white/8 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Account Balance</p>
          <p className="text-3xl font-semibold text-emerald-400 mb-1">$1,240.00</p>
          <p className="text-xs text-slate-500 mb-5">Available credits</p>
          {canAddFunds && (
            <Link href="/portal/billing/add-funds">
              <Button className="w-full bg-brand-primary hover:bg-brand-accent text-white text-sm">
                + Request Funds
              </Button>
            </Link>
          )}
        </div>

        <div className="md:col-span-1 bg-brand-surface border border-white/8 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Next Invoice</p>
          <p className="text-3xl font-semibold text-white mb-1">$4,200.00</p>
          <p className="text-xs text-slate-500 mb-5">Due Jun 1, 2026</p>
          <div className="text-xs text-slate-400">
            <div className="flex justify-between mb-1.5">
              <span>SAP Managed Services</span><span>$2,000</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span>Cloud Operations</span><span>$1,400</span>
            </div>
            <div className="flex justify-between">
              <span>DevOps as a Service</span><span>$800</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 bg-brand-surface border border-white/8 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Payment Methods</p>
          <div className="space-y-3 mb-4">
            {paymentMethods.map((pm) => (
              <div key={pm.last4} className="flex items-center gap-3">
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                  <span className="font-mono text-[9px] text-slate-300">{pm.type.slice(0, 4).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">•••• {pm.last4}</p>
                  <p className="text-xs text-slate-500">Expires {pm.expiry}</p>
                </div>
                {pm.primary && (
                  <span className="font-mono text-[10px] text-brand-accent border border-brand-accent/30 rounded-full px-2 py-0.5">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
          <button className="text-xs text-brand-primary hover:text-brand-accent transition-colors">
            + Add payment method
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-white">Invoice History</p>
          <button className="text-xs text-brand-primary hover:text-brand-accent transition-colors">
            Download all
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{inv.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">{inv.services}</p>
              </div>
              <p className="text-sm text-slate-300 shrink-0">{inv.date}</p>
              <p className="text-sm font-medium text-white w-24 text-right shrink-0">{inv.amount}</p>
              <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${statusColor[inv.status]}`}>
                {inv.status}
              </span>
              <button className="text-xs text-slate-500 hover:text-white transition-colors shrink-0">
                PDF ↓
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
