import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test
  await page.goto("/portal/login");
  await page.evaluate(() => {
    localStorage.removeItem("ascelios_session");
    localStorage.removeItem("ascelios_tickets");
  });
});

test("unauthenticated user is redirected to login", async ({ page }) => {
  await page.goto("/portal/dashboard");
  await expect(page).toHaveURL(/\/portal\/login/);
  await expect(page.getByText("Sign in to your account")).toBeVisible();
});

test("login page shows demo accounts", async ({ page }) => {
  await page.goto("/portal/login");
  await expect(page.getByText("user@acmecorp.com")).toBeVisible();
  await expect(page.getByText("manager@acmecorp.com")).toBeVisible();
  await expect(page.getByText("admin@acmecorp.com")).toBeVisible();
  await expect(page.getByText("demo1234")).toBeVisible();
});

test("wrong credentials show error", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "wrong@acmecorp.com");
  await page.fill('input[type="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});

test("user login shows correct role badge and redirects to dashboard", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal\/dashboard/);
  // Sidebar shows role badge
  await expect(page.getByText("user@acmecorp.com").first()).toBeVisible();
  await expect(page.locator("aside").getByText("user", { exact: true })).toBeVisible();
});

test("manager login shows amber role badge", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "manager@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal\/dashboard/);
  await expect(page.locator("aside").getByText("manager", { exact: true })).toBeVisible();
});

test("admin login shows red role badge", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "admin@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal\/dashboard/);
  await expect(page.locator("aside").getByText("admin", { exact: true })).toBeVisible();
});

test("demo account prefill works", async ({ page }) => {
  await page.goto("/portal/login");
  await page.getByRole("button", { name: "manager@acmecorp.com" }).click();
  await expect(page.locator('input[type="email"]')).toHaveValue("manager@acmecorp.com");
  await expect(page.locator('input[type="password"]')).toHaveValue("demo1234");
});

test("user role: Add Funds button is hidden on billing page", async ({ page }) => {
  // Login as user
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/billing");
  await expect(page.getByText("Request Funds")).not.toBeVisible();
});

test("manager role: Request Funds button is visible on billing page", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "manager@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/billing");
  await expect(page.getByText("+ Request Funds")).toBeVisible();
});

test("infrastructure page shows Request Provisioning button", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/infrastructure");
  await expect(page.getByText("+ Request Provisioning")).toBeVisible();
});

test("tickets page: user sees all tickets but no approval buttons", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/tickets");
  // Wait for ticket data to finish loading from localStorage
  await expect(page.getByText("TKT-0041")).toBeVisible();
  await expect(page.getByText("TKT-0039")).toBeVisible();
  // Expand a pending ticket — click the subtitle <p> which bubbles up to the row onClick
  await page.locator("p", { hasText: /^TKT-0041 ·/ }).click();
  // No Approve button for user role
  await expect(page.getByRole("button", { name: "Approve", exact: true })).not.toBeVisible();
  // Add Note IS visible
  await expect(page.getByPlaceholder("Add a note…")).toBeVisible();
});

test("tickets page: manager sees Approve/Reject on pending_manager tickets", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "manager@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/tickets");
  await expect(page.getByText("TKT-0041")).toBeVisible();
  // Expand TKT-0041 (pending_manager)
  await page.locator("p", { hasText: /^TKT-0041 ·/ }).click();
  await expect(page.getByRole("button", { name: "Approve", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reject", exact: true })).toBeVisible();
});

test("manager approves a ticket, status advances to Awaiting Admin", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "manager@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/tickets");
  await expect(page.getByText("TKT-0041")).toBeVisible();
  // Expand TKT-0041
  await page.locator("p", { hasText: /^TKT-0041 ·/ }).click();
  // Add an optional note
  await page.locator("textarea").first().fill("Looks good to me");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  // Status badge should update
  await expect(page.getByText("Awaiting Admin").first()).toBeVisible();
});

test("admin sees Final Approve on pending_admin ticket and can approve it", async ({ page }) => {
  // First: login as manager and approve TKT-0039
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "manager@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/tickets");
  await expect(page.getByText("TKT-0039")).toBeVisible();
  await page.locator("p", { hasText: /^TKT-0039 ·/ }).click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.getByText("Awaiting Admin").first()).toBeVisible();

  // Now: logout and login as admin
  await page.locator("aside").getByText("Sign out →").click();
  await expect(page).toHaveURL(/\/portal\/login/);
  await page.fill('input[type="email"]', "admin@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/tickets");
  await expect(page.getByText("TKT-0039")).toBeVisible();
  await page.locator("p", { hasText: /^TKT-0039 ·/ }).click();
  await expect(page.getByRole("button", { name: "Final Approve", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Final Approve", exact: true }).click();
  await expect(page.getByText("Approved").first()).toBeVisible();
});

test("logout clears session and redirects to login", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal\/dashboard/);
  await page.locator("aside").getByText("Sign out →").click();
  await expect(page).toHaveURL(/\/portal\/login/);
  // Navigating to portal should redirect back to login
  await page.goto("/portal/dashboard");
  await expect(page).toHaveURL(/\/portal\/login/);
});

test("session persists across page reload", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "manager@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal\/dashboard/);
  await page.reload();
  await expect(page).toHaveURL(/\/portal\/dashboard/);
  await expect(page.locator("aside").getByText("manager", { exact: true })).toBeVisible();
});

test("filter pills work on tickets page", async ({ page }) => {
  await page.goto("/portal/login");
  await page.fill('input[type="email"]', "user@acmecorp.com");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.goto("/portal/tickets");
  // Wait for ticket data to load before interacting with filter pills
  await expect(page.getByText("TKT-0041")).toBeVisible();
  // Click Approved filter
  await page.getByRole("button", { name: "approved" }).click();
  await expect(page.getByText("Awaiting Manager")).not.toBeVisible();
  await expect(page.getByText("Approved").first()).toBeVisible();
  // Click Pending filter
  await page.getByRole("button", { name: "pending" }).click();
  await expect(page.getByText("Awaiting Manager").first()).toBeVisible();
});
