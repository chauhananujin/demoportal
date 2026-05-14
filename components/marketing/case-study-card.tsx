import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CaseStudy } from "@/lib/sanity/queries";

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/case-studies/${study.slug.current}`} className="group block rounded-xl border border-slate-200 hover:border-brand-primary hover:shadow-md transition-all p-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {study.services.map((s) => (
          <Badge key={s} variant="secondary" className="text-xs capitalize">{s.replace(/-/g, " ")}</Badge>
        ))}
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors mb-2">{study.title}</h3>
      <p className="text-slate-500 text-sm mb-3">{study.summary}</p>
      <p className="text-xs text-slate-400">{study.client} · {study.industry}</p>
    </Link>
  );
}
