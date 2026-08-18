import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/** Deux corpus separes : les procedures de l'equipe, et celles du responsable. */
export type Scope = "staff" | "admin";

const DIRECTORIES: Record<Scope, string> = {
  staff: "content",
  admin: "content-admin",
};

const BASE_PATHS: Record<Scope, string> = {
  staff: "/procedures",
  admin: "/admin/procedures",
};

export function basePath(scope: Scope): string {
  return BASE_PATHS[scope];
}

export function hrefFor(scope: Scope, slug: string): string {
  return `${BASE_PATHS[scope]}/${slug}`;
}

function directory(scope: Scope): string {
  return path.join(process.cwd(), DIRECTORIES[scope]);
}

export type ProcedureMeta = {
  slug: string;
  scope: Scope;
  title: string;
  category: string;
  order: number;
  updated: string | null;
  summary: string;
  /** Texte brut, utilise uniquement pour la recherche cote client. */
  searchText: string;
};

export type Procedure = ProcedureMeta & { html: string };

function readFile(scope: Scope, slug: string) {
  return matter(fs.readFileSync(path.join(directory(scope), `${slug}.md`), "utf8"));
}

/**
 * gray-matter laisse YAML convertir une date non quotee en objet Date.
 * On ramene les deux formes a une chaine AAAA-MM-JJ pour que le reste du code
 * n'ait qu'un seul cas a traiter.
 */
function toIsoDate(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : value;
  }
  return null;
}

function toMeta(scope: Scope, slug: string, file: matter.GrayMatterFile<string>): ProcedureMeta {
  const data = file.data as Record<string, unknown>;
  return {
    slug,
    scope,
    title: typeof data.title === "string" ? data.title : slug,
    category: typeof data.category === "string" ? data.category : "Divers",
    order: typeof data.order === "number" ? data.order : 999,
    updated: toIsoDate(data.updated),
    summary: typeof data.summary === "string" ? data.summary : "",
    searchText: file.content
      .replace(/[#*`>_\-\[\]()]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase(),
  };
}

export function getSlugs(scope: Scope): string[] {
  const dir = directory(scope);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export function getAllProcedures(scope: Scope): ProcedureMeta[] {
  return getSlugs(scope)
    .map((slug) => toMeta(scope, slug, readFile(scope, slug)))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fr"));
}

export async function getProcedure(scope: Scope, slug: string): Promise<Procedure | null> {
  if (!getSlugs(scope).includes(slug)) return null;
  const file = readFile(scope, slug);
  return { ...toMeta(scope, slug, file), html: await marked.parse(file.content) };
}

/**
 * Le Markdown brut d'une fiche, tel qu'il est stocke : c'est ce que l'editeur
 * remet dans sa zone de saisie, contrairement a getProcedure qui rend du HTML.
 */
export function getProcedureSource(scope: Scope, slug: string): { meta: ProcedureMeta; body: string } | null {
  if (!getSlugs(scope).includes(slug)) return null;
  const file = readFile(scope, slug);
  return { meta: toMeta(scope, slug, file), body: file.content.trim() };
}

/** Toutes les categories deja utilisees, pour proposer l'autocompletion dans l'editeur. */
export function getCategories(): string[] {
  const seen = new Set<string>();
  for (const scope of ["staff", "admin"] as Scope[]) {
    for (const procedure of getAllProcedures(scope)) seen.add(procedure.category);
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b, "fr"));
}

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Nombre de mois ecoules depuis la derniere mise a jour, null si la date manque. */
export function monthsSinceUpdate(value: string | null): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const days = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(days / 30.44));
}

/** Seuil au-dela duquel une procedure merite une relecture. */
export const STALE_AFTER_MONTHS = 6;
