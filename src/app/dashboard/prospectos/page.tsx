import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";
import {
  RESPONSE_RATE_FLOOR,
  RESPONSE_RATE_MIN_SAMPLE,
  STAGE_LABEL,
  STAGE_ORDER,
  type Stage,
} from "@/lib/studio/prospects";
import { ProspectRow, type ProspectRowData } from "./_components/ProspectRow";

// Los filtros viven en la URL y no en estado del cliente: así el orden de
// trabajo del día es un link que se puede guardar y compartir.
type Search = {
  stage?: string;
  priority?: string;
  q?: string;
  califican?: string;
};

const isStage = (v: string | undefined): v is Stage =>
  v != null && (STAGE_ORDER as string[]).includes(v);

export default async function ProspectosPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const stage = isStage(sp.stage) ? sp.stage : undefined;
  const priority = sp.priority === "1" ? 1 : sp.priority === "2" ? 2 : undefined;
  const onlyQualified = sp.califican === "1";
  const search = sp.q?.trim() || undefined;

  const [stats, rows] = await Promise.all([
    api.prospects.stats(),
    api.prospects.list({ stage, priority, onlyQualified, search }),
  ]);

  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Prospección
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          A quién le <span className="font-light text-foreground/70">escribo hoy</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {stats.total} prospectos · {stats.priority1} prioridad 1 ·{" "}
          {stats.qualified} califican 3 de 3
        </p>
      </header>

      {stats.total === 0 ? (
        <Card>
          <CardContent>
            <p className="py-4 text-sm text-muted-foreground">
              Todavía no hay prospectos cargados. Importá la planilla con{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">
                node --env-file=.env scripts/import-prospects.mjs prospectos-argentina.xlsx
              </code>
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* La señal a vigilar. Va arriba de todo porque es la única que
              cambia qué hacer: si está en rojo, el problema es el mensaje. */}
          <section className="reveal" style={{ animationDelay: "40ms" }}>
            <div className="grid gap-px overflow-hidden rounded-xl border border-white/12 bg-white/10 sm:grid-cols-4">
              <Stat label="Contactados" value={stats.contacted} />
              <Stat label="Respondieron" value={stats.replied} />
              <Stat
                label="Tasa de respuesta"
                value={pct(stats.rate)}
                tone={
                  stats.belowFloor ? "bad" : stats.enoughSample && stats.rate > 0 ? "good" : "muted"
                }
              />
              <Stat label="Ganados" value={stats.stageCount.GANADO ?? 0} tone="good" />
            </div>

            {stats.belowFloor && (
              <p className="mt-3 rounded-lg border border-red-300/25 bg-red-300/[0.06] p-3 text-[13px] leading-relaxed text-red-100/90">
                <strong className="font-medium">Pará y reescribí el mensaje.</strong> Con{" "}
                {stats.contacted} contactos hechos la tasa está en {pct(stats.rate)}, debajo del{" "}
                {pct(RESPONSE_RATE_FLOOR)}. A esta altura el problema es el mensaje o el nicho, no
                el volumen. Usá las palabras textuales que te dijeron en las llamadas.
              </p>
            )}
            {!stats.enoughSample && stats.contacted > 0 && (
              <p className="mt-3 text-[12px] text-muted-foreground">
                La tasa se vuelve confiable a partir de {RESPONSE_RATE_MIN_SAMPLE} contactos. Vas{" "}
                {stats.contacted}.
              </p>
            )}
          </section>

          {/* Embudo */}
          <section className="reveal" style={{ animationDelay: "80ms" }}>
            <div className="flex flex-wrap gap-2">
              <FilterChip href="/dashboard/prospectos" active={!stage && !priority && !onlyQualified && !search}>
                Todos ({stats.total})
              </FilterChip>
              <FilterChip href="/dashboard/prospectos?priority=1" active={priority === 1}>
                Prioridad 1 ({stats.priority1})
              </FilterChip>
              <FilterChip href="/dashboard/prospectos?califican=1" active={onlyQualified}>
                Califican 3 de 3 ({stats.qualified})
              </FilterChip>
              {STAGE_ORDER.map((s) => (
                <FilterChip
                  key={s}
                  href={`/dashboard/prospectos?stage=${s}`}
                  active={stage === s}
                >
                  {STAGE_LABEL[s]} ({stats.stageCount[s] ?? 0})
                </FilterChip>
              ))}
            </div>
          </section>

          <section className="space-y-3 reveal" style={{ animationDelay: "120ms" }}>
            <p className="text-[11px] text-muted-foreground">
              {rows.length} {rows.length === 1 ? "prospecto" : "prospectos"} en esta vista ·
              ordenados por prioridad y después por los que califican
            </p>
            {rows.length === 0 && (
              <Card>
                <CardContent>
                  <p className="py-4 text-sm text-muted-foreground">
                    Ningún prospecto con ese filtro.
                  </p>
                </CardContent>
              </Card>
            )}
            {rows.map((p) => (
              <ProspectRow key={p.id} p={p as unknown as ProspectRowData} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string | number;
  tone?: "good" | "bad" | "muted";
}) {
  const color =
    tone === "good"
      ? "text-emerald-200"
      : tone === "bad"
        ? "text-red-200"
        : "text-foreground/90";
  return (
    <div className="bg-[#0f0f0f] p-5">
      <p className={`font-display text-2xl font-medium tabular-nums ${color}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
        {label}
      </p>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
        active
          ? "border-white/30 bg-white/[0.10] text-foreground"
          : "border-white/12 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground/90"
      }`}
    >
      {children}
    </Link>
  );
}
