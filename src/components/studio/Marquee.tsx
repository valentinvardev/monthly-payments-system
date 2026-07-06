// Tira infinita de palabras clave — separador entre secciones que refuerza
// el mensaje. El contenido va duplicado (segunda copia aria-hidden) y la
// animación corre exactamente el 50% del track para el loop perfecto.
export function Marquee({ items, accent = "#0070F3" }: { items: string[]; accent?: string }) {
  const row = (hidden: boolean) => (
    <div className="flex items-center" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span
          key={`${it}-${i}`}
          className="flex items-center gap-5 pr-5 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40"
        >
          {it}
          <span
            className="inline-block h-[6px] w-[6px]"
            style={{ backgroundColor: i % 4 === 3 ? accent : "rgba(255,255,255,0.22)" }}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className="studio-marquee border-y border-white/8 py-4">
      <div className="studio-marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
