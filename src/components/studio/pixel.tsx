// Sistema pixel de Surcodia Studio: fuente 5×5, marca Cruz del Sur y
// monograma S. Todo SVG puro generado por datos — server-safe, sin JS
// en el cliente, escalable sin perder el borde duro.

const PIXFONT: Record<string, string[]> = {
  S: ["11111", "10000", "11111", "00001", "11111"],
  U: ["10001", "10001", "10001", "10001", "11111"],
  R: ["11110", "10001", "11110", "10010", "10001"],
  C: ["11111", "10000", "10000", "10000", "11111"],
  O: ["11111", "10001", "10001", "10001", "11111"],
  D: ["11110", "10001", "10001", "10001", "11110"],
  I: ["11111", "00100", "00100", "00100", "11111"],
  A: ["01110", "10001", "11111", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100"],
};

type Special = { letter: number; x: number; y: number; color: string };

// Wordmark en letras-bloque. Coordenadas en unidades lógicas y width 100%
// por defecto: el SVG escala al contenedor manteniendo píxeles crocantes.
export function PixelWord({
  word,
  color = "currentColor",
  specials = [],
  letterGap = 1,
  className,
}: {
  word: string;
  color?: string;
  specials?: Special[];
  letterGap?: number;
  className?: string;
}) {
  const letters = word.toUpperCase().split("").filter((ch) => PIXFONT[ch]);
  const cols = letters.length * 5 + (letters.length - 1) * letterGap;
  const rects: React.ReactNode[] = [];
  let cx = 0;
  letters.forEach((ch, li) => {
    const glyph = PIXFONT[ch];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (glyph[r][c] !== "1") continue;
        const sp = specials.find((s) => s.letter === li && s.x === c && s.y === r);
        rects.push(
          <rect
            key={`${li}-${r}-${c}`}
            x={cx + c}
            y={r}
            width={1}
            height={1}
            fill={sp ? sp.color : color}
          />,
        );
      }
    }
    cx += 5 + letterGap;
  });

  return (
    <svg
      viewBox={`0 0 ${cols} 5`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      {rects}
    </svg>
  );
}

// Cruz del Sur: cuatro estrellas blancas + ε Crucis en acento.
const CRUX_STARS: [number, number, number][] = [
  [4, 0, 2], // γ — arriba
  [0, 4, 2], // β — izquierda
  [8, 3, 2], // δ — derecha
  [3, 9, 3], // α — abajo, la más brillante
];
const CRUX_EPSILON: [number, number] = [7, 6];

export function CruxMark({
  size = 40,
  color = "currentColor",
  accent = "#0070F3",
  className,
}: {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * (13 / 12)}
      viewBox="0 0 12 13"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
      focusable="false"
    >
      {CRUX_STARS.map(([x, y, s]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={s} height={s} fill={color} />
      ))}
      <rect x={CRUX_EPSILON[0]} y={CRUX_EPSILON[1]} width={1} height={1} fill={accent} />
    </svg>
  );
}

// Lockup de marca para headers del studio: monograma + "surcodia" en
// tipografía pixel (Silkscreen) + "studio" en sans. Server-safe.
export function StudioBrand() {
  return (
    <span className="flex items-center gap-2.5">
      <SMonogram size={22} color="#fafafa" />
      <span className="font-pixel text-[13px] tracking-[0.02em] text-[#fafafa]">
        surcodia
      </span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.38em] text-white/45">
        studio
      </span>
    </span>
  );
}

// Monograma S 7×7 con el píxel que se escapa (para favicon / nav).
// Exportado para que el exportador de logos del panel dibuje el PNG
// con exactamente la misma grilla.
export const S_GRID = ["0111111", "1100000", "1100000", "0111110", "0000011", "0000011", "1111110"];

export function SMonogram({
  size = 28,
  color = "currentColor",
  accent = "#0070F3",
  escape = true,
  className,
}: {
  size?: number;
  color?: string;
  accent?: string;
  escape?: boolean;
  className?: string;
}) {
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (S_GRID[r][c] === "1") {
        rects.push(<rect key={`${r}-${c}`} x={c} y={r + 2} width={1} height={1} fill={color} />);
      }
    }
  }
  return (
    <svg
      width={size}
      height={size * (9 / 10)}
      viewBox="0 0 10 9"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
      focusable="false"
    >
      {rects}
      {escape && <rect x={8.6} y={0} width={1} height={1} fill={accent} />}
    </svg>
  );
}
