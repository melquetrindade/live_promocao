"use client";

import { useActionState, useEffect, useState } from "react";
import { Alert } from "@/app/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type ProdutoFormProps = {
  empresas: Array<{ id: number; nome: string }>;
  action: (
    previousState: ProdutoFormState,
    formData: FormData,
  ) => Promise<ProdutoFormState>;
  initialValues?: Partial<ProdutoFormValues>;
  productId?: number;
  submitLabel?: string;
};

export type ProdutoFormState = {
  error: string | null;
};

export type ProdutoFormValues = {
  nome: string;
  codigoBarras: string;
  estoque: string;
  empresaId: string;
  preco: string;
  descricao: string;
};

const initialState: ProdutoFormState = { error: null };
const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProdutoForm({
  empresas,
  action,
  initialValues,
  productId,
  submitLabel = "Cadastrar",
}: ProdutoFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [dismissedErrorState, setDismissedErrorState] =
    useState<ProdutoFormState | null>(null);

  useEffect(() => {
    if (!state.error) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setDismissedErrorState(state),
      5000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [state]);

  return (
    <form action={formAction} noValidate>
      <Card>
        <CardContent className="space-y-5">
          {productId !== undefined && (
            <input type="hidden" name="produtoId" value={productId} />
          )}

          {empresas.length === 0 && (
            <Alert variant="destructive">
              Não existem empresas cadastradas. Cadastre uma empresa antes de
              criar um produto.
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              defaultValue={initialValues?.nome ?? ""}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="codigoBarras" className="text-sm font-medium">
              Código de barras
            </label>
            <input
              id="codigoBarras"
              name="codigoBarras"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              required
              defaultValue={initialValues?.codigoBarras ?? ""}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="estoque" className="text-sm font-medium">
              Estoque
            </label>
            <input
              id="estoque"
              name="estoque"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={initialValues?.estoque ?? ""}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="empresaId" className="text-sm font-medium">
              Empresa
            </label>
            <select
              id="empresaId"
              name="empresaId"
              required
              disabled={pending || empresas.length === 0}
              defaultValue={initialValues?.empresaId ?? ""}
              className={inputClassName}
            >
              <option value="" disabled>
                Selecione uma empresa
              </option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="preco" className="text-sm font-medium">
              Preço
            </label>
            <input
              id="preco"
              name="preco"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={initialValues?.preco ?? ""}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="text-sm font-medium">
              Descrição (opcional)
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              defaultValue={initialValues?.descricao ?? ""}
              disabled={pending || empresas.length === 0}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {state.error && dismissedErrorState !== state && (
            <Alert variant="destructive">{state.error}</Alert>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            type="submit"
            disabled={pending || empresas.length === 0}
          >
            {pending
              ? submitLabel === "Salvar alterações"
                ? "Salvando..."
                : "Cadastrando..."
              : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
