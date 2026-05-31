import type { InvoiceStatus, PaymentStatus } from "@/lib/demo/types";

const invoiceLabel: Record<InvoiceStatus, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  PENDING_REVIEW: "Revisión",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
};

const invoiceTint: Record<InvoiceStatus, string> = {
  DRAFT: "border-white/8 bg-white/[0.03] text-muted-foreground",
  PENDING: "border-white/10 bg-white/[0.04] text-foreground/85",
  PENDING_REVIEW: "border-amber-200/20 bg-amber-200/[0.06] text-amber-100/90",
  PAID: "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-100/90",
  OVERDUE: "border-rose-300/25 bg-rose-300/[0.08] text-rose-100/90",
  CANCELLED: "border-white/8 bg-white/[0.02] text-muted-foreground/60",
};

const dotTint: Record<InvoiceStatus, string> = {
  DRAFT: "bg-foreground/30",
  PENDING: "bg-foreground/55",
  PENDING_REVIEW: "bg-amber-200/80",
  PAID: "bg-emerald-200/85",
  OVERDUE: "bg-rose-300/85",
  CANCELLED: "bg-foreground/25",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${invoiceTint[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotTint[status]}`} />
      {invoiceLabel[status]}
    </span>
  );
}

const paymentLabel: Record<PaymentStatus, string> = {
  INITIATED: "Iniciado",
  PENDING_REVIEW: "Esperando revisión",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  REFUNDED: "Reembolsado",
};

const paymentTint: Record<PaymentStatus, string> = {
  INITIATED: "border-white/8 bg-white/[0.03] text-muted-foreground",
  PENDING_REVIEW: "border-amber-200/20 bg-amber-200/[0.06] text-amber-100/90",
  CONFIRMED: "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-100/90",
  REJECTED: "border-rose-300/25 bg-rose-300/[0.08] text-rose-100/90",
  REFUNDED: "border-white/8 bg-white/[0.02] text-muted-foreground/60",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${paymentTint[status]}`}
    >
      {paymentLabel[status]}
    </span>
  );
}
