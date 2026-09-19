"use client";
import {
  createContext, useContext, useEffect, useState,
  useCallback, useMemo, type ReactNode,
} from "react";
import type { Role } from "@/lib/tickets/types";
import { DEMO_ACCOUNTS } from "./accounts";

const DIRECTORY_KEY = "ascelios_users";

export interface DirectoryUser {
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  createdBy: string | null;
}

export type CreateUserResult =
  | { ok: true; user: DirectoryUser }
  | { ok: false; reason: "duplicate" | "invalid" };

interface UserDirectoryValue {
  users: DirectoryUser[];
  findByCredentials: (email: string, password: string) => DirectoryUser | null;
  createUser: (input: { email: string; password: string; role: Role; createdBy: string | null }) => CreateUserResult;
  updateRole: (email: string, role: Role) => boolean;
  resetPassword: (email: string, password: string) => boolean;
  removeUser: (email: string) => boolean;
}

const UserDirectoryContext = createContext<UserDirectoryValue | null>(null);

function seedDirectory(): DirectoryUser[] {
  const now = new Date().toISOString();
  return DEMO_ACCOUNTS.map((a) => ({
    email: a.email,
    password: a.password,
    role: a.role,
    createdAt: now,
    createdBy: null,
  }));
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function UserDirectoryProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount; seed on first run.
  useEffect(() => {
    const raw = localStorage.getItem(DIRECTORY_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DirectoryUser[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
          setHydrated(true);
          return;
        }
      } catch { /* fall through to seed */ }
    }
    const seeded = seedDirectory();
    setUsers(seeded);
    localStorage.setItem(DIRECTORY_KEY, JSON.stringify(seeded));
    setHydrated(true);
  }, []);

  // Persist on every mutation, but only after hydration so we don't overwrite real data with [].
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(DIRECTORY_KEY, JSON.stringify(users));
  }, [users, hydrated]);

  const findByCredentials = useCallback(
    (email: string, password: string): DirectoryUser | null => {
      const e = normalize(email);
      return users.find((u) => u.email === e && u.password === password) ?? null;
    },
    [users],
  );

  const createUser = useCallback(
    ({ email, password, role, createdBy }: {
      email: string; password: string; role: Role; createdBy: string | null;
    }): CreateUserResult => {
      const e = normalize(email);
      if (!e.includes("@") || password.length < 6) return { ok: false, reason: "invalid" };
      if (users.some((u) => u.email === e)) return { ok: false, reason: "duplicate" };
      const next: DirectoryUser = {
        email: e,
        password,
        role,
        createdAt: new Date().toISOString(),
        createdBy,
      };
      setUsers((prev) => [...prev, next]);
      return { ok: true, user: next };
    },
    [users],
  );

  const updateRole = useCallback((email: string, role: Role) => {
    const e = normalize(email);
    let changed = false;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.email !== e) return u;
        changed = true;
        return { ...u, role };
      }),
    );
    return changed;
  }, []);

  const resetPassword = useCallback((email: string, password: string) => {
    if (password.length < 6) return false;
    const e = normalize(email);
    let changed = false;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.email !== e) return u;
        changed = true;
        return { ...u, password };
      }),
    );
    return changed;
  }, []);

  const removeUser = useCallback((email: string) => {
    const e = normalize(email);
    let removed = false;
    setUsers((prev) => {
      const next = prev.filter((u) => {
        if (u.email === e) { removed = true; return false; }
        return true;
      });
      return next;
    });
    return removed;
  }, []);

  const value = useMemo<UserDirectoryValue>(
    () => ({ users, findByCredentials, createUser, updateRole, resetPassword, removeUser }),
    [users, findByCredentials, createUser, updateRole, resetPassword, removeUser],
  );

  return (
    <UserDirectoryContext.Provider value={value}>
      {children}
    </UserDirectoryContext.Provider>
  );
}

export function useUserDirectory(): UserDirectoryValue {
  const ctx = useContext(UserDirectoryContext);
  if (!ctx) throw new Error("useUserDirectory must be used inside UserDirectoryProvider");
  return ctx;
}
