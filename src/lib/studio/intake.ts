// Configuración del formulario de intake (/contanos). Una sola fuente de
// verdad para valores estables (los que guarda ProjectLead) y labels en
// ambos idiomas. El orden de los pasos es el del flujo.

import type { Locale } from "@/lib/studio/i18n";

export type IntakeOption = { value: string; es: string; en: string; hint?: { es: string; en: string } };

export const NICHE_OPTIONS: IntakeOption[] = [
  { value: "fotografia", es: "Fotografía y eventos", en: "Photography & events" },
  { value: "ecommerce", es: "E-commerce", en: "E-commerce" },
  { value: "ia", es: "IA y automatización", en: "AI & automation" },
  { value: "otro", es: "Otro / no estoy seguro", en: "Other / not sure" },
];

export const PROJECT_TYPE_OPTIONS: IntakeOption[] = [
  { value: "nuevo", es: "Un sitio o plataforma nueva", en: "A new site or platform" },
  { value: "tienda", es: "Una tienda online", en: "An online store" },
  { value: "sistema", es: "Un sistema a medida", en: "A custom system" },
  { value: "automatizacion", es: "Automatizar procesos con IA", en: "Automating processes with AI" },
  { value: "mejora", es: "Mejorar algo que ya tengo", en: "Improving something I already have" },
];

export const CURRENT_STATE_OPTIONS: IntakeOption[] = [
  { value: "nada", es: "Arranco de cero", en: "Starting from scratch" },
  { value: "redes", es: "Solo redes sociales", en: "Social media only" },
  { value: "sitio", es: "Tengo un sitio que quiero renovar", en: "I have a site I want to renew" },
  { value: "sistema", es: "Tengo un sistema que quiero extender", en: "I have a system I want to extend" },
];

export const BUDGET_OPTIONS: IntakeOption[] = [
  { value: "lt500", es: "Menos de USD 500", en: "Under USD 500" },
  { value: "500-1500", es: "USD 500 – 1.500", en: "USD 500 – 1,500" },
  { value: "1500-5000", es: "USD 1.500 – 5.000", en: "USD 1,500 – 5,000" },
  { value: "gt5000", es: "Más de USD 5.000", en: "Over USD 5,000" },
  { value: "nose", es: "Todavía no lo sé", en: "I don't know yet" },
];

export const URGENCY_OPTIONS: IntakeOption[] = [
  { value: "ya", es: "Lo necesito ya", en: "I need it now" },
  { value: "mes", es: "Dentro de este mes", en: "Within this month" },
  { value: "trimestre", es: "En los próximos meses", en: "In the coming months" },
  { value: "explorando", es: "Estoy explorando", en: "Just exploring" },
];

export const optionLabel = (opts: IntakeOption[], value: string, locale: Locale) =>
  opts.find((o) => o.value === value)?.[locale] ?? value;

export const values = (opts: IntakeOption[]) => opts.map((o) => o.value) as [string, ...string[]];
