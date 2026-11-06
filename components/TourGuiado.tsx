"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useConta, type TipoConta } from "@/lib/conta";
import "./TourGuiado.css";

/**
 * Tour guiado do primeiro acesso.
 *
 * Na primeira vez que a pessoa usa o Fólium, um passo a passo destaca os botões da
 * navegação (no topo do computador ou na barra de baixo do celular) e explica cada área.
 * Cada tipo de usuário tem o seu tour: visitante, colaborador (aluno) e contratante.
 *
 * - Não navega nem recarrega a página: nada do que já foi preenchido se perde.
 * - Dá para pular a qualquer momento (botão "Pular" ou tecla Esc) e rever depois
 *   pelo link "Rever o tour" do rodapé ou do guia (ver ReverTour abaixo).
 * - Fica marcado no navegador (localStorage) por tipo de conta: quem entra como aluno
 *   depois de ver o tour de visitante ainda vê o tour do aluno.
 * - Os alvos são marcados com data-tour no Cabecalho. Se o alvo não estiver visível
 *   (ex.: "Guia" não aparece na barra do celular), o passo aparece centralizado.
 */

type TipoTour = "visitante" | TipoConta;

type Passo = {
  /** Valor de data-tour do elemento a destacar. Sem alvo, o cartão fica no centro da tela. */
  alvo?: string;
  titulo: string;
  texto: string;
  /** Texto usado quando o alvo não está visível nesta tela. */
  semAlvo?: string;
};

const PASSOS: Record<TipoTour, Passo[]> = {
  visitante: [
    {
      titulo: "Bem-vindo ao Fólium",
      texto: "A vitrine de portfólios dos alunos da UNISAGRADO. Em poucos passos você vê onde fica cada coisa. Pode pular quando quiser.",
    },
    {
      alvo: "talentos",
      titulo: "Encontre talentos",
      texto: "Busque alunos por curso e serviço e abra o portfólio de cada um. Para ver os perfis é preciso entrar, assim os dados dos alunos ficam protegidos.",
    },
    {
      alvo: "oportunidades",
      titulo: "Vagas e freelas",
      texto: "O mural reúne freelas, projetos e estágios de empresas e pessoas da região.",
    },
    {
      alvo: "entrar",
      titulo: "Crie sua conta",
      texto: "Aluno entra com o e-mail institucional e monta o portfólio. Quem contrata entra com qualquer e-mail e publica vagas.",
    },
    {
      titulo: "Pronto!",
      texto: "Quando quiser rever este passo a passo, use “Rever o tour” no rodapé da página. Para instalar o Fólium no celular, veja “Instalar no celular”, também no rodapé.",
    },
  ],
  colaborador: [
    {
      titulo: "Bem-vindo ao Fólium",
      texto: "Aqui seu trabalho vira oportunidade. Em poucos passos você vê onde fica cada coisa. Pode pular quando quiser.",
    },
    {
      alvo: "meu-perfil",
      titulo: "Seu portfólio",
      texto: "Comece por aqui: foto, sobre você, trabalhos, experiências e contato. Dá para importar do currículo (PDF ou Word) e revisar antes de salvar.",
    },
    {
      alvo: "oportunidades",
      titulo: "Vagas para você",
      texto: "Freelas, projetos e estágios publicados por quem contrata. Clique em “Tenho interesse” e a empresa recebe seu portfólio.",
    },
    {
      alvo: "talentos",
      titulo: "Veja os colegas",
      texto: "Os portfólios de outros alunos aparecem aqui. Bom para se inspirar e ver como os contratantes encontram você.",
    },
    {
      alvo: "jornal",
      titulo: "Jornal do Fólium",
      texto: "Uma edição por semana com dicas de carreira e novidades para quem está começando. Completo no Premium.",
    },
    {
      alvo: "guia",
      titulo: "Guia do aluno",
      texto: "Quanto cobrar por cada serviço, como negociar e como evitar golpe e calote.",
      semAlvo: "Quanto cobrar, como negociar e como evitar golpe e calote. No celular, o Guia fica no rodapé da página.",
    },
    {
      alvo: "feedback",
      titulo: "Mande seu feedback",
      texto: "Achou um problema ou tem uma ideia? A aba Feedback vai direto para a equipe do Fólium.",
      semAlvo: "Achou um problema ou tem uma ideia? A página Feedback, no rodapé, vai direto para a equipe do Fólium.",
    },
    {
      titulo: "Pronto!",
      texto: "Agora é montar o portfólio. Para rever este passo a passo, use “Rever o tour” no rodapé ou no Guia do aluno. Para instalar o Fólium no celular, veja “Instalar no celular”, também no rodapé.",
    },
  ],
  contratante: [
    {
      titulo: "Bem-vindo ao Fólium",
      texto: "Aqui você encontra universitários da região para freelas, projetos e estágios. Em poucos passos você vê onde fica cada coisa.",
    },
    {
      alvo: "talentos",
      titulo: "Encontre talentos",
      texto: "Busque por nome ou habilidade, filtre por curso e serviço, abra o portfólio e fale direto com o aluno pelo WhatsApp ou e-mail.",
    },
    {
      alvo: "publicar",
      titulo: "Publique suas vagas",
      texto: "Descreva o trabalho, o prazo e o valor. Você pode publicar várias vagas; cada uma passa por uma conferência rápida da equipe antes de aparecer no mural.",
    },
    {
      alvo: "painel",
      titulo: "Seu painel",
      texto: "Acompanhe o status de cada vaga, veja quem demonstrou interesse e mantenha seus dados de contato em dia.",
    },
    {
      alvo: "oportunidades",
      titulo: "Mural de vagas",
      texto: "É aqui que os alunos veem as vagas aprovadas e clicam em “Tenho interesse”.",
    },
    {
      alvo: "jornal",
      titulo: "Jornal do Fólium",
      texto: "Uma edição por semana para quem contrata, com dicas de como contratar, faixas de preço e novidades. Completo no Premium.",
    },
    {
      alvo: "feedback",
      titulo: "Mande seu feedback",
      texto: "Achou um problema ou tem uma ideia? A aba Feedback vai direto para a equipe do Fólium.",
      semAlvo: "Achou um problema ou tem uma ideia? A página Feedback, no rodapé, vai direto para a equipe do Fólium.",
    },
    {
      titulo: "Pronto!",
      texto: "No Guia do contratante, no rodapé da página, tem o passo a passo de cada área e quanto pagar por serviço. Lá e no rodapé você também revê este tour e vê como instalar o Fólium no celular.",
    },
  ],
};

