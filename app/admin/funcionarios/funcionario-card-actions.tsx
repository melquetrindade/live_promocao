"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { deleteFuncionario } from "../../_actions/delete_funcionarios";
import { desactiveFuncionario } from "../../_actions/desactive_funcionarios";
import { Alert } from "../../components/ui/alert";
import { Button } from "@/components/ui/button";

type FuncionarioCardActionsProps = {
  funcionarioId: number;
  funcionarioNome: string;
  ativo: boolean;
};

const initialState = { error: null };

export function FuncionarioCardActions({
  funcionarioId,
  funcionarioNome,
  ativo,
}: FuncionarioCardActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        render={
          <Link
            href={`/admin/funcionarios/formulario/upgrade?id=${funcionarioId}`}
          />
        }
      >
        Editar
      </Button>

      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Trigger
          render={
            <Button type="button" variant="destructive" size="sm">
              Excluir
            </Button>
          }
        />
        {deleteOpen && (
          <DeleteFuncionarioDialog
            funcionarioId={funcionarioId}
            funcionarioNome={funcionarioNome}
          />
        )}
      </AlertDialog.Root>

      <AlertDialog.Root open={statusOpen} onOpenChange={setStatusOpen}>
        <AlertDialog.Trigger
          render={
            <Button type="button" variant="secondary" size="sm">
              {ativo ? "Desativar" : "Ativar"}
            </Button>
          }
        />
        {statusOpen && (
          <AlterarStatusFuncionarioDialog
            funcionarioId={funcionarioId}
            funcionarioNome={funcionarioNome}
            ativo={ativo}
          />
        )}
      </AlertDialog.Root>
    </>
  );
}

function DeleteFuncionarioDialog({
  funcionarioId,
  funcionarioNome,
}: {
  funcionarioId: number;
  funcionarioNome: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteFuncionario,
    initialState,
  );

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Excluir funcionário?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            A exclusão de “{funcionarioNome}” é irreversível. Deseja continuar?
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="funcionarioId"
            value={funcionarioId}
          />
          {state.error && <Alert variant="destructive">{state.error}</Alert>}
          <div className="flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button type="button" variant="outline" disabled={pending}>
                  Cancelar
                </Button>
              }
            />
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Excluindo..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}

function AlterarStatusFuncionarioDialog({
  funcionarioId,
  funcionarioNome,
  ativo,
}: {
  funcionarioId: number;
  funcionarioNome: string;
  ativo: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    desactiveFuncionario,
    initialState,
  );
  const novoStatus = ativo ? "INATIVO" : "ATIVO";

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            {ativo ? "Desativar funcionário?" : "Ativar funcionário?"}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            {ativo
              ? `“${funcionarioNome}” perderá o acesso ao sistema.`
              : `“${funcionarioNome}” poderá acessar o sistema novamente.`}
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="funcionarioId"
            value={funcionarioId}
          />
          <input type="hidden" name="status" value={novoStatus} />
          {state.error && <Alert variant="destructive">{state.error}</Alert>}
          <div className="flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button type="button" variant="outline" disabled={pending}>
                  Cancelar
                </Button>
              }
            />
            <Button type="submit" disabled={pending}>
              {pending
                ? "Salvando..."
                : ativo
                  ? "Desativar"
                  : "Ativar"}
            </Button>
          </div>
        </form>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}
