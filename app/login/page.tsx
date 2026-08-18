import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, safeEqual, sessionToken } from "@/lib/auth";

type PageProps = { searchParams: Promise<{ erreur?: string; suivant?: string }> };

export const metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps) {
  const { erreur, suivant } = await searchParams;

  let configured = true;
  try {
    const expected = await sessionToken();
    const cookie = (await cookies()).get(AUTH_COOKIE)?.value;
    if (cookie && safeEqual(cookie, expected)) {
      redirect("/");
    }
  } catch {
    configured = false;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-bold text-slate-900">Procédures du magasin</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Espace réservé à l&apos;équipe.</p>

        {configured ? (
          <form action="/api/login" method="post" className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <input type="hidden" name="suivant" value={suivant ?? ""} />

            <label htmlFor="motdepasse" className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              id="motdepasse"
              name="motdepasse"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
            />

            {erreur && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                Mot de passe incorrect.
              </p>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-brand-700 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Entrer
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold">Site pas encore configuré</p>
            <p className="mt-2 leading-relaxed">
              Les variables d&apos;environnement <code className="font-mono">SITE_PASSWORD</code> et{" "}
              <code className="font-mono">AUTH_SECRET</code> doivent être définies dans les réglages Vercel du projet,
              puis le site redéployé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
