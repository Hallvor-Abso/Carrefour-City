import ProcedureList from "@/app/components/ProcedureList";
import { getAllProcedures } from "@/lib/content";

export default function HomePage() {
  const procedures = getAllProcedures();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Les procédures du magasin</h1>
      <p className="mt-2 text-slate-600">
        Cherche la procédure dont tu as besoin, ou parcours la liste par thème. Chaque fiche est imprimable.
      </p>

      <div className="mt-8">
        {procedures.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            Aucune procédure pour l&apos;instant. Ajoute un fichier <code className="font-mono">.md</code> dans le
            dossier <code className="font-mono">content/</code> du dépôt.
          </p>
        ) : (
          <ProcedureList procedures={procedures} />
        )}
      </div>
    </div>
  );
}
