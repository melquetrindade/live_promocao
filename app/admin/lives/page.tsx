import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLives } from "../../_actions/get_lives";
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
import { LiveCardActions } from "./live-card-actions";
import { LiveStatusRefresh } from "./live-status-refresh";

export default function LivesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando lives...
          </p>
        </main>
      }
    >
      <AuthenticatedLives />
    </Suspense>
  );
}

async function AuthenticatedLives() {
  const lives = await getLives();

  if (lives === null) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <LiveStatusRefresh
          transitions={lives.flatMap((live) =>
            live.dataFechamento ? [live.dataFechamento.toISOString()] : [],
          )}
        />
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Lives</h1>
          <Button render={<Link href="/admin/lives/formulario" />}>
            Criar
          </Button>
        </div>

        {lives.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Não existem lives criadas no sistema.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lives.map((live) => (
              <Card key={live.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>{live.nome}</CardTitle>
                    <Badge
                      variant={
                        live.status === "ABERTA"
                          ? "default"
                          : live.status === "FECHADA"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {live.status === "ABERTA" && (
                        <span
                          className="relative inline-flex size-2"
                          aria-label="Live aberta"
                        >
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                        </span>
                      )}
                      {live.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <span className="font-medium">Data de abertura:</span>{" "}
                    {live.dataAbertura.toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo",
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Data de fechamento:</span>{" "}
                    {live.dataFechamento
                      ? live.dataFechamento.toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: "America/Sao_Paulo",
                        })
                      : "Não definida"}
                  </p>
                  <p>
                    <span className="font-medium">Empresa:</span>{" "}
                    {live.empresa.nome}
                  </p>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <LiveCardActions
                    liveId={live.id}
                    liveNome={live.nome}
                    status={live.status}
                    canOpen={live.canOpen}
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