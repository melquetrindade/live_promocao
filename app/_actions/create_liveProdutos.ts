"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export type CreateLiveProdutoState = {
  error: string | null;
  success: boolean;
};

export async function createLiveProduto(
  _previousState: CreateLiveProdutoState,
  formData: FormData,
): Promise<CreateLiveProdutoState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const liveIdValue = formData.get("liveId");
  const produtoIdValue = formData.get("produtoId");
  const precoLiveValue = formData.get("precoLive");

  if (
    typeof liveIdValue !== "string" ||
    typeof produtoIdValue !== "string" ||
    typeof precoLiveValue !== "string"
  ) {
    return {
      error: "Preencha os dados do produto corretamente.",
      success: false,
    };
  }

  const liveId = Number(liveIdValue);
  const produtoId = Number(produtoIdValue);
  const precoLiveText = precoLiveValue.trim();

  if (!Number.isSafeInteger(liveId) || liveId <= 0) {
    return { error: "A live selecionada é inválida.", success: false };
  }

  if (!Number.isSafeInteger(produtoId) || produtoId <= 0) {
    return { error: "O produto selecionado é inválido.", success: false };
  }

  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(precoLiveText)) {
    return {
      error: "Informe um preço válido, com até duas casas decimais.",
      success: false,
    };
  }

  await syncLiveStatuses();

  const live = await db.live.findUnique({
    where: { id: liveId },
    select: { id: true, status: true },
  });

  if (!live) {
    return { error: "A live selecionada não existe.", success: false };
  }

  if (live.status !== "AGENDADA") {
    return {
      error: "Só é possível adicionar produtos a lives agendadas.",
      success: false,
    };
  }

  const produto = await db.produto.findUnique({
    where: { id: produtoId },
    select: { id: true, ativo: true, estoque: true },
  });

  if (!produto || !produto.ativo) {
    return {
      error: "O produto não existe ou está inativo.",
      success: false,
    };
  }

  const produtoJaVinculado = await db.liveProduto.findFirst({
    where: { liveId, produtoId },
    select: { id: true },
  });

  if (produtoJaVinculado) {
    return {
      error: "Este produto já foi adicionado a esta live.",
      success: false,
    };
  }

  try {
    await db.liveProduto.create({
      data: {
        liveId,
        produtoId,
        precoLive: new Prisma.Decimal(precoLiveText),
        quantidadeDisponivel: produto.estoque,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Este produto já foi adicionado a esta live.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/admin/lives");
  revalidatePath("/admin/lives/live_produtos");

  return { error: null, success: true };
}