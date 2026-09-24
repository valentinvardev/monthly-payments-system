import { createHash, timingSafeEqual } from "node:crypto";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createPaymentsServer } from "../../../../mcp/payments/tools";

// surcodia-payments por HTTP, para clientes MCP que corren en la nube y no
// pueden lanzar un proceso en esta máquina (Grok Bot). Son las mismas siete
// herramientas de sólo lectura que mcp/payments/server.ts sirve por stdio.
//
// Vive dentro del app en vez de ser un proceso aparte de PM2: la RAM del
// VPS es lo escaso, y así usa el mismo dominio, el mismo certificado y el
// mismo deploy.
//
// Cerrado por defecto. Sin MCP_TOKEN en el entorno contesta 503: deployar
// este código no expone nada hasta que alguien configure el token a
// propósito. Con token, cada pedido tiene que traer
// "Authorization: Bearer <MCP_TOKEN>".
//
// Sin sesión y con respuestas JSON: cada POST arma su server, contesta y
// se cierra. No quedan streams abiertos detrás de Cloudflare ni estado en
// memoria entre pedidos. GET y DELETE, que en MCP sirven para streams y
// sesiones, no existen acá y Next contesta 405, que es lo que la
// especificación pide cuando el server no los ofrece.

const MIN_TOKEN_LENGTH = 32;

// Compara por hash para que el tiempo de la comparación no dependa de
// cuántos caracteres coinciden ni del largo del token.
function sameToken(given: string, expected: string) {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function jsonError(status: number, message: string, headers: Record<string, string> = {}) {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32001, message }, id: null },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

export async function POST(request: Request) {
  const expected = process.env.MCP_TOKEN;
  if (!expected || expected.length < MIN_TOKEN_LENGTH) {
    return jsonError(503, "surcodia-payments no está habilitado en este server.");
  }

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match || !sameToken(match[1].trim(), expected)) {
    return jsonError(401, "Falta el token o no es válido.", {
      "WWW-Authenticate": 'Bearer realm="surcodia-payments"',
    });
  }

  const server = createPaymentsServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    // En modo JSON la respuesta vuelve completa: cerrar después no corta
    // nada que esté en camino.
    const response = await transport.handleRequest(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } finally {
    await server.close();
  }
}
