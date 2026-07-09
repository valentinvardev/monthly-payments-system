import { IconStudio } from "./_components/IconStudio";

export default function IconsPage() {
  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Íconos
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Generador de <span className="font-light text-foreground/70">íconos</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gemini genera a 1:1 con fondo blanco liso; acá se recorta el fondo automáticamente
          (flood-fill desde los bordes) y sale un PNG transparente de 500×500.
        </p>
      </header>

      <IconStudio />
    </div>
  );
}
