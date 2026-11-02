import Link from "next/link";
import { ALUNOS, SERVICOS } from "@/lib/data";
import { CartaoAluno } from "@/components/CartaoAluno";
import { Leque } from "@/components/Leque";
import { Anotacao, Faixa, Ornamentos, PapelRasgado } from "@/components/Zine";
import { EntradaCapa } from "@/components/animacoes/EntradaCapa";
import { FolhasCaindo } from "@/components/animacoes/FolhasCaindo";

export default function Inicio() {
  const destaques = ALUNOS.filter((a) => a.disponivel).slice(0, 3);
  const leque = ALUNOS.slice(0, 5);

  return (
    <>
      <section className="capa-zine">
        <FolhasCaindo />
        <EntradaCapa />
        <div className="container">
          <div className="rotulos">
            <span>Bem-vindo ao</span>
            <span>UNISAGRADO · 2026</span>
          </div>

          <h1 className="marca-gigante" aria-label="Fólium">
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

          <div className="rotulos rotulos-baixo">
            <span>Vitrine de universitários</span>
            <Anotacao className="anotacao-capa">portfólios que viram oportunidade</Anotacao>
            <span>Bauru · SP</span>
          </div>

          <div className="centro">
            <Ornamentos />
          </div>

          <p className="lead-zine">
            Alunos mostram seus trabalhos. Quem precisa de um freela encontra talento local, jovem e verificado pela
            instituição.
          </p>

          <form className="busca-rapida" action="/talentos" role="search">
            <input className="entrada" type="search" name="q" placeholder="Ex.: identidade visual, fotografia…" aria-label="Buscar talentos" />
            <button className="botao botao-verde" type="submit">Buscar</button>
          </form>
          <div className="hero-acoes">
            <Link href="/talentos" className="botao botao-primario">Encontrar talentos</Link>
            <Link href="/entrar" className="botao botao-contorno">Sou aluno, criar portfólio</Link>
          </div>

          <Leque alunos={leque} />
        </div>
      </section>

      <div className="bloco-escuro">
        <PapelRasgado />
        <Faixa itens={[...SERVICOS]} />
        <PapelRasgado inverter />
      </div>

      <section className="secao">
        <div className="container">
          <div className="secao-titulo revelar">
            <h2>Disponíveis agora</h2>
            <Link href="/talentos" className="link-mao">ver todos →</Link>
          </div>
          <div className="grade-alunos revelar-grupo">
            {destaques.map((a) => (
              <CartaoAluno key={a.slug} aluno={a} />
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
