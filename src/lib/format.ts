const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const arsFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Accept Prisma's Decimal too — it stringifies cleanly via Number().
type Numeric = number | string | { toString(): string };
const toNum = (n: Numeric) => (typeof n === "number" ? n : Number(n.toString()));

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatDateTime = (d: Date | string) => dateTimeFmt.format(new Date(d));
export const formatUsd = (n: Numeric) => usdFmt.format(toNum(n));
export const formatArs = (n: Numeric) => arsFmt.format(toNum(n));
export const toNumber = toNum;

// Peso de un archivo para mostrarle al usuario, no para cuentas: KB
// enteros y MB con un decimal alcanzan para decidir si vale abrirlo.
export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export function daysUntil(d: Date | string) {
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
