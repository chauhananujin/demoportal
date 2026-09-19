"use client";
import { useEffect, useRef, useState } from "react";
import type { Tenant } from "@/lib/onboarding/types";
import type { DtEntitiesResponse, DtSummaryError } from "./types";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // inventory changes slowly

interface State {
  data: DtEntitiesResponse | null;
  error: DtSummaryError | null;
  lastFetched: number | null;
  loading: boolean;
}

const initial: State = { data: null, error: null, lastFetched: null, loading: true };

export function useDynatraceEntities(tenant: Tenant | null): State {
  const [state, setState] = useState<State>(initial);
  const lastTenantId = useRef<string | null>(null);

  useEffect(() => {
    if (!tenant) {
      setState({ data: null, error: null, lastFetched: null, loading: false });
      lastTenantId.current = null;
      return;
    }
    if (lastTenantId.current !== tenant.id) {
      setState({ data: null, error: null, lastFetched: null, loading: true });
      lastTenantId.current = tenant.id;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchOnce() {
      try {
        const res = await fetch("/api/dynatrace/entities", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant }),
          signal: controller.signal,
        });
        const json = (await res.json()) as DtEntitiesResponse | DtSummaryError;
        if (cancelled) return;
        if (!res.ok || "error" in json) {
          setState((p) => ({ ...p, error: ("error" in json ? json : { error: "Unknown", code: "upstream" }) as DtSummaryError, loading: false }));
        } else {
          setState({ data: json, error: null, lastFetched: Date.now(), loading: false });
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState((p) => ({ ...p, error: { error: (err as Error).message, code: "upstream" }, loading: false }));
      }
    }

    fetchOnce();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchOnce();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, [tenant]);

  return state;
}
