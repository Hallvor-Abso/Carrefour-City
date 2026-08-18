"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProcedureMeta } from "@/lib/content";

/** Enleve les accents pour que "reglement" trouve "règlement". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default function ProcedureList({ procedures }: { procedures: ProcedureMeta[] }) {
  const [query, setQuery] = useState("");

  const haystacks = useMemo(
    () =>
      new Map(
        procedures.map((procedure) => [
          procedure.slug,
          normalize(`${procedure.title} ${procedure.category} ${procedure.summary} ${procedure.searchText}`),
        ])
      ),
    [procedures]
  );

  const groups = useMemo(() => {
    const needle = normalize(query.trim());
    const matches = needle ? procedures.filter((p) => haystacks.get(p.slug)?.includes(needle)) : procedures;

    const byCategory = new Map<string, ProcedureMeta[]>();
    for (const procedure of matches) {
      const bucket = byCategory.get(procedure.category);
      if (bucket) bucket.push(procedure);
      else byCategory.set(procedure.category, [procedure]);
    }
    return Array.from(byCategory.entries()).map(([category, items]) => ({ category, items }));
  }, [haystacks, procedures, query]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div>
      <label className="block">
        <span className="sr-only">Rechercher une procédure</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher : caisse, retour, ouverture…"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
        />
      </label>

      {query.trim() && (
        <p className="mt-3 text-sm text-slate-500">
          {total === 0
            ? "Aucune procédure ne correspond."
            : `${total} procédure${total > 1 ? "s" : ""} trouvée${total > 1 ? "s" : ""}.`}
        </p>
      )}

      <div className="mt-8 space-y-10">
        {groups.map((group) => (
          <section key={group.category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{group.category}</h2>
            <ul className="mt-3 space-y-3">
              {group.items.map((procedure) => (
                <li key={procedure.slug}>
                  <Link
                    href={`/procedures/${procedure.slug}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    <span className="block font-semibold text-slate-900">{procedure.title}</span>
                    {procedure.summary && (
                      <span className="mt-1 block text-sm leading-relaxed text-slate-600">{procedure.summary}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
