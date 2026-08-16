"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

type Status = "NEW" | "CONTACTED" | "ARCHIVED" | "CONVERTED";

const ACTIONS: { status: Status; label: string }[] = [
  { status: "CONTACTED", label: "Contactado" },
  { status: "CONVERTED", label: "Convertido" },
  { status: "ARCHIVED", label: "Archivar" },
];

export function LeadStatusButtons({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const m = trpc.leads.setStatus.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACTIONS.filter((a) => a.status !== status).map((a) => (
        <button
          key={a.status}
          type="button"
          disabled={m.isPending}
          onClick={() => m.mutate({ id, status: a.status })}
          className="rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-[#1f1f1f] hover:border-white/25 hover:text-foreground disabled:opacity-50"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
