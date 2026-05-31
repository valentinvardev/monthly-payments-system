import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const SOURCE = "dolarapi:cripto";
const PAIR = "USD/ARS";
const CACHE_TTL_MS = 10 * 60 * 1000;
const DOLARAPI_URL = "https://dolarapi.com/v1/dolares/cripto";

type DolarApiResponse = {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
};

export type UsdToArsRate = {
  rate: Prisma.Decimal;
  fetchedAt: Date;
  cached: boolean;
};

async function readLatestFromDb() {
  return prisma.exchangeRate.findFirst({
    where: { source: SOURCE, pair: PAIR },
    orderBy: { fetchedAt: "desc" },
  });
}

async function fetchFromDolarApi(): Promise<{ rate: Prisma.Decimal; fetchedAt: Date }> {
  const res = await fetch(DOLARAPI_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`dolarapi responded ${res.status}`);
  }
  const data = (await res.json()) as DolarApiResponse;
  if (typeof data.venta !== "number") {
    throw new Error("dolarapi returned an unexpected payload");
  }
  return {
    rate: new Prisma.Decimal(data.venta.toFixed(4)),
    fetchedAt: new Date(),
  };
}

export async function getUsdToArsRate(): Promise<UsdToArsRate> {
  const latest = await readLatestFromDb();
  const now = Date.now();

  if (latest && now - latest.fetchedAt.getTime() < CACHE_TTL_MS) {
    return { rate: latest.rate, fetchedAt: latest.fetchedAt, cached: true };
  }

  try {
    const fresh = await fetchFromDolarApi();
    const saved = await prisma.exchangeRate.create({
      data: { source: SOURCE, pair: PAIR, rate: fresh.rate, fetchedAt: fresh.fetchedAt },
    });
    return { rate: saved.rate, fetchedAt: saved.fetchedAt, cached: false };
  } catch (err) {
    if (latest) {
      console.warn("[exchange-rate] dolarapi failed, falling back to last cached rate:", err);
      return { rate: latest.rate, fetchedAt: latest.fetchedAt, cached: true };
    }
    throw err;
  }
}

export function convertUsdToArs(amountUsd: Prisma.Decimal | number | string, rate: Prisma.Decimal) {
  const usd = amountUsd instanceof Prisma.Decimal ? amountUsd : new Prisma.Decimal(amountUsd);
  return usd.mul(rate);
}
