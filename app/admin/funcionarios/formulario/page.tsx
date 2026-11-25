import { redirect } from "next/navigation";
import { db } from "../../../_lib/prisma";
import { getAuthenticatedAdmin } from "../../../_lib/auth";
import { FuncionarioForm } from "./funcionario-form";
import { createFuncionario } from "../../../_actions/create_funcionarios";

export default async function NovoFuncionarioPage() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const empresas = await db.empresa.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Cadastrar funcionário
          </h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados do funcionário e da credencial de acesso.
          </p>
        </div>
        <FuncionarioForm
          empresas={empresas}
          action={createFuncionario}
        />
      </section>
    </main>
  );
}