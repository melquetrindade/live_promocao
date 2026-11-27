"use server";

import { redirect } from "next/navigation";
import type { CreateLiveState } from "./create_lives";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export async function fechaLive(
  _previousState: CreateLiveState,
  formData: FormData,
): Promise<CreateLiveState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();
  if (!authenticatedAdmin) redirect("/admin");

  await syncLiveStatuses();

  const liveId = Number(formData.get("liveId"));
  if (!Number.isSafeInteger(liveId) || liveId <= 0) {
    return { error: "Live inválida." };
  }

  const result = await db.live.updateMany({
    where: { id: liveId, status: { in: ["ABERTA", "AGENDADA"] } },
    data: {
      status: "FECHADA",
      dataFechamento: new Date(),
    },
  });

  if (result.count === 0) {
    return {
      error: "Somente lives abertas ou agendadas podem ser fechadas. Lives fechadas não podem ser reabertas.",
    };
  }

  redirect("/admin/lives");
}