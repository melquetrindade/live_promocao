"use server";

import { getAuthenticatedAdmin } from "../_lib/auth";
import { db } from "../_lib/prisma";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export async function getLivesProdutos(liveId: number) {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    return null;
  }

  await syncLiveStatuses();

  const live = await db.live.findUnique({
    where: { id: liveId },
    select: {
      id: true,
      nome: true,
      status: true,
      liveProdutos: {
        orderBy: {
          produto: {
            nome: "asc",
          },
        },
        select: {
          id: true,
          precoLive: true,
          produto: {
            select: {
              nome: true,
              codigoBarras: true,
              estoque: true,
              preco: true,
            },
          },
        },
      },
    },
  });

  if (!live) {
    return null;
  }

  return {
    ...live,
    liveProdutos: live.liveProdutos.map((item) => ({
      ...item,
      precoLive: item.precoLive.toString(),
      produto: {
        ...item.produto,
        preco: item.produto.preco.toString(),
      },
    })),
  };
}
