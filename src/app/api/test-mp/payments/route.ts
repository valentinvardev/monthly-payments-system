import { NextResponse, type NextRequest } from "next/server";
import { getTestToken, mpGet, type MpSearchResponse } from "@/lib/mpTest";

const STATUSES = new Set([
  "approved",
  "pending",
  "in_process",
  "authorized",
  "rejected",
  "refunded",
  "cancelled",
  "charged_back",
]);

// Proxy de /v1/payments/search. Existe para que el token no baje al
// navegador: el cliente pide acá y esta ruta pone el Authorization.
//
// Los pagos se devuelven tal cual los manda Mercado Pago, sin recortar.
// La página es para mirar la API: si el campo que buscás no está en la
// tabla, está en el JSON de la fila.
export async function GET(request: NextRequest) {
  const token = await getTestToken();
  if (!token) {
    return NextResponse.json({ error: "No hay ninguna cuenta conectada." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = Number(searchParams.get("limit"));
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50) : 25;
  const status = searchParams.get("status");

  // sort + criteria: los últimos primero, que es lo que se mira cuando
  // se está esperando que entre un pago.
  const qs = new URLSearchParams({
    sort: "date_created",
    criteria: "desc",
    limit: String(limit),
    offset: "0",
  });
  if (status && STATUSES.has(status)) qs.set("status", status);

  const path = `/v1/payments/search?${qs.toString()}`;
  const r = await mpGet<MpSearchResponse>(path, token);

  if (!r.ok) {
    // El 401 se pasa tal cual para que la página ofrezca reconectar; el
    // resto se envuelve en 502, porque el que falló fue Mercado Pago y
    // no nuestra ruta.
    return NextResponse.json(
      { error: r.message, mpStatus: r.status, query: path },
      { status: r.status === 401 ? 401 : 502 },
    );
  }

  return NextResponse.json({
    query: path,
    total: r.data.paging?.total ?? null,
    fetchedAt: new Date().toISOString(),
    results: r.data.results ?? [],
  });
}
