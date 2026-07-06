"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/studio/i18n";

const LANGS: { value: Locale; label: string }[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
];

// Dropdown de idioma. El nombre de la cookie tiene que coincidir con
// LOCALE_COOKIE en src/lib/studio/i18n.ts (no lo importamos para no
// arrastrar next/headers a un client component).
export function LangToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  return (
    <select
      value={locale}
      onChange={(e) => {
        document.cookie = `studio_lang=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      aria-label="Idioma"
      className="h-8 cursor-pointer appearance-none border border-white/12 bg-[#161616] px-2.5 pr-6 font-mono text-[10px] uppercase tracking-[0.14em] text-white/75 transition hover:bg-[#1f1f1f] focus:outline-none"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0h8L4 5z' fill='%23888'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      {LANGS.map((l) => (
        <option key={l.value} value={l.value} className="bg-[#161616] text-white">
          {l.label}
        </option>
      ))}
    </select>
  );
}
