// surcodia-payments: servidor MCP de sólo lectura sobre la base de
// cobros de Surcodia. Un agente puede contestar quién debe qué, qué
// venció, qué vence esta semana y cómo viene el mes, sin tocar nada.
//
//   node --env-file=.env --import tsx mcp/payments/server.ts
//
// Habla MCP por stdio. Ver README.md al lado para configurarlo en
// Claude Code o Claude Desktop.

// El app corre en UTC y sus reglas de fechas (src/lib/recurrence.ts)
// hacen la cuenta en hora local; con el proceso en UTC se reusan tal
// cual. "Hoy" en Buenos Aires se calcula aparte, con la zona explícita.
//
// Esta línea corre después de que se cargan los imports (tsx compila el
// archivo a CommonJS y los require van primero). Alcanza igual, porque
// Node lee TZ en cada cálculo y ningún módulo hace cuentas de fecha al
// cargarse. dates.ts verifica que el proceso esté en UTC antes de usar
// las reglas del app, así que si esto dejara de alcanzar, falla en vez
// de devolver fechas corridas.
process.env.TZ = "UTC";

// stdout es el canal del protocolo: un console.log perdido en cualquier
// dependencia lo rompe. Todo lo que se "loguea" va a stderr.
console.log = console.error;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getClient,
  getOverdue,
  getUpcoming,
  health,
  listClients,
  listInvoices,
  paymentsSummary,
} from "./queries";
import { isValidIsoDay } from "./dates";

const INVOICE_STATUS = z.enum(["DRAFT", "PENDING", "PENDING_REVIEW", "PAID", "OVERDUE", "CANCELLED"]);
const ISO_DAY = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD")
  .refine(isValidIsoDay, "Esa fecha no existe (por ejemplo, 2026-09-31)");

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const server = new McpServer({ name: "surcodia-payments", version: "1.0.0" });

function ok(data: Record<string, unknown>) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }], structuredContent: data };
}

// Nunca dejar pasar la cadena de conexión en un mensaje de error.
function redact(message: string) {
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://***");
}

// Envuelve una consulta: su resultado sale como JSON estructurado y como
// texto (para clientes que no leen structuredContent), y cualquier error
// vuelve como resultado de error de la herramienta, redactado, en lugar
// de tirar abajo el server. Genérico sólo en los argumentos: el esquema
// concreto de cada herramienta se pasa directo a registerTool, que así
// puede inferir el tipo que le llega a la consulta.
function run<A>(name: string, fn: (args: A) => Promise<Record<string, unknown>>) {
  return async (args: A) => {
    try {
      return ok(await fn(args));
    } catch (e) {
      const message = redact(e instanceof Error ? e.message : String(e));
      console.error(`[surcodia-payments] ${name}:`, message);
      return { isError: true, content: [{ type: "text" as const, text: `${name} falló: ${message}` }] };
    }
  };
}

server.registerTool(
  "list_clients",
  {
    title: "Clientes y planes",
    description:
      "Clientes con su plan recurrente: monto en USD, frecuencia, y el próximo día en que el cron " +
      "lo va a facturar (null si el plan o el cliente está pausado), con nextAlreadyInvoiced si esa " +
      "factura ya existe. Además cuántas facturas abiertas tiene y la última. Por defecto sólo activos.",
    inputSchema: {
      includeInactive: z.boolean().optional().describe("Incluir clientes pausados (default false)."),
    },
    annotations: READ_ONLY,
  },
  run("list_clients", listClients),
);

