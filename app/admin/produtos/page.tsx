import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProdutos } from "../../_actions/get_produtos";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProdutoCardActions } from "./produto-card-actions";

export default function ProdutosPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando produtos...
          </p>
        </main>
      }
    >
      <AuthenticatedProdutos />
    </Suspense>
  );
}

async function AuthenticatedProdutos() {
  const produtos = await getProdutos();

  if (produtos === null) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Produtos</h1>
          <Button render={<Link href="/admin/produto/formulario" />}>
            Cadastrar
          </Button>
        </div>

        {produtos.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Não existem produtos cadastrados no sistema.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {produtos.map((produto) => (
              <Card key={produto.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>{produto.nome}</CardTitle>
                    <Badge variant={produto.ativo ? "default" : "destructive"}>
                      {produto.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <span className="font-medium">Código de barras:</span>{" "}
                    {produto.codigoBarras}
                  </p>
                  <p>
                    <span className="font-medium">Estoque:</span>{" "}
                    {produto.estoque}
                  </p>
                  <p>
                    <span className="font-medium">Preço:</span>{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(produto.preco))}
                  </p>
                </CardContent>
                <CardFooter className="grid grid-cols-3 gap-2">
                  <ProdutoCardActions
                    produtoId={produto.id}
                    produtoNome={produto.nome}
                    ativo={produto.ativo}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
