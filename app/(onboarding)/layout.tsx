import { AuthProvider } from "@/lib/auth/auth-context";
import { UserDirectoryProvider } from "@/lib/auth/user-directory";
import { TicketProvider } from "@/lib/tickets/ticket-context";
import { TenantProvider } from "@/lib/onboarding/tenant-context";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserDirectoryProvider>
      <AuthProvider>
        <TicketProvider>
          <TenantProvider>{children}</TenantProvider>
        </TicketProvider>
      </AuthProvider>
    </UserDirectoryProvider>
  );
}