server.registerTool(
  "list_invoices",
  {
    title: "Facturas",
    description:
      "Facturas con filtros. Cada una trae cliente, monto en USD, vencimiento, estado tal cual " +
      "está en la base, isOverdue y daysDelta calculados por el día de Buenos Aires (positivo: " +
      "faltan días; negativo: vencida), underReview si hay un comprobante esperando confirmación, " +
      "y el pago confirmado si lo hay. Ordenadas por vencimiento, la más reciente primero; " +
      "truncated=true si hay más que limit. clientName ignora tildes y el orden de las palabras; " +
      "devuelve matchedClients, y si coincide con varios, las facturas vienen mezcladas.",
    inputSchema: {
      status: z.array(INVOICE_STATUS).optional().describe("Uno o más estados."),
      clientId: z.string().optional(),
      clientName: z.string().optional().describe("Búsqueda parcial por nombre o email."),
      dueFrom: ISO_DAY.optional().describe("Vencimiento desde, inclusive."),
      dueTo: ISO_DAY.optional().describe("Vencimiento hasta, inclusive."),
      underReview: z
        .boolean()
        .optional()
        .describe("true: sólo facturas abiertas con un comprobante esperando confirmación."),
      limit: z.number().int().min(1).max(200).optional().describe("Default 50, máximo 200."),
    },
    annotations: READ_ONLY,
  },
  run("list_invoices", listInvoices),
);

server.registerTool(
  "get_overdue",
  {
    title: "Vencidas",
    description:
      "Facturas abiertas cuyo vencimiento ya pasó según el día de Buenos Aires, estén marcadas " +
      "OVERDUE o todavía PENDING. Con más días de atraso primero, y el total adeudado.",
    inputSchema: {},
    annotations: READ_ONLY,
  },
  run("get_overdue", getOverdue),
);

server.registerTool(
  "get_upcoming",
  {
    title: "Próximos vencimientos",
    description:
      "Lo que vence entre hoy y los próximos N días (default 14). invoices: facturas ya emitidas, " +
      "de la más próxima a la más lejana, con totalAmount. projected: cobros de planes que el " +
      "cron todavía no emitió (los emite la noche anterior a cada vencimiento), con su total; " +
      "projected.missed: cobros cuyo día el cron ya pasó sin emitirlos, que no van a llegar solos. " +
      "totalWithProjected suma emitidas y proyectadas, sin las perdidas.",
    inputSchema: {
      days: z.number().int().min(0).max(365).optional().describe("Ventana en días desde hoy (default 14)."),
    },
    annotations: READ_ONLY,
  },
  run("get_upcoming", getUpcoming),
);

server.registerTool(
  "get_client",
  {
    title: "Ficha de un cliente",
    description:
      "Un cliente por id o por nombre (sin importar tildes ni orden de las palabras): plan, " +
      "facturas abiertas, última pagada, comprobantes esperando revisión y totales. Si el nombre " +
      "coincide con varios, devuelve la lista para elegir.",
    inputSchema: {
      clientId: z.string().optional(),
      clientName: z.string().optional().describe("Búsqueda parcial por nombre o email."),
    },
    annotations: READ_ONLY,
  },
  run("get_client", getClient),
);

server.registerTool(
  "payments_summary",
  {
    title: "Resumen de caja",
    description:
      "Foto de caja en USD, cada bloque con cantidad y suma: paidThisMonth (pagadas este mes), " +
      "pending (emitidas y no vencidas) y overdue (vencidas), que juntas son todo lo abierto; " +
      "proofUnderReview (de esas, las que tienen un comprobante esperando confirmación); y " +
      "upcoming (lo que vence en N días, con projected para lo que el cron todavía no emitió).",
    inputSchema: {
      upcomingDays: z.number().int().min(0).max(365).optional().describe("Ventana de 'por vencer' (default 14)."),
    },
    annotations: READ_ONLY,
  },
  run("payments_summary", paymentsSummary),
);

server.registerTool(
  "health",
  {
    title: "Estado",
    description: "Verifica la conexión a la base y devuelve conteos básicos.",
    inputSchema: {},
    annotations: READ_ONLY,
  },
  run("health", health),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[surcodia-payments] listo (stdio, sólo lectura)");
}

main().catch((e) => {
  console.error("[surcodia-payments] no arrancó:", redact(e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
