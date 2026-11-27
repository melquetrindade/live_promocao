"use server";

import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export async function getLives() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    return null;
  }

  await syncLiveStatuses();

  const lives = await db.live.findMany({
    select: {
      id: true,
      nome: true,
      status: true,
      dataAbertura: true,
      dataFechamento: true,
      _count: {
        select: {
          liveProdutos: true,
        },
      },
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

  const now = new Date();

  return lives.map((live) => ({
    ...live,
    canOpen:
      live.status === "AGENDADA" &&
      live.dataFechamento !== null &&
      live.dataFechamento >= now &&
      live._count.liveProdutos > 0,
  }));
}