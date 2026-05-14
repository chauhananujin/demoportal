import { describe, it, expect } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  it("returns 200 for valid data", async () => {
    const res = await POST(makeRequest({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "Acme Corp",
      message: "We need SAP implementation help.",
      services: ["sap-implementation"],
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("returns 400 for invalid data", async () => {
    const res = await POST(makeRequest({ name: "J", email: "bad", company: "", message: "", services: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });
});
