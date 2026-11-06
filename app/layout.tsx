import type { Metadata, Viewport } from "next";
import { Gabarito, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-gabarito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tijereta · una sola agenda para todo el equipo",
  description:
    "Prototipo de gestión para peluquerías y barberías argentinas: agenda única, link de reserva para pegar en el chat y margen por servicio. Integraciones simuladas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${jakarta.variable} ${gabarito.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
