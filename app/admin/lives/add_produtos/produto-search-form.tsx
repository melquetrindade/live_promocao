"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ProdutoSearchFormProps = {
  liveId: number;
  initialQuery: string;
};

const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProdutoSearchForm({
  liveId,
  initialQuery,
}: ProdutoSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      id: String(liveId),
      q: query.trim(),
    });

    startTransition(() => {
      router.push(`/admin/lives/add_produtos?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3"
      aria-busy={isPending}
    >
      <div className="flex-1 space-y-2">
        <label htmlFor="q" className="text-sm font-medium">
          Nome ou código de barras
        </label>
        <input
          id="q"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Digite o nome ou código de barras"
          className={inputClassName}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Pesquisando..." : "Pesquisar"}
      </Button>
    </form>
  );
}
