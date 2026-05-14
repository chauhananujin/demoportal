import { test, expect } from "@playwright/test";

test("homepage loads with hero and CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /enterprise/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get a Quote" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Our Services" })).toBeVisible();
});

test("nav links work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("heading", { name: /about ascelios/i })).toBeVisible();
});

test("contact form validates and submits", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Request a Quote" }).click();
  await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();

  await page.fill("#name", "Jane Smith");
  await page.fill("#email", "jane@acme.com");
  await page.fill("#company", "Acme Corp");
  await page.getByRole("button", { name: "SAP Implementation" }).click();
  await page.fill("#message", "We need help migrating to SAP S/4HANA on Azure.");
  await page.getByRole("button", { name: "Request a Quote" }).click();
  await expect(page.getByText("Thanks — we'll be in touch.")).toBeVisible();
});

test("services page loads SAP and Cloud sections", async ({ page }) => {
  await page.goto("/services");
  await expect(page.getByRole("heading", { name: "SAP Services" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cloud Services" })).toBeVisible();
});
