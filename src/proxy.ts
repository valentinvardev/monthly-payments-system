import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // /api/mcp se autentica con su propio token y no usa la sesión de
  // Supabase: pasarlo por acá sumaría una consulta a Supabase por pedido.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/mcp|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
