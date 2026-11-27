"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export type CreateLiveState = {
  error: string | null;
};

function parseSaoPauloDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const [year, month, day, hour, minute] = [
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
  ].map(Number);
  const normalizedDate = new Date(0);
  normalizedDate.setUTCFullYear(year, month - 1, day);
  normalizedDate.setUTCHours(hour, minute, 0, 0);

  if (
    normalizedDate.getUTCFullYear() !== year ||
    normalizedDate.getUTCMonth() !== month - 1 ||
    normalizedDate.getUTCDate() !== day ||
    normalizedDate.getUTCHours() !== hour ||
    normalizedDate.getUTCMinutes() !== minute
  ) {
    return null;
  }

  const date = new Date(`${value}:00-03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createLive(
  _previousState: CreateLiveState,
  formData: FormData,
): Promise<CreateLiveState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const nomeValue = formData.get("nome");
  const dataAberturaValue = formData.get("dataAbertura");
  const dataFechamentoValue = formData.get("dataFechamento");
  const metaArrecadacaoValue = formData.get("metaArrecadacao");
  const empresaIdValue = formData.get("empresaId");

  if (
    typeof nomeValue !== "string" ||
    typeof dataAberturaValue !== "string" ||
    typeof dataFechamentoValue !== "string" ||
    typeof metaArrecadacaoValue !== "string" ||
    typeof empresaIdValue !== "string"
  ) {
    return { error: "Preencha os campos corretamente." };
  }

  const nome = nomeValue.trim().normalize("NFC").toLocaleUpperCase("pt-BR");
  const empresaId = Number(empresaIdValue);
  const dataAbertura = parseSaoPauloDateTime(dataAberturaValue);
  const dataFechamento = dataFechamentoValue
    ? parseSaoPauloDateTime(dataFechamentoValue)
    : null;
  const metaText = metaArrecadacaoValue.trim().replace(",", ".");

  if (!nome) {
    return { error: "Informe o nome da live." };
  }

  if (!dataAbertura) {
    return { error: "Informe uma data de abertura válida." };
  }

  if (dataFechamentoValue && !dataFechamento) {
    return { error: "Informe uma data de fechamento válida." };
  }

  if (dataFechamento && dataFechamento <= dataAbertura) {
    return {
      error: "A data de fechamento deve ser posterior à data de abertura.",
    };
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

  if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
    return { error: "Selecione uma empresa válida." };
  }

  const [liveExistente, empresa] = await Promise.all([
    db.live.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: "insensitive",
        },
      },
      select: { id: true },
    }),
    db.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true },
    }),
  ]);

  if (liveExistente) {
    return {
      error: "Já existe uma live com esse nome. Escolha outro nome.",
    };
  }

  if (!empresa) {
    return { error: "A empresa selecionada não existe." };
  }

  try {
    await db.live.create({
      data: {
        nome,
        dataAbertura,
        dataFechamento,
        metaArrecadacao,
        empresa: {
          connect: { id: empresaId },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Já existe uma live com esse nome. Escolha outro nome.",
      };
    }

    throw error;
  }

  redirect("/admin/lives");
}
