"use client";
import { useState, useMemo, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermission } from "@/lib/auth/use-permission";
import { useUserDirectory, type DirectoryUser } from "@/lib/auth/user-directory";
import type { Role } from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

const ROLE_BADGE: Record<Role, string> = {
  user:    "text-slate-400 border-slate-400/30 bg-slate-400/10",
  manager: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  admin:   "text-red-400 border-red-400/30 bg-red-400/10",
};

const ROLES: Role[] = ["user", "manager", "admin"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const canManage = usePermission("manage:users");
  const { users, createUser, updateRole, resetPassword, removeUser } = useUserDirectory();

  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<Role>("user");
  const [formError, setFormError] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  const [resetPwd, setResetPwd] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.includes(q) || u.role.includes(q));
  }, [users, query]);

  const counts = useMemo(() => {
    const c: Record<Role, number> = { user: 0, manager: 0, admin: 0 };
    for (const u of users) c[u.role] += 1;
    return c;
  }, [users]);

  if (!canManage) {
    return (
      <div className="px-8 py-12 max-w-2xl">
        <h1 className="text-2xl font-semibold text-white mb-3">Users</h1>
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-5 text-sm text-red-300">
          You don&apos;t have permission to manage users. Ask an administrator or manager for access.
        </div>
      </div>
    );
  }

  function showFlash(kind: "ok" | "error", text: string) {
    setFlash({ kind, text });
    setTimeout(() => setFlash(null), 3500);
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const result = createUser({
      email: formEmail,
      password: formPassword,
      role: formRole,
      createdBy: currentUser?.email ?? null,
    });
    if (!result.ok) {
      setFormError(
        result.reason === "duplicate"
          ? "A user with that email already exists."
          : "Email must be valid and password must be at least 6 characters.",
      );
      return;
    }
    setFormEmail("");
    setFormPassword("");
    setFormRole("user");
    setShowCreate(false);
    showFlash("ok", `User ${result.user.email} created.`);
  }

  function handleRoleChange(email: string, role: Role) {
    if (currentUser?.email === email) {
      showFlash("error", "You can't change your own role.");
      return;
    }
    if (updateRole(email, role)) {
      showFlash("ok", `${email} is now ${role}.`);
    }
  }

  function handleResetSubmit(email: string) {
    if (!resetPwd) return;
    if (resetPassword(email, resetPwd)) {
      setResetting(null);
      setResetPwd("");
      showFlash("ok", `Password reset for ${email}.`);
    } else {
      showFlash("error", "Password must be at least 6 characters.");
    }
  }

  function handleRemove(u: DirectoryUser) {
    if (currentUser?.email === u.email) {
      showFlash("error", "You can't delete your own account.");
      return;
    }
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    if (removeUser(u.email)) {
      showFlash("ok", `${u.email} removed.`);
    }
  }

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase text-slate-500 mb-2">Administration</p>
          <h1 className="text-2xl font-semibold text-white">Users &amp; Roles</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create portal accounts and assign roles. Changes take effect immediately.
          </p>
        </div>
        <button
          onClick={() => { setShowCreate((v) => !v); setFormError(null); }}
          className="bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showCreate ? "Cancel" : "+ New user"}
        </button>
      </div>

      {/* Flash */}
      {flash && (
        <div className={cn(
          "rounded-lg px-4 py-2.5 text-sm mb-4 border",
          flash.kind === "ok"
            ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-300"
            : "bg-red-400/10 border-red-400/20 text-red-300",
        )}>
          {flash.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {ROLES.map((r) => (
          <div key={r} className="bg-brand-surface border border-white/8 rounded-xl px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500 mb-1">{r}s</p>
            <p className="text-2xl font-semibold text-white leading-none">{counts[r]}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-brand-surface border border-white/8 rounded-xl p-5 mb-6"
        >
          <h2 className="text-sm font-semibold text-white mb-4">Create new user</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Initial password</label>
              <input
                type="text"
                required
                minLength={6}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Role</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as Role)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {formError && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mt-4">
              {formError}
            </p>
          )}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Create user
            </button>
            <span className="text-xs text-slate-500">
              The user can sign in immediately with this email and password.
            </span>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or role…"
          className="w-full md:w-72 bg-brand-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50"
        />
      </div>

      {/* Users table */}
      <div className="bg-brand-surface border border-white/8 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/8 bg-white/3">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Created by</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">
                  No users match &quot;{query}&quot;.
                </td>
              </tr>
            )}
            {filtered.map((u) => {
              const isSelf = currentUser?.email === u.email;
              const isResetting = resetting === u.email;
              return (
                <tr key={u.email} className="border-b border-white/6 last:border-0 hover:bg-white/3">
                  <td className="px-4 py-3 text-white font-mono text-[13px]">
                    {u.email}
                    {isSelf && (
                      <span className="ml-2 text-[10px] font-mono uppercase tracking-wide text-brand-accent border border-brand-accent/40 rounded-full px-1.5 py-0.5">
                        you
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => handleRoleChange(u.email, e.target.value as Role)}
                      className={cn(
                        "font-mono text-[11px] uppercase rounded-full border px-2 py-1 bg-transparent focus:outline-none",
                        ROLE_BADGE[u.role],
                        isSelf && "opacity-60 cursor-not-allowed",
                      )}
                    >
                      {ROLES.map((r) => <option key={r} value={r} className="bg-brand-bg">{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.createdBy ?? <span className="text-slate-600">seed</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isResetting ? (
                      <span className="inline-flex items-center gap-2">
                        <input
                          type="text"
                          value={resetPwd}
                          onChange={(e) => setResetPwd(e.target.value)}
                          placeholder="new password"
                          autoFocus
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-slate-600 font-mono w-36 focus:outline-none focus:border-brand-primary/50"
                        />
                        <button
                          onClick={() => handleResetSubmit(u.email)}
                          className="text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setResetting(null); setResetPwd(""); }}
                          className="text-xs text-slate-500 hover:text-white"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        <button
                          onClick={() => { setResetting(u.email); setResetPwd(""); }}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Reset password
                        </button>
                        <button
                          onClick={() => handleRemove(u)}
                          disabled={isSelf}
                          className={cn(
                            "text-xs transition-colors",
                            isSelf
                              ? "text-slate-700 cursor-not-allowed"
                              : "text-red-400/80 hover:text-red-300",
                          )}
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-600 mt-4">
        Users and credentials are stored locally in this browser for demo purposes — no server is involved.
      </p>
    </div>
  );
}
