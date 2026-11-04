import Link from "next/link";
import { DEPOIMENTOS, MISSAO, OPORTUNIDADES, VALORES } from "@/lib/conteudo";
import { DestaquesInicio, LequeInicio } from "@/components/VitrineInicio";
import { Faixa, PapelRasgado } from "@/components/Zine";
import { EntradaCapa } from "@/components/animacoes/EntradaCapa";
import { FolhasCaindo } from "@/components/animacoes/FolhasCaindo";

/** Serviços mais procurados, mostrados no índice da faixa escura (cada um abre a busca filtrada). */
const INDICE = [
  "Identidade visual",
  "Fotografia",
  "Vídeo e edição",
  "Social media",
  "Ilustração",
  "UX/UI design",
  "Sites e sistemas",
  "Redação e revisão",
  "Motion design e animação",
  "Projeto de interiores",
];

export default function Inicio() {
  return (
    <>
      <section className="capa-zine" aria-labelledby="capa-marca">
        <FolhasCaindo />
        <EntradaCapa>
          <div className="rotulos capa-rotulos">
            <span>Vitrine de portfólios universitários</span>
            <span>UNISAGRADO · Bauru, SP</span>
          </div>

          <h1 className="marca-gigante" id="capa-marca" aria-label="Fólium">
            <span className="bloco-cobre" aria-hidden="true" />
            <span aria-hidden="true">F</span>
            <span className="letra-folha" aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="11" />
                <path d="M28 72c0-26 16-42 44-44 0 28-16 44-44 44Z" fill="currentColor" />
                <path d="M30 70 58 42" stroke="#F6F0E4" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            <span aria-hidden="true">LIUM</span>
          </h1>

          <div className="capa-conteudo">
            <p className="valor-capa">Talentos da UNISAGRADO para o seu próximo freela.</p>
            <p className="lead-zine">
              Veja trabalhos de universitários, filtre pelo que você precisa e fale direto com quem fez. Para contratar,
              não precisa criar conta.
            </p>

            <form className="busca-rapida" action="/talentos/" role="search">
              <label className="visualmente-oculto" htmlFor="busca-capa">Buscar talentos</label>
              <input id="busca-capa" className="entrada" type="search" name="q" placeholder="Ex.: identidade visual, fotografia…" />
              <button className="botao botao-verde" type="submit">Buscar</button>
            </form>

            <div className="hero-acoes">
              <Link href="/talentos" className="botao botao-primario">Encontrar talentos</Link>
              <Link href="/entrar?modo=primeiro" className="botao botao-contorno">Sou aluno, criar portfólio</Link>
            </div>

            <ul className="provas" aria-label="Por que confiar">
              <li>
                <strong>Alunos UNISAGRADO</strong>
                <span>vínculo conferido pelo e-mail institucional</span>
              </li>
              <li>
                <strong>Portfólios publicados</strong>
                <span>trabalhos montados pelo próprio aluno</span>
              </li>
              <li>
                <strong>Contato direto</strong>
                <span>WhatsApp ou e-mail, sem intermediário</span>
              </li>
            </ul>
          </div>

          <LequeInicio />
        </EntradaCapa>
      </section>

      <div className="bloco-escuro">
        <PapelRasgado />
        <Faixa itens={INDICE} />
        <PapelRasgado inverter />
      </div>

      <section className="secao">
        <div className="container">
          <div className="secao-titulo revelar">
            <h2>Disponíveis agora</h2>
            <Link href="/talentos" className="link-mao">ver todos →</Link>
          </div>
          <DestaquesInicio />
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="secao-titulo revelar">
            <h2>Oportunidades recentes</h2>
            <Link href="/oportunidades" className="link-mao">ver mural →</Link>
          </div>
          <div className="grade-vagas revelar-grupo">
            {OPORTUNIDADES.slice(0, 3).map((o) => (
              <Link key={o.id} href="/oportunidades" className={`cartao vaga vaga-link vaga-${o.tipo === "Estágio" ? "estagio" : o.tipo.toLowerCase()}`}>
                <div className="vaga-topo">
                  <span className={`carimbo carimbo-${o.tipo === "Estágio" ? "estagio" : o.tipo.toLowerCase()}`}>{o.tipo}</span>
                  <span className="suave vaga-data">{o.publicadaHa}</span>
                </div>
                <h3>{o.titulo}</h3>
                <p className="suave vaga-empresa">{o.empresa}</p>
                <dl className="vaga-dados">
                  <div><dt>Orçamento</dt><dd>{o.orcamento}</dd></div>
                  <div><dt>Prazo</dt><dd>{o.prazo}</dd></div>
                </dl>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <h2 className="revelar">Como funciona</h2>
          <div className="dois-lados revelar-grupo" style={{ marginTop: 20 }}>
            <div className="cartao lado">
              <h3>Para alunos</h3>
              <ol className="passos">
                <li>Entre com seu e-mail institucional da UNISAGRADO.</li>
                <li>Monte seu portfólio com trabalhos, áreas e valores de referência.</li>
                <li>Compartilhe seu link e receba contatos de quem quer contratar.</li>
              </ol>
            </div>
            <div className="cartao lado">
              <h3>Para quem contrata</h3>
              <ol className="passos">
                <li>Navegue sem precisar criar conta.</li>
                <li>Filtre por curso, tipo de serviço e habilidade.</li>
                <li>Fale direto com o aluno pelo WhatsApp ou e-mail.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="dois-lados revelar-grupo">
            <Link href="/guia#precos" className="cartao lado atalho">
              <span className="etiqueta etiqueta-terra">Guia do aluno</span>
              <h3>Não sabe quanto cobrar?</h3>
              <p className="suave">Veja faixas de preço de referência para cada tipo de serviço.</p>
            </Link>
            <Link href="/guia#seguranca" className="cartao lado atalho">
              <span className="etiqueta etiqueta-terra">Guia do aluno</span>
              <h3>Medo de golpe ou calote?</h3>
              <p className="suave">Seis cuidados simples para fechar freelas com segurança.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <h2 className="revelar">Quem já usou</h2>
          <div className="grade-depoimentos revelar-grupo">
            {DEPOIMENTOS.map((d) => (
              <figure key={d.autor} className="polaroide depoimento">
                <blockquote>“{d.texto}”</blockquote>
                <figcaption>{d.autor}</figcaption>
              </figure>
            ))}
          </div>
          <p className="suave" style={{ fontSize: "0.85rem", marginTop: 12 }}>Depoimentos ilustrativos do protótipo.</p>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="missao revelar">
            <span className="rotulos"><span>Nossa missão</span></span>
            <p>{MISSAO}</p>
            <div className="etiquetas" style={{ justifyContent: "center" }}>
              {VALORES.map((v) => <span key={v.titulo} className="etiqueta">{v.titulo}</span>)}
            </div>
            <Link href="/sobre" className="link-mao">conheça o Fólium →</Link>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="faixa-confianca revelar">
            <div>
              <h3>Espaço seguro</h3>
              <p>Só entra quem tem vínculo com a universidade, conferido pelo e-mail institucional.</p>
            </div>
            <div>
              <h3>Credibilidade</h3>
              <p>Cada perfil mostra trabalhos reais e o selo de aluno verificado.</p>
            </div>
            <div>
              <h3>Impacto local</h3>
              <p>Negócios da região contratam talento da região, e o aluno ganha experiência real.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
