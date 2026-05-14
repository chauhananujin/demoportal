import { describe, it, expect } from "vitest";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("user can view and create tickets", () => {
    expect(hasPermission("user", "view:tickets")).toBe(true);
    expect(hasPermission("user", "create:ticket")).toBe(true);
  });

  it("user cannot add funds or approve", () => {
    expect(hasPermission("user", "request:add-funds")).toBe(false);
    expect(hasPermission("user", "approve:stage1")).toBe(false);
    expect(hasPermission("user", "approve:stage2")).toBe(false);
    expect(hasPermission("user", "reject:ticket")).toBe(false);
  });

  it("manager can approve stage1 and reject but not stage2", () => {
    expect(hasPermission("manager", "approve:stage1")).toBe(true);
    expect(hasPermission("manager", "reject:ticket")).toBe(true);
    expect(hasPermission("manager", "approve:stage2")).toBe(false);
  });

  it("admin can approve both stages", () => {
    expect(hasPermission("admin", "approve:stage1")).toBe(true);
    expect(hasPermission("admin", "approve:stage2")).toBe(true);
    expect(hasPermission("admin", "reject:ticket")).toBe(true);
    expect(hasPermission("admin", "request:add-funds")).toBe(true);
  });
});
