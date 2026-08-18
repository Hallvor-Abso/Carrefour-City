import matter from "gray-matter";
import type { ProcedureMeta, Scope } from "@/lib/content";
import { getAllProcedures } from "@/lib/content";
import { githubConfig, listRemoteDirectory, readRemoteFile } from "@/lib/github";
import { filePathFor } from "@/lib/procedure-file";

const DIRECTORIES: Record<Scope, string> = {
  staff: "content",
  admin: "content-admin",
};

function parse(scope: Scope, slug: string, text: string): ProcedureMeta {
  const data = matter(text).data as Record<string, unknown>;
  const order = Number(data.order);

  return {
    slug,
    scope,
    title: typeof data.title === "string" ? data.title : slug,
    category: typeof data.category === "string" ? data.category : "Divers",
    order: Number.isFinite(order) ? order : 999,
    updated: typeof data.updated === "string" ? data.updated : null,
    summary: typeof data.summary === "string" ? data.summary : "",
    searchText: "",
  };
}

export type RepoListing = {
  procedures: Record<Scope, ProcedureMeta[]>;
  /** Vrai quand la liste vient du depot, donc a jour a la seconde pres. */
  live: boolean;
  warning?: string;
};

/**
 * Liste les fiches telles qu'elles sont dans le depot, et non telles qu'elles
 * etaient au dernier deploiement : une fiche enregistree a l'instant apparait
 * tout de suite, meme si le site public met encore une minute a se reconstruire.
 * Retombe sur les fichiers du deploiement si le depot est injoignable.
 */
export async function listProcedures(): Promise<RepoListing> {
  const config = githubConfig();
  const local: RepoListing = {
    procedures: { staff: getAllProcedures("staff"), admin: getAllProcedures("admin") },
    live: false,
  };

  if (!config) return local;

  try {
    const scopes: Scope[] = ["staff", "admin"];
    const perScope = await Promise.all(
      scopes.map(async (scope) => {
        const entries = await listRemoteDirectory(config, DIRECTORIES[scope]);
        const files = await Promise.all(
          entries.map(async (entry) => {
            const slug = entry.name.replace(/\\.md$/, "");
            const file = await readRemoteFile(config, filePathFor(scope, slug));
            return file ? parse(scope, slug, file.text) : null;
          })
        );
        return files
          .filter((item): item is ProcedureMeta => item !== null)
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fr"));
      })
    );

    return { procedures: { staff: perScope[0], admin: perScope[1] }, live: true };
  } catch (error) {
    return {
      ...local,
      warning:
        error instanceof Error
          ? `Liste du dépôt indisponible (${error.message}) — affichage de la version en ligne.`
          : "Liste du dépôt indisponible — affichage de la version en ligne.",
    };
  }
}
