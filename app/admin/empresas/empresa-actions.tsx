"use client";

import { useActionState, useState } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { createEmpresa } from "../../_actions/create_empresas";
import { deleteEmpresa } from "../../_actions/delete_empresas";
import { editEmpresa } from "../../_actions/edit_empresas";
import { Alert } from "../../components/ui/alert";
import { Button } from "@/components/ui/button";

type EmpresaActionState = {
  error: string | null;
};

type EmpresaFieldsProps = {
  action: (
    previousState: EmpresaActionState,
    formData: FormData,
  ) => Promise<EmpresaActionState>;
  initialNome?: string;
  initialCnpj?: string;
  empresaId?: number;
  submitLabel: string;
};

const initialState: EmpresaActionState = { error: null };
const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CriarEmpresaModal() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        render={
          <Button type="button">
            Criar
          </Button>
        }
      />
      {open && (
        <EmpresaFormDialog
          title="Criar empresa"
          description="Informe o nome e o CNPJ da empresa."
          action={createEmpresa}
          submitLabel="Criar empresa"
        />
      )}
    </AlertDialog.Root>
  );
}

export function EmpresaCardActions({
  empresaId,
  empresaNome,
  empresaCnpj,
}: {
  empresaId: number;
  empresaNome: string;
  empresaCnpj: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <AlertDialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialog.Trigger
          render={
            <Button type="button" variant="outline" size="sm">
              Editar
            </Button>
          }
        />
        {editOpen && (
          <EmpresaFormDialog
            title="Editar empresa"
            description="Atualize o nome e o CNPJ da empresa."
            action={editEmpresa}
            empresaId={empresaId}
            initialNome={empresaNome}
            initialCnpj={empresaCnpj}
            submitLabel="Salvar alterações"
          />
        )}
      </AlertDialog.Root>

      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Trigger
          render={
            <Button type="button" variant="destructive" size="sm">
              Excluir
            </Button>
          }
        />
        {deleteOpen && (
          <ExcluirEmpresaDialog
            empresaId={empresaId}
            empresaNome={empresaNome}
          />
        )}
      </AlertDialog.Root>
    </>
  );
}

function EmpresaFormDialog({
  title,
  description,
  action,
  empresaId,
  initialNome,
  initialCnpj,
  submitLabel,
}: EmpresaFieldsProps & {
  title: string;
  description: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [nome, setNome] = useState(
    (initialNome ?? "").toLocaleUpperCase("pt-BR"),
  );

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          {empresaId !== undefined && (
            <input type="hidden" name="empresaId" value={empresaId} />
          )}

          <div className="space-y-2">
            <label htmlFor="empresa-nome" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="empresa-nome"
              name="nome"
              type="text"
              required
              value={nome}
              onChange={(event) =>
                setNome(
                  event.currentTarget.value.toLocaleUpperCase("pt-BR"),
                )
              }
              disabled={pending}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="empresa-cnpj" className="text-sm font-medium">
              CNPJ
            </label>
            <input
              id="empresa-cnpj"
              name="cnpj"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="00.000.000/0000-00"
              required
              defaultValue={initialCnpj ?? ""}
              disabled={pending}
              className={inputClassName}
            />
            <p className="text-xs text-muted-foreground">
              Informe os 14 dígitos; a pontuação é opcional.
            </p>
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
              {pending ? "Salvando..." : submitLabel}
            </Button>
          </div>
        </form>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}

function ExcluirEmpresaDialog({
  empresaId,
  empresaNome,
}: {
  empresaId: number;
  empresaNome: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteEmpresa,
    initialState,
  );

  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
        <div className="space-y-2">
          <AlertDialog.Title className="text-lg font-semibold">
            Excluir empresa?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            A exclusão de “{empresaNome}” é irreversível. Deseja continuar?
          </AlertDialog.Description>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="empresaId" value={empresaId} />
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
