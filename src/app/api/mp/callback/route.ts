import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type MpTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  user_id?: number;
  public_key?: string;
};

type MpUserResponse = {
  id: number;
  nickname?: string;
  email?: string;
};

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

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get("mp_oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/dashboard/payment-methods?mp_error=invalid_state", request.url),
    );
  }

  const redirectUri = `${env.APP_URL.replace(/\/+$/, "")}/api/mp/callback`;

  // 1. Exchange code for access token
  const tokenRes = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.MERCADOPAGO_CLIENT_ID,
      client_secret: env.MERCADOPAGO_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "");
    console.error("[mp/callback] token exchange failed:", tokenRes.status, text);
    return NextResponse.redirect(
      new URL("/dashboard/payment-methods?mp_error=token_failed", request.url),
    );
  }
  const token = (await tokenRes.json()) as MpTokenResponse;

  // 2. Fetch the MP user identity to display ("nickname", email)
  const meRes = await fetch("https://api.mercadopago.com/users/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  const me = meRes.ok ? ((await meRes.json()) as MpUserResponse) : null;

  const mpUserId = String(token.user_id ?? me?.id ?? "");
  if (!mpUserId) {
    return NextResponse.redirect(
      new URL("/dashboard/payment-methods?mp_error=no_user_id", request.url),
    );
  }

  const expiresAt = token.expires_in
    ? new Date(Date.now() + token.expires_in * 1000)
    : null;

  // 3. Upsert the connection on our side
  await prisma.mercadoPagoConnection.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mpUserId,
      mpEmail: me?.email ?? null,
      mpNickname: me?.nickname ?? null,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      expiresAt,
      scope: token.scope ?? null,
    },
    update: {
      mpUserId,
      mpEmail: me?.email ?? null,
      mpNickname: me?.nickname ?? null,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      expiresAt,
      scope: token.scope ?? null,
    },
  });

  const res = NextResponse.redirect(
    new URL("/dashboard/payment-methods?mp=connected", request.url),
  );
  res.cookies.delete("mp_oauth_state");
  return res;
}
