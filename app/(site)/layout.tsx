import { cookies } from "next/headers";
import Shell from "@/app/components/Shell";
import { ADMIN_COOKIE, hasLevel } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Le lien vers l'espace responsable n'apparait que pour qui y a deja acces.
  const isAdmin = await hasLevel((await cookies()).get(ADMIN_COOKIE)?.value, "admin");

  return (
    <Shell area="staff" isAdmin={isAdmin}>
      {children}
    </Shell>
  );
}
