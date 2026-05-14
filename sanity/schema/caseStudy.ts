import { defineField, defineType } from "sanity";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "client", type: "string" }),
    defineField({
      name: "industry",
      type: "string",
      options: { list: ["manufacturing", "retail", "finance", "healthcare", "other"] },
    }),
    defineField({
      name: "services",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["sap-implementation", "sap-support", "cloud-infra", "cloud-migration", "managed", "custom-dev"] },
    }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "publishedAt", type: "datetime" }),
  ],
});
