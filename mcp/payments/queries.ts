import type { Prisma, InvoiceStatus, PlanFrequency } from "../../src/generated/prisma/client";
import { db } from "./db";
import {
  TIMEZONE,
  type Today,
  baIsoDay,
  cronBillDays,
  daysDelta,
  dayToDate,
  firstUnprocessedDay,
  isoDay,
  monthBounds,
  nextCronBillDay,
  parseIsoDay,
  storedDay,
  todayInBuenosAires,
} from "./dates";

// Las siete consultas, como funciones de datos. server.ts sólo las envuelve
// en herramientas MCP. Necesitan TZ=UTC en el proceso (ver dates.ts), que
// server.ts fija; si se llaman desde otro lado sin eso, fallan en vez de
// devolver fechas corridas.

const CURRENCY = "USD";

// Una factura que todavía se puede cobrar. PENDING_REVIEW existe en el enum
// de facturas pero el app no lo usa: el comprobante en revisión vive en
// Payment.status, y la factura sigue PENDING u OVERDUE mientras tanto.
const OPEN_STATUSES: InvoiceStatus[] = ["PENDING", "PENDING_REVIEW", "OVERDUE"];

const num = (d: Prisma.Decimal | number | null | undefined) => (d == null ? 0 : Number(d));
const round2 = (n: number) => Math.round(n * 100) / 100;

// MCP_APP_URL gana sobre APP_URL: el .env del repo tiene APP_URL en
// localhost para desarrollo, pero los datos son los de producción y los
// links tienen que abrir producción.
function appUrl() {
  const raw = process.env.MCP_APP_URL || process.env.APP_URL;
  return raw ? raw.replace(/\/+$/, "") : null;
}

function clientLinks(clientId: string) {
  const base = appUrl();
  return base ? { dashboardUrl: `${base}/dashboard/clients/${clientId}` } : {};
}

function invoiceLinks(clientId: string, invoiceId: string) {
  const base = appUrl();
  if (!base) return {};
  return {
    // El panel no tiene página por factura: la factura se ve en la ficha
    // del cliente. El link del portal es el que se le manda al cliente;
    // un admin que lo abre termina en el panel.
    dashboardUrl: `${base}/dashboard/clients/${clientId}`,
    clientPortalUrl: `${base}/portal/invoice/${invoiceId}`,
  };
}

// ---- Filtros por el día de Buenos Aires -----------------------------------
//
// Vencida o no se decide por la fecha, no por la marca OVERDUE. El cron
// corre a las 22:55 de Buenos Aires con el día UTC, que ya es el siguiente:
// marca OVERDUE una factura que vence hoy una hora antes de que termine el
// día. Si se confiara en la marca, esa factura desaparecería de "lo que
// vence hoy" y aparecería vencida con cero días de atraso.

function overdueWhere(today: Today): Prisma.InvoiceWhereInput {
  return { status: { in: OPEN_STATUSES }, dueDate: { lt: dayToDate(today.day) } };
}

function notYetDueWhere(today: Today): Prisma.InvoiceWhereInput {
  return { status: { in: OPEN_STATUSES }, dueDate: { gte: dayToDate(today.day) } };
}

const underReviewWhere: Prisma.InvoiceWhereInput = {
  status: { in: OPEN_STATUSES },
  payments: { some: { status: "PENDING_REVIEW" } },
};

// ---- Factura ----------------------------------------------------------------

const invoiceSelect = {
  id: true,
  clientId: true,
  description: true,
  amountUsd: true,
  dueDate: true,
  periodStart: true,
  periodEnd: true,
  status: true,
  paidAt: true,
  arsAmountSnapshot: true,
  arsRateSnapshot: true,
  arsSnapshotAt: true,
  client: { select: { fullName: true, email: true } },
  // Sólo los pagos que dicen algo del estado: el confirmado (cómo se pagó)
  // y el que espera revisión. Cada click en "Pagar con Mercado Pago" deja
  // una fila INITIATED que nunca se cierra; tomar "el último pago" a secas
  // haría decir "pagó por Mercado Pago" a una factura cobrada en efectivo.
  payments: {
    where: { status: { in: ["CONFIRMED", "PENDING_REVIEW"] } },
    orderBy: { createdAt: "desc" as const },
    take: 5,
    select: { method: true, status: true, amountUsd: true, createdAt: true, confirmedAt: true },
  },
} satisfies Prisma.InvoiceSelect;

