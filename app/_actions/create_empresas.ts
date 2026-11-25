"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export type CreateEmpresaState = {
  error: string | null;
};

export async function createEmpresa(
  _previousState: CreateEmpresaState,
  formData: FormData,
): Promise<CreateEmpresaState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const nomeValue = formData.get("nome");
  const cnpjValue = formData.get("cnpj");

  if (typeof nomeValue !== "string" || typeof cnpjValue !== "string") {
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

  try {
    await db.empresa.create({
      data: { nome, cnpj },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Já existe uma empresa cadastrada com esse CNPJ." };
    }

    throw error;
  }

  redirect("/admin/empresas");
}