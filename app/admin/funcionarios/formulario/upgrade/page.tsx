import { redirect } from "next/navigation";
import { editFuncionario } from "../../../../_actions/edit_funcionarios";
import { db } from "../../../../_lib/prisma";
import { getAuthenticatedAdmin } from "../../../../_lib/auth";
import { FuncionarioForm } from "../funcionario-form";

type UpgradeFuncionarioPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function UpgradeFuncionarioPage({
  searchParams,
}: UpgradeFuncionarioPageProps) {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const { id: idValue } = await searchParams;
  const funcionarioId = Number(idValue);

  if (!Number.isSafeInteger(funcionarioId) || funcionarioId <= 0) {
    redirect("/admin/funcionarios");
  }

  const [funcionario, empresas] = await Promise.all([
    db.funcionario.findUnique({
      where: { id: funcionarioId },
      select: {
        id: true,
        nome: true,
        cargo: true,
        empresaId: true,
        credencial: {
          select: { login: true },
        },
      },
    }),
    db.empresa.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!funcionario) {
    redirect("/admin/funcionarios");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Editar funcionário
          </h1>
          <p className="mt-2 text-muted-foreground">
            Atualize os dados do funcionário e da credencial de acesso.
          </p>
        </div>
        <FuncionarioForm
          action={editFuncionario}
          empresas={empresas}
          funcionarioId={funcionario.id}
          passwordRequired={!funcionario.credencial}
          submitLabel="Salvar alterações"
          initialValues={{
            nome: funcionario.nome,
            cargo: funcionario.cargo,
            empresaId: String(funcionario.empresaId),
            login: funcionario.credencial?.login ?? "",
          }}
        />
      </section>
    </main>
  );
}
