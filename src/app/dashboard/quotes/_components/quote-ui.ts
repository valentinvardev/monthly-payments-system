export const QUOTE_STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-white/12 bg-white/[0.03] text-foreground/60",
  SENT: "border-sky-300/30 bg-sky-300/[0.08] text-sky-100",
  ACCEPTED: "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-100",
  REJECTED: "border-rose-300/30 bg-rose-300/[0.08] text-rose-100",
};

export const QUOTE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
};