type InvoiceRecord = Prisma.InvoiceGetPayload<{ select: typeof invoiceSelect }>;

export function shapeInvoice(inv: InvoiceRecord, today: Today) {
  const delta = daysDelta(inv.dueDate, today);
  const open = OPEN_STATUSES.includes(inv.status);
  const confirmed = inv.payments.find((p) => p.status === "CONFIRMED");
  const review = inv.payments.find((p) => p.status === "PENDING_REVIEW");
  const shown = inv.status === "PAID" ? confirmed : open ? review : undefined;
  return {
    id: inv.id,
    client: inv.client.fullName,
    clientId: inv.clientId,
    clientEmail: inv.client.email,
    description: inv.description,
    amount: num(inv.amountUsd),
    currency: CURRENCY,
    ars: inv.arsAmountSnapshot
      ? {
          amount: num(inv.arsAmountSnapshot),
          rate: num(inv.arsRateSnapshot),
          at: inv.arsSnapshotAt?.toISOString() ?? null,
        }
      : null,
    dueDate: isoDay(inv.dueDate),
    period: { start: isoDay(inv.periodStart), end: isoDay(inv.periodEnd) },
    // Tal cual está en la base. Para saber si está vencida, isOverdue.
    status: inv.status,
    isOverdue: open && delta < 0,
    // El cliente subió un comprobante y falta que el admin lo confirme.
    underReview: open && Boolean(review),
    // Sólo tienen sentido mientras la factura está abierta: una pagada
    // hace tres meses no "lleva 90 días de atraso".
    daysDelta: open ? delta : null,
    daysOverdue: open && delta < 0 ? -delta : null,
    daysUntilDue: open && delta >= 0 ? delta : null,
    // Los instantes salen en UTC, con el día de Buenos Aires al lado: un
    // pago de las 22:00 es del día que el cliente vivió, no del siguiente.
    paidAt: inv.paidAt?.toISOString() ?? null,
    paidOn: inv.paidAt ? baIsoDay(inv.paidAt) : null,
    payment: shown
      ? {
          method: shown.method,
          status: shown.status,
          amount: num(shown.amountUsd),
          at: (shown.confirmedAt ?? shown.createdAt).toISOString(),
          on: baIsoDay(shown.confirmedAt ?? shown.createdAt),
        }
      : null,
    // Pagada sin un pago registrado: el admin la marcó pagada a mano
    // (efectivo o transferencia fuera del sistema). No hay método.
    markedPaidManually: inv.status === "PAID" && !confirmed,
    ...invoiceLinks(inv.clientId, inv.id),
  };
}

// ---- Planes: qué va a facturar el cron ------------------------------------

type PlanRecord = {
  amountUsd: Prisma.Decimal;
  description: string;
  frequency: PlanFrequency;
  anchorDate: Date;
  endDate: Date | null;
  active: boolean;
};

// Días ya facturados por cliente, para decir si el próximo cobro del plan
// ya tiene factura. Misma regla que el cron: cualquier factura de ese
// cliente con ese día exacto.
async function invoicedDays(clientIds: string[], fromDay: number, toDay?: number) {
  if (clientIds.length === 0) return new Set<string>();
  const rows = await db.invoice.findMany({
    where: {
      clientId: { in: clientIds },
      dueDate: toDay === undefined ? { gte: dayToDate(fromDay) } : { gte: dayToDate(fromDay), lt: dayToDate(toDay + 1) },
    },
    select: { clientId: true, dueDate: true },
  });
  return new Set(rows.map((r) => `${r.clientId}:${storedDay(r.dueDate)}`));
}

