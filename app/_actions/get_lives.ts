"use server";

import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";

export async function getLives() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    return null;
  }

  return db.live.findMany({
    select: {
      id: true,
      nome: true,
      status: true,
      dataAbertura: true,
      dataFechamento: true,
      empresa: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: {
      dataAbertura: "desc",
    },
  });
}