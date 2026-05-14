export type Role = "user" | "manager" | "admin";

export type PortalAction =
  | "view:tickets"
  | "update:ticket"
  | "create:ticket"
  | "approve:stage1"
  | "approve:stage2"
  | "reject:ticket"
  | "request:provision"
  | "request:sap-operation"
  | "request:add-funds";

export interface TicketApprovalStep {
  by: string;
  at: string;
  note: string;
  outcome: "approved" | "rejected";
}

export type TicketStatus = "pending_manager" | "pending_admin" | "approved" | "rejected";
export type TicketType = "provision" | "sap-operation" | "billing" | "support";

export interface TicketNote {
  by: string;
  at: string;
  text: string;
}

export interface Ticket {
  id: string;
  title: string;
  type: TicketType;
  requestedBy: string;
  requestedByRole: Role;
  createdAt: string;
  status: TicketStatus;
  managerApproval: TicketApprovalStep | null;
  adminApproval: TicketApprovalStep | null;
  detail: Record<string, unknown>;
  notes: TicketNote[];
}

export interface CreateTicketInput {
  title: string;
  type: TicketType;
  detail: Record<string, unknown>;
}
