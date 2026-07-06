"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Slider con auto-avance para las fotos vendidas de Belgrano. Crossfade
// cada 4s, pausa en hover, indicadores-píxel clickeables. Con
// prefers-reduced-motion queda estático en la primera foto.
export function BelgranoSlider({
  photos,
  placeholder,
}: {
  photos: string[];
  placeholder: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (photos.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), 4000);
    return () => clearInterval(id);
  }, [photos.length, paused]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[3/2] w-full items-center justify-center border-2 border-dashed border-[#0a0a0a]/30">
        <p className="px-6 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-[#0a0a0a]/50">
          {placeholder}
        </p>
      </div>
    );
  }

  return (
    <figure
      className="relative m-0 w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden border border-[#0a0a0a]/60 bg-[#0a0a0a]">
        {photos.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`Foto ${i + 1} — Belgrano campeón`}
            fill
            unoptimized
            className="object-cover transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Foto ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-2.5 w-2.5 border border-[#0a0a0a]/50 transition-colors"
              style={{ backgroundColor: i === index ? "#0a0a0a" : "rgba(250,250,250,0.75)" }}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
