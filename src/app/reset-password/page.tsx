import { redirect } from "next/navigation";

// Los links de recuperación llevan el token en la ruta
// (/reset-password/<token>). Sin token no hay nada que mostrar: se manda
// a pedir uno nuevo. También atrapa los links viejos de Supabase, que
// volvían acá con la sesión en el hash.
export default function ResetPasswordIndex() {
  redirect("/forgot-password");
}
