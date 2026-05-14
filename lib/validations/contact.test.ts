import { describe, it, expect } from "vitest";
import { contactSchema } from "./contact";

describe("contactSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactSchema.safeParse({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "Acme Corp",
      message: "We need help migrating to SAP S/4HANA.",
      services: ["sap-implementation"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      email: "jane@acme.com",
      company: "",
      message: "Help us please.",
      services: ["cloud-infra"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects short message", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      email: "jane@acme.com",
      company: "Acme",
      message: "Help",
      services: ["cloud-infra"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty services", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      email: "jane@acme.com",
      company: "Acme",
      message: "We need cloud help.",
      services: [],
    });
    expect(result.success).toBe(false);
  });
});
