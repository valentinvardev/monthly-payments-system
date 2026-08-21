"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Pause, Play, Plug, RefreshCw } from "lucide-react";
import { MercadoPagoLogo } from "@/components/icons/PaymentMethodIcons";

type Account = { id: number; nickname?: string; email?: string; site_id?: string };

type Payment = {
  id: number;
  status?: string | null;
  status_detail?: string | null;
  description?: string | null;
  transaction_amount?: number | null;
  currency_id?: string | null;
  date_created?: string | null;
  date_approved?: string | null;
  payment_method_id?: string | null;
  payment_type_id?: string | null;
  external_reference?: string | null;
  live_mode?: boolean;
  payer?: { email?: string | null } | null;
};

// El status de la respuesta viaja con el error para poder distinguir el
// 401 —token vencido, hay que reconectar— de un fallo cualquiera.
class MpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Cuánto queda resaltado un pago recién entrado.
const FRESH_MS = 8000;

const INTERVALS = [
  { ms: 2000, label: "2 s" },
  { ms: 5000, label: "5 s" },
  { ms: 10000, label: "10 s" },
  { ms: 30000, label: "30 s" },
];

const STATUSES = [
  { value: "all", label: "Todos los estados" },
  { value: "approved", label: "Aprobados" },
  { value: "pending", label: "Pendientes" },
  { value: "in_process", label: "En proceso" },
  { value: "authorized", label: "Autorizados" },
  { value: "rejected", label: "Rechazados" },
  { value: "refunded", label: "Devueltos" },
  { value: "cancelled", label: "Cancelados" },
  { value: "charged_back", label: "Contracargos" },
];

const CONNECT_ERRORS: Record<string, string> = {
  not_configured:
    "Faltan MERCADOPAGO_CLIENT_ID y MERCADOPAGO_CLIENT_SECRET en el server. Mientras tanto, conectá pegando un access token.",
  invalid_state: "El ida y vuelta con Mercado Pago no coincidió. Probá de nuevo.",
  token_failed:
    "Mercado Pago no entregó el token. Revisá que la URL de redirección de la app sea /api/test-mp/callback.",
};

