import type { PlanFrequency } from "../../src/generated/prisma/client";
import { computeNextPeriod } from "../../src/lib/recurrence";

// Fechas, en dos mundos distintos que no hay que mezclar.
//
// 1. Las fechas de calendario de la base (dueDate, periodStart, anchorDate)
//    se guardan a la medianoche UTC del día que representan, porque el
//    app corre en UTC y las crea con `new Date(y, m, d)`. El día que
//    significan es su fecha UTC. Convertirlas a Buenos Aires las correría
//    al día anterior a las 21:00, que es el error clásico.
//
// 2. "Hoy", y el día de cualquier instante (createdAt, paidAt), es el día
//    de calendario en Buenos Aires, porque quien lee el resultado está ahí
//    y "vence hoy" tiene que ser su hoy.
//
// La comparación se hace en días enteros desde epoch, así no hay horas de
// por medio.

export const TIMEZONE = "America/Argentina/Buenos_Aires";
const DAY_MS = 86_400_000;

// Día de calendario (UTC) de una fecha guardada, como número de días.
export function storedDay(d: Date): number {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / DAY_MS);
}

// YYYY-MM-DD de una fecha de calendario guardada (dueDate, anchorDate…).
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const baDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// YYYY-MM-DD de un instante, visto desde Buenos Aires (createdAt, paidAt).
export function baIsoDay(d: Date): string {
  return baDay.format(d); // en-CA da YYYY-MM-DD
}

export type Today = { iso: string; day: number; year: number; month: number };

export function todayInBuenosAires(now: Date = new Date()): Today {
  const iso = baIsoDay(now);
  const [y, m, d] = iso.split("-").map(Number);
  return { iso, day: Math.floor(Date.UTC(y, m - 1, d) / DAY_MS), year: y, month: m };
}

// Positivo: faltan días. Cero: vence hoy. Negativo: vencida.
export function daysDelta(dueDate: Date, today: Today): number {
  return storedDay(dueDate) - today.day;
}

// Medianoche UTC de un día de calendario, para filtrar contra dueDate.
export function dayToDate(day: number): Date {
  return new Date(day * DAY_MS);
}

// Sólo fechas que existen: "2026-09-31" o "2026-13-01" no se corren al
// mes siguiente en silencio, se rechazan.
export function isValidIsoDay(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return parseIsoDay(iso).toISOString().slice(0, 10) === iso;
}

export function parseIsoDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Instante real de la medianoche de Buenos Aires de un día. Sirve para
// filtrar paidAt/confirmedAt, que sí son instantes y no días de
// calendario. Se calcula con el offset que Intl reporta para esa fecha,
// así no se hardcodea el -03:00.
export function zonedMidnight(year: number, month: number, dayOfMonth: number): Date {
  const guess = new Date(Date.UTC(year, month - 1, dayOfMonth));
  return new Date(guess.getTime() - tzOffsetMs(guess));
}

function tzOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - at.getTime();
}

// Límites del mes en curso en Buenos Aires, como instantes.
export function monthBounds(today: Today): { start: Date; end: Date; iso: string } {
  const start = zonedMidnight(today.year, today.month, 1);
  const end =
    today.month === 12
      ? zonedMidnight(today.year + 1, 1, 1)
      : zonedMidnight(today.year, today.month + 1, 1);
  return { start, end, iso: `${today.year}-${String(today.month).padStart(2, "0")}` };
}

// ---- Cuándo factura el cron ----------------------------------------------
//
// El cron (src/app/api/cron/billing/route.ts) corre una vez por día y emite
// la factura de un plan sólo si computeNextPeriod(hoy).dueDate cae
// exactamente hoy. No factura por adelantado, y no es lo mismo que "el
// próximo dueDate que da computeNextPeriod": para planes anclados el 29,
// 30 o 31, ese día no existe en los meses cortos, la fecha se corre al 1
// del mes siguiente y el cron nunca la emite. Para decir la verdad sobre
// qué se va a facturar, acá se recorre día por día con la misma regla.
//
// computeNextPeriod hace la cuenta en hora local y el app corre en UTC.
// server.ts fija TZ=UTC; si alguien importa esto desde otro proceso sin
// hacerlo, las fechas salen un día corridas sin avisar. Por eso se
// verifica en vez de suponerlo.

function assertUtcProcess() {
  if (new Date(0).getTimezoneOffset() !== 0) {
    throw new Error(
      "surcodia-payments: el proceso tiene que correr con TZ=UTC (server.ts lo fija). " +
        "Las reglas de vencimiento del app calculan en hora local.",
    );
  }
}

function billsOn(frequency: PlanFrequency, anchorDate: Date, day: number): boolean {
  const { dueDate } = computeNextPeriod(frequency, anchorDate, dayToDate(day));
  return storedDay(dueDate) === day;
}

// Días entre fromDay y toDay, inclusive, en que el cron emitiría una
// factura de este plan.
export function cronBillDays(
  frequency: PlanFrequency,
  anchorDate: Date,
  fromDay: number,
  toDay: number,
): Date[] {
  assertUtcProcess();
  const out: Date[] = [];
  for (let day = fromDay; day <= toDay; day++) {
    if (billsOn(frequency, anchorDate, day)) out.push(dayToDate(day));
  }
  return out;
}

// El worker del cron (cron-worker.mjs en PM2) dispara cada 24 horas desde
// que arrancó. En producción corre a las 01:55 UTC, 22:55 en Buenos Aires:
// es la hora de creación de todas las facturas recurrentes de la base. Su
// corrida del día UTC X es la única que puede emitir los cobros del día X,
// y no recupera días salteados. Si el worker se reinicia a otra hora, esto
// se corre, y durante unas horas un cobro de mañana puede figurar como
// perdido cuando todavía viene, o al revés.
export const CRON_RUN_UTC_MINUTES = 1 * 60 + 55;

// Primer día que el cron todavía no procesó. Un cobro de un día anterior
// que no tenga factura ya no se va a emitir solo: hay que generarlo a mano.
// Cinco minutos de margen por lo que tarda la corrida.
export function firstUnprocessedDay(now: Date = new Date()): number {
  const utcDay = Math.floor(now.getTime() / DAY_MS);
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return minutes >= CRON_RUN_UTC_MINUTES + 5 ? utcDay + 1 : utcDay;
}

// Primer día desde fromDay en que el cron facturaría el plan. El
// horizonte cubre un plan anual; más allá no hay nada que predecir.
export function nextCronBillDay(
  frequency: PlanFrequency,
  anchorDate: Date,
  fromDay: number,
  horizonDays = 400,
): Date | null {
  assertUtcProcess();
  for (let day = fromDay; day <= fromDay + horizonDays; day++) {
    if (billsOn(frequency, anchorDate, day)) return dayToDate(day);
  }
  return null;
}
