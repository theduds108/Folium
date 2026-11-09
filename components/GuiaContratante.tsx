"use client";

import Link from "next/link";
import { useState } from "react";
import { Anotacao } from "@/components/Zine";
import { ReverTour } from "@/components/TourGuiado";
import { SERVICOS_PRECO, SOBRE_AS_FAIXAS, brl } from "@/lib/precos";
import { OrigemFaixa } from "@/components/GuiaPrecos";

/** Passo a passo de cada área do Fólium para quem contrata. */
const PASSOS = [
  {
    id: "talentos",
    titulo: "Encontre talentos",
    link: { href: "/talentos", rotulo: "Buscar talentos" },
    itens: [
      "Em Talentos, busque por nome ou habilidade e filtre por curso e tipo de serviço.",
      "Abra o portfólio para ver trabalhos, experiências, valores de referência e o selo de aluno verificado.",
      "Gostou de alguém? No Premium você salva o talento para voltar depois.",
    ],
  },
  {
    id: "publicar",
    titulo: "Publique suas vagas",
    link: { href: "/publicar", rotulo: "Publicar vaga" },
    itens: [
      "Em Publicar vaga, descreva o trabalho, o tipo (freela, projeto ou estágio), o prazo e o orçamento.",
      "Pode publicar várias vagas, uma para cada trabalho. Assim cada aluno sabe exatamente o que está sendo pedido.",
      "Cada vaga passa por uma conferência rápida da equipe antes de aparecer no mural.",
    ],
  },
  {
    id: "painel",
    titulo: "Acompanhe no painel",
    link: { href: "/painel", rotulo: "Abrir meu painel" },
    itens: [
      "Veja o status de cada vaga: em análise, no mural ou não aprovada.",
      "Confira quem clicou em “Tenho interesse” e abra o portfólio de cada aluno.",
      "Mantenha nome, empresa, WhatsApp e cidade em dia.",
    ],
  },
  {
    id: "mural",
    titulo: "O mural de vagas",
    link: { href: "/oportunidades", rotulo: "Ver o mural" },
    itens: [
      "É onde os alunos encontram as vagas aprovadas e demonstram interesse.",
      "Vaga com título claro, prazo e valor recebe mais interessados.",
      "Os interessados aparecem no seu painel, cada um com o link do portfólio.",
    ],
  },
  {
    id: "contato",
    titulo: "Fale com os alunos",
    link: { href: "/talentos", rotulo: "Ir para Talentos" },
    itens: [
      "Pelo portfólio você fala direto com o aluno, pelo WhatsApp ou e-mail. O Fólium não cobra comissão.",
      "Na primeira mensagem, conte o que precisa, o prazo e quanto pode pagar.",
      "Combine tudo por escrito antes de começar: escopo, prazo, valor e número de ajustes.",
    ],
  },
];

/** Cuidados de quem contrata: para o trabalho sair bem e o aluno ser tratado com respeito. */
const CUIDADOS = [
  { titulo: "Explique bem o trabalho", texto: "Referências, formato de entrega e para que vai ser usado. Quanto mais claro, menos retrabalho." },
  { titulo: "Combine por escrito", texto: "Escopo, prazo, valor e número de alterações. Uma mensagem de WhatsApp confirmando já ajuda." },
  { titulo: "Sinal e pagamento", texto: "O comum é pagar de 30% a 50% antes de começar e o restante na entrega." },
  { titulo: "Prazo realista", texto: "São estudantes com aulas e provas. Prazo muito curto costuma custar mais." },
  { titulo: "Direito de uso", texto: "Se a arte vai para anúncio, embalagem ou uso comercial amplo, diga isso desde o começo." },
  { titulo: "Denuncie problemas", texto: "Viu um perfil suspeito ou teve um problema? Use o botão de denúncia. A equipe analisa cada caso." },
];

export function GuiaContratante() {
  const [aberto, setAberto] = useState<string | null>(null);
  return (
    <div className="container pagina">
      <h1 className="titulo-pagina">Guia do contratante</h1>
      <Anotacao className="anotacao-perfil">para contratar bem e rápido</Anotacao>
      <p className="suave" style={{ margin: "8px 0 0" }}>
        Primeira vez por aqui? <ReverTour>Fazer o tour pelo app</ReverTour> · <Link href="/instalar">Como instalar no celular</Link>
      </p>

      <section className="secao" id="como-funciona">
        <h2>Passo a passo</h2>
        <div className="grade-dicas">
          {PASSOS.map((p, i) => (
            <div key={p.id} id={p.id} className="cartao bloco dica">
              <span className="dica-numero">{i + 1}</span>
              <h3 className="h-pequeno">{p.titulo}</h3>
              <ul style={{ margin: "0 0 10px", paddingLeft: 18 }}>
                {p.itens.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <Link href={p.link.href} className="link-mao">{p.link.rotulo} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="secao" id="precos">
        <h2>Quanto pagar</h2>
        <p className="suave" style={{ maxWidth: "42em" }}>
          Experiência, prazo curto e uso comercial amplo puxam o valor para cima. {SOBRE_AS_FAIXAS}
        </p>
        <div className="cartao bloco guia-pagina">
          <div className="guia-lista">
            {SERVICOS_PRECO.map((x, i) => {
              const novaArea = i === 0 || SERVICOS_PRECO[i - 1].area !== x.area;
              const ab = aberto === x.id;
              return (
                <div key={x.id} className="guia-item-grupo">
                  {novaArea && <h3 className="guia-area">{x.area}</h3>}
                  <section className="guia-item">
                    <button type="button" className="guia-item-topo" aria-expanded={ab} onClick={() => setAberto(ab ? null : x.id)}>
                      <span><strong>{x.servico}</strong><span className="suave"> · {x.base}</span>{x.fonte.tipo === "estimativa" && <span className="guia-selo">estimativa</span>}</span>
                      <span className="guia-faixa">{brl(x.min)} a {brl(x.max)}</span>
                    </button>
                    {ab && (
                      <div className="guia-item-corpo">
                        <p><strong>Normalmente inclui:</strong> {x.inclui.join(", ")}.</p>
                        <p><strong>Custa mais se tiver:</strong> {x.sobe.join(", ")}.</p>
                        <OrigemFaixa fonte={x.fonte} />
                      </div>
                    )}
                  </section>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="secao" id="seguranca">
        <h2>Para dar tudo certo</h2>
        <div className="grade-dicas">
          {CUIDADOS.map((d, i) => (
            <div key={d.titulo} className="cartao bloco dica">
              <span className="dica-numero">{i + 1}</span>
              <h3 className="h-pequeno">{d.titulo}</h3>
              <p style={{ margin: 0 }}>{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="secao" id="celular">
        <h2>Fólium no celular</h2>
        <p style={{ maxWidth: "42em" }}>
          Instale o Fólium como aplicativo, sem baixar da loja, para acompanhar suas vagas e responder alunos de qualquer lugar.{" "}
          <Link href="/instalar">Ver o passo a passo</Link>
        </p>
      </section>
    </div>
  );
}
