# surcodia-payments

Servidor MCP de **sólo lectura** sobre la base de cobros de Surcodia. Le da a un
agente lo justo para contestar: quién debe qué, qué venció, qué vence esta
semana y cómo viene el mes. No crea ni modifica nada; eso sigue siendo del
panel.

Corre dentro de este repo: usa el cliente de Prisma ya generado y las reglas
de vencimiento del app (`src/lib/recurrence.ts`), así no hay un segundo esquema
que mantener. Tiene dos entradas con las mismas herramientas, definidas en
`tools.ts`:

- **stdio** (`server.ts`), para clientes que lo lanzan en la misma máquina:
  Claude Code, Claude Desktop, Grok Build.
- **HTTP** (`src/app/api/mcp/route.ts`), para clientes en la nube que no
  pueden lanzar nada acá: Grok Bot. Vive dentro del app, en
  `https://surcodia.com/api/mcp`, con token.

## Herramientas

| Herramienta | Para qué | Entrada |
|---|---|---|
| `list_clients` | Clientes con plan, próximo día de facturación y si ya tiene factura, facturas abiertas y última factura | `includeInactive?` |
| `list_invoices` | Facturas con filtros | `status[]?`, `clientId?`, `clientName?`, `dueFrom?`, `dueTo?`, `underReview?`, `limit?` |
| `get_overdue` | Abiertas con el vencimiento ya pasado, más atrasadas primero, con total | — |
| `get_upcoming` | Lo que vence entre hoy y N días: facturas emitidas y cobros que el cron todavía no emitió | `days?` (14) |
| `get_client` | Un cliente por id o nombre: plan, abiertas, última pagada, comprobantes en revisión, totales | `clientId?` o `clientName?` |
| `payments_summary` | Pagado este mes, pendiente, vencido, con comprobante en revisión, por vencer | `upcomingDays?` (14) |
| `health` | Conexión a la base y conteos | — |

Preguntas que un agente puede contestar sólo con esto: *«¿quién me debe?»*,
*«¿qué venció?»*, *«¿qué vence esta semana?»*, *«¿cómo viene septiembre?»*,
*«¿hay comprobantes para revisar?»*.

### Qué significa cada campo que puede confundir

- **`status`** es el de la base, tal cual. Para saber si una factura está
  vencida, **`isOverdue`**, que se calcula por el día de Buenos Aires. Difieren
  una hora por día: el cron corre a las 22:55 de Buenos Aires con el día UTC y
  marca OVERDUE lo que vence hoy antes de que termine el día.
- **`underReview`**: el cliente subió un comprobante y falta que el admin lo
  confirme. La factura sigue PENDING u OVERDUE mientras tanto; el estado
  `PENDING_REVIEW` de factura existe en el esquema pero el app no lo usa.
- **`payment`**: en una pagada, el pago confirmado; en una abierta, el
  comprobante en revisión. Los intentos de Mercado Pago abandonados no
  cuentan. **`markedPaidManually`**: pagada sin pago registrado, marcada a mano
  desde el panel.
- **`plan.nextDueDate`**: el próximo día en que el cron va a emitir la factura,
  con la misma regla que usa el cron (sólo planes activos de clientes activos,
  el día exacto). Es `null` si el plan o el cliente está pausado.
- **`projected`** en `get_upcoming` y `payments_summary.upcoming`: cobros que
  el cron va a emitir en la ventana y todavía no tienen factura. El cron emite
  cada factura la noche anterior a su vencimiento, así que sin esto "lo que
  vence esta semana" vería sólo lo ya emitido.
- **`projected.missed`** y **`plan.missedBills`**: cobros cuyo día el cron ya
  procesó sin emitir la factura (falló esa noche, se borró la factura, se
  cambió el plan). El cron no recupera días salteados, así que no llegan solos:
  hay que generarlos desde el panel. No se suman a lo que va a entrar. El corte
  asume que el cron corre a las 01:55 UTC, que es cuando corre hoy
  (`CRON_RUN_UTC_MINUTES` en `dates.ts`).
- **`truncated`** en `list_invoices`: hay más facturas que `limit`; `count`
  es lo que vino, no el total.
- **`clientName`**: busca en nombre y mail, sin importar mayúsculas, tildes ni
  el orden de las palabras.
- **`payments_summary`**: `pending` (emitidas, no vencidas) y `overdue`
  (vencidas) son disjuntas y juntas son todo lo abierto. `proofUnderReview` no
  se suma: es un subconjunto de esas dos.

