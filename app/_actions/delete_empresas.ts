"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { CreateEmpresaState } from "./create_empresas";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export async function deleteEmpresa(
  _previousState: CreateEmpresaState,
  formData: FormData,
): Promise<CreateEmpresaState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const empresaId = Number(formData.get("empresaId"));

  if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
    return { error: "Empresa inválida." };
  }

  try {
    await db.empresa.delete({
      where: { id: empresaId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "A empresa não foi encontrada." };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error: "Não é possível excluir uma empresa vinculada a funcionários, produtos ou lives.",
      };
    }

    throw error;
  }

  redirect("/admin/empresas");
}