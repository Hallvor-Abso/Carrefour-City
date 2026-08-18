import Link from "next/link";
import ProcedureEditor from "@/app/components/ProcedureEditor";
import { getCategories } from "@/lib/content";
import { githubConfig } from "@/lib/github";

export const metadata = { title: "Nouvelle procédure" };

const MODELE = `## Première étape

1. Faire ceci
2. Puis cela

## Points de vigilance

- Ce qu'il ne faut pas oublier

> Un avertissement à ne pas manquer.
`;

export default function NewProcedurePage() {
  return (
    <div>
      <Link href="/admin/fiches" className="text-sm font-medium text-brand-600 hover:underline">
        ← Gérer les procédures
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-extrabold text-brand-900 sm:text-3xl">Nouvelle procédure</h1>

      <ProcedureEditor
        mode="create"
        writable={githubConfig() !== null}
        categories={getCategories()}
        initial={{ scope: "staff", slug: "", title: "", category: "", order: 100, summary: "", body: MODELE }}
      />
    </div>
  );
}
