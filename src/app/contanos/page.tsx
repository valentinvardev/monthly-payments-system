import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/studio/i18n";
import { StudioBrand } from "@/components/studio/pixel";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { LangToggle } from "@/components/studio/LangToggle";
import { IntakeForm } from "./_components/IntakeForm";

export const metadata: Metadata = {
  title: "Contanos tu proyecto — Surcodia Studio",
  description:
    "Contanos qué querés construir: te respondemos en el día con una propuesta concreta.",
};

export default async function ContanosPage() {
  const locale = await getLocale();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="min-w-0 transition-opacity hover:opacity-85">
            <StudioBrand />
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle locale={locale} />
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-white"
            >
              {locale === "en" ? "← Back" : locale === "pt" ? "← Voltar" : "← Volver"}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-14">
        <IntakeForm locale={locale} />
      </main>
    </div>
  );
}