function planSummary(
  p: PlanRecord,
  clientId: string,
  clientActive: boolean,
  today: Today,
  invoiced: Set<string>,
) {
  // El cron sólo factura planes activos de clientes activos.
  const billing = p.active && clientActive;
  const key = (d: Date) => `${clientId}:${storedDay(d)}`;

  // Si el cron ya pasó por el día del cobro y no lo emitió (falló esa
  // noche, se borró la factura, se cambió el plan después), ese cobro no
  // va a llegar solo. Se informa aparte y el próximo es el siguiente.
  const cutoff = firstUnprocessedDay();
  const missed: string[] = [];
  let next = billing ? nextCronBillDay(p.frequency, p.anchorDate, today.day) : null;
  while (next && storedDay(next) < cutoff && !invoiced.has(key(next))) {
    missed.push(isoDay(next));
    next = nextCronBillDay(p.frequency, p.anchorDate, storedDay(next) + 1);
  }
  const afterEnd = Boolean(next && p.endDate && storedDay(next) > storedDay(p.endDate));
  return {
    description: p.description,
    amount: num(p.amountUsd),
    currency: CURRENCY,
    frequency: p.frequency,
    anchorDate: isoDay(p.anchorDate),
    endDate: p.endDate ? isoDay(p.endDate) : null,
    active: p.active,
    billing,
    nextDueDate: next ? isoDay(next) : null,
    nextAlreadyInvoiced: next ? invoiced.has(key(next)) : null,
    ...(missed.length
      ? {
          missedBills: missed,
          missedNote:
            "El cron ya pasó por estos días y no emitió la factura: no va a llegar sola, hay que generarla desde el panel.",
        }
      : {}),
    ...(afterEnd
      ? {
          warning:
            "El plan tiene fecha de fin anterior a este cobro, pero el cron no mira la fecha de fin: lo va a facturar igual.",
        }
      : {}),
  };
}

// Cobros recurrentes que el cron va a emitir en la ventana y todavía no
// tienen factura. Sin esto, "¿qué vence esta semana?" sólo vería lo ya
// emitido, y el cron emite cada factura la noche anterior a su vencimiento.
async function projectedBills(today: Today, days: number) {
  const plans = await db.recurringPlan.findMany({
    where: { active: true, client: { active: true } },
    select: {
      clientId: true,
      amountUsd: true,
      description: true,
      frequency: true,
      anchorDate: true,
      client: { select: { fullName: true } },
    },
  });
  const from = today.day;
  const to = today.day + days;
  const invoiced = await invoicedDays(
    plans.map((p) => p.clientId),
    from,
    to,
  );

  const cutoff = firstUnprocessedDay();
  const pending = plans.flatMap((p) =>
    cronBillDays(p.frequency, p.anchorDate, from, to)
      .filter((d) => !invoiced.has(`${p.clientId}:${storedDay(d)}`))
      .map((d) => ({
        client: p.client.fullName,
        clientId: p.clientId,
        description: p.description,
        amount: num(p.amountUsd),
        currency: CURRENCY,
        dueDate: isoDay(d),
        daysUntilDue: storedDay(d) - today.day,
        frequency: p.frequency,
        issued: false as const,
        ...clientLinks(p.clientId),
      })),
  );
  pending.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.client.localeCompare(b.client));

  // Lo que el cron todavía va a procesar viene; lo que ya pasó sin factura
  // se perdió y no se suma a lo que va a entrar.
  const bills = pending.filter((b) => storedDay(parseIsoDay(b.dueDate)) >= cutoff);
  const lost = pending.filter((b) => storedDay(parseIsoDay(b.dueDate)) < cutoff);
  const total = (xs: { amount: number }[]) => round2(xs.reduce((s, b) => s + b.amount, 0));
  return {
    count: bills.length,
    amount: total(bills),
    bills,
    missed: {
      count: lost.length,
      amount: total(lost),
      bills: lost,
      ...(lost.length
        ? { note: "El cron ya pasó por estos días y no emitió la factura: hay que generarla desde el panel." }
        : {}),
    },
  };
}

// ---- Clientes ---------------------------------------------------------------

const MATCH_LIMIT = 50;

