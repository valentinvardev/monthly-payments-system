import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { api } from "@/trpc/server";
import { env } from "@/lib/env";
import { SendTestButton } from "./_components/SendTestButton";

export default async function EmailsTestPage() {
  const list = await api.emails.list();

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="studio-eyebrow">
          Emails
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Probá todos los templates.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada botón manda una copia de prueba a{" "}
          <span className="font-mono text-foreground/90">{env.ADMIN_EMAIL}</span>. Datos ficticios
          ("Cliente de Prueba", USD 200, etc.) — el contenido del email es 1:1 al de producción.
        </p>
      </header>

      <div className="grid gap-3 reveal" style={{ animationDelay: "60ms" }}>
        {list.map((e) => (
          <Card key={e.key}>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-foreground/70" />
                    <p className="font-medium text-foreground/95">{e.label}</p>
                    <span
                      className={`rounded-none border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] ${
                        e.audience === "Administrador"
                          ? "border-yellow-200/25 bg-yellow-200/[0.06] text-yellow-100/90"
                          : "border-white/12 bg-[#161616] text-foreground/75"
                      }`}
                    >
                      {e.audience}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                    Disparador: <span className="font-mono">{e.trigger}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/dashboard/emails/preview/${e.key}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-[#1f1f1f] hover:text-foreground"
                  >
                    Vista previa
                  </Link>
                  <SendTestButton kind={e.key} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/70">
        Para que los emails te lleguen efectivamente, Resend tiene que estar configurado
        (RESEND_API_KEY + RESEND_FROM_EMAIL en el server). Si el dominio del FROM todavía no está
        verificado, Resend solo te deja enviar a la cuenta del owner de la API key.
      </p>
    </div>
  );
}
