import Link from "next/link";
import DeleteProcedureButton from "@/app/components/DeleteProcedureButton";
import { formatDate, hrefFor, type ProcedureMeta } from "@/lib/content";
import { githubConfig } from "@/lib/github";
import { listProcedures } from "@/lib/procedures-repo";
import { SCOPE_LABELS } from "@/lib/procedure-file";

export const metadata = { title: "Gérer les procédures" };

type PageProps = { searchParams: Promise<{ ok?: string }> };

const CONFIRMATIONS: Record<string, string> = {
  creee: "Fiche créée.",
  modifiee: "Fiche enregistrée.",
  supprimee: "Fiche supprimée.",
};

function Row({ procedure, writable }: { procedure: ProcedureMeta; writable: boolean }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0">
        <Link href={hrefFor(procedure.scope, procedure.slug)} className="font-semibold text-brand-900 hover:underline">
          {procedure.title}
        </Link>
        <p className="mt-0.5 text-xs text-slate-500">
          {procedure.category} · {SCOPE_LABELS[procedure.scope]} · ordre {procedure.order}
          {procedure.updated ? ` · ${formatDate(procedure.updated)}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Link
          href={`/admin/fiches/${procedure.scope}/${procedure.slug}`}
          className="text-sm font-semibold text-brand-600 hover:underline"
        >
          Modifier
        </Link>
        <DeleteProcedureButton
          scope={procedure.scope}
          slug={procedure.slug}
          title={procedure.title}
          disabled={!writable}
        />
      </div>
    </li>
  );
}

export default async function ManageProceduresPage({ searchParams }: PageProps) {
  const { ok } = await searchParams;
  const writable = githubConfig() !== null;
  const listing = await listProcedures();
  const staff = listing.procedures.staff;
  const admin = listing.procedures.admin;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm font-medium text-brand-600 hover:underline">
            ← Espace responsable
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-brand-900 sm:text-3xl">Gérer les procédures</h1>
          <p className="mt-2 text-slate-600">
            Créer, modifier et supprimer les fiches sans passer par GitHub. Cette liste montre le contenu enregistré,
            donc une fiche apparaît ici tout de suite ; le site que voit l&apos;équipe se reconstruit en une minute
            environ.
          </p>
        </div>

        <Link
          href="/admin/fiches/nouvelle"
          className="rounded-lg bg-brand-500 px-4 py-2.5 font-bold text-white transition hover:bg-brand-600"
        >
          Nouvelle fiche
        </Link>
      </div>

      {ok && CONFIRMATIONS[ok] && (
        <p className="rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          {CONFIRMATIONS[ok]} Le site se met à jour dans une minute environ.
        </p>
      )}

      {listing.warning && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {listing.warning}
        </p>
      )}

      {!writable && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          <strong className="font-bold">Édition désactivée.</strong> Ajoute <code className="font-mono">GITHUB_TOKEN</code>{" "}
          et <code className="font-mono">GITHUB_REPO</code> dans les réglages Vercel, puis redéploie, pour pouvoir
          enregistrer depuis cette page.
        </p>
      )}

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-brand-500">Fiches de l&apos;équipe</h2>
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-card">
          {staff.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-600">Aucune fiche.</li>
          ) : (
            staff.map((procedure) => <Row key={procedure.slug} procedure={procedure} writable={writable} />)
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-accent-600">Fiches réservées</h2>
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-card">
          {admin.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-600">Aucune fiche.</li>
          ) : (
            admin.map((procedure) => <Row key={procedure.slug} procedure={procedure} writable={writable} />)
          )}
        </ul>
      </section>
    </div>
  );
}
