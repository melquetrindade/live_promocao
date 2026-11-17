import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "../../_lib/auth";

type AdminSectionPageProps = {
  title: string;
  description: string;
};

export function AdminSectionPage({
  title,
  description,
}: AdminSectionPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando {title.toLocaleLowerCase("pt-BR")}...
          </p>
        </main>
      }
    >
      <AuthenticatedAdminSection
        title={title}
        description={description}
      />
    </Suspense>
  );
}

async function AuthenticatedAdminSection({
  title,
  description,
}: AdminSectionPageProps) {
  const employee = await getAuthenticatedAdmin();

  if (!employee) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </section>
    </main>
  );
}
