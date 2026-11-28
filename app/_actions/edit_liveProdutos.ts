"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export type EditLiveProdutoState = {
  error: string | null;
  success: boolean;
};

export async function editLiveProduto(
  _previousState: EditLiveProdutoState,
  formData: FormData,
): Promise<EditLiveProdutoState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const liveId = Number(formData.get("liveId"));
  const liveProdutoId = Number(formData.get("liveProdutoId"));
  const precoLiveValue = formData.get("precoLive");

  if (
    !Number.isSafeInteger(liveId) ||
    liveId <= 0 ||
    !Number.isSafeInteger(liveProdutoId) ||
    liveProdutoId <= 0 ||
    typeof precoLiveValue !== "string"
  ) {
    return {
      error: "Preencha os dados do produto corretamente.",
      success: false,
    };
  }

  const precoLiveText = precoLiveValue.trim();

  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(precoLiveText)) {
    return {
      error: "Informe um preço válido, com até duas casas decimais.",
      success: false,
    };
  }

  await syncLiveStatuses();

  const liveProduto = await db.liveProduto.findFirst({
    where: { id: liveProdutoId, liveId },
    select: {
      id: true,
      live: { select: { status: true } },
    },
  });

  if (!liveProduto) {
    return {
      error: "O produto não está vinculado a esta live.",
      success: false,
    };
  }

  if (liveProduto.live.status !== "AGENDADA") {
    return {
      error: "Só é possível editar produtos de lives agendadas.",
      success: false,
    };
  }

  try {
    await db.liveProduto.update({
      where: { id: liveProdutoId },
      data: { precoLive: new Prisma.Decimal(precoLiveText) },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        error: "O produto não está mais vinculado a esta live.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/admin/lives/live_produtos");

  return { error: null, success: true };
}