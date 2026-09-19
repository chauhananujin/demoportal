export type CloudProvider = "aws" | "azure" | "gcp";

export const CLOUD_PROVIDERS: { key: CloudProvider; label: string; regions: string[] }[] = [
  {
    key: "aws",
    label: "Amazon Web Services",
    regions: ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1"],
  },
  {
    key: "azure",
    label: "Microsoft Azure",
    regions: ["East US", "West US 2", "West Europe", "North Europe", "Southeast Asia"],
  },
  {
    key: "gcp",
    label: "Google Cloud",
    regions: ["us-central1", "us-east4", "europe-west1", "europe-west4", "asia-southeast1"],
  },
];

export type ServiceKey = "sap" | "data" | "btp" | "cloud" | "devops";

export interface ServiceOption {
  key: ServiceKey;
  label: string;
  description: string;
  monthly: number;
  icon: string;
}

export const SERVICE_CATALOG: ServiceOption[] = [
  { key: "sap",    label: "SAP Managed Services",    description: "Basis, HANA, S/4HANA — 24/7 monitoring + monthly patching.", monthly: 4800, icon: "🔷" },
  { key: "data",   label: "Data Services",           description: "BW/4HANA, cloud data warehouse, Gen AI accelerator.",         monthly: 3200, icon: "🧬" },
  { key: "btp",    label: "SAP BTP",                 description: "Integration Suite, CAP extensions, clean-core advisory.",     monthly: 2800, icon: "🧩" },
  { key: "cloud",  label: "Cloud Infrastructure",    description: "Multi-cloud landing zone + FinOps reviews.",                   monthly: 3600, icon: "☁️" },
  { key: "devops", label: "DevOps as a Service",     description: "CI/CD, IaC, SRE, 24/7 on-call.",                               monthly: 2400, icon: "⚙️" },
];

export type CompanySize = "1-50" | "51-200" | "201-1000" | "1000+";

export const COMPANY_SIZES: CompanySize[] = ["1-50", "51-200", "201-1000", "1000+"];

export const INDUSTRIES = [
  "Manufacturing",
  "Retail & CPG",
  "Financial Services",
  "Healthcare & Life Sciences",
  "Energy & Utilities",
  "Public Sector",
  "Telecom",
  "Other",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export type TenantStatus = "provisioning" | "active" | "failed";

export const PROVISIONING_STAGES = [
  "Validating subscription",
  "Creating cloud account",
  "Configuring network & IAM",
  "Bootstrapping tenant workspace",
  "Tenant active",
] as const;

export type ProvisioningStage = (typeof PROVISIONING_STAGES)[number];

export interface TenantDynatrace {
  managementZoneId: string;     // Dynatrace MZ identifier (numeric string)
  managementZoneName: string;   // Human-friendly slug, e.g. "ascelios-acme-prod"
  onboardedAt: string;          // ISO date the MZ was provisioned
}

export interface Tenant {
  id: string;
  name: string;
  provider: CloudProvider;
  region: string;
  status: TenantStatus;
  stageIndex: number;
  services: ServiceKey[];
  customerCompany: string;
  customerEmail: string;
  createdAt: string;
  agreementId: string;
  dynatrace?: TenantDynatrace;
}

export interface Agreement {
  id: string;
  signedName: string;
  signedEmail: string;
  signedAt: string;
  agreedTerms: boolean;
  agreedDpa: boolean;
  agreementHash: string;
  services: ServiceKey[];
  monthlyTotal: number;
}

export interface OnboardingCompany {
  name: string;
  industry: Industry | "";
  size: CompanySize | "";
  country: string;
}

export interface OnboardingAdmin {
  fullName: string;
  email: string;
  password: string;
}

export interface OnboardingTenantInput {
  name: string;
  provider: CloudProvider;
  region: string;
}

export interface OnboardingDraft {
  step: number;
  company: OnboardingCompany;
  admin: OnboardingAdmin;
  services: ServiceKey[];
  tenants: OnboardingTenantInput[];
  signedName: string;
  agreedTerms: boolean;
  agreedDpa: boolean;
}

export function emptyDraft(): OnboardingDraft {
  return {
    step: 0,
    company: { name: "", industry: "", size: "", country: "" },
    admin: { fullName: "", email: "", password: "" },
    services: [],
    tenants: [{ name: "", provider: "aws", region: "us-east-1" }],
    signedName: "",
    agreedTerms: false,
    agreedDpa: false,
  };
}
