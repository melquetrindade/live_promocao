import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getEmpresas } from "../../_actions/get_empresas";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CriarEmpresaModal, EmpresaCardActions } from "./empresa-actions";

export default function EmpresasPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-10">
          <p className="mx-auto max-w-5xl text-muted-foreground">
            Carregando empresas...
          </p>
        </main>
      }
    >
      <AuthenticatedEmpresas />
    </Suspense>
  );
}

async function AuthenticatedEmpresas() {
  const empresas = await getEmpresas();

  if (empresas === null) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Empresas</h1>
          <CriarEmpresaModal />
        </div>

        {empresas.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Não existem empresas cadastradas no sistema.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {empresas.map((empresa) => (
              <Card key={empresa.id}>
                <CardHeader>
                  <CardTitle>{empresa.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <span className="font-medium">CNPJ:</span> {empresa.cnpj}
                  </p>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2">
                  <EmpresaCardActions
                    empresaId={empresa.id}
                    empresaNome={empresa.nome}
                    empresaCnpj={empresa.cnpj}
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