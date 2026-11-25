"use server";

import argon2 from "argon2";
import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export type CreateFuncionarioState = {
  error: string | null;
};

export async function createFuncionario(
  _previousState: CreateFuncionarioState,
  formData: FormData,
): Promise<CreateFuncionarioState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const nomeValue = formData.get("nome");
  const cargoValue = formData.get("cargo");
  const empresaIdValue = formData.get("empresaId");
  const loginValue = formData.get("login");
  const senhaValue = formData.get("senha");

  if (
    typeof nomeValue !== "string" ||
    typeof cargoValue !== "string" ||
    typeof empresaIdValue !== "string" ||
    typeof loginValue !== "string" ||
    typeof senhaValue !== "string"
  ) {
    return { error: "Preencha todos os campos corretamente." };
  }

  const nome = nomeValue.trim().normalize("NFC").toLocaleUpperCase("pt-BR");
  const login = loginValue.trim();
  const empresaId = Number(empresaIdValue);

  if (!nome) {
    return { error: "Informe o nome do funcionário." };
  }

  if (cargoValue !== "VENDEDOR" && cargoValue !== "ADMINISTRADOR") {
    return { error: "Selecione Vendedor ou Administrador." };
  }

  if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
    return { error: "Selecione uma empresa válida." };
  }

  if (!login) {
    return { error: "Informe o login do funcionário." };
  }

  if (!senhaValue) {
    return { error: "Informe a senha do funcionário." };
  }

  if (senhaValue.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const funcionarioExistente = await db.funcionario.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (funcionarioExistente) {
    return { error: "Já existe um funcionário cadastrado com esse nome." };
  }

  const credencialExistente = await db.credencial.findUnique({
    where: { login },
    select: { id: true },
  });

  if (credencialExistente) {
    return { error: "Este login já está sendo usado." };
  }

  const empresa = await db.empresa.findUnique({
    where: { id: empresaId },
    select: { id: true },
  });

  if (!empresa) {
    return { error: "A empresa selecionada não existe." };
  }

  const senhaHash = await argon2.hash(senhaValue);

  try {
    await db.funcionario.create({
      data: {
        nome,
        cargo: cargoValue,
        empresa: {
          connect: { id: empresaId },
        },
        credencial: {
          create: {
            login,
            senhaHash,
          },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target;
      const targetName = Array.isArray(target) ? target.join(",") : target;

      if (typeof targetName === "string" && targetName.includes("nome")) {
        return { error: "Já existe um funcionário cadastrado com esse nome." };
      }

      if (typeof targetName === "string" && targetName.includes("login")) {
        return { error: "Este login já está sendo usado." };
      }

      return { error: "O nome ou login informado já está cadastrado." };
    }

    throw error;
  }

  redirect("/admin/funcionarios");
}