"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

const T = {
  es: {
    accept: "Aceptar presupuesto",
    reject: "Rechazar",
    confirmAccept: "Confirmar aceptación",
    cancel: "Cancelar",
    reasonLabel: "¿Nos contás por qué? (opcional)",
    reasonPlaceholder: "Muy caro / cambió el plan / elegimos otra opción…",
    confirmReject: "Confirmar rechazo",
    sending: "Enviando…",
  },
  en: {
    accept: "Accept proposal",
    reject: "Decline",
    confirmAccept: "Confirm acceptance",
    cancel: "Cancel",
    reasonLabel: "Mind telling us why? (optional)",
    reasonPlaceholder: "Too expensive / plans changed / went another way…",
    confirmReject: "Confirm decline",
    sending: "Sending…",
  },
} as const;

// El ancho del botón lo fija su etiqueta más larga, puesta invisible
// debajo. Sin esto, al pasar a "Enviando…" se encoge de golpe —
// con la pixel font son 20 caracteres contra 9 — y el salto se lee como
// que algo se rompió.
function Label({ sizer, children }: { sizer: string; children: React.ReactNode }) {
  return (
    <span className="grid">
      <span className="invisible col-start-1 row-start-1">{sizer}</span>
      <span className="col-start-1 row-start-1">{children}</span>
    </span>
  );
}

export function DecideButtons({ token, locale }: { token: string; locale: "es" | "en" }) {
  const s = T[locale];
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "accept" | "reject">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const m = trpc.quotes.decide.useMutation({
    // router.refresh() no se espera: isPending vuelve a false apenas
    // contesta el server, así que entre eso y el HTML nuevo el botón
    // volvía a decir "Confirmar aceptación" como si no hubiera pasado
    // nada — y admitía un segundo click, que rebota con "este
    // presupuesto ya fue decidido". `sent` se queda puesto hasta que la
    // página se reemplaza sola.
    onSuccess: () => {
      setSent(true);
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });
  const busy = m.isPending || sent;

  if (mode === "idle") {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setMode("accept")}
          className="font-pixel border border-[#2EA043] bg-[#2EA043] px-6 py-3 text-[11px] text-white transition hover:bg-[#278a39]"
        >
          {s.accept}
        </button>
        <button
          type="button"
          onClick={() => setMode("reject")}
          className="font-pixel border border-white/18 px-5 py-3 text-[11px] text-white/70 transition hover:border-white/40 hover:text-white"
        >
          {s.reject}
        </button>
      </div>
    );
  }

  if (mode === "accept") {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => m.mutate({ token, decision: "ACCEPTED" })}
          className="font-pixel border border-[#2EA043] bg-[#2EA043] px-6 py-3 text-[11px] text-white transition hover:bg-[#278a39] disabled:opacity-60"
        >
          <Label sizer={s.confirmAccept}>{busy ? s.sending : s.confirmAccept}</Label>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMode("idle")}
          className="px-4 py-3 font-pixel text-[10px] text-white/45 transition hover:text-white disabled:opacity-40 disabled:hover:text-white/45"
        >
          {s.cancel}
        </button>
        {error && <span className="text-xs text-rose-300/90">{error}</span>}
      </div>
    );
  }

  return (
    <div className="mt-8 border border-white/12 bg-white/[0.02] p-5">
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
          {s.reasonLabel}
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={s.reasonPlaceholder}
          rows={3}
          className="mt-2 w-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white transition placeholder:text-white/30 focus:border-white/35 focus:outline-none"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => m.mutate({ token, decision: "REJECTED", reason: reason || undefined })}
          className="font-pixel border border-[#E5484D]/70 bg-[#E5484D]/15 px-5 py-2.5 text-[11px] text-rose-100 transition hover:bg-[#E5484D]/25 disabled:opacity-60"
        >
          <Label sizer={s.confirmReject}>{busy ? s.sending : s.confirmReject}</Label>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMode("idle")}
          className="px-3 py-2.5 font-pixel text-[10px] text-white/45 transition hover:text-white disabled:opacity-40 disabled:hover:text-white/45"
        >
          {s.cancel}
        </button>
        {error && <span className="text-xs text-rose-300/90">{error}</span>}
      </div>
    </div>
  );
}
