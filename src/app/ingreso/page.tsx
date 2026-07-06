import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Redirect por rol post-login. Antes vivía en `/`; el root ahora es la
// landing de Surcodia Studio, así que el LoginForm apunta acá.
export default async function Ingreso() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user.role === "ADMIN" ? "/dashboard" : "/portal");
}
