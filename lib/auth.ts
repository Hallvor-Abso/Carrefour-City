export const STAFF_COOKIE = "magasin_session";
export const ADMIN_COOKIE = "magasin_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

/** Deux niveaux d'acces : l'equipe, et le responsable du magasin. */
export type Level = "staff" | "admin";

function toBase64Url(bytes: ArrayBuffer): string {
  const chars = Array.from(new Uint8Array(bytes), (b) => String.fromCharCode(b)).join("");
  return btoa(chars).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function passwordFor(level: Level): string | undefined {
  return level === "admin" ? process.env.ADMIN_PASSWORD : process.env.SITE_PASSWORD;
}

export function cookieFor(level: Level): string {
  return level === "admin" ? ADMIN_COOKIE : STAFF_COOKIE;
}

/**
 * Jeton de session : HMAC du mot de passe du niveau, avec AUTH_SECRET.
 * Le niveau entre dans le message signe, donc un jeton equipe ne peut pas
 * servir de jeton responsable meme si les deux mots de passe etaient identiques.
 *
 * Consequence voulue : changer un mot de passe deconnecte tout le monde a ce niveau.
 * Renvoie null quand le niveau n'est pas configure (pas d'ADMIN_PASSWORD = pas d'espace responsable).
 */
export async function sessionToken(level: Level): Promise<string | null> {
  const password = passwordFor(level);
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`v1:${level}:${password}`));
  return toBase64Url(signature);
}

/** Comparaison a temps constant, pour ne pas fuiter le jeton octet par octet. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Le cookie presente correspond-il au jeton attendu pour ce niveau ? */
export async function hasLevel(cookieValue: string | undefined, level: Level): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await sessionToken(level);
  return expected !== null && safeEqual(cookieValue, expected);
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
