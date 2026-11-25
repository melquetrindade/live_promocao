"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { ProdutoFormState } from "../admin/produto/formulario/produto-form";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export async function desactiveProduto(
  _previousState: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const produtoId = Number(formData.get("produtoId"));
  const ativoValue = formData.get("ativo");

  if (
    !Number.isSafeInteger(produtoId) ||
    produtoId <= 0 ||
    (ativoValue !== "true" && ativoValue !== "false")
  ) {
    return { error: "Produto ou estado inválido." };
  }

  try {
    await db.produto.update({
      where: { id: produtoId },
      data: { ativo: ativoValue === "true" },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "O produto não foi encontrado." };
    }

    throw error;
  }

  redirect("/admin/produtos");
}