"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { deleteLive } from "../../_actions/delete_lives";
import { fechaLive } from "../../_actions/fecha_lives";
import { Alert } from "../../components/ui/alert";
import { Button } from "@/components/ui/button";

type LiveCardActionsProps = {
  liveId: number;
  liveNome: string;
  status: string;
  canOpen: boolean;
};

const initialState = { error: null };

export function LiveCardActions({
  liveId,
  liveNome,
  status,
  canOpen,
}: LiveCardActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const canManage = status === "ABERTA" || status === "AGENDADA";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canManage}
        title={
          !canManage
            ? "Lives fechadas não podem ser editadas."
            : undefined
        }
        render={
          canManage ? (
            <Link href={`/admin/lives/formulario/upgrade?id=${liveId}`} />
          ) : undefined
        }
      >
        Editar
      </Button>

      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Trigger
          render={
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!canManage}
              title={
                !canManage
                  ? "Lives fechadas não podem ser excluídas."
                  : undefined
              }
            >
              Excluir
            </Button>
          }
        />
        {deleteOpen && (
          <DeleteLiveDialog liveId={liveId} liveNome={liveNome} />
        )}
      </AlertDialog.Root>

      <AlertDialog.Root open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialog.Trigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!canManage}
              title={
                !canManage
                  ? "Lives fechadas não podem ser fechadas novamente."
                  : undefined
              }
            >
              Fechar live
            </Button>
          }
        />
        {closeOpen && (
          <FecharLiveDialog liveId={liveId} liveNome={liveNome} />
        )}
      </AlertDialog.Root>

      {(status === "AGENDADA" || status === "FECHADA") && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          render={
            <Link href={`/admin/lives/live_produtos?id=${liveId}`} />
          }
        >
          Produtos
        </Button>
      )}

      {status === "AGENDADA" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="col-span-full"
          disabled={!canOpen}
          title={
            !canOpen
              ? "A live precisa ter produtos e ainda não pode ter passado da data de fechamento."
              : undefined
          }
        >
          Abrir
        </Button>
      )}
    </>
  );
}

function DeleteLiveDialog({
  liveId,
  liveNome,
}: {
  liveId: number;
  liveNome: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteLive,
    initialState,
  );

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Excluir live?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            A exclusão de “{liveNome}” é irreversível. Deseja continuar?
          </AlertDialog.Description>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="liveId" value={liveId} />
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

function FecharLiveDialog({
  liveId,
  liveNome,
}: {
  liveId: number;
  liveNome: string;
}) {
  const [state, formAction, pending] = useActionState(
    fechaLive,
    initialState,
  );

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Fechar live?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            Ao fechar “{liveNome}”, a data de fechamento será atualizada para
            agora. Essa ação é definitiva e a live não poderá ser reaberta.
          </AlertDialog.Description>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="liveId" value={liveId} />
          {state.error && <Alert variant="destructive">{state.error}</Alert>}
          <div className="flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button type="button" variant="outline" disabled={pending}>
                  Cancelar
                </Button>
              }
            />
            <Button type="submit" variant="secondary" disabled={pending}>
              {pending ? "Fechando..." : "Confirmar fechamento"}
            </Button>
          </div>
        </form>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}
