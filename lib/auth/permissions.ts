import type { Role, PortalAction } from "@/lib/tickets/types";

const PERMISSIONS: Record<Role, PortalAction[]> = {
  user: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "request:provision",
    "request:sap-operation",
    "request:infra-operation",
  ],
  manager: [
    "view:tickets",
    "update:ticket",
    "create:ticket",
    "approve:stage1",
    "reject:ticket",
    "request:provision",
    "request:sap-operation",
    "request:infra-operation",
    "request:add-funds",
    "manage:users",
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
    "request:infra-operation",
    "request:add-funds",
    "manage:users",
  ],
};

export function hasPermission(role: Role, action: PortalAction): boolean {
  return PERMISSIONS[role].includes(action);
}
