import { getServicesByCategory } from "@/lib/sanity/queries";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = { title: "SAP Services" };

export default async function SapServicesPage() {
  const services = await getServicesByCategory("sap");
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">SAP Services</h1>
      <p className="text-slate-500 text-lg max-w-2xl mb-12">
        Certified SAP implementation, migration, ongoing support, and custom development.
      </p>
      {services.length === 0 ? (
        <p className="text-slate-400">Services coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s._id} href={`/services/sap/${s.slug.current}`}>
              <Card className="h-full hover:border-brand-primary hover:shadow-md transition-all">
                <CardHeader>
                  <span className="text-3xl mb-2 block">{s.icon ?? "🔷"}</span>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">{s.summary}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
