import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, safeEqual, sessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE)?.value;

  let expected: string;
  try {
    expected = await sessionToken();
  } catch {
    // Variables d'environnement absentes : on renvoie vers /login qui affiche
    // le message de configuration plutot que de laisser le site ouvert.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (cookie && safeEqual(cookie, expected)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const target = request.nextUrl.pathname + request.nextUrl.search;
  if (target !== "/") {
    loginUrl.searchParams.set("suivant", target);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Tout est protege sauf la page de connexion, ses routes API et les fichiers statiques.
  matcher: ["/((?!login|api/login|api/logout|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
