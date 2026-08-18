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

export const metadata = { title: "Espace responsable" };

export default function AdminPage() {
  const adminProcedures = getAllProcedures("admin");
  const staffProcedures = getAllProcedures("staff");
  const all = [...staffProcedures, ...adminProcedures];

  const stale = all.filter((procedure) => {
    const months = monthsSinceUpdate(procedure.updated);
    return months === null || months >= STALE_AFTER_MONTHS;
  });

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">Espace responsable</h1>
        <p className="mt-2 text-slate-600">
          Les procédures de cette page ne sont visibles qu&apos;avec le mot de passe responsable. L&apos;équipe ne les
          voit pas, et leurs adresses ne sont pas accessibles avec le mot de passe du magasin.
        </p>

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
              Aucune fiche réservée. Ajoute un fichier <code className="font-mono">.md</code> dans le dossier{" "}
              <code className="font-mono">content-admin/</code> du dépôt.
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-brand-100 bg-brand-50 p-5 text-sm leading-relaxed text-brand-900">
        <h2 className="font-bold">Modifier le contenu</h2>
        <p className="mt-2">
          Les fiches de l&apos;équipe sont dans <code className="font-mono">content/</code>, les tiennes dans{" "}
          <code className="font-mono">content-admin/</code>. Un fichier Markdown par fiche : tu le modifies sur GitHub,
          Vercel remet le site à jour tout seul en une minute environ.
        </p>
        <p className="mt-2">
          Pour changer un mot de passe, modifie <code className="font-mono">SITE_PASSWORD</code> ou{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> dans les réglages Vercel, puis redéploie. Tout le monde est
          alors déconnecté du niveau concerné.
        </p>
      </section>
    </div>
  );
}
