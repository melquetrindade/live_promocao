"use server";

import argon2 from "argon2";
import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import type { CreateFuncionarioState } from "./create_funcionarios";
import { db } from "../_lib/prisma";
import { getAuthenticatedAdmin } from "../_lib/auth";

export async function editFuncionario(
  _previousState: CreateFuncionarioState,
  formData: FormData,
): Promise<CreateFuncionarioState> {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  const funcionarioId = Number(formData.get("funcionarioId"));
  const nomeValue = formData.get("nome");
  const cargoValue = formData.get("cargo");
  const empresaIdValue = formData.get("empresaId");
  const loginValue = formData.get("login");
  const senhaValue = formData.get("senha");

  if (
    !Number.isSafeInteger(funcionarioId) ||
    funcionarioId <= 0 ||
    typeof nomeValue !== "string" ||
    typeof cargoValue !== "string" ||
    typeof empresaIdValue !== "string" ||
    typeof loginValue !== "string" ||
    typeof senhaValue !== "string"
  ) {
    return { error: "Preencha os campos corretamente." };
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

  if (senhaValue && senhaValue.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const [funcionario, empresa, funcionarioComNome, credencialComLogin] =
    await Promise.all([
      db.funcionario.findUnique({
        where: { id: funcionarioId },
        select: {
          id: true,
          credencial: {
            select: { id: true },
          },
        },
      }),
      db.empresa.findUnique({
        where: { id: empresaId },
        select: { id: true },
      }),
      db.funcionario.findFirst({
        where: {
          nome: { equals: nome, mode: "insensitive" },
          NOT: { id: funcionarioId },
        },
        select: { id: true },
      }),
      db.credencial.findUnique({
        where: { login },
        select: { funcionarioId: true },
      }),
    ]);

  if (!funcionario) {
    return { error: "O funcionário não foi encontrado." };
  }

  if (!empresa) {
    return { error: "A empresa selecionada não existe." };
  }

  if (funcionarioComNome) {
    return { error: "Já existe um funcionário cadastrado com esse nome." };
  }

  if (
    credencialComLogin &&
    credencialComLogin.funcionarioId !== funcionarioId
  ) {
    return { error: "Este login já está sendo usado." };
  }

  if (!funcionario.credencial && !senhaValue) {
    return {
      error: "Defina uma senha para criar a credencial deste funcionário.",
    };
  }

  const senhaHash = senhaValue ? await argon2.hash(senhaValue) : null;

  try {
    if (funcionario.credencial) {
      await db.funcionario.update({
        where: { id: funcionarioId },
        data: {
          nome,
          cargo: cargoValue,
          empresa: { connect: { id: empresaId } },
          credencial: {
            update: {
              login,
              ...(senhaHash ? { senhaHash } : {}),
            },
          },
        },
      });
    } else {
      if (!senhaHash) {
        return {
          error: "Defina uma senha para criar a credencial deste funcionário.",
        };
      }

      await db.funcionario.update({
        where: { id: funcionarioId },
        data: {
          nome,
          cargo: cargoValue,
          empresa: { connect: { id: empresaId } },
          credencial: {
            create: {
              login,
              senhaHash,
            },
          },
        },
      });
    }
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "O funcionário ou sua credencial não foi encontrado." };
    }

    throw error;
  }

  redirect("/admin/funcionarios");
}