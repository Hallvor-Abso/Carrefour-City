import Link from "next/link";
import PrintButton from "@/app/components/PrintButton";
import { formatDate, type Procedure } from "@/lib/content";

type ProcedureArticleProps = {
  procedure: Procedure;
  backHref: string;
  backLabel: string;
};

export default function ProcedureArticle({ procedure, backHref, backLabel }: ProcedureArticleProps) {
  const updated = formatDate(procedure.updated);
  const admin = procedure.scope === "admin";

  return (
    <article>
      <Link href={backHref} className="no-print text-sm font-medium text-brand-600 hover:underline">
        ← {backLabel}
      </Link>

      <header className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">{procedure.category}</p>
          {admin && (
            <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-accent-700">
              Responsable
            </span>
          )}
        </div>

        <h1 className="mt-2 text-2xl font-extrabold text-brand-900 sm:text-3xl">{procedure.title}</h1>
        {procedure.summary && <p className="mt-3 text-slate-600">{procedure.summary}</p>}

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          {updated ? <p className="text-sm text-slate-500">Mise à jour le {updated}</p> : <span />}
          <div className="no-print">
            <PrintButton />
          </div>
        </div>
      </header>

      <div
        className="procedure procedure-scroll mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-8"
        dangerouslySetInnerHTML={{ __html: procedure.html }}
      />
    </article>
  );
}
