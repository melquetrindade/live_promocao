"use server";

import argon2 from "argon2";
import { redirect } from "next/navigation";
import { StatusFuncionario } from "../generated/prisma/enums";
import { db } from "../_lib/prisma";
import { createAdminSession } from "../_lib/auth";

export type LoginState = {
  error: string | null;
};

const invalidCredentialsMessage = "O login ou a senha estão incorretos.";

export async function login(
  _previousState: LoginState,
  formData: FormData,
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

  await createAdminSession(credential.funcionario.id);
  redirect("/admin/dashboard");
}