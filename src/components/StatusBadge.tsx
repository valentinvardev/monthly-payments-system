import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus, PaymentStatus } from "@/lib/demo/types";

const invoiceLabel: Record<InvoiceStatus, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  PENDING_REVIEW: "Revisión",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
};

const invoiceVariant: Record<InvoiceStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  PENDING: "secondary",
  PENDING_REVIEW: "outline",
  PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "outline",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={invoiceVariant[status]}>{invoiceLabel[status]}</Badge>;
}

const paymentLabel: Record<PaymentStatus, string> = {
  INITIATED: "Iniciado",
  PENDING_REVIEW: "Esperando revisión",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  REFUNDED: "Reembolsado",
};

const paymentVariant: Record<PaymentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  INITIATED: "outline",
  PENDING_REVIEW: "secondary",
  CONFIRMED: "default",
  REJECTED: "destructive",
  REFUNDED: "outline",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariant[status]}>{paymentLabel[status]}</Badge>;
}
