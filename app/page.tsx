import Link from "next/link";
import { DEPOIMENTOS, MISSAO, VALORES } from "@/lib/conteudo";
import { MOSTRAR_EXEMPLOS } from "@/lib/config";
import { ConviteInstalar } from "@/components/InstalarApp";
import { SoParaAluno, SoParaContratante } from "@/components/GuiaPorConta";
import { DestaquesInicio, LequeInicio, VagasInicio } from "@/components/VitrineInicio";
import { Faixa, PapelRasgado } from "@/components/Zine";
import { MarcaFolium } from "@/components/Marca";
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
  "Landing page",
  "Loja virtual",
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

          <h1 className="marca-folium marca-gigante" id="capa-marca" aria-label="Fólium">
            <MarcaFolium />
          </h1>

          <div className="capa-conteudo">
            <p className="valor-capa">Talentos da UNISAGRADO para o seu próximo freela.</p>
            <p className="lead-zine">
              Veja trabalhos de universitários, filtre pelo que você precisa e fale direto com quem fez. A conta é
              grátis, para alunos e para quem contrata.
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

      <ConviteInstalar />

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
          <VagasInicio />
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
                <li>Crie sua conta grátis com qualquer e-mail.</li>
                <li>Filtre por curso, tipo de serviço e habilidade.</li>
                <li>Fale direto com o aluno pelo WhatsApp ou e-mail.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <SoParaAluno>
      <section className="secao">
        <div className="container">
          <div className="secao-titulo revelar">
            <h2>Guia do aluno</h2>
            <Link href="/guia" className="link-mao">ver guia completo →</Link>
          </div>
          <div className="dois-lados revelar-grupo">
            <Link href="/guia#precos" className="cartao lado atalho">
              <h3>Não sabe quanto cobrar?</h3>
              <p className="suave">Veja faixas de preço de referência para cada tipo de serviço.</p>
            </Link>
            <Link href="/guia#seguranca" className="cartao lado atalho">
              <h3>Medo de golpe ou calote?</h3>
              <p className="suave">Seis cuidados simples para fechar freelas com segurança.</p>
            </Link>
          </div>
        </div>
      </section>
      </SoParaAluno>

      <SoParaContratante>
      <section className="secao">
        <div className="container">
          <div className="secao-titulo">
            <h2>Guia do contratante</h2>
            <Link href="/guia" className="link-mao">ver guia completo →</Link>
          </div>
          <div className="dois-lados">
            <Link href="/guia#como-funciona" className="cartao lado atalho">
              <h3>Primeira vaga?</h3>
              <p className="suave">Como buscar talentos, publicar vagas e acompanhar os interessados no painel.</p>
            </Link>
            <Link href="/guia#precos" className="cartao lado atalho">
              <h3>Quanto pagar?</h3>
              <p className="suave">Faixas de referência para cada tipo de serviço feito por estudantes.</p>
            </Link>
          </div>
        </div>
      </section>
      </SoParaContratante>

      {MOSTRAR_EXEMPLOS && (
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
          <p className="suave" style={{ fontSize: "var(--t-pequeno)", marginTop: 12 }}>Depoimentos ilustrativos do protótipo.</p>
        </div>
      </section>
      )}

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
