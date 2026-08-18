import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, STAFF_COOKIE, hasLevel, isAdminPath, sessionToken } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ erreur?: string; suivant?: string; niveau?: string }>;
};

export const metadata = { title: "Connexion" };

/** N'accepte qu'un chemin interne, pour ne pas transformer /login en redirection ouverte. */
function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { erreur, suivant, niveau } = await searchParams;
  const next = safeNext(suivant);
  const wantsAdmin = niveau === "admin" || isAdminPath(next);

  // sessionToken renvoie null quand le niveau n'est pas configure : pas d'exception,
  // donc pas de try/catch qui pourrait avaler la redirection de Next.
  const configured = (await sessionToken("staff")) !== null;

  if (configured) {
    const jar = await cookies();
    const isAdmin = await hasLevel(jar.get(ADMIN_COOKIE)?.value, "admin");
    const isStaff = await hasLevel(jar.get(STAFF_COOKIE)?.value, "staff");

    if (wantsAdmin ? isAdmin : isAdmin || isStaff) {
      redirect(next);
    }
  }

  const adminEnabled = (await sessionToken("admin")) !== null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="text-2xl font-extrabold tracking-tight text-brand-500">Carrefour City</p>
          <p className="mt-1 text-sm font-medium text-slate-500">Procédures du magasin</p>
        </div>

        {configured ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="brand-rule" aria-hidden="true" />
            <form action="/api/login" method="post" className="p-6">
              <input type="hidden" name="suivant" value={next} />

              {wantsAdmin && (
                <p className="mb-4 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
                  {adminEnabled
                    ? "Cette page demande le mot de passe responsable."
                    : "L'espace responsable n'est pas activé sur ce site."}
                </p>
              )}

              <label htmlFor="motdepasse" className="block text-sm font-semibold text-slate-700">
                Mot de passe
              </label>
              <input
                id="motdepasse"
                name="motdepasse"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
              />

              {erreur === "niveau" && (
                <p role="alert" className="mt-3 text-sm text-accent-600">
                  Ce mot de passe ouvre les procédures du magasin, mais pas l&apos;espace responsable.
                </p>
              )}
              {erreur === "mdp" && (
                <p role="alert" className="mt-3 text-sm text-accent-600">
                  Mot de passe incorrect.
                </p>
              )}

              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-brand-500 px-4 py-2.5 font-bold text-white transition hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Entrer
              </button>

              {erreur === "niveau" && (
                <a href="/" className="mt-4 block text-center text-sm font-medium text-brand-600 hover:underline">
                  Retour aux procédures
                </a>
              )}
            </form>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-bold">Site pas encore configuré</p>
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
