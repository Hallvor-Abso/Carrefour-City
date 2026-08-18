import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/app/components/PrintButton";
import { formatDate, getProcedure, getSlugs } from "@/lib/content";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const procedure = await getProcedure(slug);
  if (!procedure) return { title: "Procédure introuvable" };
  return { title: procedure.title, description: procedure.summary || undefined };
}

export default async function ProcedurePage({ params }: PageProps) {
  const { slug } = await params;
  const procedure = await getProcedure(slug);

  if (!procedure) {
    notFound();
  }

  const updated = formatDate(procedure.updated);

  return (
    <article>
      <Link href="/" className="no-print text-sm font-medium text-brand-700 hover:underline">
        ← Toutes les procédures
      </Link>

      <header className="mt-4 border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{procedure.category}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{procedure.title}</h1>
        {procedure.summary && <p className="mt-3 text-slate-600">{procedure.summary}</p>}

        <div className="mt-5 flex items-center justify-between gap-4">
          {updated ? (
            <p className="text-sm text-slate-500">Mise à jour le {updated}</p>
          ) : (
            <span />
          )}
          <div className="no-print">
            <PrintButton />
          </div>
        </div>
      </header>

      <div className="procedure mt-8" dangerouslySetInnerHTML={{ __html: procedure.html }} />
    </article>
  );
}
