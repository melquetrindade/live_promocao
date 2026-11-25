import { redirect } from "next/navigation";
import { db } from "../../../_lib/prisma";
import { getAuthenticatedAdmin } from "../../../_lib/auth";
import { ProdutoForm } from "./produto-form";
import { createProduto } from "../../../_actions/create_produtos";

export default async function NovoProdutoPage() {
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
            Cadastrar produto
          </h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados do produto e selecione a empresa vinculada.
          </p>
        </div>
        <ProdutoForm empresas={empresas} action={createProduto} />
      </section>
    </main>
  );
}
