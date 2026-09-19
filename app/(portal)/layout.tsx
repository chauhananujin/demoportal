import { AuthProvider } from "@/lib/auth/auth-context";
import { UserDirectoryProvider } from "@/lib/auth/user-directory";
import { TicketProvider } from "@/lib/tickets/ticket-context";
import { TenantProvider } from "@/lib/onboarding/tenant-context";
import { PortalThemeProvider } from "@/lib/portal/theme-context";
import { PortalAuthGate } from "@/components/portal/portal-auth-gate";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalThemeProvider>
      <UserDirectoryProvider>
        <AuthProvider>
          <TicketProvider>
            <TenantProvider>
              <PortalAuthGate>{children}</PortalAuthGate>
            </TenantProvider>
          </TicketProvider>
        </AuthProvider>
      </UserDirectoryProvider>
    </PortalThemeProvider>
  );
}
