import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
      <h1 className="text-xl font-bold text-brand-900">Fiche introuvable</h1>
      <p className="mt-2 text-slate-600">Elle a peut-être été renommée ou supprimée.</p>
      <Link href="/admin/fiches" className="mt-6 inline-block font-semibold text-brand-600 hover:underline">
        Retour à la liste
      </Link>
    </div>
  );
}
