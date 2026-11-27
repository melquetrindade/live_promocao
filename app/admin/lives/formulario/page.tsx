import { redirect } from "next/navigation";
import { db } from "../../../_lib/prisma";
import { getAuthenticatedAdmin } from "../../../_lib/auth";
import { LiveForm } from "./live-form";
import { createLive } from "../../../_actions/create_lives";

export default async function NovaLivePage() {
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
            Criar live
          </h1>
          <p className="mt-2 text-muted-foreground">
            Preencha as informações da live e selecione a empresa vinculada.
          </p>
        </div>
        <LiveForm empresas={empresas} action={createLive} />
      </section>
    </main>
  );
}