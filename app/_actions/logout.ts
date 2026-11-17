"use server";

import { redirect } from "next/navigation";
import { deleteAdminSession } from "../_lib/auth";

export async function logout() {
  await deleteAdminSession();
  redirect("/admin");
}