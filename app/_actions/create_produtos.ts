"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";
import type { ProdutoFormState } from "../admin/produto/formulario/produto-form";

export type CreateProdutoState = ProdutoFormState;

export async function createProduto(
  _previousState: CreateProdutoState,
  formData: FormData,
): Promise<CreateProdutoState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const nomeValue = formData.get("nome");
  const codigoBarrasValue = formData.get("codigoBarras");
  const estoqueValue = formData.get("estoque");
  const empresaIdValue = formData.get("empresaId");
  const precoValue = formData.get("preco");
  const descricaoValue = formData.get("descricao");

  if (
    typeof nomeValue !== "string" ||
    typeof codigoBarrasValue !== "string" ||
    typeof estoqueValue !== "string" ||
    typeof empresaIdValue !== "string" ||
    typeof precoValue !== "string" ||
    (descricaoValue !== null && typeof descricaoValue !== "string")
  ) {
    return { error: "Preencha os campos obrigatórios corretamente." };
  }

  const nome = nomeValue.trim();
  const codigoBarras = codigoBarrasValue.trim();
  const estoque = Number(estoqueValue);
  const empresaId = Number(empresaIdValue);
  const precoText = precoValue.trim();
  const descricao = descricaoValue?.trim() || null;

  if (!nome) {
    return { error: "Informe o nome do produto." };
  }

  if (!codigoBarras) {
    return { error: "Informe o código de barras." };
  }

  if (
    !estoqueValue.trim() ||
    !Number.isSafeInteger(estoque) ||
    estoque < 0
  ) {
    return { error: "O estoque deve ser um número inteiro igual ou maior que zero." };
  }

  if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
    return { error: "Selecione uma empresa válida." };
  }

  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(precoText)) {
    return {
      error: "Informe um preço válido, com até duas casas decimais.",
    };
  }

  const empresa = await db.empresa.findUnique({
    where: { id: empresaId },
    select: { id: true },
  });

  if (!empresa) {
    return { error: "A empresa selecionada não existe." };
  }

  const produtoExistente = await db.produto.findUnique({
    where: { codigoBarras },
    select: { id: true },
  });

  if (produtoExistente) {
    return { error: "Já existe um produto com esse código de barras." };
  }

  try {
    await db.produto.create({
      data: {
        nome,
        codigoBarras,
        estoque,
        empresa: {
          connect: { id: empresaId },
        },
        preco: new Prisma.Decimal(precoText),
        descricao,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Já existe um produto com esse código de barras." };
    }

    throw error;
  }

  redirect("/admin/produtos");
}