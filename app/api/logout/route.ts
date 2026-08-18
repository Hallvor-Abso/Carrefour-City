import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, STAFF_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  // Les deux niveaux partent ensemble : "Quitter" doit tout fermer.
  response.cookies.delete({ name: STAFF_COOKIE, path: "/" });
  response.cookies.delete({ name: ADMIN_COOKIE, path: "/" });
  return response;
}
