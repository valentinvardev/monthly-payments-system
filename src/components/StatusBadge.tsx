import type { InvoiceStatus, PaymentStatus } from "@/lib/demo/types";

type Variant = {
  label: string;
  bg: string;
  ring: string;
  dot: string;
  text: string;
  glow?: string;
  pulse?: boolean;
};

const invoiceVariants: Record<InvoiceStatus, Variant> = {
  DRAFT: {
    label: "Borrador",
    bg: "bg-white/[0.04]",
    ring: "ring-white/8",
    dot: "bg-foreground/40",
    text: "text-muted-foreground",
  },
  PENDING: {
    label: "Pendiente",
    bg: "bg-gradient-to-b from-white/[0.07] to-white/[0.02]",
    ring: "ring-white/10",
    dot: "bg-foreground/65",
    text: "text-foreground/90",
  },
  PENDING_REVIEW: {
    label: "Esperando revisión",
    bg: "bg-gradient-to-b from-amber-200/[0.10] to-amber-200/[0.03]",
    ring: "ring-amber-200/20",
    dot: "bg-amber-200",
    text: "text-amber-100/95",
    glow: "shadow-[0_0_14px_-4px_oklch(0.85_0.15_85/0.45)]",
    pulse: true,
  },
  PAID: {
    label: "Pagada",
    bg: "bg-gradient-to-b from-emerald-200/[0.10] to-emerald-200/[0.03]",
    ring: "ring-emerald-200/20",
    dot: "bg-emerald-200",
    text: "text-emerald-100/95",
    glow: "shadow-[0_0_14px_-4px_oklch(0.85_0.15_155/0.40)]",
  },
  OVERDUE: {
    label: "Vencida",
    bg: "bg-gradient-to-b from-rose-300/[0.12] to-rose-300/[0.04]",
    ring: "ring-rose-300/25",
    dot: "bg-rose-300",
    text: "text-rose-100/95",
    glow: "shadow-[0_0_14px_-4px_oklch(0.75_0.18_25/0.45)]",
    pulse: true,
  },
  CANCELLED: {
    label: "Cancelada",
    bg: "bg-white/[0.03]",
    ring: "ring-white/8",
    dot: "bg-foreground/25",
    text: "text-muted-foreground/60",
  },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const v = invoiceVariants[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ring-1 ring-inset backdrop-blur-sm",
        v.bg,
        v.ring,
        v.text,
        v.glow ?? "",
      ].join(" ")}
    >
      <span className="relative flex h-1.5 w-1.5">
        {v.pulse && (
          <span
            className={`absolute inset-0 inline-flex h-full w-full animate-ping rounded-full opacity-60 ${v.dot}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${v.dot}`} />
      </span>
      {v.label}
    </span>
  );
}

const paymentVariants: Record<PaymentStatus, Variant> = {
  INITIATED: {
    label: "Iniciado",
    bg: "bg-white/[0.04]",
    ring: "ring-white/8",
    dot: "bg-foreground/40",
    text: "text-muted-foreground",
  },
  PENDING_REVIEW: {
    label: "Esperando revisión",
    bg: "bg-gradient-to-b from-amber-200/[0.10] to-amber-200/[0.03]",
    ring: "ring-amber-200/20",
    dot: "bg-amber-200",
    text: "text-amber-100/95",
    glow: "shadow-[0_0_14px_-4px_oklch(0.85_0.15_85/0.45)]",
    pulse: true,
  },
  CONFIRMED: {
    label: "Confirmado",
    bg: "bg-gradient-to-b from-emerald-200/[0.10] to-emerald-200/[0.03]",
    ring: "ring-emerald-200/20",
    dot: "bg-emerald-200",
    text: "text-emerald-100/95",
    glow: "shadow-[0_0_14px_-4px_oklch(0.85_0.15_155/0.40)]",
  },
  REJECTED: {
    label: "Rechazado",
    bg: "bg-gradient-to-b from-rose-300/[0.12] to-rose-300/[0.04]",
    ring: "ring-rose-300/25",
    dot: "bg-rose-300",
    text: "text-rose-100/95",
    glow: "shadow-[0_0_14px_-4px_oklch(0.75_0.18_25/0.45)]",
  },
  REFUNDED: {
    label: "Reembolsado",
    bg: "bg-white/[0.03]",
    ring: "ring-white/8",
    dot: "bg-foreground/25",
    text: "text-muted-foreground/60",
  },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const v = paymentVariants[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ring-1 ring-inset backdrop-blur-sm",
        v.bg,
        v.ring,
        v.text,
        v.glow ?? "",
      ].join(" ")}
    >
      <span className="relative flex h-1.5 w-1.5">
        {v.pulse && (
          <span
            className={`absolute inset-0 inline-flex h-full w-full animate-ping rounded-full opacity-60 ${v.dot}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${v.dot}`} />
      </span>
      {v.label}
    </span>
  );
}
