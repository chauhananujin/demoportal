import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const services = [
  { icon: "🔷", title: "SAP Services", description: "Basis administration, HANA, S/4HANA migrations, and managed services across your SAP landscape.", href: "/services/sap" },
  { icon: "🧬", title: "Data Services", description: "Advisory, BW/4HANA, BW-to-cloud warehouses, and a Datasphere-powered Gen AI accelerator.", href: "/services/data" },
  { icon: "🧩", title: "SAP BTP", description: "Clean-core extensions, Integration Suite, PI/PO migration, and AI on BTP — composable and upgrade-safe.", href: "/services/btp" },
  { icon: "🧠", title: "AI & Analytics", description: "Generative AI, predictive ML, BI, and decision intelligence — governed and tied to business outcomes.", href: "/services/ai-analytics" },
  { icon: "☁️", title: "Cloud Infrastructure", description: "Design, deploy, and manage AWS, Azure, and GCP environments built for enterprise scale.", href: "/services/cloud" },
  { icon: "⚙️", title: "DevOps as a Service", description: "CI/CD, IaC, observability, and 24/7 SRE — delivered as a subscription.", href: "/services/devops" },
  { icon: "🛠️", title: "Managed Support", description: "24/7 monitoring, incident response, and ongoing optimization so your team can focus on the business.", href: "/contact" },
];

export function ServicesGrid() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full border-slate-200 hover:border-brand-primary transition-colors hover:shadow-md">
                <CardHeader>
                  <span className="text-3xl mb-2 block">{s.icon}</span>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">{s.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-sm">{s.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
