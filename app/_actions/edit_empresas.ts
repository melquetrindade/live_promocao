"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { CreateEmpresaState } from "./create_empresas";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export async function editEmpresa(
  _previousState: CreateEmpresaState,
  formData: FormData,
): Promise<CreateEmpresaState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const empresaId = Number(formData.get("empresaId"));
  const nomeValue = formData.get("nome");
  const cnpjValue = formData.get("cnpj");

  if (
    !Number.isSafeInteger(empresaId) ||
    empresaId <= 0 ||
    typeof nomeValue !== "string" ||
    typeof cnpjValue !== "string"
  ) {
    return { error: "Preencha os campos corretamente." };
  }

  const nome = nomeValue.trim().normalize("NFC").toLocaleUpperCase("pt-BR");
  const cnpj = cnpjValue.replace(/\D/g, "");

  if (!nome) {
    return { error: "Informe o nome da empresa." };
  }

  if (!/^\d{14}$/.test(cnpj)) {
    return { error: "Informe um CNPJ com 14 dígitos." };
  }

  const empresaExistente = await db.empresa.findUnique({
    where: { id: empresaId },
    select: { id: true },
  });

  if (!empresaExistente) {
    return { error: "A empresa não foi encontrada." };
  }

  try {
    await db.empresa.update({
      where: { id: empresaId },
      data: { nome, cnpj },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Já existe uma empresa cadastrada com esse CNPJ." };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "A empresa não foi encontrada." };
    }

    throw error;
  }

  redirect("/admin/empresas");
}