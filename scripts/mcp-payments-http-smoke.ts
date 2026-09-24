// Prueba de humo de surcodia-payments por HTTP, contra un server que ya
// esté corriendo: el dev local o producción.
//
//   MCP_TOKEN=<token> node --import tsx scripts/mcp-payments-http-smoke.ts http://localhost:3000/api/mcp
//   MCP_TOKEN=<token> node --import tsx scripts/mcp-payments-http-smoke.ts https://surcodia.com/api/mcp
//
// Verifica que sin token o con uno inválido no se ve nada, y que con el
// token las siete herramientas responden. Sólo lee.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = process.argv[2] ?? "http://localhost:3000/api/mcp";
const token = process.env.MCP_TOKEN ?? "";

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "  ok " : "FALLA"} ${label}${detail ? ` · ${detail}` : ""}`);
  if (!ok) failures++;
}

const INIT = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "http-smoke", version: "0" } },
};

async function raw(method: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers },
    body: method === "POST" ? JSON.stringify(INIT) : undefined,
  });
  return res.status;
}

async function main() {
  if (token.length < 32) throw new Error("Falta MCP_TOKEN (32 caracteres o más) en el entorno.");
  console.log(`contra ${url}`);

  // ---- la puerta
  check("sin token: 401", (await raw("POST")) === 401);
  check("token inválido: 401", (await raw("POST", { Authorization: "Bearer " + "x".repeat(40) })) === 401);
  check("token casi igual: 401", (await raw("POST", { Authorization: `Bearer ${token.slice(0, -1)}X` })) === 401);
  check("GET no existe: 405", (await raw("GET", { Authorization: `Bearer ${token}` })) === 405);

  // ---- con token, como un cliente MCP de verdad
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const client = new Client({ name: "http-smoke", version: "0" });
  await client.connect(transport);

  const tools = await client.listTools();
  check("siete herramientas", tools.tools.length === 7, tools.tools.map((t) => t.name).join(", "));

  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const res = await client.callTool({ name, arguments: args });
    if (res.isError) throw new Error(`${name}: ${(res.content as { text?: string }[])[0]?.text}`);
    return res.structuredContent as Record<string, unknown>;
  };

  const h = (await call("health")) as { ok: boolean; counts: { clients: number; invoices: number }; appUrl: string | null };
  check("health", h.ok, `${h.counts.clients} clientes, ${h.counts.invoices} facturas, links a ${h.appUrl}`);

  const od = (await call("get_overdue")) as { count: number; totalAmount: number };
  check("get_overdue", typeof od.count === "number", `${od.count} por USD ${od.totalAmount}`);

  const up = (await call("get_upcoming", { days: 7 })) as { totalAmount: number; projected: { amount: number } };
  check("get_upcoming (usa las reglas del cron)", typeof up.totalAmount === "number", `emitido USD ${up.totalAmount}, proyectado USD ${up.projected.amount}`);

  const clients = (await call("list_clients")) as { count: number };
  check("list_clients", clients.count > 0, `${clients.count} activos`);

  const sm = (await call("payments_summary")) as { month: string; paidThisMonth: { amount: number } };
  check("payments_summary", typeof sm.month === "string", `${sm.month}: cobrado USD ${sm.paidThisMonth.amount}`);

  const inv = (await call("list_invoices", { limit: 3 })) as { count: number };
  check("list_invoices", inv.count > 0);

  const bad = await client.callTool({ name: "list_invoices", arguments: { dueTo: "2026-09-31" } }).then(
    (r) => Boolean(r.isError),
    () => true,
  );
  check("fecha inexistente rechazada", bad);

  await client.close();
  if (failures > 0) {
    console.error(`\n${failures} chequeo(s) fallaron`);
    process.exit(1);
  }
  console.log("\nOK");
}

main().catch((e) => {
  console.error("HTTP SMOKE FALLÓ:", e instanceof Error ? e.message : e);
  process.exit(1);
});
