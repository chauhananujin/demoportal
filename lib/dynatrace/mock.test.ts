import { describe, it, expect } from "vitest";
import { generateMockEntities, generateMockSeries, generateMockSummary } from "./mock";

const args = {
  tenantId: "TNT-DEMO",
  tenantName: "acme-prod",
  managementZoneId: "1234567890123456789",
  managementZoneName: "ascelios-acme-prod",
};

describe("generateMockSummary", () => {
  it("returns the 6 expected metric cards", () => {
    const summary = generateMockSummary(args);
    expect(summary.metrics.map((m) => m.key).sort()).toEqual(
      ["containers", "coverage", "events", "hosts", "mttr", "problems"],
    );
  });

  it("is deterministic — same MZ id yields identical metric values", () => {
    const a = generateMockSummary(args);
    const b = generateMockSummary(args);
    expect(a.metrics).toEqual(b.metrics);
  });

  it("differs across MZs — different MZ ids yield different metric values", () => {
    const a = generateMockSummary(args);
    const b = generateMockSummary({ ...args, managementZoneId: "9999999999999999999" });
    // At least one metric should differ — overwhelmingly likely given the hash.
    const differs = a.metrics.some((m, i) => m.value !== b.metrics[i].value);
    expect(differs).toBe(true);
  });

  it("each sparkline has exactly 24 points in [0, 100]", () => {
    const summary = generateMockSummary(args);
    for (const m of summary.metrics) {
      expect(m.sparkline).toHaveLength(24);
      for (const p of m.sparkline) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
    }
  });

  it("returns the correct tenant binding in the response", () => {
    const summary = generateMockSummary(args);
    expect(summary.tenant.id).toBe(args.tenantId);
    expect(summary.tenant.managementZoneId).toBe(args.managementZoneId);
    expect(summary.tenant.managementZoneName).toBe(args.managementZoneName);
  });

  it("marks itself as source=mock", () => {
    expect(generateMockSummary(args).source).toBe("mock");
  });
});

describe("generateMockEntities", () => {
  it("returns the same entities for the same MZ", () => {
    const a = generateMockEntities(args);
    const b = generateMockEntities(args);
    expect(a).toEqual(b);
  });

  it("returns at least 6 entities", () => {
    expect(generateMockEntities(args).length).toBeGreaterThanOrEqual(6);
  });

  it("each entity has a 24-point sparkline in [0, 100]", () => {
    for (const e of generateMockEntities(args)) {
      expect(e.sparkline).toHaveLength(24);
      for (const p of e.sparkline) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
    }
  });

  it("different MZ yields different entity health distribution", () => {
    const a = generateMockEntities(args);
    const b = generateMockEntities({ ...args, managementZoneId: "9999999999999999999" });
    // At least one entity should differ in either status or sparkline
    const differs = a.some((entity, i) => entity.ok !== b[i].ok || entity.sparkline[0] !== b[i].sparkline[0]);
    expect(differs).toBe(true);
  });

  it("degraded entities (ok=false) have at least one open problem", () => {
    for (const e of generateMockEntities(args)) {
      if (e.ok === false) expect(e.openProblems).toBeGreaterThanOrEqual(1);
      if (e.ok === true)  expect(e.openProblems).toBe(0);
    }
  });
});

describe("generateMockSeries", () => {
  const baseArgs = {
    managementZoneId: args.managementZoneId,
    metricSelector: "builtin:host.cpu.usage",
    entityId: "HOST-PRODEKSCLUSTER-0",
  };

  it("returns 60 points by default", () => {
    expect(generateMockSeries(baseArgs).points).toHaveLength(60);
  });

  it("respects custom point count", () => {
    expect(generateMockSeries({ ...baseArgs, points: 120 }).points).toHaveLength(120);
  });

  it("is deterministic per (MZ, entity, selector) tuple", () => {
    const a = generateMockSeries(baseArgs);
    const b = generateMockSeries(baseArgs);
    expect(a.points).toEqual(b.points);
  });

  it("different metric selector → different shape", () => {
    const cpu = generateMockSeries(baseArgs);
    const mem = generateMockSeries({ ...baseArgs, metricSelector: "builtin:host.mem.usage" });
    expect(cpu.points).not.toEqual(mem.points);
    expect(cpu.label).toBe("CPU usage");
    expect(mem.label).toBe("Memory usage");
  });

  it("populates label, unit, deltaPct, latest formatted with unit", () => {
    const s = generateMockSeries(baseArgs);
    expect(s.unit).toBe("%");
    expect(s.latest).toMatch(/%$/);
    expect(typeof s.deltaPct).toBe("number");
  });

  it("falls back to a default shape for unknown selectors", () => {
    const s = generateMockSeries({ ...baseArgs, metricSelector: "custom:something.weird" });
    expect(s.points.length).toBe(60);
    expect(s.label).toBe("Metric");
  });
});
