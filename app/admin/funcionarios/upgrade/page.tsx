import { redirect } from "next/navigation";

type UpgradeFuncionarioAliasProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function UpgradeFuncionarioAlias({
  searchParams,
}: UpgradeFuncionarioAliasProps) {
  const { id } = await searchParams;

  if (!id) {
    redirect("/admin/funcionarios");
  }

  redirect(
    `/admin/funcionarios/formulario/upgrade?id=${encodeURIComponent(id)}`,
  );
}