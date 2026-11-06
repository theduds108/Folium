"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useConta, type TipoConta } from "@/lib/conta";

/**
 * Tour guiado do primeiro acesso.
 *
 * Aparece sozinho uma vez para cada tipo de uso (visitante na página inicial, colaborador e
 * contratante depois de entrar) e pode ser aberto de novo pela página de Feedback ou pelo rodapé.
 * Cada passo ilumina um item do menu (marcado com data-tour no Cabecalho). Se o item não estiver
 * visível (ex.: menu de cima no celular), o passo aparece no meio da tela.
 * Guarda no navegador só a marca "já viu o tour", nada além disso.
 */

type Passo = { alvo?: string; titulo: string; texto: string };

const FEEDBACK: Passo = {
  alvo: "/feedback",
  titulo: "Conte o que achou",
  texto: "Achou um problema ou tem uma ideia? Mande pela página de Feedback, no rodapé. Por lá você também pode ver este tour de novo.",
};

const PASSOS: Record<"visitante" | TipoConta, Passo[]> = {
  visitante: [
    { titulo: "Bem-vindo ao Fólium!", texto: "Aqui alunos da UNISAGRADO mostram seus trabalhos e quem precisa de um freela encontra talento da região. Vamos ver em 1 minuto onde fica cada coisa." },
    { alvo: "/talentos", titulo: "Talentos", texto: "Os portfólios dos alunos, com filtros por curso e serviço. Para ver, é só ter uma conta grátis." },
    { alvo: "/oportunidades", titulo: "Vagas", texto: "O mural de freelas, projetos e estágios publicados por empresas e pessoas da região." },
    { alvo: "/entrar", titulo: "Crie sua conta", texto: "Aluno entra com o e-mail institucional e monta o portfólio. Quem contrata entra com qualquer e-mail e publica vagas." },
    { ...FEEDBACK, texto: "Ficou com dúvida ou tem uma ideia? Depois de entrar, a página de Feedback fica no rodapé." },
  ],
  colaborador: [
    { titulo: "Que bom ter você aqui!", texto: "Vamos ver rapidinho como montar seu portfólio e achar seus primeiros trabalhos." },
    { alvo: "/meu-perfil", titulo: "Seu portfólio", texto: "Comece por aqui: foto, curso, serviços, trabalhos e contato. Dá para preencher a partir do seu currículo. Quando estiver pronto, publique e compartilhe o link." },
    { alvo: "/oportunidades", titulo: "Vagas", texto: "Veja as oportunidades da região e toque em Tenho interesse para pegar o contato da empresa." },
    { alvo: "/guia", titulo: "Guia de preços", texto: "Não sabe quanto cobrar? A calculadora do guia sugere um valor justo e tem dicas para não cair em golpe." },
    { alvo: "/jornal", titulo: "Jornal do Fólium", texto: "Toda semana: vagas em destaque, quanto cobrar e matérias para quem está começando." },
    FEEDBACK,
  ],
  contratante: [
    { titulo: "Bem-vindo ao Fólium!", texto: "Vamos ver rapidinho como encontrar talentos e publicar suas vagas." },
    { alvo: "/talentos", titulo: "Encontre talentos", texto: "Filtre por serviço e curso, abra o portfólio e fale direto com o aluno pelo WhatsApp ou e-mail." },
    { alvo: "/publicar", titulo: "Publique vagas", texto: "Conte o que você precisa. Por enquanto você pode publicar quantas vagas quiser; a equipe confere cada uma em até 1 dia útil." },
    { alvo: "/painel", titulo: "Seu painel", texto: "Acompanhe o status das suas vagas, quantos alunos se interessaram e atualize seus dados de contato." },
    { alvo: "/oportunidades", titulo: "Mural de vagas", texto: "Depois de aprovada, sua vaga aparece aqui para os alunos." },
    FEEDBACK,
  ],
};

const CHAVE = (tipo: string) => `folium-tour-${tipo}`;
const EVENTO = "folium:abrir-tour";

/** Abre o tour de novo (usado pelo botão da página de Feedback e pelo rodapé). */
export function abrirTour() {
  window.dispatchEvent(new Event(EVENTO));
}

function jaViu(tipo: string) {
  try {
    return localStorage.getItem(CHAVE(tipo)) === "1";
  } catch {
    return true; // sem armazenamento: não insiste em abrir sozinho
  }
}

function marcarVisto(tipo: string) {
  try {
    localStorage.setItem(CHAVE(tipo), "1");
  } catch {
    /* sem armazenamento */
  }
}

