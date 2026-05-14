import { ContactForm } from "@/components/marketing/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Let&apos;s Talk</h1>
        <p className="text-slate-500 text-lg mb-8">
          Tell us about your environment and goals. We&apos;ll put together a tailored proposal within 48 hours.
        </p>
        <div className="space-y-4">
          {[
            ["📧", "hello@ascelios.com"],
            ["📞", "+1 (800) 000-0000"],
            ["⏰", "24/7 support for existing clients"],
          ].map(([icon, text]) => (
            <p key={text} className="text-slate-600 flex items-center gap-3">
              <span>{icon}</span> {text}
            </p>
          ))}
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
