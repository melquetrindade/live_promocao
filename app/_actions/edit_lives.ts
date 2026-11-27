"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { CreateLiveState } from "./create_lives";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";
import { syncLiveStatuses } from "../_lib/sync-live-statuses";

function parseSaoPauloDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const [year, month, day, hour, minute] = [
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
  ].map(Number);
  const localDate = new Date(0);
  localDate.setUTCFullYear(year, month - 1, day);
  localDate.setUTCHours(hour, minute, 0, 0);

  if (
    localDate.getUTCFullYear() !== year ||
    localDate.getUTCMonth() !== month - 1 ||
    localDate.getUTCDate() !== day ||
    localDate.getUTCHours() !== hour ||
    localDate.getUTCMinutes() !== minute
  ) {
    return null;
  }

  const date = new Date(`${value}:00-03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function editLive(
  _previousState: CreateLiveState,
  formData: FormData,
): Promise<CreateLiveState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();
  if (!authenticatedAdmin) redirect("/admin");

  await syncLiveStatuses();

  const liveId = Number(formData.get("liveId"));
  const nomeValue = formData.get("nome");
  const dataAberturaValue = formData.get("dataAbertura");
  const dataFechamentoValue = formData.get("dataFechamento");
  const metaValue = formData.get("metaArrecadacao");
  const empresaIdValue = formData.get("empresaId");

  if (
    !Number.isSafeInteger(liveId) ||
    liveId <= 0 ||
    typeof nomeValue !== "string" ||
    typeof dataAberturaValue !== "string" ||
    typeof dataFechamentoValue !== "string" ||
    typeof metaValue !== "string" ||
    typeof empresaIdValue !== "string"
  ) {
    return { error: "Preencha os campos corretamente." };
  }

  const nome = nomeValue.trim().normalize("NFC").toLocaleUpperCase("pt-BR");
  const dataAbertura = parseSaoPauloDateTime(dataAberturaValue);
  const dataFechamento = dataFechamentoValue
    ? parseSaoPauloDateTime(dataFechamentoValue)
    : null;
  const empresaId = Number(empresaIdValue);
  const metaText = metaValue.trim().replace(",", ".");

  if (!nome) return { error: "Informe o nome da live." };
  if (!dataAbertura) return { error: "Informe uma data de abertura válida." };
  if (dataFechamentoValue && !dataFechamento) {
    return { error: "Informe uma data de fechamento válida." };
  }
  if (dataFechamento && dataFechamento <= dataAbertura) {
    return {
      error: "A data de fechamento deve ser posterior à data de abertura.",
    };
  }
  if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
    return { error: "Selecione uma empresa válida." };
  }

  let metaArrecadacao: Prisma.Decimal | null = null;
  if (metaText) {
    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(metaText)) {
      return {
        error: "Informe uma meta válida, com até duas casas decimais.",
      };
    }
    metaArrecadacao = new Prisma.Decimal(metaText);
  }

  const [live, empresa, nomeEmUso] = await Promise.all([
    db.live.findUnique({
      where: { id: liveId },
      select: { id: true, status: true },
    }),
    db.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true },
    }),
    db.live.findFirst({
      where: {
        nome: { equals: nome, mode: "insensitive" },
        NOT: { id: liveId },
      },
      select: { id: true },
    }),
  ]);

  if (!live || (live.status !== "ABERTA" && live.status !== "AGENDADA")) {
    return {
      error: "Somente lives abertas ou agendadas podem ser editadas.",
    };
  }
  if (!empresa) return { error: "A empresa selecionada não existe." };
  if (nomeEmUso) {
    return { error: "Já existe uma live com esse nome. Escolha outro nome." };
  }

  try {
    const result = await db.live.updateMany({
      where: { id: liveId, status: { in: ["ABERTA", "AGENDADA"] } },
      data: {
        nome,
        dataAbertura,
        dataFechamento,
        metaArrecadacao,
        empresaId,
      },
    });

    if (result.count === 0) {
      return {
        error: "A live não está mais aberta ou agendada e não pode ser editada.",
      };
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Já existe uma live com esse nome. Escolha outro nome." };
    }
    throw error;
  }

  redirect("/admin/lives");
}