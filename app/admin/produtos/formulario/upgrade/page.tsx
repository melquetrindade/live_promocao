import { redirect } from "next/navigation";
import { editProduto } from "../../../../_actions/edit_produtos";
import { db } from "../../../../_lib/prisma";
import { getAuthenticatedAdmin } from "../../../../_lib/auth";
import { ProdutoForm } from "../../../produto/formulario/produto-form";

type UpgradeProdutoPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function UpgradeProdutoPage({
  searchParams,
}: UpgradeProdutoPageProps) {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const { id: idValue } = await searchParams;
  const produtoId = Number(idValue);

  if (!Number.isSafeInteger(produtoId) || produtoId <= 0) {
    redirect("/admin/produtos");
  }

  const [produto, empresas] = await Promise.all([
    db.produto.findUnique({
      where: { id: produtoId },
      select: {
        id: true,
        nome: true,
        codigoBarras: true,
        estoque: true,
        empresaId: true,
        preco: true,
        descricao: true,
      },
    }),
    db.empresa.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!produto) {
    redirect("/admin/produtos");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Editar produto
          </h1>
          <p className="mt-2 text-muted-foreground">
            Atualize os dados do produto.
          </p>
        </div>
        <ProdutoForm
          action={editProduto}
          empresas={empresas}
          productId={produto.id}
          submitLabel="Salvar alterações"
          initialValues={{
            nome: produto.nome,
            codigoBarras: produto.codigoBarras,
            estoque: String(produto.estoque),
            empresaId: String(produto.empresaId ?? ""),
            preco: produto.preco.toString(),
            descricao: produto.descricao ?? "",
          }}
        />
      </section>
    </main>
  );
}
