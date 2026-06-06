import { AppShell } from "@/components/layout/app-shell";
import { CustomersProvider } from "@/components/providers/customers-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <CustomersProvider>{children}</CustomersProvider>
    </AppShell>
  );
}
