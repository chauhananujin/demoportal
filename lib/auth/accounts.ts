import type { Role } from "@/lib/tickets/types";

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "user@acmecorp.com",    password: "demo1234", role: "user" },
  { email: "manager@acmecorp.com", password: "demo1234", role: "manager" },
  { email: "admin@acmecorp.com",   password: "demo1234", role: "admin" },
];
