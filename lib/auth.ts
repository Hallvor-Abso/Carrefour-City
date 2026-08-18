export const AUTH_COOKIE = "magasin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

function toBase64Url(bytes: ArrayBuffer): string {
  const chars = Array.from(new Uint8Array(bytes), (b) => String.fromCharCode(b)).join("");
  return btoa(chars).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Jeton de session : HMAC du mot de passe courant avec AUTH_SECRET.
 * Consequence voulue : changer SITE_PASSWORD deconnecte tout le monde.
 * Fonctionne a l'identique dans le middleware (edge) et dans les route handlers.
 */
export async function sessionToken(): Promise<string> {
  const password = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!password || !secret) {
    throw new Error("SITE_PASSWORD et AUTH_SECRET doivent etre definis dans les variables d'environnement.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`v1:${password}`));
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
