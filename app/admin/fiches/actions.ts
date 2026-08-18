"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, hasLevel } from "@/lib/auth";
import { deleteRemoteFile, githubConfig, readRemoteFile, writeRemoteFile } from "@/lib/github";
import {
  filePathFor,
  isScope,
  isValidSlug,
  serializeProcedure,
  slugify,
  todayIso,
} from "@/lib/procedure-file";

export type ActionState = { error?: string };

/**
 * Le middleware protege deja /admin, mais une action serveur modifie le depot :
 * elle revalide le niveau elle-meme plutot que de dependre d'une seule barriere.
 */
async function assertAdmin(): Promise<void> {
  const allowed = await hasLevel((await cookies()).get(ADMIN_COOKIE)?.value, "admin");
  if (!allowed) throw new Error("Accès refusé.");
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveProcedure(_previous: ActionState, formData: FormData): Promise<ActionState> {
  let destination: string;

  try {
    await assertAdmin();

    const config = githubConfig();
    if (!config) {
      return { error: "L'écriture n'est pas configurée : il manque GITHUB_TOKEN ou GITHUB_REPO." };
    }

    const title = readText(formData, "title");
    const category = readText(formData, "category");
    const summary = readText(formData, "summary");
    const body = readText(formData, "body");
    const scope = readText(formData, "scope");
    const orderRaw = readText(formData, "order");

    if (!title) return { error: "Le titre est obligatoire." };
    if (!category) return { error: "La catégorie est obligatoire." };
    if (!body) return { error: "Le contenu de la procédure est vide." };
    if (!isScope(scope)) return { error: "Espace inconnu." };

    const order = Number.parseInt(orderRaw, 10);
    if (!Number.isFinite(order) || order < 0 || order > 9999) {
      return { error: "L'ordre doit être un nombre entre 0 et 9999." };
    }

    // Un slug vide se deduit du titre ; sinon on valide celui qui est propose,
    // car il finit dans un chemin de fichier.
    const slug = slugify(readText(formData, "slug") || title);
    if (!isValidSlug(slug)) {
      return { error: "Le nom de fichier est vide ou invalide. Utilise des lettres, des chiffres et des tirets." };
    }

    const previousScope = readText(formData, "previousScope");
    const previousSlug = readText(formData, "previousSlug");
    const isEdit = Boolean(previousSlug) && isScope(previousScope);
    const moved = isEdit && (previousScope !== scope || previousSlug !== slug);

    const path = filePathFor(scope, slug);
    const text = serializeProcedure({ title, category, order, updated: todayIso(), summary, body });

    if (!isEdit || moved) {
      // Creation ou deplacement : on refuse d'ecraser une fiche existante.
      const existing = await readRemoteFile(config, path);
      if (existing) {
        return { error: `Une fiche utilise déjà le nom « ${slug} » dans cet espace. Choisis-en un autre.` };
      }
      await writeRemoteFile(config, path, text, `Ajouter la procédure « ${title} »`);
    } else {
      const current = await readRemoteFile(config, path);
      if (!current) return { error: "Cette fiche n'existe plus dans le dépôt." };
      await writeRemoteFile(config, path, text, `Mettre à jour la procédure « ${title} »`, current.sha);
    }

    if (moved) {
      const oldPath = filePathFor(previousScope as "staff" | "admin", previousSlug);
      const old = await readRemoteFile(config, oldPath);
      if (old) {
        await deleteRemoteFile(config, oldPath, `Déplacer la procédure « ${title} »`, old.sha);
      }
    }

    destination = `/admin/fiches?ok=${isEdit ? "modifiee" : "creee"}`;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "L'enregistrement a échoué." };
  }

  // Hors du try : redirect() leve une exception que Next doit recevoir.
  redirect(destination);
}

export async function removeProcedure(_previous: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await assertAdmin();

    const config = githubConfig();
    if (!config) {
      return { error: "L'écriture n'est pas configurée : il manque GITHUB_TOKEN ou GITHUB_REPO." };
    }

    const scope = readText(formData, "scope");
    const slug = readText(formData, "slug");
    if (!isScope(scope) || !isValidSlug(slug)) return { error: "Fiche inconnue." };

    const path = filePathFor(scope, slug);
    const current = await readRemoteFile(config, path);
    if (!current) return { error: "Cette fiche n'existe plus dans le dépôt." };

    await deleteRemoteFile(config, path, `Supprimer la procédure « ${slug} »`, current.sha);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "La suppression a échoué." };
  }

  redirect("/admin/fiches?ok=supprimee");
}
