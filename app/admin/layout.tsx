import { Suspense, type ReactNode } from "react";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { AdminLayoutShell } from "./_components/admin-layout-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="min-h-screen bg-background px-6 py-10"
        >
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando painel administrativo...
          </p>
        </main>
      }
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
