"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { ProdutoFormState } from "../admin/produto/formulario/produto-form";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export async function deleteProduto(
  _previousState: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const produtoId = Number(formData.get("produtoId"));

  if (!Number.isSafeInteger(produtoId) || produtoId <= 0) {
    return { error: "Produto inválido." };
  }

  try {
    await db.produto.delete({
      where: { id: produtoId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "O produto não foi encontrado." };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error: "Não é possível excluir um produto que já foi adicionado a uma live.",
      };
    }

    throw error;
  }

  redirect("/admin/produtos");
}