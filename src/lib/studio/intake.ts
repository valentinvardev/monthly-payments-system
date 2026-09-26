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
  { value: "ia", es: "Tecnología y software", en: "Technology and software", pt: "Tecnologia e software" },
  { value: "otro", es: "Otro rubro", en: "Another industry", pt: "Outro setor" },
];

export const PROJECT_TYPE_OPTIONS: IntakeOption[] = [
  { value: "nuevo", es: "Una herramienta nueva", en: "A new tool", pt: "Uma ferramenta nova" },
  { value: "tienda", es: "Vender online", en: "Selling online", pt: "Vender online" },
  { value: "sistema", es: "Un sistema a medida", en: "A custom system", pt: "Um sistema sob medida" },
  { value: "automatizacion", es: "Automatizar un proceso con IA", en: "Automating a process with AI", pt: "Automatizar um processo com IA" },
  { value: "mejora", es: "Mejorar algo que ya uso", en: "Improving something I already use", pt: "Melhorar algo que já uso" },
];

export const CURRENT_STATE_OPTIONS: IntakeOption[] = [
  { value: "nada", es: "Nada todavía, todo a mano o en planillas", en: "Nothing yet, all by hand or in spreadsheets", pt: "Nada ainda, tudo à mão ou em planilhas" },
  { value: "redes", es: "Solo WhatsApp y redes", en: "Just WhatsApp and social media", pt: "Só WhatsApp e redes sociais" },
  { value: "sitio", es: "Un sitio o tienda online", en: "A website or online store", pt: "Um site ou loja online" },
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
