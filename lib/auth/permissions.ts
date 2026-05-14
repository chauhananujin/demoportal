import type { Role, PortalAction } from "@/lib/tickets/types";

const PERMISSIONS: Record<Role, PortalAction[]> = {
  user: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "request:provision",
    "request:sap-operation",
  ],
  manager: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "approve:stage1",
    "reject:ticket",
    "request:provision",
    "request:sap-operation",
    "request:add-funds",
  ],
  admin: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "approve:stage1",
    "approve:stage2",
    "reject:ticket",
    "request:provision",
    "request:sap-operation",
    "request:add-funds",
  ],
};

export function hasPermission(role: Role, action: PortalAction): boolean {
  return PERMISSIONS[role].includes(action);
}
