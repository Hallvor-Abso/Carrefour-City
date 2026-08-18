/**
 * Petit client de l'API Contents de GitHub.
 *
 * Le systeme de fichiers de Vercel est en lecture seule : l'editeur ne peut pas
 * ecrire dans content/. Il ecrit donc dans le depot, ce qui declenche un
 * redeploiement et garde le Markdown comme unique source de verite.
 */

/** Surchargeable pour GitHub Enterprise, et pour tester sans toucher au vrai depot. */
function apiRoot(): string {
  return (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/+$/, "");
}

export type GithubConfig = {
  repo: string;
  branch: string;
  token: string;
};

/** Renvoie null quand l'ecriture n'est pas configuree : l'editeur s'affiche alors en lecture seule. */
export function githubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

function headers(config: GithubConfig): HeadersInit {
  return {
    Authorization: `Bearer ${config.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function contentsUrl(config: GithubConfig, filePath: string): string {
  const encoded = filePath.split("/").map(encodeURIComponent).join("/");
  return `${apiRoot()}/repos/${config.repo}/contents/${encoded}`;
}

async function describeFailure(response: Response): Promise<string> {
  let detail = "";
  try {
    const body = (await response.json()) as { message?: string };
    detail = typeof body.message === "string" ? body.message : "";
  } catch {
    detail = "";
  }

  if (response.status === 401 || response.status === 403) {
    return "GitHub refuse le jeton (droit « Contents » en écriture manquant, ou jeton expiré).";
  }
  if (response.status === 404) {
    return "Dépôt ou branche introuvable — vérifie GITHUB_REPO et GITHUB_BRANCH.";
  }
  if (response.status === 409) {
    return "La fiche a été modifiée entre-temps. Recharge la page et recommence.";
  }
  return `GitHub a répondu ${response.status}${detail ? ` : ${detail}` : ""}.`;
}

export type RemoteFile = { text: string; sha: string };

/** Lit un fichier sur la branche configuree. null si le fichier n'existe pas. */
export async function readRemoteFile(config: GithubConfig, filePath: string): Promise<RemoteFile | null> {
  const response = await fetch(`${contentsUrl(config, filePath)}?ref=${encodeURIComponent(config.branch)}`, {
    headers: headers(config),
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await describeFailure(response));

  const body = (await response.json()) as { content?: string; sha?: string };
  if (typeof body.content !== "string" || typeof body.sha !== "string") {
    throw new Error("Réponse inattendue de GitHub à la lecture du fichier.");
  }

  return { text: Buffer.from(body.content, "base64").toString("utf8"), sha: body.sha };
}

/** Cree ou remplace un fichier. `sha` est obligatoire pour un remplacement. */
export async function writeRemoteFile(
  config: GithubConfig,
  filePath: string,
  text: string,
  message: string,
  sha?: string
): Promise<void> {
  const response = await fetch(contentsUrl(config, filePath), {
    method: "PUT",
    headers: { ...headers(config), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(text, "utf8").toString("base64"),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) throw new Error(await describeFailure(response));
}

export async function deleteRemoteFile(
  config: GithubConfig,
  filePath: string,
  message: string,
  sha: string
): Promise<void> {
  const response = await fetch(contentsUrl(config, filePath), {
    method: "DELETE",
    headers: { ...headers(config), "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch: config.branch }),
  });

  if (!response.ok) throw new Error(await describeFailure(response));
}

export type RemoteEntry = { name: string; path: string };

/** Liste un dossier du depot. Tableau vide si le dossier n'existe pas encore. */
export async function listRemoteDirectory(config: GithubConfig, directory: string): Promise<RemoteEntry[]> {
  const response = await fetch(`${contentsUrl(config, directory)}?ref=${encodeURIComponent(config.branch)}`, {
    headers: headers(config),
    cache: "no-store",
  });

  if (response.status === 404) return [];
  if (!response.ok) throw new Error(await describeFailure(response));

  const body = await response.json();
  if (!Array.isArray(body)) throw new Error("Ce chemin n'est pas un dossier dans le dépôt.");

  return body
    .filter((entry) => entry?.type === "file" && typeof entry.name === "string" && entry.name.endsWith(".md"))
    .map((entry) => ({ name: entry.name as string, path: entry.path as string }));
}
