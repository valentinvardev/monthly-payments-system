import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";

// Kicks off the Mercado Pago OAuth handshake.
// Requires MERCADOPAGO_CLIENT_ID + MERCADOPAGO_CLIENT_SECRET to be set on
// the server, and that the admin be signed in (so we know which User the
// callback should attach the connection to).
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!env.MERCADOPAGO_CLIENT_ID || !env.MERCADOPAGO_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL("/dashboard/payment-methods?mp_error=not_configured", request.url),
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${env.APP_URL.replace(/\/+$/, "")}/api/mp/callback`;
  const authorizeUrl = new URL("https://auth.mercadopago.com.ar/authorization");
  authorizeUrl.searchParams.set("client_id", env.MERCADOPAGO_CLIENT_ID);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("platform_id", "mp");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set("mp_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/mp",
    maxAge: 10 * 60,
  });
  return res;
}
