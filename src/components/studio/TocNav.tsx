"use client";

import { useEffect, useState } from "react";

// Índice lateral con sección activa. Usa IntersectionObserver (nunca
// listeners de scroll) para no costar nada por frame.
export function TocNav({
  sections,
}: {
  sections: { id: string; n: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Índice"
      className="top-24 h-max lg:sticky rounded-lg border border-white/12 bg-[#0f0f0f] p-4 lg:border-0 lg:bg-transparent lg:p-0"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
        Índice
      </p>
      <ul className="mt-3 space-y-0.5">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={[
                  "flex gap-2.5 border-l-2 py-1.5 pl-3 text-[13px] leading-snug transition",
                  isActive
                    ? "border-[#0070F3] text-white"
                    : "border-white/10 text-white/45 hover:border-white/30 hover:text-white/80",
                ].join(" ")}
              >
                <span className="font-mono text-[10px] tabular-nums opacity-60">{s.n}</span>
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
