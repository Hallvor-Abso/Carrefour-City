"use client";

import Link from "next/link";
import { marked } from "marked";
import { useActionState, useMemo, useState } from "react";
import { saveProcedure, type ActionState } from "@/app/admin/fiches/actions";
import type { Scope } from "@/lib/content";
import { SCOPE_LABELS, SCOPES, slugify } from "@/lib/procedure-file";

export type EditorInitial = {
  scope: Scope;
  slug: string;
  title: string;
  category: string;
  order: number;
  summary: string;
  body: string;
};

type ProcedureEditorProps = {
  mode: "create" | "edit";
  initial: EditorInitial;
  /** Categories deja utilisees, proposees en autocompletion. */
  categories: string[];
  /** Ecriture possible ? Sinon le formulaire s'affiche desactive. */
  writable: boolean;
};

const field =
  "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 disabled:bg-slate-50 disabled:text-slate-500";
const label = "block text-sm font-semibold text-slate-700";

export default function ProcedureEditor({ mode, initial, categories, writable }: ProcedureEditorProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveProcedure, {});

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [body, setBody] = useState(initial.body);
  const [preview, setPreview] = useState(false);

  // En creation, le nom de fichier suit le titre tant que personne ne l'a modifie.
  const effectiveSlug = slugTouched ? slug : slugify(title);
  const previewHtml = useMemo(() => (preview ? marked.parse(body, { async: false }) : ""), [body, preview]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="previousScope" value={mode === "edit" ? initial.scope : ""} />
      <input type="hidden" name="previousSlug" value={mode === "edit" ? initial.slug : ""} />

      {!writable && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          L&apos;écriture n&apos;est pas configurée : ajoute <code className="font-mono">GITHUB_TOKEN</code> et{" "}
          <code className="font-mono">GITHUB_REPO</code> dans les réglages Vercel pour pouvoir enregistrer.
        </p>
      )}

      {state.error && (
        <p role="alert" className="rounded-lg border border-accent-100 bg-accent-50 px-4 py-3 text-sm text-accent-700">
          {state.error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div>
          <label htmlFor="title" className={label}>
            Titre
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={!writable}
            className={field}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="summary" className={label}>
            Résumé <span className="font-normal text-slate-500">— la phrase affichée sous le titre dans la liste</span>
          </label>
          <input id="summary" name="summary" defaultValue={initial.summary} disabled={!writable} className={field} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={label}>
              Catégorie
            </label>
            <input
              id="category"
              name="category"
              defaultValue={initial.category}
              list="categories-existantes"
              required
              disabled={!writable}
              className={field}
            />
            <datalist id="categories-existantes">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="order" className={label}>
              Ordre <span className="font-normal text-slate-500">— du plus petit au plus grand</span>
            </label>
            <input
              id="order"
              name="order"
              type="number"
              min={0}
              max={9999}
              step={10}
              defaultValue={initial.order}
              required
              disabled={!writable}
              className={field}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="scope" className={label}>
              Qui peut la lire
            </label>
            <select id="scope" name="scope" defaultValue={initial.scope} disabled={!writable} className={field}>
              {SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {SCOPE_LABELS[scope]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="slug" className={label}>
              Nom de fichier <span className="font-normal text-slate-500">— sert d&apos;adresse</span>
            </label>
            <input
              id="slug"
              name="slug"
              value={effectiveSlug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              disabled={!writable}
              className={`${field} font-mono text-sm`}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="body" className={label}>
            Contenu
          </label>
          <button
            type="button"
            onClick={() => setPreview((value) => !value)}
            className="rounded-md border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-brand-100"
          >
            {preview ? "Revenir à l'édition" : "Aperçu"}
          </button>
        </div>

        {preview ? (
          <div
            className="procedure procedure-scroll mt-3 min-h-[24rem] rounded-lg border border-slate-200 bg-slate-50 p-4"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            id="body"
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            disabled={!writable}
            rows={22}
            spellCheck
            className={`${field} min-h-[24rem] font-mono text-sm leading-relaxed`}
          />
        )}

        {/* Le champ reste soumis meme quand l'apercu masque la zone de saisie. */}
        {preview && <input type="hidden" name="body" value={body} />}

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Mise en forme : <code className="font-mono">## Titre</code> pour une section,{" "}
          <code className="font-mono">1.</code> pour une liste numérotée, <code className="font-mono">-</code> pour une
          puce, <code className="font-mono">**gras**</code>, et <code className="font-mono">&gt;</code> en début de ligne
          pour un avertissement en rouge.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!writable || pending}
          className="rounded-lg bg-brand-500 px-5 py-2.5 font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? "Enregistrement…" : mode === "create" ? "Créer la fiche" : "Enregistrer"}
        </button>
        <Link href="/admin/fiches" className="text-sm font-medium text-slate-600 hover:underline">
          Annuler
        </Link>
        <span className="text-xs text-slate-500">
          La date de mise à jour est renseignée automatiquement. Le site se rafraîchit environ une minute après.
        </span>
      </div>
    </form>
  );
}
