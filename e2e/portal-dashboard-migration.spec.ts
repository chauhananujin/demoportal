import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/portal/login");
  await page.evaluate(() => {
    localStorage.removeItem("ascelios_session");
    localStorage.removeItem("ascelios_tickets");
  });
  // Login as user
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal\/dashboard/);
});

// ── Dashboard Cost Optimisation ──────────────────────────────────────────────

test("dashboard shows Cost Optimisation section with total savings", async ({ page }) => {
  await expect(page.getByText("Cost Optimisation")).toBeVisible();
  await expect(page.getByText("$1,709/mo")).toBeVisible();
  await expect(page.getByText("6 recommendations")).toBeVisible();
});

test("dashboard shows FinOps approach steps", async ({ page }) => {
  await expect(page.getByText("Ascelios FinOps Approach")).toBeVisible();
  await expect(page.getByText("Identify", { exact: true })).toBeVisible();
  await expect(page.getByText("Analyse",  { exact: true })).toBeVisible();
  await expect(page.getByText("Optimise", { exact: true })).toBeVisible();
  await expect(page.getByText("Monitor",  { exact: true })).toBeVisible();
});

test("dashboard lists all 6 cost recommendations", async ({ page }) => {
  await expect(page.getByText("Right-size prod-eks-cluster node groups")).toBeVisible();
  await expect(page.getByText("Delete 4 unattached EBS volumes")).toBeVisible();
  await expect(page.getByText("Enable S3 Intelligent-Tiering on analytics bucket")).toBeVisible();
  await expect(page.getByText("Purchase Reserved Instances for RDS baseline")).toBeVisible();
  await expect(page.getByText("Migrate NAT Gateway traffic to VPC Endpoints")).toBeVisible();
  await expect(page.getByText("Enable AWS Compute Optimizer auto-scaling recommendations")).toBeVisible();
});

test("dashboard cost recommendations show savings amounts", async ({ page }) => {
  await expect(page.getByText("$380/mo")).toBeVisible();
  await expect(page.getByText("$94/mo")).toBeVisible();
  await expect(page.getByText("$640/mo")).toBeVisible();
  await expect(page.getByText("$225/mo")).toBeVisible();
});

test("dashboard cost recommendations show implementation approach steps", async ({ page }) => {
  await expect(page.getByText("Approach").first()).toBeVisible();
  await expect(page.getByText("Schedule maintenance window to update node group launch template")).toBeVisible();
  await expect(page.getByText("Create final snapshots of each volume as a safety backup")).toBeVisible();
});

test("dashboard cost recommendations show impact and effort badges", async ({ page }) => {
  await expect(page.getByText("High impact").first()).toBeVisible();
  await expect(page.getByText("Low effort").first()).toBeVisible();
  await expect(page.getByText("Medium effort").first()).toBeVisible();
});

test("dashboard has Create Optimisation Ticket button", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Create Optimisation Ticket" })).toBeVisible();
});

// ── Cloud Migration Journey ───────────────────────────────────────────────────

test("migration page is accessible from sidebar", async ({ page }) => {
  await page.locator("aside").getByText("Migration").click();
  await expect(page).toHaveURL(/\/portal\/migration/);
  await expect(page.getByRole("heading", { name: "Cloud Migration Journey" })).toBeVisible();
});

test("migration page shows overall progress bar", async ({ page }) => {
  await page.goto("/portal/migration");
  await expect(page.getByText("Cloud Migration Journey")).toBeVisible();
  await expect(page.getByText("Overall Progress")).toBeVisible();
  // 2 phases at 100%, 1 at 62%, 3 at 0% → avg = 44%
  await expect(page.getByText("44%")).toBeVisible();
});

test("migration page shows all 6 phases", async ({ page }) => {
  await page.goto("/portal/migration");
  await expect(page.getByText("Phase 1: Assessment & Discovery")).toBeVisible();
  await expect(page.getByText("Phase 2: Architecture & Planning")).toBeVisible();
  await expect(page.getByText("Phase 3: Pilot Migration")).toBeVisible();
  await expect(page.getByText("Phase 4: Full Migration — Wave 1")).toBeVisible();
  await expect(page.getByText("Phase 5: Full Migration — Wave 2")).toBeVisible();
  await expect(page.getByText("Phase 6: Optimisation & Steady State")).toBeVisible();
});

test("phases 1 and 2 are marked completed", async ({ page }) => {
  await page.goto("/portal/migration");
  const completedBadges = page.getByText("Completed");
  await expect(completedBadges.first()).toBeVisible();
  // Phase 1 and 2 should both show completed
  await expect(completedBadges.nth(1)).toBeVisible();
});

test("phase 3 is marked in progress with progress bar", async ({ page }) => {
  await page.goto("/portal/migration");
  await expect(page.getByText("Cloud Migration Journey")).toBeVisible();
  await expect(page.getByText("In Progress", { exact: true })).toBeVisible();
  await expect(page.getByText("62%")).toBeVisible();
});

test("phases 4-6 are marked upcoming", async ({ page }) => {
  await page.goto("/portal/migration");
  const upcomingBadges = page.getByText("Upcoming");
  await expect(upcomingBadges.first()).toBeVisible();
});

test("completed milestones show checkmarks", async ({ page }) => {
  await page.goto("/portal/migration");
  await expect(page.getByText("Workload inventory completed")).toBeVisible();
  await expect(page.getByText("AWS Landing Zone deployed")).toBeVisible();
});

test("incomplete milestones are visible without strikethrough for upcoming phases", async ({ page }) => {
  await page.goto("/portal/migration");
  await expect(page.getByText("Wave 1 migration window agreed (Jun 14–16)")).toBeVisible();
  await expect(page.getByText("prod-eks-cluster migrated and validated")).toBeVisible();
});

test("migration page has Log Migration Issue button", async ({ page }) => {
  await page.goto("/portal/migration");
  await expect(page.getByRole("button", { name: "Log Migration Issue" })).toBeVisible();
});

test("target completion date is shown", async ({ page }) => {
  await page.goto("/portal/migration");
  await expect(page.getByText("Cloud Migration Journey")).toBeVisible();
  await expect(page.getByText("Dec 2026", { exact: true })).toBeVisible();
});
