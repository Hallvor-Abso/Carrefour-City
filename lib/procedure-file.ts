import type { Scope } from "@/lib/content";

export const SCOPES: Scope[] = ["staff", "admin"];

export const SCOPE_LABELS: Record<Scope, string> = {
  staff: "Toute l'équipe",
  admin: "Responsable uniquement",
};

const DIRECTORIES: Record<Scope, string> = {
  staff: "content",
  admin: "content-admin",
};

export function isScope(value: unknown): value is Scope {
  return value === "staff" || value === "admin";
}

/** Chemin du fichier dans le depot. Le slug est valide en amont. */
export function filePathFor(scope: Scope, slug: string): string {
  return `${DIRECTORIES[scope]}/${slug}.md`;
}

/**
 * Transforme un titre en nom de fichier : minuscules, sans accents, tirets.
 * Le resultat sert de chemin, donc il ne doit contenir que [a-z0-9-].
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Garde-fou contre les chemins fabriques (../, /, caracteres exotiques). */
export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

/**
 * Reduit une valeur a une seule ligne lisible.
 * Un retour a la ligne ou un caractere de controle dans le frontmatter casserait
 * le YAML, et un fichier illisible ferait echouer la reconstruction du site
 * entier : on nettoie a l'ecriture plutot que de risquer un deploiement mort.
 */
export function singleLine(value: string): string {
  return value
    .replace(/[\\u0000-\\u001f\\u007f]+/g, " ")
    .replace(/\\s+/g, " ")
    .trim();
}

/** Une valeur YAML entre guillemets : on echappe l'antislash puis le guillemet. */
function yamlString(value: string): string {
  return `"${singleLine(value).replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\\\"')}"`;
}

export type ProcedureFields = {
  title: string;
  category: string;
  order: number;
  updated: string;
  summary: string;
  body: string;
};

/**
 * Ecrit le fichier Markdown complet.
 * La date est volontairement entre guillemets : sans cela YAML la convertit en
 * objet Date, un piege qui avait deja fait disparaitre les dates du site.
 */
export function serializeProcedure(fields: ProcedureFields): string {
  const frontmatter = [
    "---",
    `title: ${yamlString(fields.title)}`,
    `category: ${yamlString(fields.category)}`,
    `order: ${fields.order}`,
    `updated: ${yamlString(fields.updated)}`,
    `summary: ${yamlString(fields.summary)}`,
    "---",
  ].join("\n");

  const body = fields.body.replace(/\\r\\n/g, "\\n").trim();
  return `${frontmatter}\n\n${body}\n`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
