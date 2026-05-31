// In-memory USD→ARS exchange rate (demo mode). Replace with DB-cached version
// when Supabase is wired (see prisma/schema.prisma → ExchangeRate model).

const SOURCE = "dolarapi:oficial";
const PAIR = "USD/ARS";
const CACHE_TTL_MS = 10 * 60 * 1000;
const DOLARAPI_URL = "https://dolarapi.com/v1/dolares/oficial";

type DolarApiResponse = {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
};

export type UsdToArsRate = {
  source: string;
  pair: string;
  rate: number;
  fetchedAt: Date;
  cached: boolean;
};

const globalForRate = globalThis as unknown as { __rateCache?: UsdToArsRate };

async function fetchFromDolarApi(): Promise<UsdToArsRate> {
  const res = await fetch(DOLARAPI_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`dolarapi responded ${res.status}`);
  const data = (await res.json()) as DolarApiResponse;
  if (typeof data.venta !== "number") throw new Error("dolarapi returned an unexpected payload");
  return {
    source: SOURCE,
    pair: PAIR,
    rate: Number(data.venta.toFixed(4)),
    fetchedAt: new Date(),
    cached: false,
  };
}

export async function getUsdToArsRate(): Promise<UsdToArsRate> {
  const cached = globalForRate.__rateCache;
  const fresh = cached && cached.source === SOURCE && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS;
  if (cached && fresh) {
    return { ...cached, cached: true };
  }
  try {
    const fresh = await fetchFromDolarApi();
    globalForRate.__rateCache = fresh;
    return fresh;
  } catch (err) {
    if (cached) {
      console.warn("[exchange-rate] dolarapi failed, using stale cache:", err);
      return { ...cached, cached: true };
    }
    throw err;
  }
}

export function convertUsdToArs(amountUsd: number, rate: number) {
  return Math.round(amountUsd * rate * 100) / 100;
}
