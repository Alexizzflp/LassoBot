import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LassoBot | Pronóstico de Calificaciones UTP",
  description: "Calculadora inteligente de calificaciones para la Universidad Tecnológica de Panamá. Ingresa con tu Cédula, registra tus notas y conoce lo que necesitas para aprobar.",
  openGraph: {
    title: "LassoBot | Pronóstico de Calificaciones UTP",
    description: "Calculadora inteligente de calificaciones para la UTP. Asegura tu semestre.",
    url: "https://lazzobot.vercel.app", // Reemplaza con tu dominio final
    siteName: "LassoBot",
    locale: "es_PA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LassoBot | Pronóstico de Calificaciones UTP",
    description: "Asegura tu semestre en la UTP con LassoBot.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#070b14] text-slate-50">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
