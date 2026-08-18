import Shell from "@/app/components/Shell";

// Le middleware garantit que seul le niveau responsable atteint /admin.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell area="admin" isAdmin>
      {children}
    </Shell>
  );
}
