"use client";

import { useActionState } from "react";
import { removeProcedure, type ActionState } from "@/app/admin/fiches/actions";
import type { Scope } from "@/lib/content";

type DeleteProcedureButtonProps = {
  scope: Scope;
  slug: string;
  title: string;
  disabled: boolean;
};

export default function DeleteProcedureButton({ scope, slug, title, disabled }: DeleteProcedureButtonProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(removeProcedure, {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // Une suppression enleve la fiche du depot : on demande confirmation.
        if (!window.confirm(`Supprimer définitivement la procédure « ${title} » ?`)) {
          event.preventDefault();
        }
      }}
      className="inline"
    >
      <input type="hidden" name="scope" value={scope} />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={disabled || pending}
        className="text-sm font-medium text-accent-600 transition hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
      >
        {pending ? "Suppression…" : "Supprimer"}
      </button>
      {state.error && <span className="ml-2 text-xs text-accent-700">{state.error}</span>}
    </form>
  );
}
