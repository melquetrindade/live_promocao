import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { StatusFuncionario } from "../generated/prisma/enums";
import { db } from "./prisma";

const sessionCookieName = "live_promocao_session";
const sessionDurationSeconds = 60 * 60 * 8;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes");
  }

  return secret;
}

function signSession(employeeId: number, expiresAt: number): string {
  return createHmac("sha256", getSessionSecret())
    .update(`${employeeId}.${expiresAt}`)
    .digest("base64url");
}

export async function createFuncionarioSession(employeeId: number): Promise<void> {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const signature = signSession(employeeId, expiresAt);
  const cookieStore = await cookies();

  cookieStore.set(
    sessionCookieName,
    `${employeeId}.${expiresAt}.${signature}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDurationSeconds,
    },
  );
}

export async function deleteFuncionarioSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getAuthenticatedFuncionario() {
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const [employeeIdValue, expiresAtValue, signature, ...extra] =
    token.split(".");
  const employeeId = Number(employeeIdValue);
  const expiresAt = Number(expiresAtValue);
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    extra.length > 0 ||
    !Number.isSafeInteger(employeeId) ||
    employeeId <= 0 ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= currentTime ||
    !signature
  ) {
    return null;
  }

  const expectedSignature = Buffer.from(
    signSession(employeeId, expiresAt),
    "base64url",
  );
  const providedSignature = Buffer.from(signature, "base64url");

  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  const employee = await db.funcionario.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      nome: true,
      status: true,
      cargo: true,
    },
  });

  if (!employee || employee.status !== StatusFuncionario.ATIVO) {
    return null;
  }

  return employee;
}

export async function getAuthenticatedAdmin() {
  const employee = await getAuthenticatedFuncionario();

  if (!employee || employee.cargo !== "ADMINISTRADOR") {
    return null;
  }

  return employee;
}
