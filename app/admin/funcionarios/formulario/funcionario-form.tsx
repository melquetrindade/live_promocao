"use client";

import { useActionState, useEffect, useState } from "react";
import {
  type CreateFuncionarioState,
} from "@/app/_actions/create_funcionarios";
import { Alert } from "@/app/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type FuncionarioFormProps = {
  empresas: Array<{ id: number; nome: string }>;
  action: (
    previousState: CreateFuncionarioState,
    formData: FormData,
  ) => Promise<CreateFuncionarioState>;
  initialValues?: {
    nome?: string;
    cargo?: string;
    empresaId?: string;
    login?: string;
  };
  funcionarioId?: number;
  passwordRequired?: boolean;
  submitLabel?: string;
};

const initialState: CreateFuncionarioState = { error: null };
const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function FuncionarioForm({
  empresas,
  action,
  initialValues,
  funcionarioId,
  passwordRequired = funcionarioId === undefined,
  submitLabel = "Cadastrar",
}: FuncionarioFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [nome, setNome] = useState(initialValues?.nome ?? "");
  const [dismissedErrorState, setDismissedErrorState] =
    useState<CreateFuncionarioState | null>(null);

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
          {funcionarioId !== undefined && (
            <input
              type="hidden"
              name="funcionarioId"
              value={funcionarioId}
            />
          )}

          {empresas.length === 0 && (
            <Alert variant="destructive">
              Não existem empresas cadastradas. Cadastre uma empresa antes de
              criar um funcionário.
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
              autoComplete="name"
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
            <label htmlFor="cargo" className="text-sm font-medium">
              Cargo
            </label>
            <select
              id="cargo"
              name="cargo"
              required
              disabled={pending || empresas.length === 0}
              defaultValue={initialValues?.cargo ?? ""}
              className={inputClassName}
            >
              <option value="" disabled>
                Selecione um cargo
              </option>
              <option value="VENDEDOR">Vendedor</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
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
            <label htmlFor="login" className="text-sm font-medium">
              Login
            </label>
            <input
              id="login"
              name="login"
              type="text"
              autoComplete="username"
              required
              defaultValue={initialValues?.login ?? ""}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required={passwordRequired}
              disabled={pending || empresas.length === 0}
              className={inputClassName}
            />
            <p className="text-xs text-muted-foreground">
              {passwordRequired
                ? "A senha deve ter pelo menos 8 caracteres."
                : "Deixe em branco para manter a senha atual."}
            </p>
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
