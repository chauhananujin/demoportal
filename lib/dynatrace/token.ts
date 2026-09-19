/**
 * OAuth 2.0 client-credentials token broker for the Ascelios → Dynatrace
 * service principal. Caches the access token in-memory until ~60s before
 * its expiry so we don't mint a fresh token on every request.
 *
 * When DYNATRACE_MOCK is truthy (default in dev), this never actually
 * hits Dynatrace SSO — it returns a sentinel token that the mock client
 * accepts.
 */

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let cached: CachedToken | null = null;
const REFRESH_GRACE_MS = 60_000; // refresh 60s before actual expiry

export function isMockMode(): boolean {
  // Default ON unless explicitly disabled — keeps the demo working without
  // requiring real Dynatrace credentials.
  return process.env.DYNATRACE_MOCK !== "false";
}

export async function getDynatraceToken(): Promise<string> {
  if (isMockMode()) {
    return "mock-token";
  }

  if (cached && Date.now() < cached.expiresAt - REFRESH_GRACE_MS) {
    return cached.accessToken;
  }

  const ssoUrl    = process.env.DYNATRACE_SSO_URL;
  const clientId  = process.env.DYNATRACE_OAUTH_CLIENT_ID;
  const clientSec = process.env.DYNATRACE_OAUTH_CLIENT_SECRET;
  const accountUrn = process.env.DYNATRACE_OAUTH_ACCOUNT_URN;
  if (!ssoUrl || !clientId || !clientSec || !accountUrn) {
    throw new Error("dynatrace: missing OAuth env vars");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSec,
    resource: accountUrn,
    scope: [
      "storage:metrics:read",
      "storage:problems:read",
      "storage:events:read",
      "environment-api:entities:read",
    ].join(" "),
  });

  const res = await fetch(`${ssoUrl}/sso/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`dynatrace: SSO token exchange failed (${res.status})`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cached.accessToken;
}

export function clearTokenCache(): void {
  cached = null;
}
