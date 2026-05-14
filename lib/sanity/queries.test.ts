import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  sanityClient: { fetch: vi.fn() },
}));

import { sanityClient } from "./client";
import { getServicesByCategory, getAllCaseStudies } from "./queries";

const mockServices = [
  { _id: "1", title: "SAP Implementation", slug: { current: "sap-implementation" }, category: "sap", summary: "We implement SAP.", icon: "🔷" },
];

describe("getServicesByCategory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches services filtered by category", async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockServices);
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
    vi.mocked(sanityClient.fetch).mockResolvedValue([]);
    const result = await getAllCaseStudies();
    expect(Array.isArray(result)).toBe(true);
  });
});
