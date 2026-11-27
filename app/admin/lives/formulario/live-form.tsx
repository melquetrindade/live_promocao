"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  type CreateLiveState,
} from "../../../_actions/create_lives";
import { Alert } from "../../../components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type LiveFormProps = {
  empresas: Array<{ id: number; nome: string }>;
  action: (
    previousState: CreateLiveState,
    formData: FormData,
  ) => Promise<CreateLiveState>;
  liveId?: number;
  initialValues?: {
    nome?: string;
    dataAbertura?: string;
    dataFechamento?: string;
    metaArrecadacao?: string;
    empresaId?: string;
  };
  submitLabel?: string;
};

const initialState: CreateLiveState = { error: null };
const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function LiveForm({
  empresas,
  action,
  liveId,
  initialValues,
  submitLabel = "Criar",
}: LiveFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [nome, setNome] = useState(initialValues?.nome ?? "");
  const [dismissedErrorState, setDismissedErrorState] =
    useState<CreateLiveState | null>(null);

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
          {liveId !== undefined && (
            <input type="hidden" name="liveId" value={liveId} />
          )}

          {empresas.length === 0 && (
            <Alert variant="destructive">
              Não existem empresas cadastradas. Cadastre uma empresa antes de
              criar uma live.
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
              value={nome}
              onChange={(event) =>
                setNome(event.currentTarget.value.toLocaleUpperCase("pt-BR"))
              }
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dataAbertura" className="text-sm font-medium">
              Data de abertura
            </label>
            <input
              id="dataAbertura"
              name="dataAbertura"
              type="datetime-local"
              required
              defaultValue={initialValues?.dataAbertura ?? ""}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dataFechamento" className="text-sm font-medium">
              Data de fechamento (opcional)
            </label>
            <input
              id="dataFechamento"
              name="dataFechamento"
              type="datetime-local"
              defaultValue={initialValues?.dataFechamento ?? ""}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="metaArrecadacao" className="text-sm font-medium">
              Meta de arrecadação (opcional)
            </label>
            <input
              id="metaArrecadacao"
              name="metaArrecadacao"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialValues?.metaArrecadacao ?? ""}
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

          {state.error && dismissedErrorState !== state && (
            <Alert variant="destructive">{state.error}</Alert>
          )}
        </CardContent>
        <CardFooter
          className={liveId !== undefined ? "justify-between" : "justify-end"}
        >
          {liveId !== undefined && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              render={<Link href="/admin/lives" />}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={pending || empresas.length === 0}>
            {pending
              ? submitLabel === "Salvar alterações"
                ? "Salvando..."
                : "Criando..."
              : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
