import { sanityClient } from "./client";

export type Service = {
  _id: string;
  title: string;
  slug: { current: string };
  category: "sap" | "cloud";
  summary: string;
  icon: string;
};

export type CaseStudy = {
  _id: string;
  title: string;
  slug: { current: string };
  client: string;
  industry: string;
  services: string[];
  summary: string;
  publishedAt: string;
};

export async function getServicesByCategory(category: "sap" | "cloud"): Promise<Service[]> {
  return sanityClient.fetch(
    `*[_type == "service" && category == $category] | order(title asc) { _id, title, slug, category, summary, icon }`,
    { category }
  );
}

export async function getServiceBySlug(slug: string): Promise<Service & { body: unknown[] }> {
  return sanityClient.fetch(
    `*[_type == "service" && slug.current == $slug][0] { _id, title, slug, category, summary, icon, body }`,
    { slug }
  );
}

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  return sanityClient.fetch(
    `*[_type == "caseStudy"] | order(publishedAt desc) { _id, title, slug, client, industry, services, summary, publishedAt }`
  );
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy & { body: unknown[] }> {
  return sanityClient.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0] { _id, title, slug, client, industry, services, summary, publishedAt, body }`,
    { slug }
  );
}
