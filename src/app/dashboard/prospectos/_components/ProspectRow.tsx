"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";
import {
  ACTIVITY_LABEL,
  CHANNEL_LABEL,
  STAGE_LABEL,
  STAGE_ORDER,
  TRI_LABEL,
  type Channel,
  type Stage,
  type Tri,
} from "@/lib/studio/prospects";

type Activity = {
  id: string;
  kind: keyof typeof ACTIVITY_LABEL;
  body: string | null;
  createdAt: Date | string;
};

export type ProspectRowData = {
  id: string;
  name: string;
  zone: string;
  segment: string;
  email: string | null;
  instagram: string | null;
  website: string | null;
  phone: string | null;
  priority: number;
  usesMercadoPago: Tri;
  over100Students: Tri;
  chargesMonthly: Tri;
  frictionNote: string | null;
  stage: Stage;
  contactedAt: Date | string | null;
  channel: Channel | null;
  followUpAt: Date | string | null;
  qualifies: boolean;
  followUpDue: boolean;
  activities: Activity[];
};

const STAGE_STYLE: Record<Stage, string> = {
  SIN_CONTACTAR: "border-white/12 bg-white/[0.03] text-foreground/55",
  CONTACTADO: "border-yellow-200/25 bg-yellow-200/[0.06] text-yellow-100/90",
  RESPONDIO: "border-sky-300/30 bg-sky-300/[0.08] text-sky-100",
  LLAMADA_AGENDADA: "border-sky-300/30 bg-sky-300/[0.08] text-sky-100",
  PROPUESTA_ENVIADA: "border-violet-300/30 bg-violet-300/[0.08] text-violet-100",
  GANADO: "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-100",
  PERDIDO: "border-red-300/25 bg-red-300/[0.06] text-red-100/85",
  DESCARTADO: "border-white/12 bg-white/[0.03] text-foreground/40",
};

const QUESTIONS = [
  { field: "usesMercadoPago", label: "Usa Mercado Pago" },
  { field: "over100Students", label: "+100 alumnos" },
  { field: "chargesMonthly", label: "Cobra mensual" },
] as const;

const TRI_ORDER: Tri[] = ["SI", "NO", "NO_SE"];

// El mensaje de apertura sale de la nota de fricción: es lo concreto y
// verificable que separa un contacto de un mensaje de vendedor genérico.
function openingMessage(p: ProspectRowData) {
  const friction = p.frictionNote?.trim();
  return (
    `Hola! Les escribo de SurCodia. Entré a la web de ${p.name} como si fuera un padre ` +
    `queriendo inscribir a un hijo` +
    (friction ? ` y vi que ${friction}` : "") +
    `. Trabajamos justo eso: que las cuotas se cobren solas y sepas quién debe qué sin abrir la planilla. ` +
    `¿Te sirve que te muestre en 10 minutos cómo quedaría?`
  );
}

