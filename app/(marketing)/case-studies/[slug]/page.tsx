import { getCaseStudyBySlug, getAllCaseStudies } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export async function generateStaticParams() {
  const studies = await getAllCaseStudies();
  return studies.map((s) => ({ slug: s.slug.current }));
}

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="flex flex-wrap gap-2 mb-6">
        {study.services.map((s) => (
          <Badge key={s} variant="secondary" className="capitalize">{s.replace(/-/g, " ")}</Badge>
        ))}
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-3">{study.title}</h1>
      <p className="text-slate-400 text-sm mb-8">{study.client} · {study.industry}</p>
      <p className="text-slate-600 text-lg mb-10">{study.summary}</p>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-400 italic">Full case study managed in Sanity CMS.</p>
      </div>
    </div>
  );
}
