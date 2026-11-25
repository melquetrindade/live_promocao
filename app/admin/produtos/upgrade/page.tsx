import { redirect } from "next/navigation";

type UpgradeProdutoAliasProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function UpgradeProdutoAlias({
  searchParams,
}: UpgradeProdutoAliasProps) {
  const { id } = await searchParams;

  if (!id) {
    redirect("/admin/produtos");
  }

  redirect(
    `/admin/produtos/formulario/upgrade?id=${encodeURIComponent(id)}`,
  );
}