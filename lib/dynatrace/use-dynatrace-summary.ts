"use client";
import { useEffect, useRef, useState } from "react";
import type { Tenant } from "@/lib/onboarding/types";
import type { DtSummary, DtSummaryError } from "./types";

const POLL_INTERVAL_MS = 30_000;

interface State {
  data: DtSummary | null;
  error: DtSummaryError | null;
  lastFetched: number | null;
  loading: boolean;
}

const initialState: State = {
  data: null,
  error: null,
  lastFetched: null,
  loading: true,
};

/**
 * Client hook that polls /api/dynatrace/summary every 30 seconds for the
 * given tenant. On error, keeps the previous successful response visible
 * but flags the section as stale. Stops polling when the tab is hidden.
 */
export function useDynatraceSummary(tenant: Tenant | null): State {
  const [state, setState] = useState<State>(initialState);
  const lastTenantId = useRef<string | null>(null);

  useEffect(() => {
    if (!tenant) {
      setState({ data: null, error: null, lastFetched: null, loading: false });
      lastTenantId.current = null;
      return;
    }

    // Reset state when the tenant we're scoped to changes
    if (lastTenantId.current !== tenant.id) {
      setState({ data: null, error: null, lastFetched: null, loading: true });
      lastTenantId.current = tenant.id;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchOnce() {
      try {
        const res = await fetch("/api/dynatrace/summary", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant }),
          signal: controller.signal,
        });
        const json = (await res.json()) as DtSummary | DtSummaryError;
        if (cancelled) return;
        if (!res.ok || "error" in json) {
          setState((prev) => ({
            ...prev,
            error: ("error" in json ? json : { error: "Unknown error", code: "upstream" }) as DtSummaryError,
            loading: false,
          }));
        } else {
          setState({ data: json, error: null, lastFetched: Date.now(), loading: false });
        }
      } catch (err) {
        if (cancelled) return;
        const aborted = err instanceof DOMException && err.name === "AbortError";
        if (aborted) return;
        setState((prev) => ({
          ...prev,
          error: { error: (err as Error).message, code: "upstream" },
          loading: false,
        }));
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
