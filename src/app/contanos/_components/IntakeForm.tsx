"use client";

import { useState } from "react";
import Image from "next/image";
import { trpc } from "@/trpc/react";
import type { Locale } from "@/lib/studio/i18n";
import {
  BUDGET_OPTIONS,
  CURRENT_STATE_OPTIONS,
  NICHE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  URGENCY_OPTIONS,
  optionLabel,
  type IntakeOption,
} from "@/lib/studio/intake";

// Copy del formulario. Vive acá (no en i18n.ts) porque es exclusivo de
// este flujo; los VALORES de las opciones vienen de lib/studio/intake.
const T = {
  es: {
    eyebrow: "CONTANOS TU PROYECTO",
    title: "Empecemos por el principio.",
    sub: "Siete preguntas cortas. Al final te respondemos en el día, con ideas concretas — no con un PDF genérico.",
    stepWho: "¿Quién sos?",
    name: "Tu nombre",
    email: "Tu email",
    company: "Empresa o proyecto (opcional)",
    stepNiche: "¿En qué mundo está tu proyecto?",
    stepType: "¿Qué necesitás?",
    stepState: "¿Qué tenés hoy?",
    currentUrl: "URL actual (opcional)",
    stepProblem: "Contanos el problema",
    problemPlaceholder:
      "Ej: vendo por Instagram y pierdo pedidos porque todo es por DM. Quiero un catálogo con checkout y que el stock se maneje solo…",
    problemHint: "Mientras más contexto, mejor la respuesta. Mínimo un par de líneas.",
    stepBudget: "¿Qué presupuesto manejás?",
    budgetHint: "Es una referencia para proponerte algo realista — no un compromiso.",
    stepUrgency: "¿Para cuándo?",
    back: "Atrás",
    next: "Siguiente",
    send: "Enviar",
    sending: "Enviando…",
    review: "Revisá y mandá",
    doneTitle: "Recibido.",
    doneBody: "Te respondemos dentro del día a",
    doneBack: "Volver al inicio",
    errGeneric: "Algo falló al enviar. Probá de nuevo en un momento.",
  },
  en: {
    eyebrow: "TELL US ABOUT YOUR PROJECT",
    title: "Let's start at the beginning.",
    sub: "Seven short questions. We reply within the day with concrete ideas — not a generic PDF.",
    stepWho: "Who are you?",
    name: "Your name",
    email: "Your email",
    company: "Company or project (optional)",
    stepNiche: "What world is your project in?",
    stepType: "What do you need?",
    stepState: "What do you have today?",
    currentUrl: "Current URL (optional)",
    stepProblem: "Tell us the problem",
    problemPlaceholder:
      "E.g.: I sell on Instagram and lose orders because everything happens in DMs. I want a catalog with checkout and stock that manages itself…",
    problemHint: "The more context, the better the answer. At least a couple of lines.",
    stepBudget: "What's your budget?",
    budgetHint: "A reference so we can propose something realistic — not a commitment.",
    stepUrgency: "When do you need it?",
    back: "Back",
    next: "Next",
    send: "Send",
    sending: "Sending…",
    review: "Review & send",
    doneTitle: "Got it.",
    doneBody: "We'll reply within the day to",
    doneBack: "Back to home",
    errGeneric: "Something failed while sending. Try again in a moment.",
  },
  pt: {
    eyebrow: "CONTE SEU PROJETO",
    title: "Vamos começar pelo começo.",
    sub: "Sete perguntas curtas. No final respondemos no mesmo dia, com ideias concretas, não com um PDF genérico.",
    stepWho: "Quem é você?",
    name: "Seu nome",
    email: "Seu email",
    company: "Empresa ou projeto (opcional)",
    stepNiche: "Em que mundo está o seu projeto?",
    stepType: "O que você precisa?",
    stepState: "O que você tem hoje?",
    currentUrl: "URL atual (opcional)",
    stepProblem: "Conte o problema",
    problemPlaceholder:
      "Ex.: vendo pelo Instagram e perco pedidos porque tudo é por DM. Quero um catálogo com checkout e estoque que se gerencia sozinho…",
    problemHint: "Quanto mais contexto, melhor a resposta. No mínimo algumas linhas.",
    stepBudget: "Qual é o seu orçamento?",
    budgetHint: "É uma referência para propor algo realista, não um compromisso.",
    stepUrgency: "Para quando?",
    back: "Voltar",
    next: "Próximo",
    send: "Enviar",
    sending: "Enviando…",
    review: "Revise e envie",
    doneTitle: "Recebido.",
    doneBody: "Respondemos dentro do dia para",
    doneBack: "Voltar ao início",
    errGeneric: "Algo falhou no envio. Tente de novo em instantes.",
  },
} as const;

