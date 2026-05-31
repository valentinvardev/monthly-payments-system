// USD→ARS exchange rate, cached in the DB via the ExchangeRate model.
// Falls back to the most recent row if dolarapi is unreachable.
import "server-only";
import { prisma } from "@/lib/prisma";

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

async function readLatestFromDb() {
  return prisma.exchangeRate.findFirst({
    where: { source: SOURCE, pair: PAIR },
    orderBy: { fetchedAt: "desc" },
  });
}

async function fetchFromDolarApi(): Promise<{ rate: number; fetchedAt: Date }> {
  const res = await fetch(DOLARAPI_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`dolarapi responded ${res.status}`);
  const data = (await res.json()) as DolarApiResponse;
  if (typeof data.venta !== "number") throw new Error("dolarapi returned an unexpected payload");
  return { rate: Number(data.venta.toFixed(4)), fetchedAt: new Date() };
}

export async function getUsdToArsRate(): Promise<UsdToArsRate> {
  const latest = await readLatestFromDb();
  const now = Date.now();
  if (latest && now - latest.fetchedAt.getTime() < CACHE_TTL_MS) {
    return {
      source: latest.source,
      pair: latest.pair,
      rate: Number(latest.rate),
      fetchedAt: latest.fetchedAt,
      cached: true,
    };
  }

  try {
    const fresh = await fetchFromDolarApi();
    const saved = await prisma.exchangeRate.create({
      data: { source: SOURCE, pair: PAIR, rate: fresh.rate, fetchedAt: fresh.fetchedAt },
    });
    return {
      source: saved.source,
      pair: saved.pair,
      rate: Number(saved.rate),
      fetchedAt: saved.fetchedAt,
      cached: false,
    };
  } catch (err) {
    if (latest) {
      console.warn("[exchange-rate] dolarapi failed, using stale row:", err);
      return {
        source: latest.source,
        pair: latest.pair,
        rate: Number(latest.rate),
        fetchedAt: latest.fetchedAt,
        cached: true,
      };
    }
    throw err;
  }
}

export function convertUsdToArs(amountUsd: number, rate: number) {
  return Math.round(amountUsd * rate * 100) / 100;
}
