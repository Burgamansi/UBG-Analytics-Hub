import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RJT NEXUS 360° — Enterprise Management Platform",
  description: "Cockpit executivo de indicadores gerenciais — Comercial, RH, Financeiro, Qualidade e Produção",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
