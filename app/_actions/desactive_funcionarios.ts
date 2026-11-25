"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { StatusFuncionario } from "../generated/prisma/enums";
import type { CreateFuncionarioState } from "./create_funcionarios";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export async function desactiveFuncionario(
  _previousState: CreateFuncionarioState,
  formData: FormData,
): Promise<CreateFuncionarioState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const funcionarioId = Number(formData.get("funcionarioId"));
  const statusValue = formData.get("status");

  if (
    !Number.isSafeInteger(funcionarioId) ||
    funcionarioId <= 0 ||
    (statusValue !== StatusFuncionario.ATIVO &&
      statusValue !== StatusFuncionario.INATIVO)
  ) {
    return { error: "Funcionário ou estado inválido." };
  }

  if (
    funcionarioId === authenticatedAdmin.id &&
    statusValue === StatusFuncionario.INATIVO
  ) {
    return { error: "Não é possível desativar o funcionário conectado." };
  }

  try {
    await db.funcionario.update({
      where: { id: funcionarioId },
      data: { status: statusValue },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "O funcionário não foi encontrado." };
    }

    throw error;
  }

  redirect("/admin/funcionarios");
}