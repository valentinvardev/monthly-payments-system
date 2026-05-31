type Props = {
  className?: string;
  size?: number;
};

export function BrandMark({ className, size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="surc-iceberg" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.97 0.01 220)" />
          <stop offset="60%" stopColor="oklch(0.78 0.05 220)" />
          <stop offset="100%" stopColor="oklch(0.55 0.06 230)" />
        </linearGradient>
        <linearGradient id="surc-reflect" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.70 0.05 225 / 0.35)" />
          <stop offset="100%" stopColor="oklch(0.40 0.04 245 / 0.03)" />
        </linearGradient>
      </defs>

      <path d="M16 3 L28 15.4 L16 16.5 L4 15.4 Z" fill="url(#surc-iceberg)" />

      <path
        d="M4 15.4 L16 16.5 L28 15.4"
        stroke="oklch(0.96 0.01 220 / 0.35)"
        strokeWidth="0.35"
        fill="none"
      />

      <path d="M16 17.4 L28 16.6 L16 27 L4 16.6 Z" fill="url(#surc-reflect)" />

      <path
        d="M16 5.2 L24.5 14.6 L16 15.4 Z"
        fill="oklch(1 0 0 / 0.22)"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-display text-[1.05rem] font-medium tracking-tight text-foreground/95 ${className ?? ""}`}
    >
      Surcodia
    </span>
  );
}
