// Payment-method icons. Mostly monochrome (sober palette) with a single
// brand-coloured accent on MercadoPago so it stays instantly recognisable.

type Props = { className?: string; size?: number };

export function MercadoPagoIcon({ className, size = 22 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mp-coin" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="oklch(0.93 0.16 95)" />
          <stop offset="100%" stopColor="oklch(0.82 0.18 85)" />
        </radialGradient>
      </defs>
      {/* Soft halo */}
      <circle cx="16" cy="16" r="15" fill="oklch(0.85 0.18 90 / 0.10)" />
      {/* Yellow coin */}
      <circle cx="16" cy="16" r="11" fill="url(#mp-coin)" />
      {/* Inner highlight crescent */}
      <path
        d="M9 11 A11 11 0 0 1 22 8"
        stroke="oklch(1 0 0 / 0.45)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Stylised handshake — two interlocked curves */}
      <path
        d="M9.5 17.5 Q12.5 12 16 16 Q19.5 20 22.5 14.5"
        stroke="oklch(0.38 0.12 235)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function BankTransferIcon({ className, size = 22 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Pediment */}
      <path d="M5 13 L16 6 L27 13" />
      {/* Architrave + base */}
      <line x1="4" y1="13.5" x2="28" y2="13.5" />
      <line x1="3.5" y1="26" x2="28.5" y2="26" strokeWidth="1.8" />
      <line x1="3" y1="28.5" x2="29" y2="28.5" strokeWidth="0.8" opacity="0.6" />
      {/* Columns */}
      <line x1="8" y1="14.5" x2="8" y2="25" />
      <line x1="13" y1="14.5" x2="13" y2="25" />
      <line x1="19" y1="14.5" x2="19" y2="25" />
      <line x1="24" y1="14.5" x2="24" y2="25" />
      {/* Top dot — keystone */}
      <circle cx="16" cy="9" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CryptoIcon({ className, size = 22 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crypto-hex" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.92 0.02 220 / 0.95)" />
          <stop offset="100%" stopColor="oklch(0.68 0.05 230 / 0.85)" />
        </linearGradient>
      </defs>
      {/* Hex coin outline */}
      <path
        d="M16 3 L27 9 L27 23 L16 29 L5 23 L5 9 Z"
        fill="oklch(0.18 0.015 240 / 0.4)"
        stroke="url(#crypto-hex)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Inner shine */}
      <path
        d="M16 5.5 L24.7 10.4"
        stroke="oklch(1 0 0 / 0.3)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      {/* Stylised $ symbol */}
      <path
        d="M16 9 L16 23"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M19 12.5 Q19 10.5 16.5 10.5 L14.5 10.5 Q12 10.5 12 12.8 Q12 15 14.5 15.5 L17.5 16.2 Q20 16.7 20 19 Q20 21.4 17.5 21.5 L15 21.5 Q12.5 21.5 12.5 19.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}
