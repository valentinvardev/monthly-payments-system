// Prueba de humo del MCP surcodia-payments contra la base real.
//
//   npm run mcp:payments:smoke
//
// 1. Verifica que el cliente de sólo lectura bloquea escrituras y SQL crudo.
// 2. Levanta el server por stdio, como lo haría Claude, llama a las siete
//    herramientas y comprueba las reglas que ya se rompieron una vez.
//
// Lee la base de producción y no escribe nada.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { db } from "../mcp/payments/db";

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "  ok " : "FALLA"} ${label}${detail ? ` · ${detail}` : ""}`);
  if (!ok) failures++;
}

async function expectBlocked(label: string, attempt: () => Promise<unknown>) {
  try {
    await attempt();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    check(`guard: ${label}`, msg.includes("sólo lectura"), msg.slice(0, 90));
    return;
  }
  check(`guard: ${label}`, false, "la operación pasó");
}

// Los intentos apuntan a nada ("__nunca__", un SELECT): si el guard
// fallara, igual no cambian ninguna fila.
async function guard() {
  await expectBlocked("update de modelo", () =>
    db.client.updateMany({ where: { id: "__nunca__" }, data: { notes: "x" } }),
  );
  await expectBlocked("$executeRaw", () => db.$executeRawUnsafe("SELECT 1"));
  await expectBlocked("$queryRaw", () => db.$queryRawUnsafe("SELECT 1"));
}

type Invoice = {
  client: string;
  dueDate: string;
  status: string;
  isOverdue: boolean;
  underReview: boolean;
  daysDelta: number | null;
  daysOverdue: number | null;
  payment: { method: string; status: string } | null;
  markedPaidManually: boolean;
  dashboardUrl?: string;
  clientPortalUrl?: string;
};

async function main() {
  await guard();

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--env-file=.env", "--import", "tsx", "mcp/payments/server.ts"],
    env: { ...(process.env as Record<string, string>), MCP_APP_URL: "https://surcodia.com" },
    stderr: "inherit",
  });
  const client = new Client({ name: "smoke", version: "0.0.0" });
  await client.connect(transport);

  const tools = await client.listTools();
  check("siete herramientas", tools.tools.length === 7, tools.tools.map((t) => t.name).join(", "));
  check(
    "todas marcadas de sólo lectura",
    tools.tools.every((t) => t.annotations?.readOnlyHint === true),
  );

  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const res = await client.callTool({ name, arguments: args });
    if (res.isError) {
      const text = (res.content as { text?: string }[])[0]?.text;
      throw new Error(`${name} devolvió error: ${text}`);
    }
    return res.structuredContent as Record<string, unknown>;
  };

  // Una entrada inválida tiene que volver como error, no como datos.
  const rejects = async (name: string, args: Record<string, unknown>) => {
    try {
      const res = await client.callTool({ name, arguments: args });
      return Boolean(res.isError);
    } catch {
      return true;
    }
  };

  // ---- health y links
  const h = (await call("health")) as { ok: boolean; counts: { clients: number; invoices: number }; appUrl: string };
  check("health", h.ok === true, `${h.counts.clients} clientes, ${h.counts.invoices} facturas`);
  check("MCP_APP_URL gana sobre el APP_URL del .env", h.appUrl === "https://surcodia.com", h.appUrl);

  // ---- clientes y planes
  const all = (await call("list_clients", { includeInactive: true })) as {
    clients: { name: string; active: boolean; plan: { active: boolean; billing: boolean; nextDueDate: string | null } | null }[];
  };
  const paused = all.clients.filter((c) => !c.active && c.plan);
  check(
    "cliente pausado: sin próximo cobro",
    paused.every((c) => c.plan!.billing === false && c.plan!.nextDueDate === null),
    paused.map((c) => `${c.name}=${c.plan!.nextDueDate}`).join(" ") || "(no hay pausados con plan)",
  );
  const billing = all.clients.filter((c) => c.plan?.billing);
  check(
    "cliente activo con plan activo: tiene próximo cobro",
    billing.length > 0 && billing.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.plan!.nextDueDate ?? "")),
    billing.map((c) => `${c.name}=${c.plan!.nextDueDate}`).join(" | "),
  );

  // ---- facturas
  const recent = (await call("list_invoices", { limit: 50 })) as { count: number; invoices: Invoice[] };
  check("list_invoices", recent.count > 0, `${recent.count} facturas`);
  check(
    "links de factura a producción",
    recent.invoices.every((i) => i.clientPortalUrl?.startsWith("https://surcodia.com/portal/invoice/")),
  );
  const paid = recent.invoices.filter((i) => i.status === "PAID");
  check(
    "pagada: el pago mostrado es el confirmado, nunca un intento",
    paid.every((i) => i.payment === null || i.payment.status === "CONFIRMED"),
  );
  check(
    "pagada sin pago confirmado: markedPaidManually",
    paid.every((i) => i.markedPaidManually === (i.payment === null)),
    `${paid.filter((i) => i.markedPaidManually).length} de ${paid.length} marcadas a mano`,
  );
  check(
    "cerradas: sin días de atraso",
    paid.every((i) => i.daysDelta === null && i.isOverdue === false),
  );

  const none = (await call("list_invoices", { clientName: "zzz-no-existe" })) as { count: number; invoices: unknown[]; matchedClients: unknown[] };
  check(
    "filtro sin resultados: listas vacías",
    none.count === 0 && none.invoices.length === 0 && Array.isArray(none.matchedClients),
  );
  const many = (await call("list_invoices", { clientName: "an" })) as { matchedClients: unknown[]; hint?: string };
  check(
    "nombre ambiguo: devuelve las coincidencias y avisa",
    many.matchedClients.length > 1 ? Boolean(many.hint) : true,
    `${many.matchedClients.length} coincidencias`,
  );
  const review = (await call("list_invoices", { underReview: true })) as { invoices: Invoice[] };
  check(
    "underReview: sólo abiertas con comprobante",
    review.invoices.every((i) => i.underReview && i.status !== "PAID"),
    `${review.invoices.length} en revisión`,
  );

  check("fecha inexistente rechazada", await rejects("list_invoices", { dueTo: "2026-09-31" }));
  check("mes inexistente rechazado", await rejects("list_invoices", { dueFrom: "2026-13-01" }));
  const sept = (await call("list_invoices", { dueFrom: "2026-09-01", dueTo: "2026-09-30" })) as { invoices: Invoice[] };
  check(
    "rango inclusivo y sin desbordes",
    sept.invoices.every((i) => i.dueDate >= "2026-09-01" && i.dueDate <= "2026-09-30"),
    `${sept.invoices.length} en septiembre`,
  );

  // ---- vencidas y por vencer, por el día de Buenos Aires
  const od = (await call("get_overdue")) as { today: string; count: number; totalAmount: number; invoices: Invoice[] };
  check(
    "vencidas: todas antes de hoy y con días de atraso",
    od.invoices.every((i) => i.dueDate < od.today && i.isOverdue && (i.daysOverdue ?? 0) > 0),
    `${od.count} por USD ${od.totalAmount}: ` + od.invoices.map((i) => `${i.client} ${i.daysOverdue}d`).join(" | "),
  );
  check(
    "vencidas: las más atrasadas primero",
    od.invoices.every((inv, k) => k === 0 || od.invoices[k - 1].dueDate <= inv.dueDate),
  );

  const up = (await call("get_upcoming", { days: 14 })) as {
    today: string;
    until: string;
    totalAmount: number;
    invoices: Invoice[];
    projected: { count: number; amount: number; bills: { client: string; dueDate: string; amount: number }[] };
    totalWithProjected: number;
  };
  check(
    "por vencer: emitidas dentro de la ventana, ninguna vencida",
    up.invoices.every((i) => i.dueDate >= up.today && i.dueDate <= up.until && !i.isOverdue),
    `USD ${up.totalAmount} emitido`,
  );
  check(
    "por vencer: cobros proyectados dentro de la ventana",
    up.projected.bills.every((b) => b.dueDate >= up.today && b.dueDate <= up.until),
    `${up.projected.count} por USD ${up.projected.amount}: ` + up.projected.bills.map((b) => `${b.client} ${b.dueDate}`).join(" | "),
  );
  check(
    "por vencer: el total suma emitido y proyectado",
    Math.abs(up.totalWithProjected - (up.totalAmount + up.projected.amount)) < 0.005,
  );
  check(
    "por vencer: un cobro proyectado no duplica una factura emitida",
    up.projected.bills.every((b) => !up.invoices.some((i) => i.client === b.client && i.dueDate === b.dueDate)),
  );

  // ---- ficha de cliente
  const gc = (await call("get_client", { clientName: "maritano" })) as {
    client: { name: string; since: string; totals: { openCount: number }; lastPaidInvoice: Invoice | null; pendingReviewPayments: unknown[] } | null;
  };
  check(
    "get_client por nombre",
    gc.client !== null,
    gc.client ? `${gc.client.name}, cliente desde ${gc.client.since}, ${gc.client.totals.openCount} abiertas` : "",
  );
  const gz = (await call("get_client", { clientName: "zzz-no-existe" })) as { client: unknown; matches: unknown[] };
  check("get_client inexistente: vacío, no error", gz.client === null && gz.matches.length === 0);

  // ---- resumen
  const sm = (await call("payments_summary")) as {
    paidThisMonth: { amount: number };
    pending: { count: number; amount: number };
    overdue: { count: number; amount: number };
    proofUnderReview: { count: number };
    upcoming: { amount: number; projected: { amount: number } };
  };
  check(
    "resumen: vencido coincide con get_overdue",
    sm.overdue.count === od.count && Math.abs(sm.overdue.amount - od.totalAmount) < 0.005,
  );
  check(
    "resumen: por vencer coincide con get_upcoming",
    Math.abs(sm.upcoming.amount - up.totalAmount) < 0.005 &&
      Math.abs(sm.upcoming.projected.amount - up.projected.amount) < 0.005,
  );
  console.log("payments_summary:", JSON.stringify(sm));

  await client.close();
  await db.$disconnect();

  if (failures > 0) {
    console.error(`\n${failures} chequeo(s) fallaron`);
    process.exit(1);
  }
  console.log("\nOK");
}

main().catch((e) => {
  console.error("SMOKE FALLÓ:", e);
  process.exit(1);
});
