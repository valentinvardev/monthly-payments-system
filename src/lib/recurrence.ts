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
      // Each day is its own period. Skip to tomorrow if anchor was today or earlier.
      const due = a.getTime() > today.getTime() ? a : addDays(today, 1);
      return { periodStart: due, periodEnd: due, dueDate: due };
    }

    case "WEEKLY": {
      // Same weekday as anchor, every 7 days. Pick the first one strictly in the future.
      const dow = a.getDay();
      let due = new Date(today);
      const offset = (dow - today.getDay() + 7) % 7;
      due = addDays(today, offset === 0 ? 7 : offset);
      const periodStart = addDays(due, -6);
      return { periodStart, periodEnd: due, dueDate: due };
    }

    case "MONTHLY": {
      // Same day-of-month as anchor.
      const dom = a.getDate();
      const baseYear = today.getFullYear();
      const baseMonth = today.getMonth();
      let candidate = new Date(baseYear, baseMonth, dom);
      if (candidate.getTime() <= today.getTime()) {
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
      if (candidate.getTime() <= today.getTime()) {
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