Convenciones de salida: fechas ISO (`YYYY-MM-DD` para vencimientos, instante
completo para pagos), montos como número con `currency: "USD"` (la moneda en
que se factura; si hay foto en pesos viene aparte en `ars`). Un filtro que no
matchea devuelve listas vacías, no errores. Una fecha que no existe
(`2026-09-31`) es un error de entrada, no se corre al mes siguiente.

### Fechas y "hoy"

"Hoy" es el día de calendario en **America/Argentina/Buenos_Aires**. Los
vencimientos de la base están guardados a la medianoche UTC del día que
representan (el app corre en UTC), así que se leen por su fecha UTC y se
comparan en días enteros. Los instantes (`paidAt`, `payment.at`,
`submittedAt`) salen en UTC con su día de Buenos Aires al lado (`paidOn`,
`payment.on`, `submittedOn`), y `since` de un cliente ya es el día de Buenos
Aires.

El server fija `TZ=UTC` en su proceso para reusar las reglas del app, que
calculan en hora local. Si esas funciones se llaman desde otro proceso sin
eso, fallan con un error en vez de devolver fechas corridas un día.

## Variables de entorno

| Variable | Obligatoria | Qué es |
|---|---|---|
| `DATABASE_URL` | sí | Postgres de Supabase, la misma del app (pooler, `?pgbouncer=true`) |
| `MCP_DATABASE_URL` | no | Conexión propia del MCP, para el rol de sólo lectura. Gana sobre `DATABASE_URL` |
| `MCP_TOKEN` | para HTTP | Token de `/api/mcp`, 32 caracteres o más. Sin él, la ruta contesta 503 |
| `MCP_APP_URL` | no | Base de los links, p. ej. `https://surcodia.com`. Gana sobre `APP_URL` |
| `APP_URL` | no | Se usa si no hay `MCP_APP_URL` |

Toma el `.env` del repo con `--env-file=.env`. Ese `.env` tiene `APP_URL` en
`http://localhost:3000`, porque es el de desarrollo, pero los datos son los de
producción. Por eso `.mcp.json` y los lanzadores fijan
`MCP_APP_URL=https://surcodia.com`: los links abren producción. `--env-file`
no pisa una variable que ya viene seteada.

Cada cliente trae `dashboardUrl` (su ficha en el panel). Cada factura trae
`dashboardUrl` (la ficha del cliente, porque el panel no tiene página por
factura) y `clientPortalUrl` (el link para mandarle al cliente; un admin que lo
abre termina en el panel).

## Configurar

### Claude Code

Ya está declarado en `.mcp.json` en la raíz del repo: abriendo Claude Code en
este directorio aparece como `surcodia-payments` (la primera vez pide aprobar
el server del proyecto). Para verificar: `/mcp`.

Claude Code tiene que abrirse en la **raíz** del repo. Arranca el server en el
directorio donde se abrió, y desde una subcarpeta ni `.env` ni
`mcp/payments/server.ts` se encuentran: el server aparece como fallido en
`/mcp` con `node: .env: not found`.

### Claude Desktop

Claude Desktop no fija el directorio de trabajo, así que se usa el lanzador,
que se para solo en la raíz del repo. En `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "surcodia-payments": {
      "command": "C:\\Users\\optit\\OneDrive\\.wdc\\Documentos\\surcodia-plataforma\\mcp\\payments\\start.cmd"
    }
  }
}
```

En macOS o Linux, `start.sh` en lugar de `start.cmd` (darle permiso de
ejecución una vez: `chmod +x mcp/payments/start.sh`).

### Grok Bot y otros clientes en la nube

Grok Bot corre en la nube de xAI: no puede lanzar un proceso en tu máquina ni
llegar a `localhost`. Se conecta por HTTPS a `https://surcodia.com/api/mcp`,
que sirve las mismas herramientas desde el app que ya corre en el VPS: sin
proceso nuevo en PM2, sin puerto ni certificado nuevos.

La ruta está **cerrada por defecto**: sin `MCP_TOKEN` contesta 503, así que
deployar el código no expone nada. Para abrirla, en el VPS:

1. Generar un token (una vez) y guardarlo en el `.env` del app, junto con la
   base de los links:

   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

   ```
   MCP_TOKEN=<el token>
   MCP_APP_URL=https://surcodia.com
   ```

2. Deployar como siempre, instalando la dependencia nueva
   (`@modelcontextprotocol/sdk`):

   ```
   git pull && npm install && npm run build && pm2 restart <app>
   ```

