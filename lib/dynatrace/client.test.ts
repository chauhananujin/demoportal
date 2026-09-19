import { describe, it, expect } from "vitest";
import { dtClient, UnscopedQueryError } from "./client";

describe("dtClient — multi-tenant scoping enforcement", () => {
  it("throws when managementZoneId is missing", async () => {
    // @ts-expect-error — deliberately omitting required field
    await expect(dtClient.get("/api/v2/problems", {})).rejects.toBeInstanceOf(UnscopedQueryError);
  });

  it("throws when managementZoneId is empty string", async () => {
    await expect(
      dtClient.get("/api/v2/problems", { managementZoneId: "" }),
    ).rejects.toBeInstanceOf(UnscopedQueryError);
  });

  it("throws when managementZoneId is whitespace only", async () => {
    await expect(
      dtClient.get("/api/v2/problems", { managementZoneId: "   " }),
    ).rejects.toBeInstanceOf(UnscopedQueryError);
  });

  // Note: in mock mode (the default) calling dtClient.get throws explicitly
  // because the route handler is supposed to short-circuit to the mock
  // generator. We assert that contract here.
  it("refuses to run in mock mode (route handlers must call the mock generator instead)", async () => {
    await expect(
      dtClient.get("/api/v2/problems", { managementZoneId: "12345" }),
    ).rejects.toThrow(/mock mode/);
  });
});
