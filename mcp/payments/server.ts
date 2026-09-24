// surcodia-payments: servidor MCP de sólo lectura sobre la base de
// cobros de Surcodia. Un agente puede contestar quién debe qué, qué
// venció, qué vence esta semana y cómo viene el mes, sin tocar nada.
//
//   node --env-file=.env --import tsx mcp/payments/server.ts
//
// Esta es la entrada por stdio, para clientes que lo lanzan en la misma
// máquina (Claude Code, Claude Desktop, Grok Build). Para clientes en la
// nube (Grok Bot) el mismo server se sirve por HTTP en /api/mcp del app.
// Ver README.md al lado.

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

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPaymentsServer, redact } from "./tools";

async function main() {
  const server = createPaymentsServer();
  await server.connect(new StdioServerTransport());
  console.error("[surcodia-payments] listo (stdio, sólo lectura)");
}

main().catch((e) => {
  console.error("[surcodia-payments] no arrancó:", redact(e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
