"use client";

import { useRef, useState, useEffect } from "react";

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
};

export function ProofUpload({ value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    if (!value.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const sizeKb = value ? Math.round(value.size / 1024) : 0;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group/upload flex w-full items-center gap-3 rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.04]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-[#161616] text-foreground/70 transition group-hover/upload:text-foreground/95">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6.5" />
              <path d="M17 3v6h6" />
              <path d="M17 3l6 6" />
              <path d="M8 13l3-3 3 3" />
              <path d="M11 10v8" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-2">
              <span className="text-sm text-foreground/90">Adjuntar comprobante</span>
              <span className="rounded-none border border-white/12 bg-[#161616] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/80">
                Opcional
              </span>
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {hint ?? "Imagen o PDF · captura del pago o hash de la transacción"}
            </span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 group-hover/upload:text-foreground/80">
            Subir
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-white/12 bg-[#161616] px-3 py-2.5">
          {previewUrl ? (
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/12 bg-[#161616]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="comprobante"
                className="h-full w-full object-cover"
              />
            </span>
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-[#161616] text-foreground/70">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground/95">{value.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {sizeKb < 1024 ? `${sizeKb} KB` : `${(sizeKb / 1024).toFixed(1)} MB`} ·{" "}
              {value.type || "archivo"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-none border border-white/12 bg-[#161616] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground/95 hover:border-white/25 transition"
          >
            Cambiar
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-none border border-white/8 bg-transparent px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 hover:text-rose-100/90 hover:border-rose-300/30 transition"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}
