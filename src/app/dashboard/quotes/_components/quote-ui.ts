// Mismos tintes planos que StatusBadge — borde de un pixel, sin glow.
export const QUOTE_STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-white/10 bg-white/[0.02] text-white/45",
  SENT: "border-[#0070F3]/40 bg-[#0070F3]/10 text-[#7db8ff]",
  ACCEPTED: "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-200",
  REJECTED: "border-rose-400/30 bg-rose-400/[0.08] text-rose-200",
};

export const QUOTE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
};
