"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

export function NewClientForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const create = trpc.clients.create.useMutation({
    onSuccess: (client) => {
      router.push(`/dashboard/clients/${client.id}`);
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    create.mutate({
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="fullName" label="Nombre y apellido" required />
        <Field name="email" label="Email" type="email" required />
      </div>

      <p className="text-[11px] text-muted-foreground/80">
        Después podés agregar plan recurrente, teléfono o notas desde la página de gestión del
        cliente.
      </p>

      <div className="flex items-center justify-between gap-4">
        {error && <p className="text-sm text-rose-200/85">{error}</p>}
        <div className="ml-auto">
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-full border border-white/18 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
          >
            {create.isPending ? "Guardando…" : "Crear cliente"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-rose-200/70">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
      />
    </label>
  );
}
