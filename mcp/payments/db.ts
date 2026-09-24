import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

// Cliente de Prisma de sólo lectura para el MCP.
//
// No se importa src/lib/prisma ni src/lib/env: el primero es un cliente
// con permiso de escritura y el segundo exige todas las variables del
// app (Supabase, Resend) que este proceso no necesita. Acá alcanza con
// DATABASE_URL.
//
// La garantía de sólo lectura tiene dos capas. Esta es la del proceso:
// una extensión que rechaza toda operación que no sea de lectura antes
// de que llegue a la base, así un error en queries.ts no puede escribir
// por accidente. Va a nivel cliente y no sólo por modelo: así también
// intercepta $queryRaw y $executeRaw, que no pertenecen a ningún modelo
// y un "SELECT" crudo puede esconder un DELETE en un CTE. El MCP no usa
// SQL crudo, así que se bloquea entero.
//
// La otra capa, un rol de Postgres con SELECT y nada más, está
// documentada en el README; es la que protege incluso de un bug acá.

const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

// MCP_DATABASE_URL gana sobre DATABASE_URL: es donde va la conexión con el
// rol de sólo lectura (README), sin tocar la del app.
function connectionString() {
  const url = process.env.MCP_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL (o MCP_DATABASE_URL). Corré el server con --env-file=.env o pasala en el entorno.",
    );
  }
  return url;
}

function makeClient() {
  const base = new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString() }),
    // Un server MCP por stdio habla por stdout: cualquier log ahí rompe
    // el protocolo. Los errores van como eventos y de ahí a stderr.
    log: [{ level: "error", emit: "event" }],
  });
  base.$on("error", (e) => {
    console.error("[surcodia-payments] prisma:", e.message);
  });

  return base.$extends({
    name: "read-only",
    query: {
      $allOperations({ model, operation, args, query }) {
        if (!model || !READ_OPERATIONS.has(operation)) {
          throw new Error(
            `surcodia-payments es de sólo lectura: ${model ?? "SQL crudo"}.${operation} está bloqueado`,
          );
        }
        return query(args);
      },
    },
  });
}

export const db = makeClient();
export type Db = typeof db;
