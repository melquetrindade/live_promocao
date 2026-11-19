import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getFuncionarios } from "../../_actions/get_funcionarios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FuncionariosPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando funcionários...
          </p>
        </main>
      }
    >
      <AuthenticatedFuncionarios />
    </Suspense>
  );
}

async function AuthenticatedFuncionarios() {
  const funcionarios = await getFuncionarios();

  if (funcionarios === null) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Funcionários
          </h1>
          <Button type="button">Cadastrar</Button>
        </div>

        {funcionarios.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Não existem funcionários cadastrados no sistema.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {funcionarios.map((funcionario) => (
              <Card key={funcionario.id}>
                <CardHeader>
                  <CardTitle>{funcionario.nome}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <span className="font-medium">Cargo:</span>{" "}
                    {funcionario.cargo}
                  </p>
                  <p>
                    <span className="font-medium">Empresa:</span>{" "}
                    {funcionario.empresa.nome}
                  </p>
                </CardContent>
                <CardFooter className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button type="button" variant="destructive" size="sm">
                    Excluir
                  </Button>
                  <Button type="button" variant="secondary" size="sm">
                    Desativar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}