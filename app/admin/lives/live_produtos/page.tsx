import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getLivesProdutos } from "../../../_actions/get_lives_produtos";
import { getAuthenticatedAdmin } from "../../../_lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LiveProdutoActions } from "./live-produto-actions";

type LiveProdutosPageProps = {
  searchParams: Promise<{ id?: string | string[] }>;
};

export default function LiveProdutosPage(props: LiveProdutosPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando produtos da live...
          </p>
        </main>
      }
    >
      <AuthenticatedLiveProdutos {...props} />
    </Suspense>
  );
}

async function AuthenticatedLiveProdutos({
  searchParams,
}: LiveProdutosPageProps) {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const { id } = await searchParams;
  const liveId = typeof id === "string" ? Number(id) : Number.NaN;

  if (!Number.isSafeInteger(liveId) || liveId <= 0) {
    notFound();
  }

  const live = await getLivesProdutos(liveId);

  if (!live) {
    notFound();
  }

  const formatCurrency = (value: string) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Produtos da live
            </h1>
            <p className="mt-2 text-muted-foreground">{live.nome}</p>
            <Button
              className="mt-3"
              variant="outline"
              render={<Link href="/admin/lives" />}
            >
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Voltar
            </Button>
          </div>
          <Button
            disabled={live.status === "FECHADA"}
            title={
              live.status === "FECHADA"
                ? "Lives fechadas não permitem adicionar produtos."
                : undefined
            }
            render={
              live.status === "FECHADA" ? undefined : (
                <Link href={`/admin/lives/add_produtos?id=${live.id}`} />
              )
            }
          >
            Adicionar
          </Button>
        </div>

        {live.liveProdutos.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Ainda não existem produtos adicionados a esta live.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Nome
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Cod.
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Preço
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Promo
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Estoque
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {live.liveProdutos.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">{item.produto.nome}</td>
                    <td className="px-4 py-3">{item.produto.codigoBarras}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(item.produto.preco)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(item.precoLive)}
                    </td>
                    <td className="px-4 py-3">{item.produto.estoque}</td>
                    <td className="px-4 py-3">
                      <LiveProdutoActions
                        liveId={live.id}
                        liveProdutoId={item.id}
                        produtoNome={item.produto.nome}
                        precoLive={item.precoLive}
                        canModify={live.status === "AGENDADA"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}