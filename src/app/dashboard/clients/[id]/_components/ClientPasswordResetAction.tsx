"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Send, Copy, Check } from "lucide-react";
import { trpc } from "@/trpc/react";

// Para un cliente que ya tiene acceso: un link para que elija una
// contraseña nueva. Se puede copiar (para mandarlo por WhatsApp) o
// mandar por mail con la plantilla del sistema. Es lo mismo que hace
// «¿Olvidaste tu contraseña?», sin depender de que el cliente lo pida.
export function ClientPasswordResetAction({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [link, setLink] = useState<{ url: string; expiresAt: Date } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gen = trpc.clients.passwordReset.useMutation({
    onSuccess: (res, vars) => {
      setError(null);
      setLink({ url: res.url, expiresAt: new Date(res.expiresAt) });
      if (vars.send) {
        setNote(res.emailed ? "Mail enviado." : (res.emailError ?? "El mail no salió: copiá el link."));
      } else {
        setNote(null);
        navigator.clipboard.writeText(res.url).catch(() => null);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-none border px-3 py-1.5 text-[11px] font-medium transition disabled:opacity-50";

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
        Contraseña
      </p>
      <p className="text-sm text-muted-foreground">
        Si no puede entrar, generá un link para que elija una contraseña nueva. Sirve una sola vez
        y vence en 24 horas; generar otro anula el anterior.
      </p>

      {link && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Link para cambiar la contraseña
          </p>
          <code className="mt-1 block break-all font-mono text-[11px] text-foreground/90">{link.url}</code>
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            Vence {link.expiresAt.toLocaleString("es-AR")}
          </p>
          {note && <p className="mt-1.5 text-[11px] text-emerald-100/85">{note}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {link ? (
          <button
            type="button"
            onClick={copy}
            className={`${btn} border-white/12 bg-[#161616] text-foreground/90 hover:bg-white/[0.10]`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-200" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
        ) : (
          <button
            type="button"
            disabled={gen.isPending}
            onClick={() => gen.mutate({ clientId, send: false })}
            className={`${btn} border-white/12 bg-[#161616] text-foreground/95 hover:border-white/25 hover:bg-[#1f1f1f]`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            {gen.isPending && !gen.variables?.send ? "Generando…" : "Generar link"}
          </button>
        )}
        <button
          type="button"
          disabled={gen.isPending}
          onClick={() => gen.mutate({ clientId, send: true })}
          className={`${btn} border-white/10 bg-transparent text-muted-foreground hover:bg-white/[0.05] hover:text-foreground`}
        >
          <Send className="h-3.5 w-3.5" />
          {gen.isPending && gen.variables?.send ? "Enviando…" : link ? "Mandar otro por mail" : "Mandar por mail"}
        </button>
      </div>

      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </div>
  );
}
