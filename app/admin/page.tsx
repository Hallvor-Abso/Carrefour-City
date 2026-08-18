import Link from "next/link";
import ProcedureList from "@/app/components/ProcedureList";
import {
  STALE_AFTER_MONTHS,
  basePath,
  formatDate,
  getAllProcedures,
  hrefFor,
  monthsSinceUpdate,
} from "@/lib/content";
import { githubConfig } from "@/lib/github";

export const metadata = { title: "Espace responsable" };

export default function AdminPage() {
  const adminProcedures = getAllProcedures("admin");
  const staffProcedures = getAllProcedures("staff");
  const all = [...staffProcedures, ...adminProcedures];
  const writable = githubConfig() !== null;

  const stale = all.filter((procedure) => {
    const months = monthsSinceUpdate(procedure.updated);
    return months === null || months >= STALE_AFTER_MONTHS;
  });

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">Espace responsable</h1>
            <p className="mt-2 max-w-xl text-slate-600">
              Les procédures de cette page ne sont visibles qu&apos;avec le mot de passe responsable. L&apos;équipe ne
              les voit pas, et leurs adresses ne sont pas accessibles avec le mot de passe du magasin.
            </p>
          </div>

          <Link
            href="/admin/fiches"
            className="rounded-lg bg-brand-500 px-4 py-2.5 font-bold text-white transition hover:bg-brand-600"
          >
            Gérer les procédures
          </Link>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fiches équipe</dt>
            <dd className="mt-1 text-2xl font-extrabold text-brand-900">{staffProcedures.length}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fiches responsable</dt>
            <dd className="mt-1 text-2xl font-extrabold text-brand-900">{adminProcedures.length}</dd>
          </div>
          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:col-span-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">À relire</dt>
            <dd className={`mt-1 text-2xl font-extrabold ${stale.length > 0 ? "text-accent-600" : "text-brand-900"}`}>
              {stale.length}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-900">Procédures réservées</h2>
        <div className="mt-4">
          {adminProcedures.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
              Aucune fiche réservée.{" "}
              <Link href="/admin/fiches/nouvelle" className="font-semibold text-brand-600 hover:underline">
                Créer la première
              </Link>
              .
            </p>
          ) : (
            <ProcedureList procedures={adminProcedures} basePath={basePath("admin")} searchable={false} />
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-900">État des fiches</h2>
        <p className="mt-1 text-sm text-slate-600">
          Une fiche est signalée à relire passé {STALE_AFTER_MONTHS} mois sans mise à jour, ou si sa date manque.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-brand-50">
                <th className="px-4 py-3 font-semibold text-brand-900">Procédure</th>
                <th className="px-4 py-3 font-semibold text-brand-900">Espace</th>
                <th className="px-4 py-3 font-semibold text-brand-900">Mise à jour</th>
                <th className="px-4 py-3 font-semibold text-brand-900">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {all.map((procedure) => {
                const months = monthsSinceUpdate(procedure.updated);
                const needsReview = months === null || months >= STALE_AFTER_MONTHS;

                return (
                  <tr key={`${procedure.scope}-${procedure.slug}`} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={hrefFor(procedure.scope, procedure.slug)}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {procedure.title}
                      </Link>
                      <span className="mt-0.5 block text-xs text-slate-500">{procedure.category}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {procedure.scope === "admin" ? "Responsable" : "Équipe"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">{formatDate(procedure.updated) ?? "Date absente"}</span>
                      {needsReview && (
                        <span className="ml-2 whitespace-nowrap rounded-full bg-accent-50 px-2 py-0.5 text-xs font-bold text-accent-700">
                          à relire
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/fiches/${procedure.scope}/${procedure.slug}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-brand-100 bg-brand-50 p-5 text-sm leading-relaxed text-brand-900">
        <h2 className="font-bold">Comment ça marche</h2>
        <p className="mt-2">
          Chaque fiche est un fichier Markdown dans le dépôt. Quand tu enregistres depuis{" "}
          <Link href="/admin/fiches" className="font-semibold underline">
            Gérer les procédures
          </Link>
          , le fichier est écrit dans le dépôt et le site se reconstruit tout seul : compte environ une minute avant de
          voir le changement. Chaque enregistrement laisse une trace, tu peux donc retrouver qui a changé quoi et quand.
        </p>
        {!writable && (
          <p className="mt-2 font-semibold">
            L&apos;édition depuis le site est désactivée tant que GITHUB_TOKEN et GITHUB_REPO ne sont pas renseignés
            dans les réglages Vercel.
          </p>
        )}
        <p className="mt-2">
          Pour changer un mot de passe, modifie <code className="font-mono">SITE_PASSWORD</code> ou{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> dans les réglages Vercel, puis redéploie. Tout le monde est
          alors déconnecté du niveau concerné.
        </p>
      </section>
    </div>
  );
}