export function ProspectRow({ p }: { p: ProspectRowData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(p.frictionNote ?? "");
  const [activity, setActivity] = useState("");

  const refresh = () => start(() => router.refresh());

  const qualify = trpc.prospects.qualify.useMutation({ onSuccess: refresh });
  const setStage = trpc.prospects.setStage.useMutation({ onSuccess: refresh });
  const setNoteM = trpc.prospects.setFrictionNote.useMutation({ onSuccess: refresh });
  const addActivity = trpc.prospects.addActivity.useMutation({
    onSuccess: () => {
      setActivity("");
      refresh();
    },
  });

  const busy =
    pending ||
    qualify.isPending ||
    setStage.isPending ||
    setNoteM.isPending ||
    addActivity.isPending;

  const waLink = p.phone
    ? `https://wa.me/${p.phone.replace(/\D/g, "")}?text=${encodeURIComponent(openingMessage(p))}`
    : null;
  const mailLink = p.email
    ? `mailto:${p.email}?subject=${encodeURIComponent(
        `Cobranza de cuotas — ${p.name}`,
      )}&body=${encodeURIComponent(openingMessage(p))}`
    : null;

  const followUpDue = p.followUpDue;

  return (
    <div
      className={`rounded-xl border bg-white/[0.02] p-4 transition ${
        p.qualifies ? "border-emerald-300/25" : "border-white/10"
      } ${busy ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-foreground/95">
            {p.name}
            {p.priority === 1 && (
              <span className="rounded-none border border-amber-200/30 bg-amber-200/[0.08] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-amber-100/90">
                P1
              </span>
            )}
            {p.qualifies && (
              <span className="rounded-none border border-emerald-300/30 bg-emerald-300/[0.08] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-emerald-100">
                3 de 3
              </span>
            )}
            {followUpDue && (
              <span className="rounded-none border border-orange-300/30 bg-orange-300/[0.08] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-orange-100">
                seguimiento
              </span>
            )}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>{p.zone}</span>
            {p.website && (
              <a
                href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/20 underline-offset-2 hover:text-foreground"
              >
                {p.website}
              </a>
            )}
            {p.instagram && (
              <a
                href={`https://instagram.com/${p.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/20 underline-offset-2 hover:text-foreground"
              >
                {p.instagram}
              </a>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`} className="hover:text-foreground">
                {p.email}
              </a>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-none border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] ${STAGE_STYLE[p.stage]}`}
          >
            {STAGE_LABEL[p.stage]}
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-none border border-white/15 px-2.5 py-1 text-[11px] text-foreground/80 transition hover:bg-[#1f1f1f]"
          >
            {open ? "Cerrar" : "Trabajar"}
          </button>
        </div>
      </div>

      {/* El filtro de 3, siempre visible: es lo primero que hay que completar */}
      <div className="mt-3 flex flex-wrap gap-4">
        {QUESTIONS.map((q) => (
          <div key={q.field} className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
              {q.label}
            </span>
            <div className="flex overflow-hidden rounded-md border border-white/12">
              {TRI_ORDER.map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    qualify.mutate({ id: p.id, field: q.field, value: v })
                  }
                  className={`px-2 py-0.5 text-[10px] transition ${
                    p[q.field] === v
                      ? v === "SI"
                        ? "bg-emerald-300/15 text-emerald-100"
                        : v === "NO"
                          ? "bg-red-300/12 text-red-100/90"
                          : "bg-white/[0.07] text-foreground/60"
                      : "text-muted-foreground/50 hover:bg-white/[0.04]"
                  }`}
                >
                  {TRI_LABEL[v]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {p.frictionNote && !open && (
        <p className="mt-3 border-l-2 border-white/15 pl-3 text-[13px] leading-relaxed text-foreground/75">
          {p.frictionNote}
        </p>
      )}

      {open && (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          {/* Nota de fricción */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Nota de fricción — qué viste entrando como un padre
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="pagan por transferencia manual, sin link de pago, «consultanos por WhatsApp» para pagar…"
              className="mt-1.5 w-full rounded-lg border border-white/12 bg-white/[0.03] p-2.5 text-[13px] text-foreground/90 outline-none transition placeholder:text-muted-foreground/40 focus:border-white/25"
            />
            <button
              type="button"
              disabled={busy || note === (p.frictionNote ?? "")}
              onClick={() => setNoteM.mutate({ id: p.id, note })}
              className="mt-1.5 rounded-none border border-white/15 px-3 py-1 text-[11px] text-foreground/85 transition hover:bg-[#1f1f1f] disabled:opacity-40"
            >
              Guardar nota
            </button>
          </div>

          {/* Cola de contacto: el mensaje ya escrito, se manda en dos clics */}
          <div className="flex flex-wrap gap-2">
            {mailLink && (
              <a
                href={mailLink}
                className="rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] text-foreground/95 transition hover:bg-white/[0.12]"
              >
                Abrir email con el mensaje
              </a>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-none border border-emerald-300/25 bg-emerald-300/[0.08] px-3 py-1.5 text-[11px] text-emerald-100 transition hover:bg-emerald-300/[0.14]"
              >
                Abrir WhatsApp
              </a>
            )}
            {!mailLink && !waLink && (
              <p className="text-[12px] text-muted-foreground">
                Sin email ni teléfono cargado — contactalo por Instagram DM.
              </p>
            )}
          </div>

          {/* Etapas */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Estado
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {STAGE_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy || s === p.stage}
                  onClick={() => setStage.mutate({ id: p.id, stage: s })}
                  className={`rounded-none border px-2.5 py-1 text-[11px] transition disabled:opacity-45 ${
                    s === p.stage
                      ? STAGE_STYLE[s]
                      : "border-white/12 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground/90"
                  }`}
                >
                  {STAGE_LABEL[s]}
                </button>
              ))}
            </div>
            {p.contactedAt && (
              <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
                contactado el{" "}
                {new Date(p.contactedAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short",
                })}
                {p.channel ? ` · ${CHANNEL_LABEL[p.channel]}` : ""}
                {p.followUpAt
                  ? ` · seguimiento ${new Date(p.followUpAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    })}`
                  : ""}
              </p>
            )}
          </div>

          {/* Bitácora */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Bitácora
            </p>
            <div className="mt-1.5 flex gap-2">
              <input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Qué pasó…"
                className="flex-1 rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-foreground/90 outline-none transition placeholder:text-muted-foreground/40 focus:border-white/25"
              />
              <button
                type="button"
                disabled={busy || activity.trim().length === 0}
                onClick={() =>
                  addActivity.mutate({ id: p.id, kind: "NOTA", body: activity })
                }
                className="rounded-none border border-white/15 px-3 py-1 text-[11px] text-foreground/85 transition hover:bg-[#1f1f1f] disabled:opacity-40"
              >
                Anotar
              </button>
            </div>
            {p.activities.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {p.activities.map((a) => (
                  <li key={a.id} className="flex gap-2.5 text-[12px]">
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                      {new Date(a.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <span className="text-muted-foreground/80">
                      <span className="text-foreground/70">{ACTIVITY_LABEL[a.kind]}</span>
                      {a.body ? ` — ${a.body}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
