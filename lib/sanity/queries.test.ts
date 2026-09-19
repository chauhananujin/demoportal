import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  sanityClient: { fetch: vi.fn() },
  isSanityConfigured: true,
}));

import { sanityClient } from "./client";
import { getServicesByCategory, getAllCaseStudies, getServiceBySlug, getCaseStudyBySlug } from "./queries";

const mockServices = [
  { _id: "1", title: "SAP Implementation", slug: { current: "sap-implementation" }, category: "sap", summary: "We implement SAP.", icon: "🔷" },
];

describe("getServicesByCategory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches services filtered by category", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockServices as never);
    const result = await getServicesByCategory("sap");
    expect(result).toEqual(mockServices);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("category == $category"),
      { category: "sap" }
    );
  });
});

describe("getAllCaseStudies", () => {
  it("fetches all case studies", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue([] as never);
    const result = await getAllCaseStudies();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getServiceBySlug", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches a service by slug", async () => {
    const mockService = { _id: "1", title: "SAP Implementation", slug: { current: "sap-implementation" }, category: "sap", summary: "We implement SAP.", icon: "🔷", body: [] };
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockService as never);
    const result = await getServiceBySlug("sap-implementation");
    expect(result).toEqual(mockService);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining("slug.current == $slug"),
      { slug: "sap-implementation" }
    );
  });

  it("returns null when slug does not exist", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(null as never);
    const result = await getServiceBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("getCaseStudyBySlug", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches a case study by slug", async () => {
    const mockStudy = { _id: "1", title: "Acme Migration", slug: { current: "acme-migration" }, client: "Acme", industry: "manufacturing", services: ["sap-implementation"], summary: "We migrated Acme.", publishedAt: "2024-01-01", body: [] };
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockStudy as never);
    const result = await getCaseStudyBySlug("acme-migration");
    expect(result).toEqual(mockStudy);
  });

  it("returns null when slug does not exist", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(null as never);
    const result = await getCaseStudyBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("when Sanity is not configured", () => {
  it("short-circuits to empty results without hitting the network", async () => {
    vi.resetModules();
    vi.doMock("./client", () => ({
      sanityClient: { fetch: vi.fn() },
      isSanityConfigured: false,
    }));
    const queries = await import("./queries");
    const { sanityClient: mockedClient } = await import("./client");

    expect(await queries.getServicesByCategory("sap")).toEqual([]);
    expect(await queries.getAllCaseStudies()).toEqual([]);
    expect(await queries.getServiceBySlug("x")).toBeNull();
    expect(await queries.getCaseStudyBySlug("x")).toBeNull();
    expect(mockedClient.fetch).not.toHaveBeenCalled();

    vi.doUnmock("./client");
    vi.resetModules();
  });
});