3. Verificar desde afuera, con el mismo token:

   ```
   MCP_TOKEN=<el token> node --import tsx scripts/mcp-payments-http-smoke.ts https://surcodia.com/api/mcp
   ```

   Comprueba que sin token o con uno inválido contesta 401, y que con el
   token responden las siete herramientas.

En Grok Bot, pedirle en el chat que agregue un server MCP propio con la URL y
el header de autenticación:

> Agregá un servidor MCP personalizado llamado surcodia-payments en
> https://surcodia.com/api/mcp con el header `Authorization: Bearer <el token>`

Detalles del endpoint:

- **Sin sesión y con respuestas JSON.** Cada pedido es independiente; no hay
  streams abiertos detrás de Cloudflare. `GET` y `DELETE` contestan 405, que es
  lo que la especificación pide cuando el server no ofrece streams ni sesiones.
- **El proceso tiene que estar en UTC**, igual que el resto del app, que
  depende de eso para las fechas. Si no lo está, las herramientas que calculan
  vencimientos devuelven un error en vez de fechas corridas.
- **Rotar el token** es cambiar `MCP_TOKEN` y reiniciar; el token viejo deja de
  servir en ese momento. Hay que actualizarlo también en Grok Bot.
- **Cloudflare** está delante del dominio. Si algún día pone un desafío a los
  pedidos que no vienen de un navegador, `/api/mcp` necesita una regla que lo
  saltee. Hoy el webhook de Mercado Pago pasa, que es la misma situación.
- Ahora que la base es alcanzable desde internet a través de esta ruta, el rol
  de sólo lectura de la sección siguiente deja de ser opcional en la práctica:
  va en `MCP_DATABASE_URL` del VPS y el MCP lo usa en lugar de `DATABASE_URL`.

### A mano

```
npm run -s mcp:payments       # levanta el server por stdio
npm run mcp:payments:smoke    # lo levanta y prueba las siete herramientas
```

El `-s` importa si un cliente MCP lanza el server por npm: sin él, npm escribe
su encabezado en stdout, que es el canal del protocolo. Las configs de arriba
llaman a `node` directo y no tienen ese problema.

## Sólo lectura, en dos capas

**1. En el proceso.** `db.ts` envuelve a Prisma con una extensión que rechaza,
antes de que llegue a la base, toda operación que no sea de lectura
(`create`, `update`, `delete`, `upsert`…) y todo SQL crudo (`$executeRaw`,
`$queryRaw`: un "SELECT" crudo puede esconder un DELETE). Un bug en una
consulta no puede escribir. La prueba de humo lo verifica.

**2. En la base (recomendado).** Un rol de Postgres que sólo puede leer las
cuatro tablas, para usarlo en el `DATABASE_URL` del MCP en lugar del rol
`postgres` del app. Con eso, ni un bug ni un cambio futuro en este código
pueden escribir. Las tablas tienen RLS activo, así que el rol necesita
políticas de lectura además del `GRANT`; sin ellas ve cero filas.

```sql
create role surcodia_mcp_read login password '<elegir-una>';
grant usage on schema public to surcodia_mcp_read;
grant select on public."Client", public."RecurringPlan", public."Invoice", public."Payment"
  to surcodia_mcp_read;

create policy mcp_read on public."Client"        for select to surcodia_mcp_read using (true);
create policy mcp_read on public."RecurringPlan" for select to surcodia_mcp_read using (true);
create policy mcp_read on public."Invoice"       for select to surcodia_mcp_read using (true);
create policy mcp_read on public."Payment"       for select to surcodia_mcp_read using (true);
```

Después, para el MCP, el usuario va con el sufijo del proyecto: el pooler de
Supabase decide a qué proyecto va la conexión por el nombre de usuario. Es el
mismo sufijo que tiene el usuario `postgres.<project-ref>` del `DATABASE_URL`
actual.

```
DATABASE_URL=postgresql://surcodia_mcp_read.<project-ref>:<clave>@<host-del-pooler>:6543/postgres?pgbouncer=true
```

Sin el sufijo, el pooler contesta `Tenant or user not found`.

## Qué no hace

Crear clientes o facturas, marcar pagos, mandar mails o WhatsApp, ni nada de
Mercado Pago. Todo eso vive en el panel y en tRPC. Tampoco expone la cadena
de conexión: los errores que devuelve se redactan antes de salir.
