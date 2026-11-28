import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "../../../_lib/auth";

export default async function LivePedidosPage() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Pedidos da Live
        </h1>
      </section>
    </main>
  );
}