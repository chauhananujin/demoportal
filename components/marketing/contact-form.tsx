"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const serviceOptions = [
  { value: "sap-implementation", label: "SAP Implementation" },
  { value: "sap-support", label: "SAP Support & Maintenance" },
  { value: "cloud-infra", label: "Cloud Infrastructure" },
  { value: "cloud-migration", label: "Cloud Migration" },
  { value: "managed", label: "Managed Services" },
  { value: "custom-dev", label: "Custom Development" },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { services: [] },
  });

  const selectedServices = watch("services");

  function toggleService(value: string) {
    const current = selectedServices ?? [];
    setValue(
      "services",
      current.includes(value) ? current.filter((s) => s !== value) : [...current, value],
      { shouldValidate: true }
    );
  }

  async function onSubmit(data: ContactFormData) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-slate-900 mb-2">Thanks — we&apos;ll be in touch.</p>
        <p className="text-slate-500">Expect a response within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Jane Smith" className="mt-1" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Work Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="jane@company.com" className="mt-1" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" {...register("company")} placeholder="Acme Corp" className="mt-1" />
        {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
      </div>
      <div>
        <Label>Services Interested In</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {serviceOptions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => toggleService(s.value)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                selectedServices?.includes(s.value)
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "border-slate-200 text-slate-600 hover:border-brand-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services.message}</p>}
      </div>
      <div>
        <Label htmlFor="message">Tell us about your project</Label>
        <Textarea id="message" {...register("message")} rows={5} placeholder="Describe your current environment and what you're looking to achieve..." className="mt-1" />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary hover:bg-brand-accent text-white font-semibold">
        {isSubmitting ? "Sending..." : "Request a Quote"}
      </Button>
    </form>
  );
}
