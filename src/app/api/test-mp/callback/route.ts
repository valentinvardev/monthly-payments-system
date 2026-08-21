import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { MP_API, MP_TEST_STATE_COOKIE, tokenCookie } from "@/lib/mpTest";

type MpTokenResponse = { access_token?: string; expires_in?: number };

export async function GET(request: NextRequest) {
  const back = (params: string) => NextResponse.redirect(new URL(`/test?${params}`, request.url));

  if (!env.MERCADOPAGO_CLIENT_ID || !env.MERCADOPAGO_CLIENT_SECRET) {
    return back("mp_error=not_configured");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get(MP_TEST_STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return back("mp_error=invalid_state");
  }

  const tokenRes = await fetch(`${MP_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.MERCADOPAGO_CLIENT_ID,
      client_secret: env.MERCADOPAGO_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${env.APP_URL.replace(/\/+$/, "")}/api/test-mp/callback`,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "");
    console.error("[test-mp/callback] token exchange failed:", tokenRes.status, text);
    return back("mp_error=token_failed");
  }

  const token = (await tokenRes.json()) as MpTokenResponse;
  if (!token.access_token) return back("mp_error=token_failed");

  // El refresh token se descarta a propósito: la sesión dura lo que
  // dura la cookie y renovarla implicaría guardarlo en algún lado, que
  // es justo lo que esta página evita.
  const res = back("mp=connected");
  res.cookies.set(tokenCookie(token.access_token));
  res.cookies.set({ name: MP_TEST_STATE_COOKIE, value: "", path: "/api/test-mp", maxAge: 0 });
  return res;
}
