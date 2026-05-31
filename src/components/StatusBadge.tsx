import type { InvoiceStatus, PaymentStatus } from "@/lib/demo/types";

type Variant = {
  label: string;
  bg: string;
  ring: string;
  dot: string;
  text: string;
  glow?: string;
  pulse?: boolean;
  icon?: React.ReactNode;
};

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}

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
    bg: "bg-gradient-to-b from-yellow-200/[0.14] to-yellow-300/[0.04]",
    ring: "ring-yellow-200/30",
    dot: "bg-yellow-200",
    text: "text-yellow-100",
    glow: "shadow-[0_0_16px_-4px_oklch(0.90_0.18_100/0.55)]",
    icon: <ClockIcon />,
  },
  PAID: {
    label: "Pagada",
    bg: "bg-gradient-to-b from-emerald-300/[0.14] to-emerald-400/[0.04]",
    ring: "ring-emerald-300/30",
    dot: "bg-emerald-300",
    text: "text-emerald-100",
    glow: "shadow-[0_0_16px_-4px_oklch(0.82_0.18_155/0.55)]",
    icon: <CheckIcon />,
  },
  OVERDUE: {
    label: "Vencida",
    bg: "bg-gradient-to-b from-rose-300/[0.12] to-rose-300/[0.04]",
    ring: "ring-rose-300/30",
    dot: "bg-rose-300",
    text: "text-rose-100",
    glow: "shadow-[0_0_16px_-4px_oklch(0.75_0.18_25/0.50)]",
    icon: <AlertIcon />,
  },
  CANCELLED: {
    label: "Cancelada",
    bg: "bg-white/[0.03]",
    ring: "ring-white/8",
    dot: "bg-foreground/25",
    text: "text-muted-foreground/60",
  },
};

function BadgePill({ v }: { v: Variant }) {
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
      {v.icon ? (
        <span className="inline-flex h-3 w-3 items-center justify-center">{v.icon}</span>
      ) : (
        <span className="relative flex h-1.5 w-1.5">
          {v.pulse && (
            <span
              className={`absolute inset-0 inline-flex h-full w-full animate-ping rounded-full opacity-60 ${v.dot}`}
            />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${v.dot}`} />
        </span>
      )}
      {v.label}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <BadgePill v={invoiceVariants[status]} />;
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
    bg: "bg-gradient-to-b from-yellow-200/[0.14] to-yellow-300/[0.04]",
    ring: "ring-yellow-200/30",
    dot: "bg-yellow-200",
    text: "text-yellow-100",
    glow: "shadow-[0_0_16px_-4px_oklch(0.90_0.18_100/0.55)]",
    icon: <ClockIcon />,
  },
  CONFIRMED: {
    label: "Confirmado",
    bg: "bg-gradient-to-b from-emerald-300/[0.14] to-emerald-400/[0.04]",
    ring: "ring-emerald-300/30",
    dot: "bg-emerald-300",
    text: "text-emerald-100",
    glow: "shadow-[0_0_16px_-4px_oklch(0.82_0.18_155/0.55)]",
    icon: <CheckIcon />,
  },
  REJECTED: {
    label: "Rechazado",
    bg: "bg-gradient-to-b from-rose-300/[0.12] to-rose-300/[0.04]",
    ring: "ring-rose-300/30",
    dot: "bg-rose-300",
    text: "text-rose-100",
    glow: "shadow-[0_0_16px_-4px_oklch(0.75_0.18_25/0.50)]",
    icon: <AlertIcon />,
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
  return <BadgePill v={paymentVariants[status]} />;
}
