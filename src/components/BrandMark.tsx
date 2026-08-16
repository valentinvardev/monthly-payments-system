// Marca del panel y el portal.
//
// Antes esto era un iceberg con degradés (la identidad "glaciar").
// La identidad actual es el sistema pixel de la landing, así que
// BrandMark y Wordmark delegan en los componentes del studio: una
// sola definición de la marca para todo el producto.
//
// Se mantienen los nombres y la firma para no tocar las seis
// pantallas que ya los importan.

import { SMonogram } from "@/components/studio/pixel";

type Props = {
  className?: string;
  size?: number;
};

export function BrandMark({ className, size = 28 }: Props) {
  return <SMonogram size={size} color="#fafafa" className={className} />;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-pixel text-[13px] tracking-[0.02em] text-[#fafafa] ${className ?? ""}`}
    >
      surcodia
    </span>
  );
}
