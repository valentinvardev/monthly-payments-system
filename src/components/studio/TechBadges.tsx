import {
  siMercadopago,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siReact,
  siSupabase,
  siTailwindcss,
  siTrpc,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";

const STACK: SimpleIcon[] = [
  siNextdotjs,
  siReact,
  siTypescript,
  siNodedotjs,
  siTrpc,
  siPrisma,
  siSupabase,
  siPostgresql,
  siTailwindcss,
  siMercadopago,
  siVercel,
];

// Marcas oscuras (Next, Vercel, Prisma…) no se leen sobre fondo ink:
// si el color oficial es muy oscuro, el ícono va en blanco.
function iconColor(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.25 ? "#FAFAFA" : `#${hex}`;
}

export function TechBadges() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {STACK.map((icon) => (
        <span
          key={icon.slug}
          className="inline-flex items-center gap-2 border border-white/12 bg-white/[0.02] px-3 py-2 transition-colors hover:border-white/30 hover:bg-white/[0.05]"
        >
          <svg
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill={iconColor(icon.hex)}
            aria-hidden
            focusable="false"
          >
            <path d={icon.path} />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
            {icon.title}
          </span>
        </span>
      ))}
    </div>
  );
}
