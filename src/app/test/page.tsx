import type { Metadata } from "next";
import { env } from "@/lib/env";
import { getAccount, getTestToken } from "@/lib/mpTest";
import { MpTester } from "./_components/MpTester";

export const metadata: Metadata = {
  title: "Mercado Pago · prueba",
  robots: { index: false, follow: false },
};

// Banco de pruebas de la API de Mercado Pago.
//
// No toca la base: el token de la cuenta conectada vive en una cookie
// httpOnly de este navegador y los pagos se piden en vivo a la API. Por
// eso tampoco pide login — sin cookie no hay nada que ver, y la cookie
// la trae puesta sólo quien conectó su propia cuenta.
export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{ mp?: string; mp_error?: string }>;
}) {
  const { mp_error: errorParam } = await searchParams;

  const token = await getTestToken();
  const me = token ? await getAccount(token) : null;
  const account = me?.ok ? me.data : null;

  // Cookie presente pero rechazada: el token venció o lo revocaron.
  const staleSession = Boolean(token && me && !me.ok);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <header className="reveal">
        <p className="studio-eyebrow">Banco de pruebas</p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Mercado Pago <span className="font-light text-foreground/70">en vivo</span>.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Consulta directa a <code className="font-mono text-xs text-foreground/80">/v1/payments/search</code>.
          No hay base de datos de por medio: el token queda en una cookie de este navegador
          y los pagos se leen de la API cada vez.
        </p>
      </header>

      <MpTester
        account={account}
        oauthConfigured={Boolean(env.MERCADOPAGO_CLIENT_ID && env.MERCADOPAGO_CLIENT_SECRET)}
        staleSession={staleSession}
        errorParam={errorParam ?? null}
      />
    </main>
  );
}