// Minúsculas y sin tildes: "Raúl" encuentra a "Raul" y al revés.
function fold(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

async function resolveClient(input: { clientId?: string; clientName?: string }) {
  if (input.clientId) {
    const c = await db.client.findUnique({
      where: { id: input.clientId },
      select: { id: true, fullName: true, email: true },
    });
    return {
      ids: c ? [c.id] : [],
      matches: c ? [{ id: c.id, name: c.fullName, email: c.email }] : [],
      truncated: false,
    };
  }
  const tokens = input.clientName ? fold(input.clientName).split(/\s+/).filter(Boolean) : [];
  if (tokens.length > 0) {
    // Se compara en código y no con ILIKE, que distingue tildes: la tabla
    // de clientes es chica y así cada palabra puede estar en cualquier
    // orden ("Guevara Juan" encuentra a "juan cruz guevara").
    const all = await db.client.findMany({
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });
    const found = all.filter((c) => {
      const haystack = fold(`${c.fullName} ${c.email}`);
      return tokens.every((t) => haystack.includes(t));
    });
    const truncated = found.length > MATCH_LIMIT;
    const kept = found.slice(0, MATCH_LIMIT);
    return {
      ids: kept.map((c) => c.id),
      matches: kept.map((c) => ({ id: c.id, name: c.fullName, email: c.email })),
      truncated,
    };
  }
  return { ids: null, matches: [], truncated: false };
}

export async function listClients(input: { includeInactive?: boolean }) {
  const today = todayInBuenosAires();
  const clients = await db.client.findMany({
    where: input.includeInactive ? {} : { active: true },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      active: true,
      userId: true,
      recurringPlan: true,
      invoices: {
        orderBy: { dueDate: "desc" },
        take: 1,
        select: { id: true, dueDate: true, status: true, amountUsd: true },
      },
      _count: { select: { invoices: { where: { status: { in: OPEN_STATUSES } } } } },
    },
  });

  const invoiced = await invoicedDays(
    clients.filter((c) => c.recurringPlan).map((c) => c.id),
    today.day,
  );

  return {
    today: today.iso,
    timezone: TIMEZONE,
    count: clients.length,
    clients: clients.map((c) => {
      const last = c.invoices[0];
      return {
        id: c.id,
        name: c.fullName,
        email: c.email,
        phone: c.phone,
        active: c.active,
        hasPortalAccess: c.userId !== null,
        plan: c.recurringPlan ? planSummary(c.recurringPlan, c.id, c.active, today, invoiced) : null,
        openInvoices: c._count.invoices,
        lastInvoice: last
          ? { id: last.id, dueDate: isoDay(last.dueDate), status: last.status, amount: num(last.amountUsd) }
          : null,
        ...clientLinks(c.id),
      };
    }),
  };
}

export async function listInvoices(input: {
  status?: InvoiceStatus[];
  clientId?: string;
  clientName?: string;
  dueFrom?: string;
  dueTo?: string;
  underReview?: boolean;
  limit?: number;
}) {
  const today = todayInBuenosAires();
  const resolved = await resolveClient(input);
  const clientInfo =
    input.clientName !== undefined
      ? {
          matchedClients: resolved.matches,
          ...(resolved.truncated
            ? { hint: `El nombre coincide con más de ${MATCH_LIMIT} clientes: afiná la búsqueda.` }
            : resolved.matches.length > 1
              ? { hint: "El nombre coincide con varios clientes: las facturas están mezcladas. Usá clientId para uno solo." }
              : {}),
        }
      : {};
  if (resolved.ids && resolved.ids.length === 0) {
    return { today: today.iso, count: 0, invoices: [], ...clientInfo };
  }

  const and: Prisma.InvoiceWhereInput[] = [];
  if (input.status?.length) and.push({ status: { in: input.status } });
  if (resolved.ids) and.push({ clientId: { in: resolved.ids } });
  if (input.dueFrom) and.push({ dueDate: { gte: parseIsoDay(input.dueFrom) } });
  // Inclusivo: hasta el final del día pedido.
  if (input.dueTo) and.push({ dueDate: { lt: new Date(parseIsoDay(input.dueTo).getTime() + 86_400_000) } });
  if (input.underReview === true) and.push(underReviewWhere);
  if (input.underReview === false) and.push({ payments: { none: { status: "PENDING_REVIEW" } } });

  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  const fetched = await db.invoice.findMany({
    where: and.length ? { AND: and } : {},
    orderBy: { dueDate: "desc" },
    take: limit + 1,
    select: invoiceSelect,
  });
  // Una fila de más para saber si hay más: sin esto, una lista cortada en
  // el límite se lee como completa y count parece el total.
  const truncated = fetched.length > limit;
  const rows = fetched.slice(0, limit);
  return {
    today: today.iso,
    count: rows.length,
    limit,
    truncated,
    ...clientInfo,
    invoices: rows.map((r) => shapeInvoice(r, today)),
  };
}

