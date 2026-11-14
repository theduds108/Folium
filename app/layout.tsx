import type { Metadata, Viewport } from "next";
import { Archivo_Black, Caveat, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AbaFeedback } from "@/components/AbaFeedback";
import { AvisoSenha } from "@/components/AvisoSenha";
import { FaixaConta } from "@/components/seguranca/FaixaConta";
import { Cabecalho } from "@/components/Cabecalho";
import { JanelaInstalar } from "@/components/InstalarApp";
import { RegistrarSW } from "@/components/RegistrarSW";
import { TourGuiado } from "@/components/TourGuiado";
import { VisaoDemo } from "@/components/VisaoDemo";
import { Abertura } from "@/components/animacoes/Abertura";
import { Revelar } from "@/components/animacoes/Revelar";
import { SCRIPT_CAPTURA } from "@/lib/instalar-script";

const titulo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--fonte-titulo", display: "swap" });
const mao = Caveat({ subsets: ["latin"], variable: "--fonte-mao", display: "swap" });
const texto = Inter({ subsets: ["latin"], variable: "--fonte-texto", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Fólium · Portfólios que viram oportunidade", template: "%s · Fólium" },
  description:
    "Vitrine segura de portfólios de universitários da UNISAGRADO. Encontre talentos locais para seu próximo freela.",
  appleWebApp: { capable: true, title: "Fólium", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#4F7A3A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${titulo.variable} ${texto.variable} ${mao.variable}`}>
      <head>
        {/* Guarda o pedido de instalação do navegador antes do React carregar (ver lib/instalar.ts). */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_CAPTURA }} />
      </head>
      <body>
        <Abertura />
        <Cabecalho />
        <AvisoSenha />
        <FaixaConta />
        <main>{children}</main>
        <footer className="rodape">
          <div className="container rodape-interno">
            <span>
              Fólium · projeto de empreendedorismo, em parceria com a UNISAGRADO.
            </span>
            {/* Os outros links (Guia, Sobre, Planos, Feedback, Rever o tour, Instalar) ficam no menu ☰ do cabeçalho. */}
            <span>
              <Link href="/sobre">Sobre</Link> · <Link href="/conduta">Conduta e segurança</Link> · <Link href="/privacidade">Privacidade</Link> · <Link href="/feedback">Feedback</Link>
            </span>
          </div>
        </footer>
        <AbaFeedback />
        <VisaoDemo />
        <TourGuiado />
        <JanelaInstalar />
        <RegistrarSW />
        <Revelar />
      </body>
    </html>
  );
}
