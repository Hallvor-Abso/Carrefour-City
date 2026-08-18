import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, COOKIE_MAX_AGE, safeEqual, sessionToken } from "@/lib/auth";

/** N'accepte qu'un chemin interne, pour ne pas transformer /login en redirection ouverte. */
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const submitted = form.get("motdepasse");
  const next = safeNext(form.get("suivant"));

  const expectedPassword = process.env.SITE_PASSWORD;
  if (!expectedPassword || typeof submitted !== "string" || !safeEqual(submitted, expectedPassword)) {
    const failed = new URL("/login", request.url);
    failed.searchParams.set("erreur", "1");
    if (next !== "/") failed.searchParams.set("suivant", next);
    return NextResponse.redirect(failed, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  response.cookies.set(AUTH_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}
