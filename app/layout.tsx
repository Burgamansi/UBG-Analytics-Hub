import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UBG Analytics Hub — União Bag",
  description: "Cockpit executivo de indicadores gerenciais — Comercial, RH e Financeiro",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
