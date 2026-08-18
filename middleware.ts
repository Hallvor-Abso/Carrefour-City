import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, STAFF_COOKIE, hasLevel, isAdminPath, sessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const admin = isAdminPath(pathname);

  // Site pas encore configure : on renvoie vers /login, qui explique quoi faire.
  if ((await sessionToken("staff")) === null) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAdmin = await hasLevel(request.cookies.get(ADMIN_COOKIE)?.value, "admin");
  const isStaff = await hasLevel(request.cookies.get(STAFF_COOKIE)?.value, "staff");

  // L'espace responsable exige le cookie responsable : les procedures qui y vivent
  // sont protegees par leur chemin, pas par un filtrage a l'affichage.
  if (admin ? isAdmin : isAdmin || isStaff) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const target = pathname + search;
  if (target !== "/") loginUrl.searchParams.set("suivant", target);
  if (admin) loginUrl.searchParams.set("niveau", "admin");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|api/login|api/logout|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
