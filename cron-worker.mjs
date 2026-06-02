// Cron worker para Surcodia.
// No usa node-cron ni el cron del sistema — simplemente despierta cada
// 24h y hace fetch al endpoint /api/cron/billing del propio app. PM2 lo
// mantiene vivo igual que el server principal.
//
// Uso (en el VPS):
//   pm2 start cron-worker.mjs --name surcodia-cron --node-args="--env-file=.env"
//   pm2 save
//
// Las variables que necesita ya están en el .env del proyecto: APP_URL
// y CRON_SECRET. Node 20.6+ las carga vía --env-file.

const base = process.env.APP_URL?.replace(/\/+$/, "");
const secret = process.env.CRON_SECRET;

if (!base || !secret) {
  console.error(
    "[cron] APP_URL o CRON_SECRET no están seteadas. Verificá el .env y reiniciá.",
  );
  process.exit(1);
}

const url = `${base}/api/cron/billing?secret=${secret}`;
const safeUrl = `${base}/api/cron/billing?secret=***`;
const INTERVAL_MS = 24 * 60 * 60 * 1000;

async function tick() {
  const ts = new Date().toISOString();
  try {
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    console.log(`[cron] ${ts} → ${res.status} ${text.slice(0, 400)}`);
  } catch (err) {
    console.error(`[cron] ${ts} fallo:`, err.message ?? err);
  }
}

console.log(
  `[cron] worker arriba, tick cada ${
    INTERVAL_MS / 3600000
  }h contra ${safeUrl}`,
);

// Primer tick a los 30 segundos del boot — le da tiempo al app server
// (PM2 levanta en paralelo, el server puede no haber bindeado todavía).
setTimeout(tick, 30_000);
setInterval(tick, INTERVAL_MS);