const CHAVE = (t: TipoTour) => `folium-tour-visto-${t}`;
const EVENTO_REVER = "folium-tour";
/** Páginas em que o tour não começa sozinho (a pessoa está no meio do login). */
const SEM_TOUR = ["/entrar", "/senha"];

function jaViu(t: TipoTour) {
  try {
    return localStorage.getItem(CHAVE(t)) === "1";
  } catch {
    return false;
  }
}
function marcarVisto(t: TipoTour) {
  try {
    localStorage.setItem(CHAVE(t), "1");
  } catch {
    /* sem armazenamento: o tour pode voltar na próxima visita */
  }
}

/** Abre o tour de novo, de qualquer lugar do site. */
export function reverTour() {
  window.dispatchEvent(new Event(EVENTO_REVER));
}

/** Link "Rever o tour" (rodapé, guia). */
export function ReverTour({ className = "link-texto", children = "Rever o tour" }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={reverTour}>
      {children}
    </button>
  );
}

/** Primeiro elemento visível com data-tour={alvo}. */
function acharAlvo(alvo?: string): HTMLElement | null {
  if (!alvo) return null;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${alvo}"]`))) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden") return el;
  }
  return null;
}

type Caixa = { top: number; left: number; width: number; height: number };

export function TourGuiado() {
  const pathname = usePathname();
  const { conta, carregando, logado } = useConta();
  const tipo: TipoTour | null = carregando ? null : conta ? conta.tipo : logado ? null : "visitante";

  const [ativo, setAtivo] = useState<TipoTour | null>(null);
  const [indice, setIndice] = useState(0);
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [cartao, setCartao] = useState<{ top: number; left: number } | null>(null);
  const refCartao = useRef<HTMLDivElement>(null);
  const refProximo = useRef<HTMLButtonElement>(null);
  const focoAntes = useRef<Element | null>(null);

  const passos = ativo ? PASSOS[ativo] : [];
  const passo = passos[indice];
  const ultimo = indice === passos.length - 1;

  const abrir = useCallback((t: TipoTour) => {
    focoAntes.current = document.activeElement;
    setIndice(0);
    setAtivo(t);
  }, []);

  const fechar = useCallback(() => {
    if (ativo) marcarVisto(ativo);
    setAtivo(null);
    setCaixa(null);
    setCartao(null);
    const antes = focoAntes.current;
    if (antes instanceof HTMLElement) antes.focus({ preventScroll: true });
  }, [ativo]);

  // Começa sozinho na primeira visita, depois da abertura do app.
  useEffect(() => {
    if (!tipo || ativo || jaViu(tipo)) return;
    if (SEM_TOUR.some((p) => pathname.startsWith(p))) return;
    // Visitante só vê o tour na página inicial (quem chega por um link de perfil vai direto ao assunto).
    if (tipo === "visitante" && pathname !== "/") return;
    const comAbertura =
      !document.documentElement.classList.contains("sem-abertura") &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const espera = window.setTimeout(() => {
      if (!jaViu(tipo) && !document.querySelector(".janela-fundo")) abrir(tipo);
    }, comAbertura ? 1900 : 600);
    return () => window.clearTimeout(espera);
  }, [tipo, pathname, ativo, abrir]);

  // "Rever o tour".
  useEffect(() => {
    const aoRever = () => {
      if (tipo) abrir(tipo);
    };
    window.addEventListener(EVENTO_REVER, aoRever);
    return () => window.removeEventListener(EVENTO_REVER, aoRever);
  }, [tipo, abrir]);

  // Se a conta muda no meio (ex.: saiu), fecha sem marcar.
  useEffect(() => {
    if (ativo && tipo && tipo !== ativo) setAtivo(null);
  }, [tipo, ativo]);

  // Mede o alvo e posiciona destaque e cartão; acompanha rolagem e mudança de tamanho.
  const medir = useCallback(() => {
    if (!passo) return;
    const el = acharAlvo(passo.alvo);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const larguraCartao = Math.min(360, vw - 32);
    const alturaCartao = refCartao.current?.offsetHeight ?? 220;
    if (!el) {
      setCaixa(null);
      setCartao({ top: Math.max(16, (vh - alturaCartao) / 2), left: (vw - larguraCartao) / 2 });
      return;
    }
    const r = el.getBoundingClientRect();
    const folga = 6;
    const c = { top: r.top - folga, left: r.left - folga, width: r.width + folga * 2, height: r.height + folga * 2 };
    setCaixa(c);
    const espacoAbaixo = vh - (c.top + c.height);
    const top =
      espacoAbaixo >= alturaCartao + 24
        ? c.top + c.height + 14
        : Math.max(16, c.top - alturaCartao - 14);
    const left = Math.min(Math.max(16, c.left + c.width / 2 - larguraCartao / 2), vw - larguraCartao - 16);
    setCartao({ top, left });
  }, [passo]);

  useLayoutEffect(() => {
    if (!ativo) return;
    medir();
    // Mede de novo depois que o cartão tem o texto novo (a altura muda).
    const q = requestAnimationFrame(medir);
    let pendente = 0;
    const aoMudar = () => {
      cancelAnimationFrame(pendente);
      pendente = requestAnimationFrame(medir);
    };
    window.addEventListener("resize", aoMudar);
    window.addEventListener("scroll", aoMudar, true);
    return () => {
      cancelAnimationFrame(q);
      cancelAnimationFrame(pendente);
      window.removeEventListener("resize", aoMudar);
      window.removeEventListener("scroll", aoMudar, true);
    };
  }, [ativo, indice, medir]);

  // Foco no botão principal a cada passo; teclado: Esc pula, setas andam, Tab fica dentro do cartão.
  useEffect(() => {
    if (!ativo) return;
    refProximo.current?.focus({ preventScroll: true });
  }, [ativo, indice]);

  useEffect(() => {
    if (!ativo) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fechar();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (ultimo) fechar();
        else setIndice((i) => i + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndice((i) => Math.max(0, i - 1));
      } else if (e.key === "Tab" && refCartao.current) {
        const focaveis = Array.from(refCartao.current.querySelectorAll<HTMLElement>("button"));
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const fim = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          fim.focus();
        } else if (!e.shiftKey && document.activeElement === fim) {
          e.preventDefault();
          primeiro.focus();
        } else if (!refCartao.current.contains(document.activeElement)) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [ativo, ultimo, fechar]);

  if (!ativo || !passo) return null;

  const texto = !caixa && passo.alvo && passo.semAlvo ? passo.semAlvo : passo.texto;

  return (
    <div className="tour" data-centro={caixa ? undefined : ""}>
      {/* Segura os cliques fora do cartão: o tour não deixa ninguém sair da página sem querer. */}
      <div className="tour-fundo" aria-hidden="true" />
      {caixa && (
        <div
          className="tour-destaque"
          aria-hidden="true"
          style={{ top: caixa.top, left: caixa.left, width: caixa.width, height: caixa.height }}
        />
      )}
      <div
        ref={refCartao}
        className="tour-cartao"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-titulo"
        aria-describedby="tour-texto"
        key={indice}
        style={cartao ? { top: cartao.top, left: cartao.left } : { visibility: "hidden" }}
      >
        <div className="tour-topo">
          <span className="tour-contagem">
            {indice + 1} de {passos.length}
          </span>
          <button type="button" className="tour-pular" onClick={fechar}>
            {ultimo ? "Fechar" : "Pular tour"}
          </button>
        </div>
        <h2 id="tour-titulo" className="tour-titulo">{passo.titulo}</h2>
        <p id="tour-texto" className="tour-texto">{texto}</p>
        <div className="tour-pe">
          <ol className="tour-pontos" aria-hidden="true">
            {passos.map((_, i) => (
              <li key={i} className={i === indice ? "atual" : i < indice ? "feito" : ""} />
            ))}
          </ol>
          <div className="tour-botoes">
            {indice > 0 && (
              <button type="button" className="botao botao-contorno" onClick={() => setIndice((i) => i - 1)}>
                Voltar
              </button>
            )}
            <button
              ref={refProximo}
              type="button"
              className="botao botao-primario"
              onClick={() => (ultimo ? fechar() : setIndice((i) => i + 1))}
            >
              {ultimo ? "Começar" : indice === 0 ? "Mostrar" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
