"use server";

import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";

export async function getFuncionarios() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    return null;
  }

  return db.funcionario.findMany({
    select: {
      id: true,
      nome: true,
      cargo: true,
      status: true,
      empresa: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: {
      nome: "asc",
    },
  });
}