import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// Falls back to a placeholder ID so `createClient` never throws, but callers
// must check this before fetching — an unconfigured/placeholder project ID
// returns 404s from Sanity's API and would otherwise fail builds that call
// generateStaticParams for CMS-backed routes.
export const isSanityConfigured = Boolean(projectId && projectId !== "placeholder-fill-in-later");

export const sanityClient = createClient({
  projectId: projectId || "placeholder-fill-in-later",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});
