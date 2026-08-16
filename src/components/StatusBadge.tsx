import type { InvoiceStatus, PaymentStatus } from "@/lib/types";

// Estado en lenguaje pixel: rectángulo duro, borde de un pixel, tinte
// plano y un cuadradito de 6px como indicador — la misma forma que las
// estrellas del cielo y la viñeta del menú. Sin degradés, sin glow y
// sin esquinas redondas: eso era la identidad vieja.
//
// El azul de marca NO aparece acá a propósito: el acento está reservado
// para lo accionable, y un estado no se toca.

type Variant = {
  label: string;
  className: string;
  dot: string;
};

const NEUTRAL_SOFT = {
  className: "border-white/10 bg-white/[0.02] text-white/45",
  dot: "bg-white/30",
};

const NEUTRAL = {
  className: "border-white/18 bg-white/[0.05] text-white/85",
  dot: "bg-white/60",
};

const WAITING = {
  className: "border-amber-300/25 bg-amber-300/[0.07] text-amber-200",
  dot: "bg-amber-300",
};

const GOOD = {
  className: "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-200",
  dot: "bg-emerald-300",
};

const BAD = {
  className: "border-rose-400/30 bg-rose-400/[0.08] text-rose-200",
  dot: "bg-rose-400",
};

const invoiceVariants: Record<InvoiceStatus, Variant> = {
  DRAFT: { label: "Borrador", ...NEUTRAL_SOFT },
  PENDING: { label: "Pendiente", ...NEUTRAL },
  PENDING_REVIEW: { label: "Esperando revisión", ...WAITING },
  PAID: { label: "Pagada", ...GOOD },
  OVERDUE: { label: "Vencida", ...BAD },
  CANCELLED: { label: "Cancelada", ...NEUTRAL_SOFT },
};

const paymentVariants: Record<PaymentStatus, Variant> = {
  INITIATED: { label: "Iniciado", ...NEUTRAL_SOFT },
  PENDING_REVIEW: { label: "Esperando revisión", ...WAITING },
  CONFIRMED: { label: "Confirmado", ...GOOD },
  REJECTED: { label: "Rechazado", ...BAD },
  REFUNDED: { label: "Reembolsado", ...NEUTRAL_SOFT },
};

function BadgePill({ v }: { v: Variant }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 border px-2 py-[3px] text-[10px] font-medium uppercase tracking-[0.14em] whitespace-nowrap",
        v.className,
      ].join(" ")}
    >
      <span aria-hidden className={`inline-block h-1.5 w-1.5 shrink-0 ${v.dot}`} />
      {v.label}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <BadgePill v={invoiceVariants[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <BadgePill v={paymentVariants[status]} />;
}
