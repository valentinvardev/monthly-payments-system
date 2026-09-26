import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

// Dónde trabaja Valentín hoy, con el logo de Stealth Seller. Va en el hero y
// en "Quién hace el trabajo": el que llega por un mensaje en frío ve que
// quien le escribe hace esto todos los días en una empresa de producto.
//
// El logo es el de stealthseller.co con el relleno pasado a blanco, porque
// el original es oscuro y sobre este fondo no se ve.
export function StealthSellerBadge({ label }: { label: string }) {
  return (
    <a
      href="https://stealthseller.co"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 border border-white/12 bg-[#131313] py-1.5 pl-3 pr-2.5 text-[12px] text-white/60 transition hover:border-white/25 hover:text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0070F3]"
    >
      <span className="whitespace-nowrap">{label}</span>
      <Image
        src="/logos/stealth-seller.svg"
        alt="Stealth Seller"
        width={111}
        height={15}
        unoptimized
        className="h-[15px] w-auto"
      />
      <ArrowUpRight className="h-3.5 w-3.5 text-white/35 transition group-hover:text-white/70" aria-hidden />
    </a>
  );
}
