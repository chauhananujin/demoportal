"use client";
import {
  createContext, useContext, useEffect, useState,
  useCallback, type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/tickets/types";
import { DEMO_ACCOUNTS } from "./accounts";

const SESSION_KEY = "ascelios_session";

export interface AuthUser {
  email: string;
  role: Role;
  loginAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<"ok" | "invalid">;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw) as AuthUser); } catch { /* ignore corrupt data */ }
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<"ok" | "invalid"> => {
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email === email.trim().toLowerCase() && a.password === password,
      );
      if (!account) return "invalid";
      const session: AuthUser = {
        email: account.email,
        role: account.role,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return "ok";
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    router.push("/portal/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
