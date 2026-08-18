import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Cette procédure n&apos;existe pas</h1>
      <p className="mt-2 text-slate-600">Elle a peut-être été renommée ou supprimée.</p>
      <Link href="/" className="mt-6 inline-block font-medium text-brand-700 hover:underline">
        Retour à la liste
      </Link>
    </div>
  );
}
