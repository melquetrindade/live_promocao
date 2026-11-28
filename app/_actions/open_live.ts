"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export type OpenLiveState = {
  error: string | null;
  success: boolean;
};

export async function openLive(
  _previousState: OpenLiveState,
  formData: FormData,
): Promise<OpenLiveState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const liveId = Number(formData.get("liveId"));

  if (!Number.isSafeInteger(liveId) || liveId <= 0) {
    return { error: "Live inválida.", success: false };
  }

  await syncLiveStatuses();

  const live = await db.live.findUnique({
    where: { id: liveId },
    select: {
      status: true,
      dataFechamento: true,
      _count: { select: { liveProdutos: true } },
    },
  });

  if (!live) {
    return { error: "A live não foi encontrada.", success: false };
  }

  if (live.status !== "AGENDADA") {
    return {
      error: "Somente lives agendadas podem ser abertas.",
      success: false,
    };
  }

  const now = new Date();
  if (!live.dataFechamento || live.dataFechamento < now) {
    return {
      error: "Não é possível abrir a live após a data de fechamento.",
      success: false,
    };
  }

  if (live._count.liveProdutos === 0) {
    return {
      error: "Adicione pelo menos um produto antes de abrir a live.",
      success: false,
    };
  }

  const result = await db.live.updateMany({
    where: {
      id: liveId,
      status: "AGENDADA",
      dataFechamento: { gte: now },
      liveProdutos: { some: {} },
    },
    data: { status: "ABERTA" },
  });

  if (result.count === 0) {
    return {
      error: "A live não atende mais às condições para ser aberta.",
      success: false,
    };
  }

  revalidatePath("/admin/lives");

  return { error: null, success: true };
}