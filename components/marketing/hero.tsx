import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-brand-bg to-brand-surface py-28 px-6 text-center">
      <p className="text-brand-accent-light text-sm font-semibold tracking-widest uppercase mb-4">
        Cloud + SAP Expertise
      </p>
      <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
        Your Enterprise<br />Cloud & SAP Partner
      </h1>
      <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
        End-to-end services from implementation and migration to 24/7 managed support — across SAP and all major cloud platforms.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/contact">
          <Button size="lg" className="bg-brand-primary hover:bg-brand-accent text-white font-semibold">
            Get a Quote
          </Button>
        </Link>
        <Link href="/services/sap">
          <Button size="lg" variant="outline" className="border-brand-primary text-brand-accent-light hover:bg-brand-surface">
            Our Services
          </Button>
        </Link>
      </div>
    </section>
  );
}
