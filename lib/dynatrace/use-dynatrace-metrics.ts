"use client";
import { useEffect, useRef, useState } from "react";
import type { Tenant } from "@/lib/onboarding/types";
import type { DtMetricsResponse, DtSummaryError } from "./types";

const POLL_INTERVAL_MS = 60_000;

interface State {
  data: DtMetricsResponse | null;
  error: DtSummaryError | null;
  lastFetched: number | null;
  loading: boolean;
}

const initial: State = { data: null, error: null, lastFetched: null, loading: true };

/**
 * Fetches one or more metric series for a single entity. Polls every 60s
 * while the tab is visible.
 */
export function useDynatraceMetrics(
  tenant: Tenant | null,
  entityId: string | null,
  metricSelectors: string[],
): State {
  const [state, setState] = useState<State>(initial);
  const lastKey = useRef<string | null>(null);

  // Stable key — refetch whenever scope changes
  const key = tenant && entityId ? `${tenant.id}::${entityId}::${metricSelectors.join("|")}` : null;

  useEffect(() => {
    if (!tenant || !entityId || metricSelectors.length === 0) {
      setState({ data: null, error: null, lastFetched: null, loading: false });
      lastKey.current = null;
      return;
    }
    if (lastKey.current !== key) {
      setState({ data: null, error: null, lastFetched: null, loading: true });
      lastKey.current = key;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchOnce() {
      try {
        const res = await fetch("/api/dynatrace/metrics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant, entityId, metricSelectors }),
          signal: controller.signal,
        });
        const json = (await res.json()) as DtMetricsResponse | DtSummaryError;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
