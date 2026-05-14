import { AuthProvider } from "@/lib/auth/auth-context";
import { TicketProvider } from "@/lib/tickets/ticket-context";
import { PortalAuthGate } from "@/components/portal/portal-auth-gate";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TicketProvider>
        <PortalAuthGate>{children}</PortalAuthGate>
      </TicketProvider>
    </AuthProvider>
  );
}
