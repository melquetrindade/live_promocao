"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { CreateLiveState } from "./create_lives";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

export async function deleteLive(
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

  try {
    const result = await db.live.deleteMany({
      where: { id: liveId, status: { in: ["ABERTA", "AGENDADA"] } },
    });

    if (result.count === 0) {
      return {
        error: "Somente lives abertas ou agendadas podem ser excluídas.",
      };
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error: "Não é possível excluir uma live que já possui pedidos vinculados.",
      };
    }
    throw error;
  }

  redirect("/admin/lives");
}