"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_ACCOUNTS } from "@/lib/auth/accounts";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result === "ok") {
      router.push("/portal/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-brand-accent font-bold text-2xl tracking-tight">Ascelios</span>
          <p className="text-slate-400 text-sm mt-1">Client Portal — Elios Login</p>
        </div>

        {/* Form card */}
        <div className="bg-brand-surface border border-white/8 rounded-2xl p-8 mb-4">
          <h1 className="text-lg font-semibold text-white mb-6">Sign in to your account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
                placeholder="you@acmecorp.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Demo accounts hint */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wide">Demo accounts</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => { setEmail(a.email); setPassword(a.password); setError(""); }}
                className="w-full flex items-center justify-between hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="text-xs text-brand-accent font-mono">{a.email}</span>
                <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                  a.role === "admin"
                    ? "text-red-400 border-red-400/30 bg-red-400/10"
                    : a.role === "manager"
                    ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                    : "text-slate-400 border-slate-400/30 bg-slate-400/10"
                }`}>{a.role}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Password for all accounts: <span className="font-mono text-slate-500">demo1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
