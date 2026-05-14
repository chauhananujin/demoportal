import { Hero } from "@/components/marketing/hero";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { ClientLogos } from "@/components/marketing/client-logos";
import { WhyAscelios } from "@/components/marketing/why-ascelios";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <ClientLogos />
      <WhyAscelios />
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">Tell us about your environment and we&apos;ll put together a tailored proposal within 48 hours.</p>
        <Link href="/contact">
          <Button size="lg" className="bg-brand-primary hover:bg-brand-accent text-white font-semibold">
            Request a Quote
          </Button>
        </Link>
      </section>
    </>
  );
}