export async function getOverdue() {
  const today = todayInBuenosAires();
  const where = overdueWhere(today);
  const [rows, agg] = await Promise.all([
    db.invoice.findMany({ where, orderBy: { dueDate: "asc" }, select: invoiceSelect }),
    db.invoice.aggregate({ where, _sum: { amountUsd: true } }),
  ]);
  return {
    today: today.iso,
    count: rows.length,
    totalAmount: round2(num(agg._sum.amountUsd)),
    currency: CURRENCY,
    // dueDate asc = más días de atraso primero.
    invoices: rows.map((r) => shapeInvoice(r, today)),
  };
}

export async function getUpcoming(input: { days?: number }) {
  const today = todayInBuenosAires();
  const days = Math.min(Math.max(input.days ?? 14, 0), 365);
  const where: Prisma.InvoiceWhereInput = {
    status: { in: OPEN_STATUSES },
    dueDate: { gte: dayToDate(today.day), lt: dayToDate(today.day + days + 1) },
  };
  const [rows, agg, projected] = await Promise.all([
    db.invoice.findMany({ where, orderBy: { dueDate: "asc" }, select: invoiceSelect }),
    db.invoice.aggregate({ where, _sum: { amountUsd: true } }),
    projectedBills(today, days),
  ]);
  const issuedAmount = round2(num(agg._sum.amountUsd));
  return {
    today: today.iso,
    days,
    until: isoDay(dayToDate(today.day + days)),
    currency: CURRENCY,
    // Facturas ya emitidas que vencen en la ventana.
    count: rows.length,
    totalAmount: issuedAmount,
    invoices: rows.map((r) => shapeInvoice(r, today)),
    // Cobros de planes que el cron todavía no emitió.
    projected,
    totalWithProjected: round2(issuedAmount + projected.amount),
  };
}

export async function getClient(input: { clientId?: string; clientName?: string }) {
  const today = todayInBuenosAires();
  const { ids, matches } = await resolveClient(input);
  if (!ids || ids.length === 0) return { today: today.iso, client: null, matches: [] };
  if (ids.length > 1) {
    return {
      today: today.iso,
      client: null,
      matches,
      hint: "Más de un cliente coincide: repetí la consulta con clientId.",
    };
  }

  const c = await db.client.findUnique({
    where: { id: ids[0] },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      taxId: true,
      notes: true,
      active: true,
      userId: true,
      createdAt: true,
      recurringPlan: true,
    },
  });
  if (!c) return { today: today.iso, client: null, matches: [] };

  const [open, lastPaid, pendingReview, overdueAgg, invoiced] = await Promise.all([
    db.invoice.findMany({
      where: { clientId: c.id, status: { in: OPEN_STATUSES } },
      orderBy: { dueDate: "asc" },
      select: invoiceSelect,
    }),
    // paidAt nunca es null en una PAID (lo ponen confirm, markPaid y el
    // webhook), pero en Postgres un DESC pone los NULL primero: se filtran
    // igual para que un dato viejo no gane el "último pago".
    db.invoice.findFirst({
      where: { clientId: c.id, status: "PAID", paidAt: { not: null } },
      orderBy: { paidAt: "desc" },
      select: invoiceSelect,
    }),
    db.payment.findMany({
      where: { status: "PENDING_REVIEW", invoice: { clientId: c.id, status: { in: OPEN_STATUSES } } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceId: true,
        method: true,
        amountUsd: true,
        arsAmount: true,
        proofUrl: true,
        notes: true,
        createdAt: true,
      },
    }),
    db.invoice.aggregate({
      where: { clientId: c.id, ...overdueWhere(today) },
      _sum: { amountUsd: true },
      _count: true,
    }),
    c.recurringPlan ? invoicedDays([c.id], today.day) : Promise.resolve(new Set<string>()),
  ]);

  return {
    today: today.iso,
    matches: [],
    client: {
      id: c.id,
      name: c.fullName,
      email: c.email,
      phone: c.phone,
      taxId: c.taxId,
      notes: c.notes,
      active: c.active,
      hasPortalAccess: c.userId !== null,
      since: baIsoDay(c.createdAt),
      plan: c.recurringPlan ? planSummary(c.recurringPlan, c.id, c.active, today, invoiced) : null,
      totals: {
        openCount: open.length,
        openAmount: round2(open.reduce((s, i) => s + num(i.amountUsd), 0)),
        overdueCount: overdueAgg._count,
        overdueAmount: round2(num(overdueAgg._sum.amountUsd)),
        currency: CURRENCY,
      },
      openInvoices: open.map((r) => shapeInvoice(r, today)),
      lastPaidInvoice: lastPaid ? shapeInvoice(lastPaid, today) : null,
      // Comprobantes que el cliente subió y el admin todavía no confirmó.
      pendingReviewPayments: pendingReview.map((pay) => ({
        id: pay.id,
        invoiceId: pay.invoiceId,
        method: pay.method,
        amount: num(pay.amountUsd),
        currency: CURRENCY,
        arsAmount: pay.arsAmount ? num(pay.arsAmount) : null,
        hasProof: Boolean(pay.proofUrl),
        notes: pay.notes,
        submittedAt: pay.createdAt.toISOString(),
        submittedOn: baIsoDay(pay.createdAt),
      })),
      ...clientLinks(c.id),
    },
  };
}

