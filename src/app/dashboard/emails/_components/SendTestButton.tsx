"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { trpc } from "@/trpc/react";

export function SendTestButton({ kind }: { kind: string }) {
  const [done, setDone] = useState(false);
  const m = trpc.emails.sendTest.useMutation({
    onSuccess: () => {
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    },
  });

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={m.isPending}
        onClick={() => m.mutate({ key: kind })}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.07] px-3 py-1.5 text-[11px] font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {done ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-200" />
            Enviado
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            {m.isPending ? "Enviando…" : "Enviar de prueba"}
          </>
        )}
      </button>
      {m.error && <span className="text-[10px] text-rose-200/85">{m.error.message}</span>}
    </div>
  );
}
