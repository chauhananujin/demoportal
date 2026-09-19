import { describe, it, expect } from "vitest";
import { parseTenantPayload, resolveTenantMz } from "./mz";
import type { Tenant } from "@/lib/onboarding/types";

const baseTenant: Tenant = {
  id: "TNT-1",
  name: "acme-prod",
  provider: "aws",
  region: "us-east-1",
  status: "active",
  stageIndex: 4,
  services: ["sap"],
  customerCompany: "Acme",
  customerEmail: "j@acme.com",
  createdAt: new Date().toISOString(),
  agreementId: "AGR-1",
  dynatrace: {
    managementZoneId: "12345",
    managementZoneName: "ascelios-acme-prod",
    onboardedAt: new Date().toISOString(),
  },
};

describe("resolveTenantMz", () => {
  it("returns the binding when the tenant has a Dynatrace block", () => {
    const resolved = resolveTenantMz(baseTenant);
    expect(resolved?.dynatrace.managementZoneId).toBe("12345");
  });

  it("returns null when the tenant has no Dynatrace binding", () => {
    const t = { ...baseTenant, dynatrace: undefined };
    expect(resolveTenantMz(t)).toBeNull();
  });

  it("returns null when the tenant is missing entirely", () => {
    expect(resolveTenantMz(null)).toBeNull();
    expect(resolveTenantMz(undefined)).toBeNull();
  });
});

describe("parseTenantPayload", () => {
  it("rejects non-object input", () => {
    expect(parseTenantPayload("hi")).toBeNull();
    expect(parseTenantPayload(123)).toBeNull();
    expect(parseTenantPayload(null)).toBeNull();
  });

  it("rejects payloads missing required fields", () => {
    expect(parseTenantPayload({ id: "TNT-1" })).toBeNull();
    expect(parseTenantPayload({ name: "x" })).toBeNull();
  });

  it("accepts a tenant-shaped object", () => {
    const parsed = parseTenantPayload(baseTenant);
    expect(parsed).not.toBeNull();
    expect(parsed?.id).toBe("TNT-1");
  });
});
