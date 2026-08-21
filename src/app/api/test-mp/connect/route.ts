import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { env } from "@/lib/env";
import { MP_TEST_STATE_COOKIE } from "@/lib/mpTest";

// Arranque del OAuth para /test. Es el mismo handshake que /api/mp/connect
// pero sin sesión de admin y sin base: el token termina en una cookie.
//
// Mercado Pago acepta una sola redirect URI por aplicación, así que esta
// ruta necesita su propia app en el panel de desarrolladores, con
// <APP_URL>/api/test-mp/callback cargada como URL de redirección.
export async function GET(request: NextRequest) {
  if (!env.MERCADOPAGO_CLIENT_ID || !env.MERCADOPAGO_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/test?mp_error=not_configured", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${env.APP_URL.replace(/\/+$/, "")}/api/test-mp/callback`;

  const authorizeUrl = new URL("https://auth.mercadopago.com.ar/authorization");
  authorizeUrl.searchParams.set("client_id", env.MERCADOPAGO_CLIENT_ID);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("platform_id", "mp");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(MP_TEST_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/test-mp",
    maxAge: 10 * 60,
  });
  return res;
}
