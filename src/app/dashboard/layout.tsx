import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensive: a CLIENT that bookmarks /dashboard/* would otherwise hit
  // adminProcedure and get a server-side FORBIDDEN. Route them to the
  // portal instead. A signed-out user is already caught by the
  // middleware before this runs.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/portal");

  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 pt-8 pb-16">{children}</div>
    </>
  );
}
