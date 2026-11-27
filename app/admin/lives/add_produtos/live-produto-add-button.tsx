"use client";

import { useActionState, useState } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { createLiveProduto } from "../../../_actions/create_liveProdutos";
import type { CreateLiveProdutoState } from "../../../_actions/create_liveProdutos";
import { Alert } from "../../../components/ui/alert";
import { Button } from "@/components/ui/button";

type LiveProdutoAddButtonProps = {
  liveId: number;
  produtoId: number;
  produtoNome: string;
};

const initialState: CreateLiveProdutoState = {
  error: null,
  success: false,
};

const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function LiveProdutoAddButton({
  liveId,
  produtoId,
  produtoNome,
}: LiveProdutoAddButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        render={
          <Button type="button">
            Adicionar
          </Button>
        }
      />
      {open && (
        <LiveProdutoDialog
          liveId={liveId}
          produtoId={produtoId}
          produtoNome={produtoNome}
        />
      )}
    </AlertDialog.Root>
  );
}

function LiveProdutoDialog({
  liveId,
  produtoId,
  produtoNome,
}: LiveProdutoAddButtonProps) {
  const [state, formAction, pending] = useActionState(
    createLiveProduto,
    initialState,
  );

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Adicionar produto à live
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            Informe o preço promocional para “{produtoNome}”.
          </AlertDialog.Description>
        </div>

        {state.success ? (
          <div className="space-y-4">
            <p role="status" className="text-sm text-green-700 dark:text-green-400">
              Produto adicionado à live.
            </p>
            <div className="flex justify-end">
              <AlertDialog.Close
                render={<Button type="button">Concluir</Button>}
              />
            </div>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="liveId" value={liveId} />
            <input type="hidden" name="produtoId" value={produtoId} />

            <div className="space-y-2">
              <label
                htmlFor={`preco-live-${produtoId}`}
                className="text-sm font-medium"
              >
                Preço promocional da live
              </label>
              <input
                id={`preco-live-${produtoId}`}
                name="precoLive"
                type="number"
                min="0"
                step="0.01"
                required
                disabled={pending}
                className={inputClassName}
              />
            </div>

            {state.error && (
              <Alert variant="destructive">{state.error}</Alert>
            )}

            <div className="flex justify-end gap-2">
              <AlertDialog.Close
                render={
                  <Button type="button" variant="outline" disabled={pending}>
                    Cancelar
                  </Button>
                }
              />
              <Button type="submit" disabled={pending}>
                {pending ? "Adicionando..." : "Confirmar"}
              </Button>
            </div>
          </form>
        )}
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}