export function MpTester({
  account,
  oauthConfigured,
  staleSession,
  errorParam,
}: {
  account: Account | null;
  oauthConfigured: boolean;
  staleSession: boolean;
  errorParam: string | null;
}) {
  const router = useRouter();

  // --- conexión -----------------------------------------------------
  const [tokenInput, setTokenInput] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // --- controles de la consulta -------------------------------------
  const [auto, setAuto] = useState(true);
  const [everyMs, setEveryMs] = useState(5000);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);

  // Reloj de un segundo. Mueve dos cosas: el "hace N s" y el apagado del
  // resaltado de los pagos nuevos, que así no necesita timers propios.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Cuándo se vio por primera vez cada pago. La primera tanda se anota
  // con 0 —son los que ya estaban, no novedades— y de ahí en más lo que
  // aparece queda marcado unos segundos.
  const [firstSeen, setFirstSeen] = useState<Map<number, number>>(() => new Map());
  // El "ya hubo una primera tanda" sólo se lee dentro de la consulta,
  // así que puede seguir siendo un ref. No sirve mirar si el mapa está
  // vacío: una cuenta sin pagos tendría que resaltar el primero que
  // entre, y ese es justo el momento que se está esperando.
  const seeded = useRef(false);

  // El polling lo maneja React Query, que ya está montado para tRPC:
  // trae la primera tanda, repite cada everyMs, no encima dos consultas
  // y frena solo cuando la pestaña pasa a segundo plano.
  const q = useQuery({
    queryKey: ["mp-test-payments", limit, status],
    enabled: Boolean(account),
    retry: false,
    refetchInterval: auto ? everyMs : false,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await fetch(`/api/test-mp/payments?limit=${limit}&status=${status}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new MpError(data?.error ?? `La consulta falló (${res.status})`, res.status);
      }

      const rows = (data?.results ?? []) as Payment[];
      const stamp = seeded.current ? Date.now() : 0;
      seeded.current = true;
      setFirstSeen((prev) => {
        // Sin ids nuevos se devuelve el mismo mapa: si no, cada consulta
        // repintaría la tabla entera para nada.
        let next: Map<number, number> | null = null;
        rows.forEach((p) => {
          if (prev.has(p.id)) return;
          next ??= new Map(prev);
          next.set(p.id, stamp);
        });
        return next ?? prev;
      });

      return {
        rows,
        total: typeof data?.total === "number" ? (data.total as number) : null,
        query: typeof data?.query === "string" ? (data.query as string) : null,
      };
    },
  });

  const payments = q.data?.rows ?? [];
  const error = q.error instanceof Error ? q.error.message : null;
  const expired = q.error instanceof MpError && q.error.status === 401;
  const ago = q.dataUpdatedAt ? Math.max(0, Math.round((now - q.dataUpdatedAt) / 1000)) : null;

  async function connectWithToken(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setConnectError(null);
    try {
      const res = await fetch("/api/test-mp/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setConnectError(data?.error ?? "No se pudo conectar");
        return;
      }
      setTokenInput("");
      router.refresh();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "No se pudo conectar");
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    await fetch("/api/test-mp/token", { method: "DELETE" });
    setFirstSeen(new Map());
    seeded.current = false;
    router.refresh();
  }

  // --------------------------------------------------------------------
  if (!account) {
    return (
      <section
        className="reveal mt-8 max-w-2xl border border-white/12 bg-[#131313] p-6"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 items-center justify-center border border-white/12 bg-[#161616] px-4">
            <MercadoPagoLogo height={22} className="text-foreground/95" />
          </span>
          <div>
            <p className="studio-label">Sin conectar</p>
            <h2 className="font-display text-base font-medium tracking-tight text-foreground/95">
              Conectá una cuenta para ver sus pagos
            </h2>
          </div>
        </div>

        {staleSession && (
          <p className="mt-4 border border-amber-200/25 bg-amber-200/[0.06] px-3 py-2 text-xs text-amber-100/90">
            La cuenta que estaba conectada dejó de responder: el token venció o lo revocaron.
            Conectala de nuevo.
          </p>
        )}

        {errorParam && (
          <p className="mt-4 border border-rose-300/25 bg-rose-300/[0.08] px-3 py-2 text-xs text-rose-100/95">
            {CONNECT_ERRORS[errorParam] ?? "No se pudo completar la conexión."}
          </p>
        )}

        <a
          href="/api/test-mp/connect"
          aria-disabled={!oauthConfigured}
          className={`studio-btn studio-btn-primary mt-5 w-full px-5 py-3 text-sm font-medium ${
            oauthConfigured ? "" : "pointer-events-none opacity-40"
          }`}
        >
          <Plug className="h-4 w-4" /> Conectar con Mercado Pago
        </a>

        {!oauthConfigured && (
          <p className="mt-2 text-xs text-muted-foreground">
            El botón necesita{" "}
            <code className="font-mono text-[11px] text-foreground/80">MERCADOPAGO_CLIENT_ID</code> y{" "}
            <code className="font-mono text-[11px] text-foreground/80">MERCADOPAGO_CLIENT_SECRET</code>{" "}
            en el server, y que la app de Mercado Pago tenga cargada la URL de redirección{" "}
            <code className="font-mono text-[11px] text-foreground/80">/api/test-mp/callback</code>.
            Mientras tanto, el token suelto hace lo mismo.
          </p>
        )}

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="studio-label">o pegá un access token</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={connectWithToken}>
          <label className="studio-label" htmlFor="mp-token">
            Access token
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="mp-token"
              type={showToken ? "text" : "password"}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="APP_USR-… o TEST-…"
              autoComplete="off"
              spellCheck={false}
              className="studio-field mt-0 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              aria-label={showToken ? "Ocultar el token" : "Mostrar el token"}
              className="studio-btn shrink-0 px-3"
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Está en el panel de desarrolladores de Mercado Pago, en las credenciales de tu
            aplicación. Con las de prueba ves los pagos de prueba; con las de producción, los reales.
          </p>

          {connectError && (
            <p className="mt-3 border border-rose-300/25 bg-rose-300/[0.08] px-3 py-2 text-xs text-rose-100/95">
              {connectError}
            </p>
          )}

          <button
            type="submit"
            disabled={connecting || tokenInput.trim().length === 0}
            className="studio-btn mt-4 w-full px-5 py-2.5 text-sm"
          >
            {connecting ? "Verificando…" : "Conectar con este token"}
          </button>
        </form>
      </section>
    );
  }

  // --------------------------------------------------------------------
  return (
    <section className="reveal mt-8" style={{ animationDelay: "80ms" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border border-white/12 bg-[#131313] px-5 py-4">
        <div className="flex items-center gap-3">
          <MercadoPagoLogo height={20} className="text-foreground/95" />
          <div>
            <p className="flex items-center gap-2 text-sm text-foreground">
              {account.nickname ?? account.email ?? `Cuenta ${account.id}`}
              <span className="inline-flex items-center gap-1.5 border border-emerald-200/25 bg-emerald-200/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-100/95">
                <span className="h-1.5 w-1.5 bg-emerald-300" /> Conectada
              </span>
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-white/40">
              user {account.id}
              {account.site_id ? ` · ${account.site_id}` : ""}
              {account.email ? ` · ${account.email}` : ""}
            </p>
          </div>
        </div>
        <button type="button" onClick={disconnect} className="studio-btn px-3 py-2 text-xs">
          Desconectar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-x border-b border-white/12 bg-[#0f0f0f] px-5 py-3">
        <button
          type="button"
          onClick={() => setAuto((v) => !v)}
          className="studio-btn px-3 py-1.5 text-xs"
        >
          {auto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {auto ? "En vivo" : "Pausado"}
          {auto && <span className="ml-1 h-1.5 w-1.5 animate-pulse bg-[#0070F3]" />}
        </button>

        <select
          value={everyMs}
          onChange={(e) => setEveryMs(Number(e.target.value))}
          className="studio-field mt-0 w-auto py-1.5 text-xs"
          aria-label="Cada cuánto consultar"
        >
          {INTERVALS.map((i) => (
            <option key={i.ms} value={i.ms} className="bg-[#161616]">
              cada {i.label}
            </option>
          ))}
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="studio-field mt-0 w-auto py-1.5 text-xs"
          aria-label="Cuántos pagos traer"
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n} className="bg-[#161616]">
              {n} filas
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="studio-field mt-0 w-auto py-1.5 text-xs"
          aria-label="Filtrar por estado"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#161616]">
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => void q.refetch()}
          className="studio-btn px-3 py-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> Actualizar
        </button>

        <span className="ml-auto font-mono text-[10px] text-white/40">
          {ago === null ? "sin consultar" : ago === 0 ? "recién" : `hace ${ago} s`}
          {q.data?.total != null && ` · ${payments.length} de ${q.data.total}`}
        </span>
      </div>

      {error && (
        <div className="border-x border-b border-rose-300/25 bg-rose-300/[0.08] px-5 py-3 text-xs text-rose-100/95">
          {error}
          {expired && (
            <button type="button" onClick={disconnect} className="ml-2 underline underline-offset-2">
              Conectar de nuevo
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto border-x border-b border-white/12 bg-[#0f0f0f]">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
              <th className="px-4 py-2.5 text-left font-normal">Fecha</th>
              <th className="px-4 py-2.5 text-left font-normal">ID</th>
              <th className="px-4 py-2.5 text-left font-normal">Estado</th>
              <th className="px-4 py-2.5 text-right font-normal">Monto</th>
              <th className="px-4 py-2.5 text-left font-normal">Método</th>
              <th className="px-4 py-2.5 text-left font-normal">Pagador</th>
              <th className="px-4 py-2.5 text-left font-normal">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {q.isPending
                    ? "Consultando…"
                    : "Esta cuenta todavía no tiene pagos con ese filtro. Cobrá algo y aparece solo."}
                </td>
              </tr>
            )}

            {payments.map((p) => {
              const seenAt = firstSeen.get(p.id) ?? 0;
              const isNew = seenAt > 0 && now - seenAt < FRESH_MS;
              const open = openId === p.id;
              return (
                <Fragment key={p.id}>
                  <tr
                    onClick={() => setOpenId(open ? null : p.id)}
                    className={`cursor-pointer border-b border-white/[0.06] transition hover:bg-white/[0.03] ${
                      isNew ? "bg-[#0070F3]/[0.10]" : ""
                    } ${open ? "bg-white/[0.04]" : ""}`}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-white/70">
                      <span className="flex items-center gap-2">
                        {isNew && (
                          <span className="h-1.5 w-1.5 shrink-0 bg-[#0070F3]" title="Entró recién" />
                        )}
                        {when(p.date_created)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-white/70">
                      {p.id}
                      {p.live_mode === false && (
                        <span className="ml-2 border border-white/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/50">
                          test
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusChip status={p.status ?? null} detail={p.status_detail ?? null} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-foreground">
                      {money(p.transaction_amount, p.currency_id)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-white/60">
                      {p.payment_method_id ?? "—"}
                      {p.payment_type_id ? (
                        <span className="text-white/35"> · {p.payment_type_id}</span>
                      ) : null}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-2.5 text-xs text-white/60">
                      {p.payer?.email ?? "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-2.5 font-mono text-xs text-white/50">
                      {p.external_reference ?? "—"}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-white/[0.06] bg-[#0b0b0b]">
                      <td colSpan={7} className="px-4 py-3">
                        <pre className="max-h-80 overflow-auto font-mono text-[11px] leading-relaxed text-white/60">
                          {JSON.stringify(p, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-[10px] text-white/30">
        GET https://api.mercadopago.com{q.data?.query ?? "/v1/payments/search"} · click en una fila
        para ver el JSON completo
      </p>
    </section>
  );
}

function StatusChip({ status, detail }: { status: string | null; detail: string | null }) {
  const tone =
    status === "approved"
      ? "border-emerald-200/25 bg-emerald-200/[0.06] text-emerald-100/95"
      : status === "pending" || status === "in_process" || status === "authorized"
        ? "border-amber-200/25 bg-amber-200/[0.06] text-amber-100/95"
        : status === "rejected" || status === "cancelled"
          ? "border-rose-300/25 bg-rose-300/[0.08] text-rose-100/95"
          : "border-white/15 bg-white/[0.04] text-white/60";

  return (
    <span
      title={detail ?? undefined}
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${tone}`}
    >
      {status ?? "—"}
    </span>
  );
}

function money(amount: number | null | undefined, currency: string | null | undefined) {
  if (typeof amount !== "number") return "—";
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency ?? "ARS",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Una moneda que Intl no conoce no vale romper la fila.
    return `${amount} ${currency ?? ""}`.trim();
  }
}

// Las fechas se formatean sólo en el cliente: los datos llegan después
// del montaje, así que no hay HTML del server con el que discrepar.
function when(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : d.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}
