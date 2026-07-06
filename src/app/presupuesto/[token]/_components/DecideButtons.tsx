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

export function DecideButtons({ token, locale }: { token: string; locale: "es" | "en" }) {
  const s = T[locale];
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "accept" | "reject">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const m = trpc.quotes.decide.useMutation({
    onSuccess: () => router.refresh(),
    onError: (e) => setError(e.message),
  });

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
          disabled={m.isPending}
          onClick={() => m.mutate({ token, decision: "ACCEPTED" })}
          className="font-pixel border border-[#2EA043] bg-[#2EA043] px-6 py-3 text-[11px] text-white transition hover:bg-[#278a39] disabled:opacity-60"
        >
          {m.isPending ? s.sending : s.confirmAccept}
        </button>
        <button
          type="button"
          onClick={() => setMode("idle")}
          className="px-4 py-3 font-pixel text-[10px] text-white/45 transition hover:text-white"
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
          disabled={m.isPending}
          onClick={() => m.mutate({ token, decision: "REJECTED", reason: reason || undefined })}
          className="font-pixel border border-[#E5484D]/70 bg-[#E5484D]/15 px-5 py-2.5 text-[11px] text-rose-100 transition hover:bg-[#E5484D]/25 disabled:opacity-60"
        >
          {m.isPending ? s.sending : s.confirmReject}
        </button>
        <button
          type="button"
          onClick={() => setMode("idle")}
          className="px-3 py-2.5 font-pixel text-[10px] text-white/45 transition hover:text-white"
        >
          {s.cancel}
        </button>
        {error && <span className="text-xs text-rose-300/90">{error}</span>}
      </div>
    </div>
  );
}
