import Link from "next/link";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-base font-semibold text-slate-900 hover:text-brand-700">
            Procédures du magasin
          </Link>
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-slate-500">
          Une procédure à corriger ? Préviens le responsable, elle sera mise à jour ici.
        </div>
      </footer>
    </div>
  );
}
