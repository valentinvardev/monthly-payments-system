import { NextResponse, type NextRequest } from "next/server";
import { getAccount, MP_TEST_COOKIE, tokenCookie } from "@/lib/mpTest";

// Conexión "a mano": el access token del panel de desarrolladores,
// pegado en la página. Es el camino que funciona sin registrar una
// aplicación OAuth (ver ../connect para el otro).
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!token) {
    return NextResponse.json({ error: "Pegá un access token para conectar." }, { status: 400 });
  }

  // Se valida contra /users/me antes de guardarlo: si el token está
  // mal conviene decirlo acá y no en la primera consulta de pagos,
  // donde el error parecería un problema de la búsqueda.
  const me = await getAccount(token);
  if (!me.ok) {
    return NextResponse.json(
      {
        error:
          me.status === 401 || me.status === 403
            ? "Mercado Pago rechazó el token. Fijate que sea el access token completo (empieza con APP_USR- o TEST-)."
            : me.message,
        status: me.status,
      },
      { status: 400 },
    );
  }

  const res = NextResponse.json({ account: me.data });
  res.cookies.set(tokenCookie(token));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: MP_TEST_COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
}
