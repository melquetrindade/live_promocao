"use server";

import argon2 from "argon2";
import { redirect } from "next/navigation";
import { StatusFuncionario } from "../generated/prisma/enums";
import { db } from "../_lib/prisma";
import { createFuncionarioSession } from "../_lib/auth";

export type LoginState = {
  error: string | null;
};

const invalidCredentialsMessage = "O login ou a senha estão incorretos.";

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return authenticate(formData, "operacional");
}

export async function loginAdmin(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return authenticate(formData, "admin");
}

async function authenticate(
  formData: FormData,
  destination: "admin" | "operacional",
): Promise<LoginState> {
  const loginValue = formData.get("login");
  const passwordValue = formData.get("password");

  if (
    typeof loginValue !== "string" ||
    typeof passwordValue !== "string" ||
    !loginValue.trim() ||
    !passwordValue
  ) {
    return { error: invalidCredentialsMessage };
  }

  const credential = await db.credencial.findUnique({
    where: { login: loginValue.trim() },
    select: {
      senhaHash: true,
      funcionario: {
        select: {
          id: true,
          status: true,
          cargo: true,
        },
      },
    },
  });

  if (
    !credential ||
    credential.funcionario.status !== StatusFuncionario.ATIVO ||
    !(await argon2.verify(credential.senhaHash, passwordValue))
  ) {
    return { error: invalidCredentialsMessage };
  }

  const cargo = credential.funcionario.cargo;

  if (destination === "admin" && cargo !== "ADMINISTRADOR") {
    return {
      error: "Apenas funcionários com cargo ADMINISTRADOR podem acessar o painel.",
    };
  }

  if (
    destination === "operacional" &&
    cargo !== "ADMINISTRADOR" &&
    cargo !== "VENDEDOR"
  ) {
    return {
      error: "Este funcionário não possui um cargo autorizado para acessar o sistema.",
    };
  }

  await createFuncionarioSession(credential.funcionario.id);
  redirect(destination === "admin" ? "/admin/dashboard" : "/operacional");
}