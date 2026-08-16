"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/react";
import { formatUsd } from "@/lib/format";

type ClientOption = { id: string; fullName: string; email: string };
type Item = { label: string; detail: string; amount: string };

const inputCls =
  "studio-field mt-1.5";
const labelCls =
  "block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80";

export function QuoteForm({
  clients,
  initial,
}: {
  clients: ClientOption[];
  initial: { leadId: string; name: string; email: string; company: string; locale: "es" | "en" } | null;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [locale, setLocale] = useState<"es" | "en">(initial?.locale ?? "es");
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [items, setItems] = useState<Item[]>([{ label: "", detail: "", amount: "" }]);
  const [error, setError] = useState<string | null>(null);

  const m = trpc.quotes.create.useMutation({
    onSuccess: (q) => router.push(`/dashboard/quotes/${q.id}`),
    onError: (e) => setError(e.message),
  });

  function pickClient(id: string) {
    setClientId(id);
    const c = clients.find((x) => x.id === id);
    if (c) {
      setName(c.fullName);
      setEmail(c.email);
    }
  }

  const setItem = (i: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, x) => (x === i ? { ...it, ...patch } : it)));

  const total = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = items
      .filter((it) => it.label.trim())
      .map((it) => ({
        label: it.label.trim(),
        detail: it.detail.trim() || undefined,
        amountUsd: Number(it.amount) || 0,
      }));
    if (parsed.length === 0) {
      setError("Agregá al menos un ítem con nombre");
      return;
    }
    m.mutate({
      clientId: clientId || undefined,
      leadId: initial?.leadId,
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      title: title.trim(),
      intro: intro.trim() || undefined,
      locale,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      items: parsed,
    });
  }

  return (
    <form onSubmit={onSubmit} className="reveal space-y-6" style={{ animationDelay: "60ms" }}>
      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <h2 className="font-display text-base font-medium text-foreground/95">Destinatario</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelCls}>Cliente existente (opcional — habilita convertir en factura)</span>
            <select value={clientId} onChange={(e) => pickClient(e.target.value)} className={inputCls}>
              <option value="">— Prospecto nuevo —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} · {c.email}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Nombre *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Email *</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Empresa</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Idioma del presupuesto</span>
            <select value={locale} onChange={(e) => setLocale(e.target.value as "es" | "en")} className={inputCls}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <h2 className="font-display text-base font-medium text-foreground/95">Propuesta</h2>
        <label className="block">
          <span className={labelCls}>Título *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ej. Tienda online con checkout de MercadoPago"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Nota personal (aparece arriba de los ítems)</span>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={3}
            placeholder="Como hablamos, la idea es…"
            className={inputCls}
          />
        </label>
        <label className="block sm:max-w-[240px]">
          <span className={labelCls}>Válido hasta</span>
          <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} />
        </label>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-foreground/95">Ítems</h2>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { label: "", detail: "", amount: "" }])}
            className="inline-flex items-center gap-1.5 rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-[#1f1f1f]"
          >
            <Plus className="h-3 w-3" /> Agregar ítem
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:grid-cols-[1fr_1fr_130px_auto]">
              <label className="block">
                <span className={labelCls}>Ítem</span>
                <input
                  value={it.label}
                  onChange={(e) => setItem(i, { label: e.target.value })}
                  placeholder="Diseño + desarrollo"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className={labelCls}>Detalle</span>
                <input
                  value={it.detail}
                  onChange={(e) => setItem(i, { detail: e.target.value })}
                  placeholder="Qué incluye"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className={labelCls}>USD</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={it.amount}
                  onChange={(e) => setItem(i, { amount: e.target.value })}
                  className={inputCls}
                />
              </label>
              <div className="flex items-end pb-1">
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, x) => x !== i))}
                  disabled={items.length === 1}
                  title="Quitar ítem"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-none border border-white/12 bg-[#161616] text-muted-foreground transition hover:border-rose-300/30 hover:text-rose-100/85 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/8 pt-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Total</span>
          <span className="font-display text-2xl font-medium tabular-nums text-foreground">
            {formatUsd(total)}
          </span>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        {error ? <p className="text-sm text-rose-200/85">{error}</p> : <span />}
        <button
          type="submit"
          disabled={m.isPending}
          className="rounded-none border border-[#0070F3] bg-[#0070F3] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0060d3] hover:border-[#0060d3] disabled:opacity-50"
        >
          {m.isPending ? "Guardando…" : "Guardar borrador"}
        </button>
      </div>
    </form>
  );
}
