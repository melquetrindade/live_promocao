import { redirect } from "next/navigation";
import { editLive } from "../../../../_actions/edit_lives";
import { db } from "../../../../_lib/prisma";
import { getAuthenticatedAdmin } from "../../../../_lib/auth";
import { LiveForm } from "../live-form";

type UpgradeLivePageProps = {
  searchParams: Promise<{ id?: string }>;
};

function toSaoPauloDateTimeInput(date: Date | null): string {
  if (!date) return "";

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(date)
    .replace(" ", "T");
}

export default async function UpgradeLivePage({
  searchParams,
}: UpgradeLivePageProps) {
  const authenticatedAdmin = await getAuthenticatedAdmin();
  if (!authenticatedAdmin) redirect("/admin");

  const { id: idValue } = await searchParams;
  const liveId = Number(idValue);

  if (!Number.isSafeInteger(liveId) || liveId <= 0) {
    redirect("/admin/lives");
  }

  const [live, empresas] = await Promise.all([
    db.live.findUnique({
      where: { id: liveId },
      select: {
        id: true,
        nome: true,
        status: true,
        dataAbertura: true,
        dataFechamento: true,
        metaArrecadacao: true,
        empresaId: true,
      },
    }),
    db.empresa.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (
    !live ||
    (live.status !== "ABERTA" && live.status !== "AGENDADA")
  ) {
    redirect("/admin/lives");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Editar live</h1>
          <p className="mt-2 text-muted-foreground">
            Atualize as informações da live aberta ou agendada.
          </p>
        </div>
        <LiveForm
          action={editLive}
          empresas={empresas}
          liveId={live.id}
          submitLabel="Salvar alterações"
          initialValues={{
            nome: live.nome,
            dataAbertura: toSaoPauloDateTimeInput(live.dataAbertura),
            dataFechamento: toSaoPauloDateTimeInput(live.dataFechamento),
            metaArrecadacao: live.metaArrecadacao?.toString() ?? "",
            empresaId: String(live.empresaId),
          }}
        />
      </section>
    </main>
  );
}
