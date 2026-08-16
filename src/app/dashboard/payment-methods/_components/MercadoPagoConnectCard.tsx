"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MercadoPagoLogo } from "@/components/icons/PaymentMethodIcons";
import { trpc } from "@/trpc/react";

type Connection = {
  id: string;
  mpUserId: string;
  mpEmail: string | null;
  mpNickname: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
} | null;

export function MercadoPagoConnectCard({
  initialConnection,
  configured,
  errorParam,
  successParam,
}: {
  initialConnection: Connection;
  configured: boolean;
  errorParam: string | null;
  successParam: string | null;
}) {
  const router = useRouter();
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const disconnect = trpc.mercadoPago.disconnect.useMutation({
    onSettled: () => {
      setConfirmingDisconnect(false);
      router.refresh();
    },
  });

  const errorLabel = errorMessage(errorParam);

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 bg-[#161616] px-4">
              <MercadoPagoLogo height={26} className="text-foreground/95" />
            </span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
                Cobros automáticos
              </p>
              <h2 className="font-display text-base font-medium tracking-tight text-foreground/95">
                Mercado Pago Connect
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Conectá tu cuenta y dejá que los clientes paguen online con confirmación automática.
              </p>
            </div>
          </div>

          {initialConnection ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-none border border-emerald-200/25 bg-emerald-200/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-100/95">
                <span className="h-1.5 w-1.5 rounded-none bg-emerald-300" /> Conectada
              </span>
            </div>
          ) : (
            <ConnectButton configured={configured} />
          )}
        </div>

        {successParam === "connected" && (
          <p className="rounded-xl border border-emerald-200/20 bg-emerald-200/[0.06] px-3 py-2 text-xs text-emerald-100/95">
            ¡Listo! Tu cuenta de Mercado Pago quedó conectada. Los clientes pueden pagar desde el
            portal y el sistema te avisa apenas se acredita.
          </p>
        )}

        {errorLabel && (
          <p className="rounded-xl border border-rose-300/25 bg-rose-300/[0.08] px-3 py-2 text-xs text-rose-100/95">
            {errorLabel}
          </p>
        )}

        {initialConnection && (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <dl className="grid grid-cols-2 gap-2 text-xs">
              {initialConnection.mpNickname && (
                <Row label="Cuenta MP">{initialConnection.mpNickname}</Row>
              )}
              {initialConnection.mpEmail && (
                <Row label="Email MP">{initialConnection.mpEmail}</Row>
              )}
              <Row label="ID Mercado Pago">
                <span className="font-mono">{initialConnection.mpUserId}</span>
              </Row>
              {initialConnection.expiresAt && (
                <Row label="Token vence">
                  {new Date(initialConnection.expiresAt).toLocaleString("es-AR")}
                </Row>
              )}
            </dl>
            <div className="mt-3 flex justify-end">
              {confirmingDisconnect ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">¿Seguro?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmingDisconnect(false)}
                    className="rounded-none border border-white/10 bg-transparent px-3 py-1 text-xs text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={disconnect.isPending}
                    onClick={() => disconnect.mutate()}
                    className="rounded-none border border-rose-300/30 bg-rose-300/[0.08] px-3 py-1 text-xs text-rose-100/95 transition hover:bg-rose-300/[0.15] disabled:opacity-50"
                  >
                    {disconnect.isPending ? "…" : "Sí, desconectar"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDisconnect(true)}
                  className="rounded-none border border-white/10 bg-transparent px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground"
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectButton({ configured }: { configured: boolean }) {
  if (!configured) {
    return (
      <a
        href="/api/mp/connect"
        title="Falta configurar MERCADOPAGO_CLIENT_ID / SECRET en Vercel"
        className="inline-flex items-center gap-2 rounded-none border border-white/12 bg-[#161616] px-4 py-2 text-xs font-medium text-muted-foreground"
        aria-disabled
      >
        Conectar Mercado Pago
        <span className="rounded-none border border-amber-200/30 bg-amber-200/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-amber-100/90">
          requiere config
        </span>
      </a>
    );
  }
  return (
    <a
      href="/api/mp/connect"
      className="inline-flex items-center gap-2 rounded-none border border-[#0070F3] bg-[#0070F3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0060d3] hover:border-[#0060d3]"
    >
      Conectar Mercado Pago
    </a>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
        {label}
      </dt>
      <dd className="text-foreground/95">{children}</dd>
    </div>
  );
}

function errorMessage(error: string | null) {
  switch (error) {
    case "not_configured":
      return "Faltan las credenciales de Mercado Pago en el servidor (MERCADOPAGO_CLIENT_ID y MERCADOPAGO_CLIENT_SECRET).";
    case "invalid_state":
      return "El flujo de OAuth se interrumpió. Volvé a intentar.";
    case "token_failed":
      return "Mercado Pago rechazó el intercambio de código. Revisá las credenciales y el redirect URI.";
    case "no_user_id":
      return "Mercado Pago no devolvió el ID del usuario. Reintentá la conexión.";
    default:
      return null;
  }
}
