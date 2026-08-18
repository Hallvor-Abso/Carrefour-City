import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProcedureArticle from "@/app/components/ProcedureArticle";
import { getProcedure, getSlugs } from "@/lib/content";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSlugs("admin").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const procedure = await getProcedure("admin", slug);
  if (!procedure) return { title: "Procédure introuvable" };
  return { title: procedure.title, description: procedure.summary || undefined };
}

export default async function AdminProcedurePage({ params }: PageProps) {
  const { slug } = await params;
  const procedure = await getProcedure("admin", slug);

  if (!procedure) {
    notFound();
  }

  return <ProcedureArticle procedure={procedure} backHref="/admin" backLabel="Espace responsable" />;
}
