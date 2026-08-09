// Vocabulario compartido de la prospección saliente. Vive acá y no en el
// router porque lo usan el panel, la lista, los filtros y el importador.

export const STAGE_LABEL = {
  SIN_CONTACTAR: "Sin contactar",
  CONTACTADO: "Contactado",
  RESPONDIO: "Respondió",
  LLAMADA_AGENDADA: "Llamada agendada",
  PROPUESTA_ENVIADA: "Propuesta enviada",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
  DESCARTADO: "Descartado",
} as const;

export type Stage = keyof typeof STAGE_LABEL;

export const STAGE_ORDER = Object.keys(STAGE_LABEL) as Stage[];

// Etapas que cuentan como "me respondió". Un prospecto que llegó a
// propuesta obviamente respondió antes, así que la tasa de respuesta mira
// todo lo que esté de RESPONDIO en adelante y no sólo esa etapa exacta.
export const REPLIED_STAGES: Stage[] = [
  "RESPONDIO",
  "LLAMADA_AGENDADA",
  "PROPUESTA_ENVIADA",
  "GANADO",
];

// Lo mismo para "ya lo contacté": todo lo que no sea sin contactar ni
// descartado. Descartado es el que nunca calificó, no un contacto fallido.
export const CONTACTED_STAGES: Stage[] = [
  "CONTACTADO",
  "RESPONDIO",
  "LLAMADA_AGENDADA",
  "PROPUESTA_ENVIADA",
  "GANADO",
  "PERDIDO",
];

export const CHANNEL_LABEL = {
  EMAIL: "Email",
  INSTAGRAM_DM: "Instagram DM",
  TELEFONO: "Teléfono",
  PRESENCIAL: "Presencial",
  REFERIDO: "Referido",
} as const;

export type Channel = keyof typeof CHANNEL_LABEL;

export const TRI_LABEL = { SI: "Sí", NO: "No", NO_SE: "No sé" } as const;
export type Tri = keyof typeof TRI_LABEL;

export const ACTIVITY_LABEL = {
  NOTA: "Nota",
  CONTACTO: "Contacto enviado",
  RESPUESTA: "Respondió",
  LLAMADA: "Llamada",
  PROPUESTA: "Propuesta",
  CAMBIO_ESTADO: "Cambio de estado",
} as const;

export type ActivityKind = keyof typeof ACTIVITY_LABEL;

export const SEGMENT_LABEL: Record<string, string> = {
  idiomas: "Idiomas",
  futbol: "Fútbol infantil",
  danza: "Danza y baile",
  jardin: "Jardines",
  gimnasio: "Gimnasios",
  egresados: "Egresados",
  otro: "Otro",
};

/**
 * Califica cuando las tres respuestas son «Sí». No se guarda en la base:
 * se deriva, para que el panel no pueda terminar diciendo algo distinto
 * de lo que dicen los tres campos.
 */
export function qualifies(p: {
  usesMercadoPago: Tri;
  over100Students: Tri;
  chargesMonthly: Tri;
}): boolean {
  return (
    p.usesMercadoPago === "SI" && p.over100Students === "SI" && p.chargesMonthly === "SI"
  );
}

/** Cuántas de las tres preguntas están contestadas (con Sí o No). */
export function answered(p: {
  usesMercadoPago: Tri;
  over100Students: Tri;
  chargesMonthly: Tri;
}): number {
  return [p.usesMercadoPago, p.over100Students, p.chargesMonthly].filter(
    (v) => v !== "NO_SE",
  ).length;
}

/** Un solo seguimiento, a los 4 días del contacto. Nunca más de dos toques. */
export const FOLLOW_UP_DAYS = 4;

export function followUpDate(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + FOLLOW_UP_DAYS);
  return d;
}

/**
 * La señal a vigilar: con 100 contactos hechos y menos de 5% de respuesta,
 * el problema es el mensaje o el nicho, no el volumen.
 */
export const RESPONSE_RATE_FLOOR = 0.05;
export const RESPONSE_RATE_MIN_SAMPLE = 100;

export function responseRateAlarm(contacted: number, replied: number) {
  const rate = contacted > 0 ? replied / contacted : 0;
  return {
    rate,
    enoughSample: contacted >= RESPONSE_RATE_MIN_SAMPLE,
    belowFloor: contacted >= RESPONSE_RATE_MIN_SAMPLE && rate < RESPONSE_RATE_FLOOR,
  };
}
