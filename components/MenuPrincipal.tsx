"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { InstalarApp } from "./InstalarApp";
import { ReverTour } from "./TourGuiado";
import { sair } from "@/lib/sessao";

/**
 * Menu (☰) do cabeçalho.
 *
 * O cabeçalho mostra só o essencial; o resto (Guia, Sobre, Planos, Feedback, Rever o tour,
 * Instalar no celular) fica aqui. Abre uma folha de papel pela direita, na mesma página:
 * links internos nunca abrem em nova aba e nada do que estava preenchido se perde.
 * Fecha com Esc, clicando fora, no X ou ao escolher um link.
 */

export type ItemMenu = { href: string; rotulo: string; dica?: string };
export type GrupoMenu = { titulo: string; itens: ItemMenu[] };

function ativo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function MenuPrincipal({ grupos, logado = false }: { grupos: GrupoMenu[]; logado?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  const refBotao = useRef<HTMLButtonElement>(null);
  const refFolha = useRef<HTMLDivElement>(null);
  const idTitulo = useId();

  useEffect(() => setMontado(true), []);

  const fechar = useCallback((devolverFoco = true) => {
    setAberto(false);
    if (devolverFoco) refBotao.current?.focus({ preventScroll: true });
  }, []);

  // Trocou de página: fecha.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  // Aberto: trava a rolagem da página, foca o menu, Esc fecha e Tab fica dentro.
  useEffect(() => {
    if (!aberto) return;
    const html = document.documentElement;
    const antes = html.style.overflow;
    html.style.overflow = "hidden";
    refFolha.current?.querySelector<HTMLElement>(".menu-fechar")?.focus({ preventScroll: true });
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fechar();
      } else if (e.key === "Tab" && refFolha.current) {
        const focaveis = Array.from(refFolha.current.querySelectorAll<HTMLElement>("a, button"));
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const fim = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          fim.focus();
        } else if (!e.shiftKey && document.activeElement === fim) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      html.style.overflow = antes;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, fechar]);

  return (
    <>
      <button
        ref={refBotao}
        type="button"
        className="menu-botao"
        data-tour="menu"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
      >
        <span className="menu-riscos" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="menu-botao-rotulo">Menu</span>
      </button>

      {montado &&
        aberto &&
        createPortal(
          <div className="menu-fundo" onClick={() => fechar()}>
            <div
              ref={refFolha}
              className="menu-folha"
              role="dialog"
              aria-modal="true"
              aria-labelledby={idTitulo}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-topo">
                <p id={idTitulo} className="menu-titulo">Menu</p>
                <button type="button" className="menu-fechar" onClick={() => fechar()} aria-label="Fechar o menu">
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Menu" className="menu-grupos">
                {grupos.map((g) => (
                  <section key={g.titulo} className="menu-grupo">
                    <h2 className="menu-grupo-titulo">{g.titulo}</h2>
                    <ul>
                      {g.itens.map((i) => (
                        <li key={i.href}>
                          <Link
                            href={i.href}
                            className={`menu-link${ativo(pathname, i.href) ? " ativo" : ""}`}
                            aria-current={ativo(pathname, i.href) ? "page" : undefined}
                            onClick={() => fechar(false)}
                          >
                            <span className="menu-link-rotulo">{i.rotulo}</span>
                            {i.dica && <span className="menu-link-dica">{i.dica}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                <section className="menu-grupo menu-grupo-extra">
                  <h2 className="menu-grupo-titulo">Primeira vez por aqui?</h2>
                  <ul>
                    <li>
                      <ReverTour className="menu-link" antes={() => fechar(false)}>
                        <span className="menu-link-rotulo">Rever o tour</span>
                        <span className="menu-link-dica">O passo a passo de onde fica cada coisa</span>
                      </ReverTour>
                    </li>
                    <li>
                      <InstalarApp variante="menu" antes={() => fechar(false)} />
                    </li>
                  </ul>
                </section>

                {logado && (
                  <section className="menu-grupo menu-grupo-extra">
                    <h2 className="menu-grupo-titulo">Sua conta</h2>
                    <ul>
                      <li>
                        <Link href="/senha" className={`menu-link${ativo(pathname, "/senha") ? " ativo" : ""}`} onClick={() => fechar(false)}>
                          <span className="menu-link-rotulo">Trocar usuário ou senha</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="menu-link"
                          onClick={async () => {
                            fechar(false);
                            await sair();
                            router.replace("/");
                          }}
                        >
                          <span className="menu-link-rotulo">Sair da conta</span>
                          <span className="menu-link-dica">Só neste aparelho</span>
                        </button>
                      </li>
                    </ul>
                  </section>
                )}
              </nav>

              <p className="menu-assinatura">Fólium · em parceria com a UNISAGRADO</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