const NICHE_ART: Record<string, string> = {
  fotografia: "/pixel/camara.png?v=2",
  ecommerce: "/pixel/changuito.png?v=2",
  ia: "/pixel/agente.png?v=2",
};

type Draft = {
  name: string;
  email: string;
  company: string;
  niche: string;
  projectType: string;
  currentState: string;
  currentUrl: string;
  problem: string;
  budgetRange: string;
  urgency: string;
};

const EMPTY: Draft = {
  name: "",
  email: "",
  company: "",
  niche: "",
  projectType: "",
  currentState: "",
  currentUrl: "",
  problem: "",
  budgetRange: "",
  urgency: "",
};

const TOTAL_STEPS = 8; // 0..6 preguntas + 7 review

export function IntakeForm({ locale }: { locale: Locale }) {
  const s = T[locale];
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(EMPTY);
  const [hp, setHp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = trpc.leads.submit.useMutation({
    onSuccess: () => setDone(true),
    onError: () => setError(s.errGeneric),
  });

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
  const canNext = (): boolean => {
    switch (step) {
      case 0: return d.name.trim().length >= 2 && emailOk;
      case 1: return !!d.niche;
      case 2: return !!d.projectType;
      case 3: return !!d.currentState;
      case 4: return d.problem.trim().length >= 20;
      case 5: return !!d.budgetRange;
      case 6: return !!d.urgency;
      default: return true;
    }
  };

  function onSend() {
    setError(null);
    submit.mutate({
      name: d.name.trim(),
      email: d.email.trim(),
      company: d.company.trim() || undefined,
      niche: d.niche,
      projectType: d.projectType,
      currentState: d.currentState,
      currentUrl: d.currentUrl.trim() || undefined,
      problem: d.problem.trim(),
      budgetRange: d.budgetRange,
      urgency: d.urgency,
      locale,
      website: hp || undefined,
    });
  }

  if (done) {
    return (
      <div className="reveal flex flex-col items-center py-16 text-center">
        <Image
          src="/pixel/carpincho.png?v=2"
          alt=""
          width={200}
          height={200}
          unoptimized
          className="pixelated"
        />
        <h1 className="mt-8 font-display text-4xl font-medium tracking-[-0.03em]">{s.doneTitle}</h1>
        <p className="mt-3 text-white/60">
          {s.doneBody} <span className="font-mono text-white/90">{d.email}</span>.
        </p>
        <a
          href="/"
          className="font-pixel mt-8 border border-white/18 px-5 py-2.5 text-[11px] text-white/85 transition hover:border-white/40 hover:text-white"
        >
          {s.doneBack}
        </a>
      </div>
    );
  }

  return (
    <div className="reveal">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">{s.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
        {s.title}
      </h1>
      <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-white/55">{s.sub}</p>

      {/* progreso: un píxel por paso */}
      <div className="mt-8 flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className="h-2 w-2 transition-colors duration-300"
            style={{
              backgroundColor:
                i < step ? "#0070F3" : i === step ? "#fafafa" : "rgba(255,255,255,0.14)",
            }}
          />
        ))}
        <span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-white/40">
          {String(Math.min(step + 1, TOTAL_STEPS)).padStart(2, "0")}/{TOTAL_STEPS}
        </span>
      </div>

      <div className="mt-8 border border-white/10 bg-[#0d0d0c] p-6 sm:p-8">
        {/* honeypot — invisible para humanos */}
        <input
          type="text"
          name="website"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        {step === 0 && (
          <StepShell title={s.stepWho}>
            <div className="space-y-4">
              <Field label={s.name} value={d.name} onChange={(v) => set({ name: v })} autoFocus />
              <Field label={s.email} type="email" value={d.email} onChange={(v) => set({ email: v })} />
              <Field label={s.company} value={d.company} onChange={(v) => set({ company: v })} />
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title={s.stepNiche}>
            <div className="grid gap-3 sm:grid-cols-2">
              {NICHE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => set({ niche: o.value })}
                  className={[
                    "flex items-center gap-4 border p-4 text-left transition",
                    d.niche === o.value
                      ? "border-[#0070F3] bg-[#0070F3]/10"
                      : "border-white/12 bg-white/[0.02] hover:border-white/30",
                  ].join(" ")}
                >
                  {NICHE_ART[o.value] ? (
                    <Image
                      src={NICHE_ART[o.value]}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="pixelated shrink-0"
                    />
                  ) : (
                    <span className="inline-block h-3 w-3 shrink-0 bg-white/30" />
                  )}
                  <span className="text-sm font-medium">{o[locale]}</span>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title={s.stepType}>
            <OptionList options={PROJECT_TYPE_OPTIONS} locale={locale} value={d.projectType} onPick={(v) => set({ projectType: v })} />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title={s.stepState}>
            <OptionList options={CURRENT_STATE_OPTIONS} locale={locale} value={d.currentState} onPick={(v) => set({ currentState: v })} />
            {(d.currentState === "sitio" || d.currentState === "sistema") && (
              <div className="mt-4">
                <Field label={s.currentUrl} value={d.currentUrl} onChange={(v) => set({ currentUrl: v })} placeholder="https://" />
              </div>
            )}
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title={s.stepProblem}>
            <textarea
              value={d.problem}
              onChange={(e) => set({ problem: e.target.value })}
              placeholder={s.problemPlaceholder}
              rows={6}
              autoFocus
              className="w-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white transition placeholder:text-white/30 focus:border-white/35 focus:bg-white/[0.05] focus:outline-none"
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
              {s.problemHint} · {d.problem.trim().length}/20
            </p>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title={s.stepBudget}>
            <OptionList options={BUDGET_OPTIONS} locale={locale} value={d.budgetRange} onPick={(v) => set({ budgetRange: v })} />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">{s.budgetHint}</p>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title={s.stepUrgency}>
            <OptionList options={URGENCY_OPTIONS} locale={locale} value={d.urgency} onPick={(v) => set({ urgency: v })} />
          </StepShell>
        )}

        {step === 7 && (
          <StepShell title={s.review}>
            <dl className="space-y-2.5 text-sm">
              <Row k={s.name} v={`${d.name}${d.company ? ` · ${d.company}` : ""}`} />
              <Row k={s.email} v={d.email} />
              <Row k={s.stepNiche} v={optionLabel(NICHE_OPTIONS, d.niche, locale)} />
              <Row k={s.stepType} v={optionLabel(PROJECT_TYPE_OPTIONS, d.projectType, locale)} />
              <Row k={s.stepState} v={optionLabel(CURRENT_STATE_OPTIONS, d.currentState, locale)} />
              {d.currentUrl && <Row k="URL" v={d.currentUrl} />}
              <Row k={s.stepProblem} v={d.problem} />
              <Row k={s.stepBudget} v={optionLabel(BUDGET_OPTIONS, d.budgetRange, locale)} />
              <Row k={s.stepUrgency} v={optionLabel(URGENCY_OPTIONS, d.urgency, locale)} />
            </dl>
          </StepShell>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep((x) => Math.max(0, x - 1))}
            disabled={step === 0 || submit.isPending}
            className="px-3 py-2 font-pixel text-[10px] text-white/45 transition hover:text-white disabled:invisible"
          >
            ← {s.back}
          </button>
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-rose-300/90">{error}</span>}
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={() => setStep((x) => x + 1)}
                disabled={!canNext()}
                className="font-pixel border border-white/20 bg-white/[0.06] px-5 py-2.5 text-[11px] text-white transition hover:border-white/45 hover:bg-white/[0.1] disabled:opacity-35"
              >
                {s.next} →
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={submit.isPending}
                className="font-pixel border border-[#0070F3] bg-[#0070F3] px-6 py-2.5 text-[11px] text-white transition hover:bg-[#0060d3] disabled:opacity-60"
              >
                {submit.isPending ? s.sending : s.send}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-5 font-display text-xl font-medium tracking-[-0.02em]">{title}</legend>
      {children}
    </fieldset>
  );
}

function OptionList({
  options,
  locale,
  value,
  onPick,
}: {
  options: IntakeOption[];
  locale: Locale;
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value)}
          className={[
            "flex w-full items-center gap-3 border px-4 py-3 text-left text-sm transition",
            value === o.value
              ? "border-[#0070F3] bg-[#0070F3]/10 text-white"
              : "border-white/12 bg-white/[0.02] text-white/80 hover:border-white/30",
          ].join(" ")}
        >
          <span
            className="inline-block h-2 w-2 shrink-0"
            style={{ backgroundColor: value === o.value ? "#0070F3" : "rgba(255,255,255,0.2)" }}
          />
          {o[locale]}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="mt-1.5 w-full border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white transition placeholder:text-white/30 focus:border-white/35 focus:bg-white/[0.05] focus:outline-none"
      />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 border-b border-white/6 pb-2.5">
      <dt className="w-36 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 pt-0.5">
        {k}
      </dt>
      <dd className="min-w-0 break-words text-white/85">{v}</dd>
    </div>
  );
}
