import type { Metadata } from "next";
import { Inter_Tight, Geist, Geist_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { Aurora } from "@/components/Aurora";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

// Fuente pixel para la marca del studio (wordmark + nav de la landing).
const silkscreen = Silkscreen({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Surcodia Studio",
    template: "%s · Surcodia",
  },
  description:
    "Estudio de desarrollo de software: e-commerce, plataformas para fotógrafos y herramientas con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} ${silkscreen.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Aurora />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
