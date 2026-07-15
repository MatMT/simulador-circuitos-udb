import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulador Dinámico de Laboratorio UDB | Circuitos & MNA",
  description:
    "Simulador interactivo exacto de circuitos eléctricos con tablero acrílico de 9 resistencias. Análisis de Leyes de Kirchhoff y Ohm en tiempo real mediante Análisis Nodal Modificado (MNA). Desarrollado por OlaLabs & Mateo Elías para la Universidad Don Bosco.",
  keywords: [
    "simulador circuitos",
    "universidad don bosco",
    "udb",
    "kirchhoff",
    "ohm",
    "mna",
    "OlaLabs",
    "mateo elias",
    "ingenieria electrica",
    "tablero acrilico"
  ],
  authors: [{ name: "Mateo Elías", url: "https://instagram.com/byelias._" }, { name: "OlaLabs", url: "https://ola-studio-tan.vercel.app" }],
  creator: "Mateo Elías (OlaLabs)",
  publisher: "OlaLabs",
  openGraph: {
    title: "Simulador Dinámico de Laboratorio UDB — OlaLabs",
    description:
      "Herramienta académica de alta precisión y diseño minimalista para el análisis y verificación de circuitos en el módulo acrílico de 9 resistencias. Patrocinado por OlaLabs.",
    type: "website",
    locale: "es_ES",
    siteName: "Simulador de Circuitos UDB"
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulador Dinámico de Laboratorio UDB | OlaLabs",
    description:
      "Simulaciones y cálculos exactos en tiempo real con Leyes de Kirchhoff & Ohm. Diseñado por Mateo Elías (@byelias._) y OlaLabs.",
    creator: "@byelias._"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
