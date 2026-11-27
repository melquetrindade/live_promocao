import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "../../../_lib/prisma";
import { getAuthenticatedAdmin } from "../../../_lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { LiveProdutoAddButton } from "./live-produto-add-button";
import { ProdutoSearchForm } from "./produto-search-form";

type AddProdutosPageProps = {
  searchParams: Promise<{
    id?: string | string[];
    q?: string | string[];
  }>;
};

export default function AddProdutosPage(props: AddProdutosPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-3xl text-muted-foreground">
            Carregando produtos...
          </p>
        </main>
      }
    >
      <AuthenticatedAddProdutos {...props} />
    </Suspense>
  );
}

async function AuthenticatedAddProdutos({
  searchParams,
}: AddProdutosPageProps) {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const { id, q } = await searchParams;
  const liveId = typeof id === "string" ? Number(id) : Number.NaN;

  if (!Number.isSafeInteger(liveId) || liveId <= 0) {
    notFound();
  }

  const live = await db.live.findUnique({
    where: { id: liveId },
    select: { id: true, nome: true },
  });

  if (!live) {
    notFound();
  }

  const searchTerm = typeof q === "string" ? q.trim() : "";
  const hasSearched = typeof q === "string";
  const produtos = searchTerm
    ? await db.produto.findMany({
        where: {
        ativo: true,
          OR: [
            { nome: { contains: searchTerm, mode: "insensitive" } },
            { codigoBarras: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          nome: true,
          codigoBarras: true,
          estoque: true,
          preco: true,
        },
        orderBy: { nome: "asc" },
      })
    : [];

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-4">
          <Button
            variant="outline"
            render={
              <Link href={`/admin/lives/live_produtos?id=${live.id}`} />
            }
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Adicionar produtos
            </h1>
            <p className="mt-2 text-muted-foreground">
              Pesquise produtos para a live “{live.nome}” pelo nome ou código
              de barras.
            </p>
          </div>
        </div>

        <ProdutoSearchForm
          liveId={live.id}
          initialQuery={typeof q === "string" ? q : ""}
        />

        {!hasSearched ? (
          <p className="text-muted-foreground">
            Pesquise para ver os produtos cadastrados.
          </p>
        ) : searchTerm.length === 0 ? (
          <p className="text-muted-foreground">
            Informe o nome ou código de barras para pesquisar.
          </p>
        ) : produtos.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum produto encontrado para “{searchTerm}”.
          </p>
        ) : (
          <div className="space-y-3">
            {produtos.map((produto) => (
              <Card key={produto.id}>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-semibold">{produto.nome}</h2>
                    <p className="text-sm text-muted-foreground">
                      Código de barras: {produto.codigoBarras}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estoque: {produto.estoque}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Preço:{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(produto.preco))}
                    </p>
                  </div>
                  <LiveProdutoAddButton
                    liveId={live.id}
                    produtoId={produto.id}
                    produtoNome={produto.nome}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}