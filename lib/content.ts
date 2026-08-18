import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ProcedureMeta = {
  slug: string;
  title: string;
  category: string;
  order: number;
  updated: string | null;
  summary: string;
  /** Texte brut, utilise uniquement pour la recherche cote client. */
  searchText: string;
};

export type Procedure = ProcedureMeta & { html: string };

function readFile(slug: string) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf8");
  return matter(raw);
}

function toMeta(slug: string, file: matter.GrayMatterFile<string>): ProcedureMeta {
  const data = file.data as Record<string, unknown>;
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    category: typeof data.category === "string" ? data.category : "Divers",
    order: typeof data.order === "number" ? data.order : 999,
    updated: typeof data.updated === "string" ? data.updated : null,
    summary: typeof data.summary === "string" ? data.summary : "",
    searchText: file.content
      .replace(/[#*`>_\-\[\]()]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase(),
  };
}

export function getSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export function getAllProcedures(): ProcedureMeta[] {
  return getSlugs()
    .map((slug) => toMeta(slug, readFile(slug)))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fr"));
}

export async function getProcedure(slug: string): Promise<Procedure | null> {
  if (!getSlugs().includes(slug)) return null;
  const file = readFile(slug);
  return { ...toMeta(slug, file), html: await marked.parse(file.content) };
}

/**
 * Regroupe par categorie. L'ordre des categories suit le plus petit `order`
 * qu'elles contiennent, ce qui evite d'avoir a maintenir une liste separee.
 */
export function groupByCategory(procedures: ProcedureMeta[]) {
  const groups = new Map<string, ProcedureMeta[]>();
  for (const procedure of procedures) {
    const bucket = groups.get(procedure.category);
    if (bucket) bucket.push(procedure);
    else groups.set(procedure.category, [procedure]);
  }
  return Array.from(groups.entries())
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => a.items[0].order - b.items[0].order);
}

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
