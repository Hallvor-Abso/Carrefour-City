import matter from "gray-matter";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProcedureEditor, { type EditorInitial } from "@/app/components/ProcedureEditor";
import { getCategories, getProcedureSource, type Scope } from "@/lib/content";
import { githubConfig, readRemoteFile } from "@/lib/github";
import { filePathFor, isScope } from "@/lib/procedure-file";

export const metadata = { title: "Modifier une procédure" };

type PageProps = { params: Promise<{ scope: string; slug: string }> };

function fromFrontmatter(scope: Scope, slug: string, text: string): EditorInitial {
  const file = matter(text);
  const data = file.data as Record<string, unknown>;
  const order = Number(data.order);

  return {
    scope,
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    category: typeof data.category === "string" ? data.category : "",
    order: Number.isFinite(order) ? order : 100,
    summary: typeof data.summary === "string" ? data.summary : "",
    body: file.content.trim(),
  };
}

export default async function EditProcedurePage({ params }: PageProps) {
  const { scope, slug } = await params;
  if (!isScope(scope)) notFound();

  const config = githubConfig();
  let initial: EditorInitial | null = null;

  if (config) {
    // On relit la fiche dans le depot plutot que sur le disque du deploiement :
    // sinon un enregistrement juste avant serait ecrase par une version perimee.
    const file = await readRemoteFile(config, filePathFor(scope, slug));
    if (file) initial = fromFrontmatter(scope, slug, file.text);
  } else {
    const source = getProcedureSource(scope, slug);
    if (source) {
      initial = {
        scope,
        slug,
        title: source.meta.title,
        category: source.meta.category,
        order: source.meta.order,
        summary: source.meta.summary,
        body: source.body,
      };
    }
  }

  if (!initial) notFound();

  return (
    <div>
      <Link href="/admin/fiches" className="text-sm font-medium text-brand-600 hover:underline">
        ← Gérer les procédures
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-extrabold text-brand-900 sm:text-3xl">{initial.title}</h1>

      <ProcedureEditor mode="edit" writable={config !== null} categories={getCategories()} initial={initial} />
    </div>
  );
}
