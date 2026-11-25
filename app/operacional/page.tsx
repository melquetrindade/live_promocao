import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedFuncionario } from "../_lib/auth";
import { OperacionalSidebar } from "./operacional-sidebar";

export default function OperacionalPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando tela operacional...
          </p>
        </main>
      }
    >
      <AuthenticatedOperacionalPage />
    </Suspense>
  );
}

async function AuthenticatedOperacionalPage() {
  const employee = await getAuthenticatedFuncionario();

  if (!employee) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <OperacionalSidebar employeeName={employee.nome} />
      <main className="px-6 py-10 lg:ml-72">
        <section className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Tela operacional
          </h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo, {employee.nome}.
          </p>
        </section>
      </main>
    </div>
  );
}