"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { deleteLiveProduto } from "../../../_actions/delete_liveProdutos";
import type { DeleteLiveProdutoState } from "../../../_actions/delete_liveProdutos";
import { editLiveProduto } from "../../../_actions/edit_liveProdutos";
import type { EditLiveProdutoState } from "../../../_actions/edit_liveProdutos";
import { Alert } from "../../../components/ui/alert";
import { Button } from "@/components/ui/button";

type LiveProdutoActionsProps = {
  liveId: number;
  liveProdutoId: number;
  produtoNome: string;
  precoLive: string;
  canModify: boolean;
};

const initialEditState: EditLiveProdutoState = {
  error: null,
  success: false,
};

const initialDeleteState: DeleteLiveProdutoState = {
  error: null,
  success: false,
};

const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function LiveProdutoActions(props: LiveProdutoActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <AlertDialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialog.Trigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Editar ${props.produtoNome}`}
              title={
                props.canModify
                  ? "Editar preço promocional"
                  : "Só é possível editar produtos de lives agendadas."
              }
              disabled={!props.canModify}
              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              <Pencil aria-hidden="true" />
            </Button>
          }
        />
        {editOpen && (
          <EditLiveProdutoDialog
            {...props}
            onSuccess={() => setEditOpen(false)}
          />
        )}
      </AlertDialog.Root>

      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Trigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Excluir ${props.produtoNome}`}
              title={
                props.canModify
                  ? "Excluir da live"
                  : "Só é possível excluir produtos de lives agendadas."
              }
              disabled={!props.canModify}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          }
        />
        {deleteOpen && (
          <DeleteLiveProdutoDialog
            {...props}
            onSuccess={() => setDeleteOpen(false)}
          />
        )}
      </AlertDialog.Root>
    </div>
  );
}

function EditLiveProdutoDialog({
  liveId,
  liveProdutoId,
  produtoNome,
  precoLive,
  onSuccess,
}: LiveProdutoActionsProps & { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    editLiveProduto,
    initialEditState,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onSuccess();
    }
  }, [onSuccess, router, state.success]);

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Editar preço promocional
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            Informe o novo preço para “{produtoNome}”.
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="liveId" value={liveId} />
          <input type="hidden" name="liveProdutoId" value={liveProdutoId} />
          <div className="space-y-2">
            <label
              htmlFor={`edit-preco-live-${liveProdutoId}`}
              className="text-sm font-medium"
            >
              Preço promocional
            </label>
            <input
              id={`edit-preco-live-${liveProdutoId}`}
              name="precoLive"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={precoLive}
              disabled={pending}
              className={inputClassName}
            />
          </div>
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
              {pending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}

function DeleteLiveProdutoDialog({
  liveId,
  liveProdutoId,
  produtoNome,
  onSuccess,
}: LiveProdutoActionsProps & { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    deleteLiveProduto,
    initialDeleteState,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onSuccess();
    }
  }, [onSuccess, router, state.success]);

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Excluir produto da live?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            A exclusão de “{produtoNome}” desta live é irreversível. Deseja
            continuar?
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="liveId" value={liveId} />
          <input type="hidden" name="liveProdutoId" value={liveProdutoId} />
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
