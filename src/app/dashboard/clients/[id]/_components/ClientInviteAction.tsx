"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Copy, Check } from "lucide-react";
import { trpc } from "@/trpc/react";

export function ClientInviteAction({
  clientId,
  hasLogin,
  pendingInviteUrl,
  pendingExpiresAt,
}: {
  clientId: string;
  hasLogin: boolean;
  pendingInviteUrl: string | null;
  pendingExpiresAt: Date | null;
}) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(pendingInviteUrl);
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
      <p className="text-sm text-emerald-100/90">
        ✓ El cliente ya tiene acceso al portal. Puede entrar con su email y contraseña.
      </p>
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

  return (
    <div className="space-y-3">
      {url ? (
        <>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
              Link activo
            </p>
            <code className="mt-1 block break-all font-mono text-[11px] text-foreground/90">
              {url}
            </code>
            {pendingExpiresAt && (
              <p className="mt-1 text-[10px] text-muted-foreground/70">
                Vence {new Date(pendingExpiresAt).toLocaleString("es-AR")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-foreground/90 transition hover:bg-white/[0.10]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-200" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar link"}
            </button>
            <button
              type="button"
              disabled={gen.isPending}
              onClick={() => gen.mutate({ clientId })}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-transparent px-3 py-1.5 text-[11px] text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground disabled:opacity-50"
            >
              {gen.isPending ? "…" : "Regenerar"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Generá un link de invitación para que el cliente cree su contraseña y acceda al
            portal.
          </p>
          <button
            type="button"
            disabled={gen.isPending}
            onClick={() => {
              setError(null);
              gen.mutate({ clientId });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.07] px-3.5 py-1.5 text-[11px] font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {gen.isPending ? "Generando…" : "Generar link de invitación"}
          </button>
        </>
      )}
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </div>
  );
}
