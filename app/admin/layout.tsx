import Shell from "@/app/components/Shell";

/**
 * Rien ici ne doit etre fige au build : ces pages sont derriere une
 * authentification et refletent des variables d'environnement lues a l'execution
 * (le jeton GitHub, notamment). Prerendues, elles garderaient l'etat du build.
 */
export const dynamic = "force-dynamic";

// Le middleware garantit que seul le niveau responsable atteint /admin.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell area="admin" isAdmin>
      {children}
    </Shell>
  );
}
