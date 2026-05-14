import { getServiceBySlug, getServicesByCategory } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function generateStaticParams() {
  const services = await getServicesByCategory("sap");
  return services.map((s) => ({ slug: s.slug.current }));
}

export default async function SapServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-brand-primary text-sm font-semibold uppercase tracking-widest mb-3">SAP Services</p>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">{service.title}</h1>
      <p className="text-slate-500 text-lg mb-10">{service.summary}</p>
      <div className="prose prose-slate max-w-none mb-12">
        <p className="text-slate-400 italic">Full service description managed in Sanity CMS.</p>
      </div>
      <Link href="/contact">
        <Button className="bg-brand-primary hover:bg-brand-accent text-white">
          Get a Quote for {service.title}
        </Button>
      </Link>
    </div>
  );
}
