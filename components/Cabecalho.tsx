"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolhaIcone } from "./Logo";
import { InstalarApp } from "./InstalarApp";
import { MenuPrincipal, type GrupoMenu } from "./MenuPrincipal";
import { useConta, type TipoConta } from "@/lib/conta";

const ICONE = {
  inicio: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
  talentos: "M11 4a7 7 0 1 0 4.4 12.4l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z",
  vagas: "M9 4h6a2 2 0 0 1 2 2v1h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V6a2 2 0 0 1 2-2Zm0 3h6V6H9Z",
  guia: "M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm8 1v5h5M7 13h10M7 17h7",
  jornal: "M3 5h13v15H5a2 2 0 0 1-2-2Zm3 3v4h7V8Zm0 6v1.6h7V14Zm0 3v1.6h5V17Zm11.5-9h3v10.5a1.5 1.5 0 0 1-3 0Z",
  perfil: "M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2 8 5v1H4v-1c0-3 3.6-5 8-5Z",
  painel: "M4 4h7v7H4Zm9 0h7v4h-7Zm0 6h7v10h-7ZM4 13h7v7H4Z",
  publicar: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm-1 5v3H8v2h3v3h2v-3h3v-2h-3V8Z",
};

type ItemNav = { href: string; rotulo: string; icone?: keyof typeof ICONE };

/**
 * Navegação de cada tipo de usuário: visitante, colaborador (aluno) e contratante.
 * topo = só o essencial no cabeçalho do computador; barra = barra de baixo do celular;
 * menu = tudo, no menu (☰) que fica no cabeçalho em qualquer tela.
 */
const NAV: Record<"visitante" | TipoConta, { topo: ItemNav[]; acao: ItemNav; barra: ItemNav[]; menu: GrupoMenu[] }> = {
  visitante: {
    topo: [
      { href: "/talentos", rotulo: "Talentos" },
      { href: "/oportunidades", rotulo: "Oportunidades" },
      { href: "/jornal", rotulo: "Jornal" },
    ],
    menu: [
      {
        titulo: "Explorar",
        itens: [
          { href: "/", rotulo: "Início" },
          { href: "/talentos", rotulo: "Talentos", dica: "Portfólios dos alunos" },
          { href: "/oportunidades", rotulo: "Oportunidades", dica: "Freelas, projetos e estágios" },
          { href: "/jornal", rotulo: "Jornal" },
        ],
      },
      {
        titulo: "Sobre o Fólium",
        itens: [
          { href: "/guia", rotulo: "Guia", dica: "Como funciona e quanto cobrar" },
          { href: "/planos", rotulo: "Planos" },
          { href: "/sobre", rotulo: "Sobre" },
          { href: "/privacidade", rotulo: "Termos e privacidade" },
          { href: "/entrar", rotulo: "Entrar ou criar conta" },
        ],
      },
    ],
    acao: { href: "/entrar", rotulo: "Entrar" },
    barra: [
      { href: "/", rotulo: "Início", icone: "inicio" },
      { href: "/talentos", rotulo: "Talentos", icone: "talentos" },
      { href: "/oportunidades", rotulo: "Vagas", icone: "vagas" },
      { href: "/jornal", rotulo: "Jornal", icone: "jornal" },
      { href: "/entrar", rotulo: "Entrar", icone: "perfil" },
    ],
  },
  colaborador: {
    topo: [
      { href: "/oportunidades", rotulo: "Oportunidades" },
      { href: "/talentos", rotulo: "Talentos" },
      { href: "/jornal", rotulo: "Jornal" },
    ],
    menu: [
      {
        titulo: "Sua área",
        itens: [
          { href: "/meu-perfil", rotulo: "Meu portfólio", dica: "Editar foto, trabalhos e contato" },
          { href: "/oportunidades", rotulo: "Oportunidades", dica: "Freelas, projetos e estágios" },
          { href: "/talentos", rotulo: "Talentos", dica: "Portfólios dos colegas" },
          { href: "/jornal", rotulo: "Jornal" },
        ],
      },
      {
        titulo: "Ajuda e Fólium",
        itens: [
          { href: "/guia", rotulo: "Guia do aluno", dica: "Quanto cobrar, negociar, evitar golpe" },
          { href: "/planos", rotulo: "Planos" },
          { href: "/feedback", rotulo: "Feedback", dica: "Fale com a equipe" },
          { href: "/sobre", rotulo: "Sobre" },
          { href: "/privacidade", rotulo: "Termos e privacidade", dica: "Seus dados e excluir conta" },
        ],
      },
    ],
    acao: { href: "/meu-perfil", rotulo: "Meu portfólio" },
    barra: [
      { href: "/", rotulo: "Início", icone: "inicio" },
      { href: "/oportunidades", rotulo: "Vagas", icone: "vagas" },
      { href: "/talentos", rotulo: "Talentos", icone: "talentos" },
      { href: "/jornal", rotulo: "Jornal", icone: "jornal" },
      { href: "/meu-perfil", rotulo: "Portfólio", icone: "perfil" },
    ],
  },
  contratante: {
    topo: [
      { href: "/talentos", rotulo: "Talentos" },
      { href: "/oportunidades", rotulo: "Vagas" },
      { href: "/publicar", rotulo: "Publicar vaga" },
      { href: "/jornal", rotulo: "Jornal" },
    ],
    menu: [
      {
        titulo: "Sua área",
        itens: [
          { href: "/painel", rotulo: "Meu painel", dica: "Suas vagas e interessados" },
          { href: "/talentos", rotulo: "Talentos", dica: "Buscar alunos" },
          { href: "/publicar", rotulo: "Publicar vaga" },
          { href: "/oportunidades", rotulo: "Mural de vagas" },
          { href: "/jornal", rotulo: "Jornal" },
        ],
      },
      {
        titulo: "Ajuda e Fólium",
        itens: [
          { href: "/guia", rotulo: "Guia do contratante", dica: "Passo a passo e quanto pagar" },
          { href: "/planos", rotulo: "Planos" },
          { href: "/feedback", rotulo: "Feedback", dica: "Fale com a equipe" },
          { href: "/sobre", rotulo: "Sobre" },
          { href: "/privacidade", rotulo: "Termos e privacidade", dica: "Seus dados e excluir conta" },
        ],
      },
    ],
    acao: { href: "/painel", rotulo: "Meu painel" },
    barra: [
      { href: "/talentos", rotulo: "Talentos", icone: "talentos" },
      { href: "/oportunidades", rotulo: "Vagas", icone: "vagas" },
      { href: "/publicar", rotulo: "Publicar", icone: "publicar" },
      { href: "/jornal", rotulo: "Jornal", icone: "jornal" },
      { href: "/painel", rotulo: "Painel", icone: "painel" },
    ],
  },
};

