"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Check, Copy } from "lucide-react";
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
      navigator.clipboard.writeText(res.url).catch(() => null);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  if (hasLogin) {
    return (
      <span
        title="Cliente activo en el portal"
        className="inline-flex h-7 w-7 items-center justify-center rounded-none border border-emerald-200/25 bg-emerald-200/[0.06] text-emerald-100/90"
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  if (url) {
    return (
      <button
        type="button"
        onClick={copy}
        title={copied ? "Link copiado" : "Copiar link de invitación"}
        className="inline-flex h-7 w-7 items-center justify-center rounded-none border border-white/12 bg-[#161616] text-foreground/90 transition hover:bg-white/[0.10] hover:border-white/25"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-200" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <button
        type="button"
        disabled={gen.isPending}
        onClick={() => {
          setError(null);
          gen.mutate({ clientId });
        }}
        title="Generar link de invitación"
        className="inline-flex h-7 w-7 items-center justify-center rounded-none border border-white/12 bg-[#161616] text-foreground/80 transition hover:bg-[#1f1f1f] hover:border-white/25 hover:text-foreground disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
      {error && <span className="text-[10px] text-rose-200/85">{error}</span>}
    </div>
  );
}
