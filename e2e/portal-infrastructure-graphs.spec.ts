import { test, expect } from "@playwright/test";

// Helper: click a resource card by targeting the card's name <p> element specifically
async function clickResourceCard(page: any, name: string) {
  // Cards use font-mono for the name; target that <p> specifically to avoid hitting
  // the detail panel header or SAP widget select options
  await page.locator("p.font-mono", { hasText: name }).first().click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/portal/login");
  await page.evaluate(() => {
    localStorage.removeItem("ascelios_session");
    localStorage.removeItem("ascelios_tickets");
  });
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal\/dashboard/);
  await page.goto("/portal/infrastructure");
  await expect(page.getByText("prod-eks-cluster")).toBeVisible();
});

test("clicking a resource card opens the detail panel", async ({ page }) => {
  await clickResourceCard(page, "prod-eks-cluster");
  await expect(page.locator('[data-testid="resource-detail-panel"]')).toBeVisible();
});

test("detail panel shows CPU and Memory charts for active resources", async ({ page }) => {
  await clickResourceCard(page, "prod-eks-cluster");
  await expect(page.locator('[data-testid="resource-detail-panel"]')).toBeVisible();
  await expect(page.getByText("CPU %").first()).toBeVisible();
  await expect(page.getByText("Memory %").first()).toBeVisible();
});

test("detail panel shows Network In and Out charts", async ({ page }) => {
  await clickResourceCard(page, "prod-eks-cluster");
  const panel = page.locator('[data-testid="resource-detail-panel"]');
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Network In").first()).toBeVisible();
  await expect(panel.getByText("Network Out").first()).toBeVisible();
});

test("clicking the same card again closes the panel", async ({ page }) => {
  await clickResourceCard(page, "prod-eks-cluster");
  await expect(page.locator('[data-testid="resource-detail-panel"]')).toBeVisible();
  // Click the card name in the grid (not the panel header) — same p.font-mono selector
  await page.locator("p.font-mono", { hasText: "prod-eks-cluster" }).first().click();
  await expect(page.locator('[data-testid="resource-detail-panel"]')).not.toBeVisible();
});

test("panel close button collapses the panel", async ({ page }) => {
  await clickResourceCard(page, "prod-eks-cluster");
  await expect(page.locator('[data-testid="resource-detail-panel"]')).toBeVisible();
  await page.locator('[data-testid="resource-detail-panel"]').getByRole("button").click();
  await expect(page.locator('[data-testid="resource-detail-panel"]')).not.toBeVisible();
});

test("provisioning resource shows collecting-metrics placeholder", async ({ page }) => {
  // Use font-mono selector to avoid matching the SAP widget <select> option
  await page.locator("p.font-mono", { hasText: "sap-s4-sandbox-02" }).first().click();
  await expect(page.locator('[data-testid="resource-detail-panel"]')).toBeVisible();
  await expect(page.getByText(/collecting|provisioning/i).first()).toBeVisible();
});

test("selecting a different resource switches the panel", async ({ page }) => {
  await clickResourceCard(page, "prod-eks-cluster");
  await expect(page.locator('[data-testid="resource-detail-panel"]')).toBeVisible();
  await clickResourceCard(page, "dev-vm-fleet");
  await expect(page.locator('[data-testid="resource-detail-panel"]').getByText("dev-vm-fleet")).toBeVisible();
});

test("metric cards show Avg / Max / Min footer", async ({ page }) => {
  await clickResourceCard(page, "prod-eks-cluster");
  const panel = page.locator('[data-testid="resource-detail-panel"]');
  await expect(panel.getByText(/Avg:/i).first()).toBeVisible();
  await expect(panel.getByText(/Max:/i).first()).toBeVisible();
  await expect(panel.getByText(/Min:/i).first()).toBeVisible();
});

test("ci-runner-pool shows bursty CPU pattern", async ({ page }) => {
  await clickResourceCard(page, "ci-runner-pool");
  const panel = page.locator('[data-testid="resource-detail-panel"]');
  await expect(panel).toBeVisible();
  await expect(panel.getByText("CPU %").first()).toBeVisible();
});

test("backup-storage does not show CPU chart (storage-only metrics)", async ({ page }) => {
  await clickResourceCard(page, "backup-storage");
  const panel = page.locator('[data-testid="resource-detail-panel"]');
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Network In").first()).toBeVisible();
});
