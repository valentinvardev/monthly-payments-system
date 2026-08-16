import Link from "next/link";
import { SMonogram } from "@/components/studio/pixel";

// Marco común de las pantallas de acceso (login, invitación, reseteo,
// setup). Las cinco eran el mismo bloque copiado con un orbe azul
// difuminado de la identidad vieja; ahora comparten este panel plano
// del studio y sólo cambian el rótulo, el título y el contenido.
//
// El eyebrow no decora: dice en qué paso del acceso estás.
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="reveal w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5 transition-opacity hover:opacity-85"
        >
          <SMonogram size={24} color="#fafafa" />
          <span className="font-pixel text-[15px] tracking-[0.02em] text-[#fafafa]">
            surcodia
          </span>
        </Link>

        <div className="border border-white/10 bg-[#0d0d0c] p-7 sm:p-8">
          <header>
            <p className="studio-eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.025em] text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2.5 text-sm leading-relaxed text-white/55">{subtitle}</p>
            )}
          </header>

          <div className="mt-7">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </main>
  );
}
