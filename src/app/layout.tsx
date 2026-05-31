import type { Metadata } from "next";
import { Inter_Tight, Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Surcodia · cobros mensuales",
  description:
    "Gestión de cobros recurrentes y portal de autogestión para tus clientes. Surcodia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Aurora />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
