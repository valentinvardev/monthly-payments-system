import type { PlanFrequency } from "@/generated/prisma/client";

// Compute the next billing period and due date based on a recurring plan's
// anchor date + frequency. Returns the period that ENDS on or after today;
// i.e. the next bill to generate.
export function computeNextPeriod(
  frequency: PlanFrequency,
  anchorDate: Date,
  now: Date = new Date(),
): { periodStart: Date; periodEnd: Date; dueDate: Date } {
  const a = startOfDay(anchorDate);
  const today = startOfDay(now);

  switch (frequency) {
    case "DAILY": {
      // Today counts if anchor was today or earlier; otherwise wait for the anchor day.
      const due = a.getTime() > today.getTime() ? a : today;
      return { periodStart: due, periodEnd: due, dueDate: due };
    }

    case "WEEKLY": {
      // Same weekday as anchor. If today is that weekday, today is valid.
      const dow = a.getDay();
      const offset = (dow - today.getDay() + 7) % 7; // 0 = today
      const due = addDays(today, offset);
      const periodStart = addDays(due, -6);
      return { periodStart, periodEnd: due, dueDate: due };
    }

    case "MONTHLY": {
      // Same day-of-month as anchor. Today is valid; jump to next month only when today is past it.
      const dom = a.getDate();
      const baseYear = today.getFullYear();
      const baseMonth = today.getMonth();
      let candidate = new Date(baseYear, baseMonth, dom);
      if (candidate.getTime() < today.getTime()) {
        candidate = new Date(baseYear, baseMonth + 1, dom);
      }
      const periodStart = new Date(candidate.getFullYear(), candidate.getMonth(), 1);
      const periodEnd = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0);
      return { periodStart, periodEnd, dueDate: candidate };
    }

    case "YEARLY": {
      // Same month-day as anchor.
      const m = a.getMonth();
      const d = a.getDate();
      let candidate = new Date(today.getFullYear(), m, d);
      if (candidate.getTime() < today.getTime()) {
        candidate = new Date(today.getFullYear() + 1, m, d);
      }
      const periodStart = new Date(candidate.getFullYear(), 0, 1);
      const periodEnd = new Date(candidate.getFullYear(), 11, 31);
      return { periodStart, periodEnd, dueDate: candidate };
    }
  }
}

export function formatFrequency(frequency: PlanFrequency): string {
  switch (frequency) {
    case "DAILY":
      return "Diario";
    case "WEEKLY":
      return "Semanal";
    case "MONTHLY":
      return "Mensual";
    case "YEARLY":
      return "Anual";
  }
}

export function describeAnchor(frequency: PlanFrequency, anchorDate: Date): string {
  const a = new Date(anchorDate);
  switch (frequency) {
    case "DAILY":
      return `Empieza ${a.toLocaleDateString("es-AR")}`;
    case "WEEKLY":
      return `Todos los ${a.toLocaleDateString("es-AR", { weekday: "long" })}`;
    case "MONTHLY":
      return `Vence el día ${a.getDate()} de cada mes`;
    case "YEARLY":
      return `Vence cada ${a.toLocaleDateString("es-AR", { day: "2-digit", month: "long" })}`;
  }
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function derivePeriod(
  frequency: PlanFrequency,
  dueDate: Date,
): { periodStart: Date; periodEnd: Date } {
  switch (frequency) {
    case "DAILY":
      return { periodStart: dueDate, periodEnd: dueDate };
    case "WEEKLY":
      return { periodStart: addDays(dueDate, -6), periodEnd: dueDate };
    case "MONTHLY":
      return {
        periodStart: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
        periodEnd: new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0),
      };
    case "YEARLY":
      return {
        periodStart: new Date(dueDate.getFullYear(), 0, 1),
        periodEnd: new Date(dueDate.getFullYear(), 11, 31),
      };
  }
}

function advanceByOne(frequency: PlanFrequency, date: Date): Date {
  const x = new Date(date);
  switch (frequency) {
    case "DAILY":
      x.setDate(x.getDate() + 1);
      break;
    case "WEEKLY":
      x.setDate(x.getDate() + 7);
      break;
    case "MONTHLY":
      x.setMonth(x.getMonth() + 1);
      break;
    case "YEARLY":
      x.setFullYear(x.getFullYear() + 1);
      break;
  }
  return x;
}

// Backfill: walk from the anchor up to `until` (default today) and return
// one period per cycle. Used when a plan is created with an anchor in the
// past so the client gets every missed bill at once. Capped so a typo
// like "anchor: 5 years ago, frequency: DAILY" doesn't generate thousands
// of rows in one transaction.
export const BACKFILL_LIMIT_BY_FREQUENCY: Record<PlanFrequency, number> = {
  DAILY: 60, // ~2 months
  WEEKLY: 52, // 1 year
  MONTHLY: 36, // 3 years
  YEARLY: 10,
};

export function computeAllDueDatesFromAnchor(
  frequency: PlanFrequency,
  anchorDate: Date,
  until: Date = new Date(),
): { dueDate: Date; periodStart: Date; periodEnd: Date }[] {
  const anchor = startOfDay(anchorDate);
  const stop = startOfDay(until);

  // Anchor in the future → just one invoice at the anchor date.
  if (anchor.getTime() > stop.getTime()) {
    return [{ dueDate: anchor, ...derivePeriod(frequency, anchor) }];
  }

  const max = BACKFILL_LIMIT_BY_FREQUENCY[frequency];
  const out: { dueDate: Date; periodStart: Date; periodEnd: Date }[] = [];
  let current = anchor;
  while (current.getTime() <= stop.getTime() && out.length < max) {
    out.push({ dueDate: current, ...derivePeriod(frequency, current) });
    current = advanceByOne(frequency, current);
  }
  return out;
}
