// Configuración del formulario de intake (/contanos). Una sola fuente de
// verdad para valores estables (los que guarda ProjectLead) y labels en
// los tres idiomas. El orden de los pasos es el del flujo.

import type { Locale } from "@/lib/studio/i18n";

export type IntakeOption = {
  value: string;
  es: string;
  en: string;
  pt: string;
};

export const NICHE_OPTIONS: IntakeOption[] = [
  { value: "fotografia", es: "Fotografía y eventos", en: "Photography & events", pt: "Fotografia e eventos" },
  { value: "ecommerce", es: "E-commerce", en: "E-commerce", pt: "E-commerce" },
  { value: "ia", es: "IA y automatización", en: "AI & automation", pt: "IA e automação" },
  { value: "otro", es: "Otro / no estoy seguro", en: "Other / not sure", pt: "Outro / não sei" },
];

export const PROJECT_TYPE_OPTIONS: IntakeOption[] = [
  { value: "nuevo", es: "Un sitio o plataforma nueva", en: "A new site or platform", pt: "Um site ou plataforma nova" },
  { value: "tienda", es: "Una tienda online", en: "An online store", pt: "Uma loja online" },
  { value: "sistema", es: "Un sistema a medida", en: "A custom system", pt: "Um sistema sob medida" },
  { value: "automatizacion", es: "Automatizar procesos con IA", en: "Automating processes with AI", pt: "Automatizar processos com IA" },
  { value: "mejora", es: "Mejorar algo que ya tengo", en: "Improving something I already have", pt: "Melhorar algo que já tenho" },
];

export const CURRENT_STATE_OPTIONS: IntakeOption[] = [
  { value: "nada", es: "Arranco de cero", en: "Starting from scratch", pt: "Começando do zero" },
  { value: "redes", es: "Solo redes sociales", en: "Social media only", pt: "Só redes sociais" },
  { value: "sitio", es: "Tengo un sitio que quiero renovar", en: "I have a site I want to renew", pt: "Tenho um site que quero renovar" },
  { value: "sistema", es: "Tengo un sistema que quiero extender", en: "I have a system I want to extend", pt: "Tenho um sistema que quero estender" },
];

export const BUDGET_OPTIONS: IntakeOption[] = [
  { value: "lt500", es: "Menos de USD 500", en: "Under USD 500", pt: "Menos de USD 500" },
  { value: "500-1500", es: "USD 500 – 1.500", en: "USD 500 – 1,500", pt: "USD 500 – 1.500" },
  { value: "1500-5000", es: "USD 1.500 – 5.000", en: "USD 1,500 – 5,000", pt: "USD 1.500 – 5.000" },
  { value: "gt5000", es: "Más de USD 5.000", en: "Over USD 5,000", pt: "Mais de USD 5.000" },
  { value: "nose", es: "Todavía no lo sé", en: "I don't know yet", pt: "Ainda não sei" },
];

export const URGENCY_OPTIONS: IntakeOption[] = [
  { value: "ya", es: "Lo necesito ya", en: "I need it now", pt: "Preciso agora" },
  { value: "mes", es: "Dentro de este mes", en: "Within this month", pt: "Dentro deste mês" },
  { value: "trimestre", es: "En los próximos meses", en: "In the coming months", pt: "Nos próximos meses" },
  { value: "explorando", es: "Estoy explorando", en: "Just exploring", pt: "Estou explorando" },
];

export const optionLabel = (opts: IntakeOption[], value: string, locale: Locale) => {
  const o = opts.find((x) => x.value === value);
  if (!o) return value;
  return o[locale] ?? o.es;
};

export const values = (opts: IntakeOption[]) => opts.map((o) => o.value) as [string, ...string[]];
