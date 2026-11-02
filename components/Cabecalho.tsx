"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolhaIcone } from "./Logo";

const LINKS = [
  { href: "/", rotulo: "Início", icone: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" },
  { href: "/talentos", rotulo: "Talentos", icone: "M11 4a7 7 0 1 0 4.4 12.4l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" },
  { href: "/oportunidades", rotulo: "Vagas", icone: "M9 4h6a2 2 0 0 1 2 2v1h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V6a2 2 0 0 1 2-2Zm0 3h6V6H9Z" },
  { href: "/guia", rotulo: "Guia", icone: "M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm8 1v5h5M7 13h10M7 17h7" },
  { href: "/meu-perfil", rotulo: "Meu perfil", icone: "M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2 8 5v1H4v-1c0-3 3.6-5 8-5Z" },
];

function ativo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Cabecalho() {
  const pathname = usePathname();
  return (
    <>
      <header className="cabecalho">
        <div className="container cabecalho-interno">
          <Link href="/" className="logo" aria-label="Fólium, página inicial">
            <FolhaIcone />
            Fólium
          </Link>
          <nav className="nav" aria-label="Principal">
            <Link href="/talentos" className={ativo(pathname, "/talentos") ? "ativo" : ""}>Talentos</Link>
            <Link href="/oportunidades" className={ativo(pathname, "/oportunidades") ? "ativo" : ""}>Oportunidades</Link>
            <Link href="/guia" className={ativo(pathname, "/guia") ? "ativo" : ""}>Guia</Link>
            <Link href="/sobre" className={ativo(pathname, "/sobre") ? "ativo" : ""}>Sobre</Link>
            <Link href="/planos" className={ativo(pathname, "/planos") ? "ativo" : ""}>Planos</Link>
            <Link href="/meu-perfil" className={ativo(pathname, "/meu-perfil") ? "ativo" : ""}>Meu portfólio</Link>
            <Link href="/entrar" className="botao botao-primario">Entrar</Link>
          </nav>
          <Link href="/entrar" className="botao botao-contorno barra-entrar" style={{ minHeight: 38, padding: "6px 14px" }}>
            Entrar
          </Link>
        </div>
      </header>
      <nav className="barra-inferior" aria-label="Navegação">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={ativo(pathname, l.href) ? "ativo" : ""}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d={l.icone} fill="currentColor" /></svg>
            {l.rotulo}
          </Link>
        ))}
      </nav>
    </>
  );
}
