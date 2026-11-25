"use server";

import { redirect } from "next/navigation";
import { deleteFuncionarioSession } from "../_lib/auth";

export async function logout() {
  await deleteFuncionarioSession();
  redirect("/admin");
}