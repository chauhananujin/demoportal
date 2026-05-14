import { getAllCaseStudies } from "@/lib/sanity/queries";
import { CaseStudyCard } from "@/components/marketing/case-study-card";

export const metadata = { title: "Case Studies" };

export default async function CaseStudiesPage() {
  const studies = await getAllCaseStudies();
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Case Studies</h1>
      <p className="text-slate-500 text-lg max-w-2xl mb-12">Real results for real enterprises.</p>
      {studies.length === 0 ? (
        <p className="text-slate-400">Case studies coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studies.map((s) => <CaseStudyCard key={s._id} study={s} />)}
        </div>
      )}
    </div>
  );
}