export async function paymentsSummary(input: { upcomingDays?: number }) {
  const today = todayInBuenosAires();
  const days = Math.min(Math.max(input.upcomingDays ?? 14, 0), 365);
  const month = monthBounds(today);

  const sum = (where: Prisma.InvoiceWhereInput) =>
    db.invoice.aggregate({ where, _sum: { amountUsd: true }, _count: true });

  const [paid, pending, overdue, review, upcoming, projected] = await Promise.all([
    sum({ status: "PAID", paidAt: { gte: month.start, lt: month.end } }),
    sum(notYetDueWhere(today)),
    sum(overdueWhere(today)),
    sum(underReviewWhere),
    sum({
      status: { in: OPEN_STATUSES },
      dueDate: { gte: dayToDate(today.day), lt: dayToDate(today.day + days + 1) },
    }),
    projectedBills(today, days),
  ]);

  const bucket = (a: { _count: number; _sum: { amountUsd: Prisma.Decimal | null } }) => ({
    count: a._count,
    amount: round2(num(a._sum.amountUsd)),
  });

  return {
    today: today.iso,
    timezone: TIMEZONE,
    currency: CURRENCY,
    month: month.iso,
    // Facturas que pasaron a PAID este mes (por la fecha de pago, en
    // Buenos Aires).
    paidThisMonth: bucket(paid),
    // Emitidas y todavía no vencidas. pending + overdue = todo lo abierto.
    pending: bucket(pending),
    overdue: bucket(overdue),
    // No es un bloque aparte: son facturas de pending u overdue que ya
    // tienen un comprobante esperando que el admin lo confirme.
    proofUnderReview: bucket(review),
    upcoming: {
      days,
      until: isoDay(dayToDate(today.day + days)),
      ...bucket(upcoming),
      // Cobros de planes en la ventana que el cron todavía no emitió, y
      // los que ya pasó sin emitir (no llegan solos; no se suman).
      projected: { count: projected.count, amount: projected.amount },
      missed: { count: projected.missed.count, amount: projected.missed.amount },
    },
  };
}

export async function health() {
  const started = Date.now();
  // Dos conteos alcanzan como ping: si la base no responde, fallan.
  const [clients, invoices] = await Promise.all([db.client.count(), db.invoice.count()]);
  const today = todayInBuenosAires();
  return {
    ok: true as const,
    latencyMs: Date.now() - started,
    counts: { clients, invoices },
    today: today.iso,
    timezone: TIMEZONE,
    readOnly: true,
    appUrl: appUrl(),
  };
}