/** Primeiro elemento visível na tela com esse data-tour. */
function acharAlvo(alvo?: string): DOMRect | null {
  if (!alvo) return null;
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${alvo}"]`)) {
    const r = el.getBoundingClientRect();
    const visivel = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && getComputedStyle(el).visibility !== "hidden";
    if (visivel) return r;
  }
  return null;
}

/** Páginas em que o tour não abre sozinho (a pessoa está no meio de outra tarefa). */
const SEM_TOUR_AUTOMATICO = ["/entrar", "/senha"];

export function TourGuiado() {
  const pathname = usePathname();
  const { conta, logado, carregando } = useConta();
  const tipo: "visitante" | TipoConta = conta?.tipo ?? "visitante";
  const passos = PASSOS[tipo];
  const [aberto, setAberto] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cartao = useRef<HTMLDivElement>(null);

  // Abre sozinho na primeira vez de cada tipo.
  useEffect(() => {
    if (carregando || aberto) return;
    if (logado && !conta) return; // conta ainda carregando
    if (SEM_TOUR_AUTOMATICO.some((p) => pathname.startsWith(p))) return;
    if (tipo === "visitante" && pathname !== "/") return;
    if (jaViu(tipo)) return;
    const t = window.setTimeout(() => {
      setI(0);
      setAberto(true);
    }, 1800); // depois da animação de abertura
    return () => window.clearTimeout(t);
  }, [carregando, logado, conta, tipo, pathname, aberto]);

  // Abrir de novo pelo botão.
  useEffect(() => {
    const abrir = () => {
      setI(0);
      setAberto(true);
    };
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  const fechar = useCallback(() => {
    marcarVisto(tipo);
    setAberto(false);
  }, [tipo]);

  const passo = passos[Math.min(i, passos.length - 1)]!;

  // Posição do item iluminado; acompanha rolagem e mudança de tamanho.
  useLayoutEffect(() => {
    if (!aberto) return;
    const medir = () => setRect(acharAlvo(passo.alvo));
    medir();
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, { passive: true });
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir);
    };
  }, [aberto, passo.alvo]);

  // Foco no cartão a cada passo e Esc para fechar.
  useEffect(() => {
    if (!aberto) return;
    cartao.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowRight") setI((x) => Math.min(x + 1, passos.length - 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(x - 1, 0));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto, i, fechar, passos.length]);

  if (!aberto) return null;

  const ultimo = i >= passos.length - 1;
  const folga = 6;
  const posicao: React.CSSProperties = {};
  if (rect) {
    const largura = Math.min(360, window.innerWidth - 32);
    posicao.left = Math.max(16, Math.min(rect.left + rect.width / 2 - largura / 2, window.innerWidth - largura - 16));
    posicao.width = largura;
    if (rect.top < window.innerHeight / 2) posicao.top = rect.bottom + folga + 14;
    else posicao.bottom = window.innerHeight - rect.top + folga + 14;
  }

  return (
    <div className="tour" role="presentation">
      {rect ? (
        <div
          className="tour-foco"
          aria-hidden="true"
          style={{ top: rect.top - folga, left: rect.left - folga, width: rect.width + folga * 2, height: rect.height + folga * 2 }}
        />
      ) : (
        <div className="tour-fundo" aria-hidden="true" onClick={fechar} />
      )}
      <div
        ref={cartao}
        className={rect ? "tour-cartao" : "tour-cartao tour-cartao-centro"}
        style={posicao}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-titulo"
        aria-describedby="tour-texto"
        tabIndex={-1}
      >
        <div className="tour-topo">
          <span className="rotulos"><span>Tour · {i + 1} de {passos.length}</span></span>
          <button type="button" className="tour-pular" onClick={fechar}>Pular tour</button>
        </div>
        <h2 id="tour-titulo">{passo.titulo}</h2>
        <p id="tour-texto">{passo.texto}</p>
        <div className="tour-pontos" aria-hidden="true">
          {passos.map((_, n) => <span key={n} className={n === i ? "atual" : ""} />)}
        </div>
        <div className="tour-acoes">
          {i > 0 && (
            <button type="button" className="botao botao-contorno" onClick={() => setI(i - 1)}>Voltar</button>
          )}
          <button type="button" className="botao botao-verde" onClick={() => (ultimo ? fechar() : setI(i + 1))}>
            {ultimo ? "Começar a usar" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Link "Tour do app" para o rodapé. */
export function BotaoTour() {
  return (
    <button type="button" className="link-tour" onClick={abrirTour}>Tour do app</button>
  );
}
