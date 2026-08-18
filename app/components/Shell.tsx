import Link from "next/link";

type ShellProps = {
  /** Espace consulte, qui change l'accent de couleur de l'en-tete. */
  area: "staff" | "admin";
  /** Le visiteur a-t-il le niveau responsable ? Sinon l'espace reste invisible. */
  isAdmin: boolean;
  children: React.ReactNode;
};

export default function Shell({ area, isAdmin, children }: ShellProps) {
  const admin = area === "admin";

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <header className="no-print bg-white shadow-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
          <div className="flex items-baseline gap-2.5">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-brand-500">
              Carrefour City
            </Link>
            <span className="text-sm font-medium text-slate-500">Procédures</span>
          </div>

          <div className="flex items-center gap-3">
            {admin && (
              <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-700">
                Espace responsable
              </span>
            )}
            {isAdmin && !admin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-accent-600 transition hover:text-accent-700 hover:underline"
              >
                Espace responsable
              </Link>
            )}
            {admin && (
              <Link href="/" className="text-sm font-medium text-brand-600 transition hover:underline">
                Procédures
              </Link>
            )}
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Quitter
              </button>
            </form>
          </div>
        </div>
        <div className="brand-rule" aria-hidden="true" />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-slate-500">
          {admin
            ? "Les procédures de cet espace ne sont pas visibles par l'équipe."
            : "Une procédure à corriger ? Préviens le responsable, elle sera mise à jour ici."}
        </div>
      </footer>
    </div>
  );
}
