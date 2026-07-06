import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";
import {
  BUDGET_OPTIONS,
  CURRENT_STATE_OPTIONS,
  NICHE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  URGENCY_OPTIONS,
  optionLabel,
} from "@/lib/studio/intake";
import { LeadStatusButtons } from "./_components/LeadStatusButtons";

const STATUS_STYLE: Record<string, string> = {
  NEW: "border-sky-300/30 bg-sky-300/[0.08] text-sky-100",
  CONTACTED: "border-yellow-200/25 bg-yellow-200/[0.06] text-yellow-100/90",
  CONVERTED: "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-100",
  ARCHIVED: "border-white/12 bg-white/[0.03] text-foreground/55",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  CONVERTED: "Convertido",
  ARCHIVED: "Archivado",
};

export default async function LeadsPage() {
  const leads = await api.leads.list();
  const news = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Leads
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Proyectos que <span className="font-light text-foreground/70">tocan la puerta</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {leads.length} consultas del formulario · {news} sin responder
        </p>
      </header>

      <div className="space-y-4 reveal" style={{ animationDelay: "60ms" }}>
        {leads.length === 0 && (
          <Card>
            <CardContent>
              <p className="py-4 text-sm text-muted-foreground">
                Todavía no entró ninguna consulta por /contanos.
              </p>
            </CardContent>
          </Card>
        )}
        {leads.map((l) => (
          <Card key={l.id}>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-medium text-foreground/95">
                      {l.name}
                      {l.company && (
                        <span className="ml-2 text-muted-foreground">· {l.company}</span>
                      )}
                    </p>
                    <a
                      href={`mailto:${l.email}`}
                      className="font-mono text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      {l.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] ${STATUS_STYLE[l.status]}`}
                    >
                      {STATUS_LABEL[l.status]}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                      {new Date(l.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                  <Meta k="Nicho" v={optionLabel(NICHE_OPTIONS, l.niche, "es")} />
                  <Meta k="Proyecto" v={optionLabel(PROJECT_TYPE_OPTIONS, l.projectType, "es")} />
                  <Meta k="Hoy tiene" v={optionLabel(CURRENT_STATE_OPTIONS, l.currentState, "es")} />
                  <Meta k="Presupuesto" v={optionLabel(BUDGET_OPTIONS, l.budgetRange, "es")} />
                  <Meta k="Urgencia" v={optionLabel(URGENCY_OPTIONS, l.urgency, "es")} />
                  {l.currentUrl && (
                    <Meta
                      k="URL"
                      v={
                        <a
                          href={l.currentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-white/25 underline-offset-2 hover:text-foreground"
                        >
                          {l.currentUrl}
                        </a>
                      }
                    />
                  )}
                </div>

                <p className="border-l-2 border-white/15 pl-3 text-sm leading-relaxed text-foreground/80">
                  {l.problem}
                </p>

                <div className="flex justify-end">
                  <LeadStatusButtons id={l.id} status={l.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <p className="text-muted-foreground">
      <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">{k}:</span>{" "}
      <span className="text-foreground/85">{v}</span>
    </p>
  );
}
