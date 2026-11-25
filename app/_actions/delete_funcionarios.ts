"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { CreateFuncionarioState } from "./create_funcionarios";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export async function deleteFuncionario(
  _previousState: CreateFuncionarioState,
  formData: FormData,
): Promise<CreateFuncionarioState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const funcionarioId = Number(formData.get("funcionarioId"));

  if (!Number.isSafeInteger(funcionarioId) || funcionarioId <= 0) {
    return { error: "Funcionário inválido." };
  }

  if (funcionarioId === authenticatedAdmin.id) {
    return { error: "Não é possível excluir o funcionário conectado." };
  }

  try {
    await db.funcionario.delete({
      where: { id: funcionarioId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "O funcionário não foi encontrado." };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error: "Não é possível excluir um funcionário com anotações vinculadas a lives.",
      };
    }

    throw error;
  }

  redirect("/admin/funcionarios");
}