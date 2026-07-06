"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/studio/i18n";

// El nombre de la cookie tiene que coincidir con LOCALE_COOKIE en
// src/lib/studio/i18n.ts (no lo importamos para no arrastrar
// next/headers a un client component).
export function LangToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function set(next: Locale) {
    document.cookie = `studio_lang=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.18em]">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={locale === l}
          className={[
            "px-2 py-1 transition",
            locale === l
              ? "bg-white/10 text-white"
              : "text-white/45 hover:text-white/85",
          ].join(" ")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
