import type { Metadata, Viewport } from "next";
import { Archivo_Black, Caveat, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Cabecalho } from "@/components/Cabecalho";
import { RegistrarSW } from "@/components/RegistrarSW";
import { Revelar } from "@/components/animacoes/Revelar";

const titulo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--fonte-titulo", display: "swap" });
const mao = Caveat({ subsets: ["latin"], variable: "--fonte-mao", display: "swap" });
const texto = Inter({ subsets: ["latin"], variable: "--fonte-texto", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Fólium · Portfólios que viram oportunidade", template: "%s · Fólium" },
  description:
    "Vitrine segura de portfólios de universitários da UNISAGRADO. Encontre talentos locais para seu próximo freela.",
  appleWebApp: { capable: true, title: "Fólium", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#4F7A3A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable} ${mao.variable}`}>
      <body>
        <Cabecalho />
        <main>{children}</main>
        <footer className="rodape">
          <div className="container rodape-interno">
            <span>
              Fólium · projeto de empreendedorismo, em parceria com a UNISAGRADO. Fotos de demonstração:{" "}
              <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
            </span>
            <span>
              <Link href="/talentos">Talentos</Link> · <Link href="/entrar">Entrar</Link>
            </span>
          </div>
        </footer>
        <RegistrarSW />
        <Revelar />
      </body>
    </html>
  );
}
