"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

export function InviteLinkButton({
  clientId,
  hasLogin,
}: {
  clientId: string;
  hasLogin: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gen = trpc.clients.generateInvite.useMutation({
    onSuccess: (res) => {
      setUrl(res.url);
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  if (hasLogin) {
    return (
      <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-200/80">
        ✓ activo
      </span>
    );
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  if (url) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-cyan-300/30 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-cyan-50 transition hover:bg-white/[0.10]"
        >
          {copied ? "✓ Copiado" : "📋 Copiar link"}
        </button>
        <code className="max-w-[16rem] truncate text-[10px] font-mono text-muted-foreground/70">
          {url}
        </code>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={gen.isPending}
        onClick={() => {
          setError(null);
          gen.mutate({ clientId });
        }}
        className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-white/[0.08] hover:border-white/22 hover:text-foreground disabled:opacity-50"
      >
        {gen.isPending ? "Generando…" : "+ Link de invite"}
      </button>
      {error && <span className="text-[10px] text-rose-200/85">{error}</span>}
    </div>
  );
}
