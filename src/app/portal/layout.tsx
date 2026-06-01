import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mirror of the dashboard layout: keep ADMINs out of the portal so
  // they don't trip clientProcedure's "Tu usuario no está vinculado a
  // un cliente" guard.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENT") redirect("/dashboard");

  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 pt-8 pb-16">{children}</div>
    </>
  );
}
