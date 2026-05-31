// Per-asset crypto icons. Brand-coloured but contained (small size, single
// filled circle + monogram glyph) so they read instantly without breaking
// the sober glacier palette.

type Props = { className?: string; size?: number };

export function UsdtIcon({ className, size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#26A17B" />
      {/* T glyph + crossbar (tether style) */}
      <path
        d="M14.4 11.2 V13.6 H9.6 V11.2 H22.4 V13.6 H17.6 V20.5 Q17.6 21.4 16 21.4 Q14.4 21.4 14.4 20.5 Z"
        fill="#fff"
      />
      <ellipse cx="16" cy="14.5" rx="5.6" ry="1.05" fill="#26A17B" />
    </svg>
  );
}

export function UsdcIcon({ className, size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#2775CA" />
      {/* Stylised $ — the recognizable Circle USD mark uses a single vertical stroke through a curved S */}
      <path
        d="M16 8 L16 24"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M19.5 12.2 Q19.5 10.2 17 10.2 H15 Q12.6 10.2 12.6 12.4 Q12.6 14.4 15 14.9 L17.6 15.5 Q20 16 20 18.2 Q20 20.5 17.5 20.6 H15 Q12.5 20.6 12.5 18.6"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function BtcIcon({ className, size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#F7931A" />
      {/* ₿ symbol */}
      <g transform="rotate(-12 16 16)" fill="#fff">
        <rect x="10.2" y="9" width="1.7" height="14" rx="0.4" />
        <rect x="13.2" y="6.7" width="1.4" height="3" rx="0.3" />
        <rect x="13.2" y="22.3" width="1.4" height="3" rx="0.3" />
        <rect x="16.2" y="6.7" width="1.4" height="3" rx="0.3" />
        <rect x="16.2" y="22.3" width="1.4" height="3" rx="0.3" />
        <path
          d="M11.9 9 H18.2 Q21.6 9 21.6 12.3 Q21.6 14.3 19.9 15.2 Q22.4 15.9 22.4 18.7 Q22.4 23 18.4 23 H11.9 Z M14.3 11.1 V14.5 H17.8 Q19.3 14.5 19.3 12.8 Q19.3 11.1 17.8 11.1 Z M14.3 16.6 V20.9 H18 Q19.9 20.9 19.9 18.75 Q19.9 16.6 18 16.6 Z"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export function LtcIcon({ className, size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#345D9D" />
      {/* Stylised Ł */}
      <path
        d="M13.5 7.5 H17 L15 16.5 L19.2 15.1 L18.4 18 L14.3 19.4 L13.2 23.7 H22.5 L21.7 26.5 H10.5 L12.2 19.9 L9.6 20.8 L10.4 17.9 L13 17 Z"
        fill="#fff"
      />
    </svg>
  );
}

export function GenericCoinIcon({ className, size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="oklch(0.45 0.05 230)" />
      <circle cx="16" cy="16" r="14" fill="none" stroke="oklch(0.85 0.04 220 / 0.5)" strokeWidth="1" />
      <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill="oklch(0.95 0.01 220)" fontFamily="ui-sans-serif">
        $
      </text>
    </svg>
  );
}

export function CryptoAssetIcon({ asset, size = 22, className }: { asset: string } & Props) {
  switch (asset.toUpperCase()) {
    case "USDT":
      return <UsdtIcon size={size} className={className} />;
    case "USDC":
      return <UsdcIcon size={size} className={className} />;
    case "BTC":
      return <BtcIcon size={size} className={className} />;
    case "LTC":
      return <LtcIcon size={size} className={className} />;
    default:
      return <GenericCoinIcon size={size} className={className} />;
  }
}
