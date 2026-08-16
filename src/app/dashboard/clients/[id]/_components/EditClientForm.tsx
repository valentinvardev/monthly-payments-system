"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

type Client = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  taxId: string | null;
  notes: string | null;
};

export function EditClientForm({ client }: { client: Client }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const update = trpc.clients.update.useMutation({
    onSuccess: () => {
      setSavedAt(new Date());
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSavedAt(null);
    const fd = new FormData(e.currentTarget);
    update.mutate({
      id: client.id,
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: (fd.get("phone") as string)?.trim() || null,
      taxId: (fd.get("taxId") as string)?.trim() || null,
      notes: (fd.get("notes") as string)?.trim() || null,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="fullName" label="Nombre / Razón social" defaultValue={client.fullName} required />
        <Field name="email" label="Email" type="email" defaultValue={client.email} required />
        <Field name="phone" label="Teléfono" defaultValue={client.phone ?? ""} />
        <Field name="taxId" label="CUIT / Tax ID" defaultValue={client.taxId ?? ""} />
      </div>
      <Field name="notes" label="Notas" defaultValue={client.notes ?? ""} textarea />

      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] text-muted-foreground">
          {error && <span className="text-rose-200/85">{error}</span>}
          {!error && savedAt && (
            <span className="text-emerald-200/90">
              Guardado · {savedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded-none border border-[#0070F3] bg-[#0070F3] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0060d3] hover:border-[#0060d3] disabled:opacity-50"
        >
          {update.isPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  defaultValue?: string;
}) {
  const cls =
    "glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55";
  return (
    <label className="block">
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-rose-200/70">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} className={cls} rows={2} defaultValue={defaultValue} />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className={cls}
        />
      )}
    </label>
  );
}
