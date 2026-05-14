import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company name is required"),
  message: z.string().min(10, "Please provide more detail (at least 10 characters)"),
  services: z.array(z.string()).min(1, "Select at least one service"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
