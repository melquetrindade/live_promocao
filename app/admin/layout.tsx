import { Suspense, type ReactNode } from "react";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { AdminLayoutShell } from "./_components/admin-layout-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-background">{children}</div>}
    >
      <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
    </Suspense>
  );
}

async function AuthenticatedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const employee = await getAuthenticatedAdmin();

  return (
    <AdminLayoutShell administratorName={employee?.nome ?? null}>
      {children}
    </AdminLayoutShell>
  );
}