function ativo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Cabecalho() {
  const pathname = usePathname();
  const { conta, logado } = useConta();
  const nav = NAV[conta?.tipo ?? "visitante"];
  // Logado mas a conta ainda carregando: o botão já leva para a área certa depois.
  const acao = logado && !conta ? { href: "/entrar", rotulo: "Minha conta" } : nav.acao;
  return (
    <>
      <header className="cabecalho">
        <div className="container cabecalho-interno">
          <Link href="/" className="logo" aria-label="Fólium, página inicial">
            <FolhaIcone />
            Fólium
          </Link>
          <nav className="nav" aria-label="Principal">
            {nav.topo.map((l) => (
              <Link key={l.href} href={l.href} data-tour={l.href.slice(1)} className={ativo(pathname, l.href) ? "ativo" : ""}>{l.rotulo}</Link>
            ))}
            <Link href={acao.href} data-tour={acao.href.slice(1)} className="botao botao-primario">{acao.rotulo}</Link>
          </nav>
          <div className="cabecalho-direita">
            <InstalarApp variante="cabecalho" />
            <Link href={acao.href} data-tour={acao.href.slice(1)} className="botao botao-contorno barra-entrar" style={{ minHeight: 40, padding: "6px 14px" }}>
              {acao.rotulo}
            </Link>
            <MenuPrincipal grupos={nav.menu} logado={logado} />
          </div>
        </div>
      </header>
      <nav className="barra-inferior" aria-label="Navegação">
        {nav.barra.map((l) => (
          <Link key={l.href} href={l.href} data-tour={l.href.slice(1) || "inicio"} className={ativo(pathname, l.href) ? "ativo" : ""}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d={ICONE[l.icone ?? "inicio"]} fill="currentColor" fillRule={l.icone === "jornal" || l.icone === "publicar" ? "evenodd" : undefined} />
            </svg>
            {l.rotulo}
          </Link>
        ))}
      </nav>
    </>
  );
}
