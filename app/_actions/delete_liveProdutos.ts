"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export type DeleteLiveProdutoState = {
  error: string | null;
  success: boolean;
};

export async function deleteLiveProduto(
  _previousState: DeleteLiveProdutoState,
  formData: FormData,
): Promise<DeleteLiveProdutoState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const liveId = Number(formData.get("liveId"));
  const liveProdutoId = Number(formData.get("liveProdutoId"));

  if (
    !Number.isSafeInteger(liveId) ||
    liveId <= 0 ||
    !Number.isSafeInteger(liveProdutoId) ||
    liveProdutoId <= 0
  ) {
    return {
      error: "A live ou o produto selecionado é inválido.",
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
      error: "Só é possível excluir produtos de lives agendadas.",
      success: false,
    };
  }

  let deleted: { count: number };
  try {
    deleted = await db.liveProduto.deleteMany({
      where: { id: liveProdutoId, liveId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error: "Não é possível excluir um produto que já está em um pedido.",
        success: false,
      };
    }

    throw error;
  }

  if (deleted.count === 0) {
    return {
      error: "O produto não está mais vinculado a esta live.",
      success: false,
    };
  }

  revalidatePath("/admin/lives/live_produtos");

  return { error: null, success: true };
}