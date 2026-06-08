"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { trpc } from "@/trpc/react";

export function GenerateNextButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const gen = trpc.invoices.generateNext.useMutation({
    onSuccess: () => router.refresh(),
    onError: (e) => setError(e.message),
  });

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <button
        type="button"
        disabled={gen.isPending}
        onClick={() => {
          setError(null);
          gen.mutate({ clientId });
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-foreground/90 transition hover:border-white/22 hover:bg-white/[0.09] hover:text-foreground disabled:opacity-50"
      >
        <Sparkles className="h-3 w-3" />
        {gen.isPending ? "Generando…" : "Generar ahora"}
      </button>
      {error && <span className="text-[10px] text-rose-200/85">{error}</span>}
    </div>
  );
}
