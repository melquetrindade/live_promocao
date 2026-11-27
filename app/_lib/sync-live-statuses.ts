import "server-only";

import { db } from "./prisma";

export async function syncLiveStatuses(): Promise<void> {
  const now = new Date();

  await db.live.updateMany({
    where: {
      status: { not: "FECHADA" },
      dataFechamento: { lt: now },
    },
    data: { status: "FECHADA" },
  });
}
