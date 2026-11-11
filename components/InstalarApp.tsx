"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { fecharJanelaInstalar, instalar, useInstalar, type Plataforma } from "@/lib/instalar";

/**
 * Botão "Instalar app" e a janela com o passo a passo.
 *
 * - Android, Chrome e Edge: abre o pedido de instalação do próprio navegador.
 * - iPhone/iPad, Safari no Mac, Firefox, Instagram/WhatsApp: abre uma janela aqui mesmo no site
 *   com os passos do navegador da pessoa (links internos nunca abrem em nova aba).
 * - Já aberto como app (display-mode: standalone): o botão some.
 *
 * O estado é um só para o site inteiro (lib/instalar.ts) e a janela fica montada no layout,
 * então o botão pode estar no cabeçalho, no menu ☰ ou na página inicial.
 */

const ICONE_BAIXAR = "M12 3v11m0 0-4.5-4.5M12 14l4.5-4.5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3";

export function IconeInstalar({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d={ICONE_BAIXAR} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Quadrado com a seta para cima, igual ao "Compartilhar" do Safari. */
function IconeCompartilhar() {
  return (
    <svg className="icone-passo" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 3v12M12 3 8 7m4-4 4 4M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeMais() {
  return (
    <svg className="icone-passo" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type Variante = "botao" | "cabecalho" | "menu";

/**
 * Botão "Instalar app". Some quando o Fólium já está instalado.
 * variante "botao" usa a className recebida; "cabecalho" é o botão compacto do topo; "menu" é a linha do menu ☰.
 */
export function InstalarApp({
  className = "botao botao-verde",
  variante = "botao",
  rotulo = "Instalar app",
  antes,
}: {
  className?: string;
  variante?: Variante;
  rotulo?: string;
  /** Roda antes de instalar (ex.: fechar o menu). */
  antes?: () => void;
}) {
  const { pronto, instalado } = useInstalar();
  if (!pronto || instalado) return null;

  const aoClicar = () => {
    antes?.();
    void instalar();
  };

  if (variante === "cabecalho") {
    return (
      <button type="button" className="instalar-cabecalho" data-tour="instalar" onClick={aoClicar} aria-label="Instalar o app do Fólium">
        <IconeInstalar tamanho={18} />
        <span className="instalar-cabecalho-rotulo" aria-hidden="true">Instalar<span className="instalar-cabecalho-app"> app</span></span>
      </button>
    );
  }

  if (variante === "menu") {
    return (
      <button type="button" className="menu-link menu-link-instalar" onClick={aoClicar}>
        <span className="menu-link-rotulo">
          <IconeInstalar tamanho={18} /> Instalar o app
        </span>
        <span className="menu-link-dica">Põe o ícone da folha na sua tela inicial</span>
      </button>
    );
  }

  return (
    <button type="button" className={className} onClick={aoClicar}>
      <IconeInstalar />
      {rotulo}
    </button>
  );
}

const PASSOS: Record<Plataforma, { titulo: string; passos: ReactNode[]; nota?: ReactNode }> = {
  "iphone-safari": {
    titulo: "Instalar no iPhone",
    passos: [
      <>Toque em <strong>Compartilhar</strong> <IconeCompartilhar /> (o quadrado com a seta para cima). No iOS mais novo, ele fica dentro do botão <strong>•••</strong> na barra.</>,
      <>Role a lista e toque em <strong>Adicionar à Tela de Início</strong> <IconeMais />. Se não aparecer, toque em <strong>Ver mais</strong>.</>,
      <>Toque em <strong>Adicionar</strong>, no canto de cima.</>,
    ],
    nota: "Pronto: o ícone da folha aparece junto com seus outros apps.",
  },
  "iphone-outro": {
    titulo: "Instalar no iPhone",
    passos: [
      <>Toque em <strong>Compartilhar</strong> <IconeCompartilhar /> (no Chrome, fica na barra de endereço, em cima).</>,
      <>Escolha <strong>Adicionar à Tela de Início</strong> <IconeMais /> e confirme em <strong>Adicionar</strong>.</>,
    ],
    nota: (
      <>
        Não achou a opção? Abra o Fólium no <strong>Safari</strong> e toque de novo em “Instalar app”.
      </>
    ),
  },
  "app-interno": {
    titulo: "Abra no navegador primeiro",
    passos: [
      <>Você está vendo o Fólium por dentro de outro app (Instagram, WhatsApp...), e ele não deixa instalar.</>,
      <>Toque nos <strong>três pontinhos</strong> (ou no ícone de compartilhar) e escolha <strong>Abrir no navegador</strong>.</>,
      <>No Safari ou no Chrome, toque de novo em <strong>Instalar app</strong>.</>,
    ],
  },
  android: {
    titulo: "Instalar no Android",
    passos: [
      <>Toque nos <strong>três pontinhos</strong> ⋮ no canto de cima do Chrome (no Samsung Internet, no ☰ embaixo).</>,
      <>Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</>,
      <>Confirme em <strong>Instalar</strong>.</>,
    ],
    nota: "Se a opção não aparecer, talvez o Fólium já esteja instalado: procure o ícone da folha nos seus apps.",
  },
  "mac-safari": {
    titulo: "Instalar no Mac",
    passos: [
      <>No menu do Safari, clique em <strong>Arquivo</strong> e depois em <strong>Adicionar ao Dock</strong>.</>,
      <>Clique em <strong>Adicionar</strong>. O Fólium abre numa janela própria, como um app.</>,
    ],
  },
  "firefox-computador": {
    titulo: "Instalar no computador",
    passos: [
      <>O Firefox no computador ainda não instala sites como app.</>,
      <>Abra o Fólium no <strong>Chrome</strong>, no <strong>Edge</strong> ou no <strong>Safari</strong> e clique em <strong>Instalar app</strong>.</>,
    ],
    nota: "Enquanto isso, você pode salvar o Fólium nos favoritos (Ctrl+D).",
  },
  computador: {
    titulo: "Instalar no computador",
    passos: [
      <>Clique no ícone de instalar no fim da barra de endereço (um monitor com uma seta).</>,
      <>Ou abra o menu do navegador (⋮ no Chrome, ··· no Edge) e procure <strong>Instalar Fólium</strong> ou <strong>Aplicativos › Instalar este site</strong>.</>,
      <>Confirme em <strong>Instalar</strong>.</>,
    ],
    nota: "Se a opção não aparecer, talvez o Fólium já esteja instalado neste computador.",
  },
};

/** Janela com o passo a passo, montada uma vez no layout. Fecha com Esc, no X, em “Entendi” ou clicando fora. */
export function JanelaInstalar() {
  const { janelaAberta, plataforma } = useInstalar();
  const pathname = usePathname();
  const refJanela = useRef<HTMLDivElement>(null);

  // Trocou de página: fecha.
  useEffect(() => {
    fecharJanelaInstalar();
  }, [pathname]);

  useEffect(() => {
    if (!janelaAberta) return;
    const voltar = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const antes = html.style.overflow;
    html.style.overflow = "hidden";
    refJanela.current?.querySelector<HTMLElement>(".janela-entendi")?.focus({ preventScroll: true });
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fecharJanelaInstalar();
      } else if (e.key === "Tab" && refJanela.current) {
        const focaveis = Array.from(refJanela.current.querySelectorAll<HTMLElement>("a, button"));
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
      if (voltar?.isConnected) voltar.focus({ preventScroll: true });
    };
  }, [janelaAberta]);

  if (!janelaAberta) return null;
  const guia = PASSOS[plataforma];

  return createPortal(
    <div className="janela-fundo janela-instalar-fundo" role="presentation" onClick={() => fecharJanelaInstalar()}>
      <div
        ref={refJanela}
        className="janela cartao janela-instalar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instalar-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="janela-fechar" onClick={() => fecharJanelaInstalar()} aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
        <p className="janela-rotulo">Fólium no seu aparelho</p>
        <h2 id="instalar-titulo" className="janela-titulo">{guia.titulo}</h2>
        <ol className="passos-instalar">
          {guia.passos.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
        {guia.nota && <p className="suave janela-nota">{guia.nota}</p>}
        <button type="button" className="botao botao-primario janela-entendi" style={{ width: "100%" }} onClick={() => fecharJanelaInstalar()}>
          Entendi
        </button>
        <p className="janela-rodape">
          <Link href="/instalar">Ver o passo a passo de todos os aparelhos</Link>
        </p>
      </div>
    </div>,
    document.body,
  );
}

/** Faixa da página inicial convidando a instalar. Some quando já está instalado. */
export function ConviteInstalar() {
  const { pronto, instalado } = useInstalar();
  if (!pronto || instalado) return null;
  return (
    <section className="secao convite-instalar-secao" aria-labelledby="convite-instalar-titulo">
      <div className="container">
        <div className="convite-instalar">
          <div className="convite-instalar-icone" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- ícone pequeno e fixo, site exportado estático */}
            <img src="/icons/icon-192.png" alt="" width="64" height="64" />
          </div>
          <div className="convite-instalar-texto">
            <p className="convite-instalar-rotulo">Leve no bolso</p>
            <h2 id="convite-instalar-titulo">Tenha o Fólium como app</h2>
            <p className="suave">
              Um toque e o ícone da folha vai para a sua tela inicial. Abre em tela cheia, sem loja e sem ocupar espaço.
            </p>
          </div>
          <InstalarApp className="botao botao-verde convite-instalar-botao" />
        </div>
      </div>
    </section>
  );
}
