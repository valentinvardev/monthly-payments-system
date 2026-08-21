import "server-only";
import { cookies } from "next/headers";

// Sesión de prueba de Mercado Pago para /test.
//
// El token vive en una cookie httpOnly y en ningún otro lado: no hay
// tabla, no hay usuario y no hay nada que limpiar después. Esa es la
// diferencia con lib/mercadoPago.ts, que lee la conexión del admin
// desde la base — acá la base no tiene por qué estar levantada.
//
// Al ser httpOnly el token nunca baja al navegador: el cliente pide
// pagos a nuestras rutas y son ellas las que hablan con Mercado Pago.

export const MP_TEST_COOKIE = "mp_test_token";
export const MP_TEST_STATE_COOKIE = "mp_test_state";
export const MP_API = "https://api.mercadopago.com";

// Seis horas: alcanza para una sesión de pruebas y no deja un token de
// producción dando vueltas en el navegador más tiempo del necesario.
const MAX_AGE = 6 * 60 * 60;

export function tokenCookie(value: string) {
  return {
    name: MP_TEST_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function getTestToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(MP_TEST_COOKIE)?.value ?? null;
}

export type MpResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

// Todas las llamadas pasan por acá para que el error de Mercado Pago
// llegue entero a la pantalla. En una página de pruebas el cuerpo del
// error es la mitad de la información útil: "invalid access token" y
// "malformed date" se arreglan distinto, y un 500 con HTML adentro
// también es un dato.
export async function mpGet<T>(path: string, token: string): Promise<MpResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${MP_API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      message: e instanceof Error ? e.message : "No se pudo llegar a Mercado Pago",
    };
  }

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Los 5xx de MP a veces vienen en HTML; se maneja como texto plano.
  }

  if (!res.ok) {
    const msg =
      body && typeof body === "object" && typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : text.slice(0, 300) || res.statusText;
    return { ok: false, status: res.status, message: msg };
  }

  return { ok: true, data: body as T };
}

export type MpAccount = {
  id: number;
  nickname?: string;
  email?: string;
  site_id?: string;
  first_name?: string;
  last_name?: string;
};

export function getAccount(token: string) {
  return mpGet<MpAccount>("/users/me", token);
}

// Lo que devuelve /v1/payments/search. Sólo se tipa lo que la tabla
// muestra: el resto del objeto viaja igual al cliente para el JSON
// crudo de cada fila.
export type MpSearchPayment = {
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
  payer?: { email?: string | null; id?: string | number | null } | null;
};

export type MpSearchResponse = {
  paging?: { total?: number; limit?: number; offset?: number };
  results?: MpSearchPayment[];
};
