"use server";

import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";

export async function getEmpresas() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    return null;
  }

  return db.empresa.findMany({
    select: {
      id: true,
      nome: true,
      cnpj: true,
    },
    orderBy: {
      nome: "asc",
    },
  });
}