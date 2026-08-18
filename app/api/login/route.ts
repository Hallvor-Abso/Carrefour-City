import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  COOKIE_MAX_AGE,
  STAFF_COOKIE,
  isAdminPath,
  passwordFor,
  safeEqual,
  sessionToken,
  type Level,
} from "@/lib/auth";

/** N'accepte qu'un chemin interne, pour ne pas transformer la connexion en redirection ouverte. */
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function matches(submitted: FormDataEntryValue | null, level: Level): boolean {
  const expected = passwordFor(level);
  return Boolean(expected) && typeof submitted === "string" && safeEqual(submitted, expected as string);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const submitted = form.get("motdepasse");
  const next = safeNext(form.get("suivant"));

  // Le mot de passe responsable est teste en premier : il ouvre tout le site,
  // donc son porteur recoit aussi le cookie equipe.
  if (matches(submitted, "admin")) {
    const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
    const adminToken = await sessionToken("admin");
    const staffToken = await sessionToken("staff");
    if (adminToken) response.cookies.set(ADMIN_COOKIE, adminToken, cookieOptions());
    if (staffToken) response.cookies.set(STAFF_COOKIE, staffToken, cookieOptions());
    return response;
  }

  if (matches(submitted, "staff")) {
    // Bon mot de passe, mais pas le bon niveau pour la page demandee : on ouvre
    // quand meme la session equipe et on explique pourquoi ca s'arrete la.
    const destination = new URL(isAdminPath(next) ? "/login" : next, request.url);
    if (isAdminPath(next)) {
      destination.searchParams.set("erreur", "niveau");
      destination.searchParams.set("niveau", "admin");
      destination.searchParams.set("suivant", next);
    }

    const response = NextResponse.redirect(destination, { status: 303 });
    const staffToken = await sessionToken("staff");
    if (staffToken) response.cookies.set(STAFF_COOKIE, staffToken, cookieOptions());
    return response;
  }

  const failed = new URL("/login", request.url);
  failed.searchParams.set("erreur", "mdp");
  if (next !== "/") failed.searchParams.set("suivant", next);
  if (isAdminPath(next)) failed.searchParams.set("niveau", "admin");
  return NextResponse.redirect(failed, { status: 303 });
}
