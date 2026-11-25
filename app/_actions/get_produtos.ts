"use server";

import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";

export async function getProdutos() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    return null;
  }

  const produtos = await db.produto.findMany({
    select: {
      id: true,
      nome: true,
      codigoBarras: true,
      estoque: true,
      preco: true,
      ativo: true,
    },
    orderBy: {
      nome: "asc",
    },
  });

  return produtos.map((produto) => ({
    ...produto,
    preco: produto.preco.toString(),
  }));
}