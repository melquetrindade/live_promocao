"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { deleteProduto } from "../../_actions/delete_produtos";
import { desactiveProduto } from "../../_actions/desactive_produtos";
import { Alert } from "../../components/ui/alert";
import { Button } from "@/components/ui/button";

type ProdutoCardActionsProps = {
  produtoId: number;
  produtoNome: string;
  ativo: boolean;
};

const initialState = { error: null };

export function ProdutoCardActions({
  produtoId,
  produtoNome,
  ativo,
}: ProdutoCardActionsProps) {
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
            href={`/admin/produtos/formulario/upgrade?id=${produtoId}`}
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
          <DeleteProdutoDialog
            produtoId={produtoId}
            produtoNome={produtoNome}
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
          <AlterarStatusProdutoDialog
            produtoId={produtoId}
            produtoNome={produtoNome}
            ativo={ativo}
          />
        )}
      </AlertDialog.Root>
    </>
  );
}

function DeleteProdutoDialog({
  produtoId,
  produtoNome,
}: {
  produtoId: number;
  produtoNome: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteProduto,
    initialState,
  );

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Excluir produto?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            A exclusão de “{produtoNome}” é irreversível. Deseja continuar?
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="produtoId" value={produtoId} />
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

function AlterarStatusProdutoDialog({
  produtoId,
  produtoNome,
  ativo,
}: {
  produtoId: number;
  produtoNome: string;
  ativo: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    desactiveProduto,
    initialState,
  );
  const novoEstadoAtivo = !ativo;

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            {ativo ? "Desativar produto?" : "Ativar produto?"}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            {ativo
              ? `Se “${produtoNome}” for desativado, não será possível adicioná-lo a uma live.`
              : `Deseja ativar “${produtoNome}” novamente?`}
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="produtoId" value={produtoId} />
          <input
            type="hidden"
            name="ativo"
            value={novoEstadoAtivo ? "true" : "false"}
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
            <Button type="submit" disabled={pending}>
              {pending
                ? "Salvando..."
                : novoEstadoAtivo
                  ? "Ativar"
                  : "Desativar"}
            </Button>
          </div>
        </form>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}
