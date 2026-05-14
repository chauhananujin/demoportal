import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  // In production: send email via Resend/SendGrid and/or write lead to Supabase
  console.log("New contact submission:", parsed.data);

  return NextResponse.json({ success: true });
}
