"use client";
import {
  createContext, useContext, useEffect, useState,
  useCallback, useMemo, useRef, type ReactNode,
} from "react";
import type {
  Tenant, Agreement, CloudProvider, ServiceKey,
} from "./types";
import { PROVISIONING_STAGES } from "./types";

const TENANTS_KEY = "ascelios_tenants";
const AGREEMENTS_KEY = "ascelios_agreements";

// Time (ms) each provisioning stage takes — quick enough for demo, slow enough to feel real.
const STAGE_DURATION_MS = 4500;

interface CreateTenantInput {
  name: string;
  provider: CloudProvider;
  region: string;
  services: ServiceKey[];
  customerCompany: string;
  customerEmail: string;
  agreementId: string;
}

interface CreateAgreementInput {
  signedName: string;
  signedEmail: string;
  agreedTerms: boolean;
  agreedDpa: boolean;
  services: ServiceKey[];
  monthlyTotal: number;
}

interface TenantContextValue {
  tenants: Tenant[];
  agreements: Agreement[];
  createAgreement: (input: CreateAgreementInput) => Agreement;
  createTenant: (input: CreateTenantInput) => Tenant;
  getAgreement: (id: string) => Agreement | null;
}

const TenantContext = createContext<TenantContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function hashAgreement(input: CreateAgreementInput, ts: string): string {
  const payload = JSON.stringify({ ...input, ts });
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (h * 31 + payload.charCodeAt(i)) | 0;
  }
  // Pad to 8 hex chars — surrogate "hash" for demo purposes.
  return Math.abs(h).toString(16).padStart(8, "0");
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Hydrate from localStorage on mount
  useEffect(() => {
    setTenants(readJSON<Tenant[]>(TENANTS_KEY, []));
    setAgreements(readJSON<Agreement[]>(AGREEMENTS_KEY, []));
    setHydrated(true);
  }, []);

  // Persist on every change after hydration
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
  }, [tenants, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(AGREEMENTS_KEY, JSON.stringify(agreements));
  }, [agreements, hydrated]);

  // Drive provisioning forward: any tenant in "provisioning" gets a ticking timer
  // that advances stageIndex until it reaches the last stage, then status → "active".
  useEffect(() => {
    if (!hydrated) return;
    const lastIndex = PROVISIONING_STAGES.length - 1;

    for (const t of tenants) {
      if (t.status !== "provisioning") continue;
      if (timersRef.current.has(t.id)) continue;

      const interval = setInterval(() => {
        setTenants((prev) =>
          prev.map((row) => {
            if (row.id !== t.id) return row;
            if (row.status !== "provisioning") return row;
            const nextIndex = row.stageIndex + 1;
            if (nextIndex >= lastIndex) {
              const timer = timersRef.current.get(row.id);
              if (timer) { clearInterval(timer); timersRef.current.delete(row.id); }
              return { ...row, stageIndex: lastIndex, status: "active" };
            }
            return { ...row, stageIndex: nextIndex };
          }),
        );
      }, STAGE_DURATION_MS);

      timersRef.current.set(t.id, interval);
    }

    // Clean up timers for tenants that no longer exist or are no longer provisioning
    for (const [id, timer] of timersRef.current.entries()) {
      const stillProvisioning = tenants.some((t) => t.id === id && t.status === "provisioning");
      if (!stillProvisioning) {
        clearInterval(timer);
        timersRef.current.delete(id);
      }
    }
  }, [tenants, hydrated]);

  // Tear down all timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) clearInterval(timer);
      timersRef.current.clear();
    };
  }, []);

  const createAgreement = useCallback((input: CreateAgreementInput): Agreement => {
    const signedAt = new Date().toISOString();
    const agreement: Agreement = {
      id: `AGR-${Date.now().toString(36).toUpperCase()}`,
      signedName: input.signedName,
      signedEmail: input.signedEmail.trim().toLowerCase(),
      signedAt,
      agreedTerms: input.agreedTerms,
      agreedDpa: input.agreedDpa,
      agreementHash: hashAgreement(input, signedAt),
      services: input.services,
      monthlyTotal: input.monthlyTotal,
    };
    setAgreements((prev) => [agreement, ...prev]);
    return agreement;
  }, []);

  const createTenant = useCallback((input: CreateTenantInput): Tenant => {
    const id = `TNT-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)
      .toString(36)
      .toUpperCase()}`;
    // Auto-assign a synthetic Dynatrace Management Zone. In a real deploy this
    // would be a back-office step that calls the Dynatrace Settings API. For
    // the demo we generate a deterministic 19-digit MZ ID from the tenant id
    // so mocked telemetry stays stable across reloads.
    const mzSlug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tenant";
    const mzId = Array.from({ length: 19 }, (_, i) => ((id.charCodeAt(i % id.length) * 31 + i) % 10).toString()).join("");

    const tenant: Tenant = {
      id,
      name: input.name,
      provider: input.provider,
      region: input.region,
      status: "provisioning",
      stageIndex: 0,
      services: input.services,
      customerCompany: input.customerCompany,
      customerEmail: input.customerEmail.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
      agreementId: input.agreementId,
      dynatrace: {
        managementZoneId: mzId,
        managementZoneName: `ascelios-${mzSlug}`,
        onboardedAt: new Date().toISOString(),
      },
    };
    setTenants((prev) => [tenant, ...prev]);
    return tenant;
  }, []);

  const getAgreement = useCallback(
    (id: string) => agreements.find((a) => a.id === id) ?? null,
    [agreements],
  );

  const value = useMemo<TenantContextValue>(
    () => ({ tenants, agreements, createTenant, createAgreement, getAgreement }),
    [tenants, agreements, createTenant, createAgreement, getAgreement],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenants(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenants must be used inside TenantProvider");
  return ctx;
}
