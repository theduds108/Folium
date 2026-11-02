import Link from "next/link";
import { ALUNOS } from "@/lib/data";
import { CartaoAluno } from "@/components/CartaoAluno";

export default function Inicio() {
  const destaques = ALUNOS.filter((a) => a.disponivel).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grade">
          <div>
            <span className="etiqueta etiqueta-terra">Começando na UNISAGRADO</span>
            <h1 style={{ marginTop: 16 }}>Portfólios que viram oportunidade.</h1>
            <p className="lead suave">
              O Fólium é a vitrine de universitários da região de Bauru. Alunos mostram seus trabalhos,
              e quem precisa de um freela encontra talento local, jovem e verificado pela instituição.
            </p>
            <form className="busca-rapida" action="/talentos" role="search">
              <input
                className="entrada"
                type="search"
                name="q"
                placeholder="Ex.: identidade visual, fotografia…"
                aria-label="Buscar talentos"
              />
              <button className="botao botao-verde" type="submit">Buscar</button>
            </form>
            <div className="hero-acoes">
              <Link href="/talentos" className="botao botao-primario">Encontrar talentos</Link>
              <Link href="/entrar" className="botao botao-contorno">Sou aluno, criar portfólio</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="secao-titulo">
            <h2>Talentos disponíveis agora</h2>
            <Link href="/talentos" className="suave">Ver todos →</Link>
          </div>
          <div className="grade-alunos">
            {destaques.map((a) => (
              <CartaoAluno key={a.slug} aluno={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <h2>Como funciona</h2>
          <div className="dois-lados" style={{ marginTop: 20 }}>
            <div className="cartao lado">
              <h3>Para alunos</h3>
              <ol>
                <li>Entre com seu e-mail institucional da UNISAGRADO.</li>
                <li>Monte seu portfólio com trabalhos, áreas e valores de referência.</li>
                <li>Compartilhe seu link e receba contatos de quem quer contratar.</li>
              </ol>
            </div>
            <div className="cartao lado">
              <h3>Para quem contrata</h3>
              <ol>
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
          <div className="faixa-confianca">
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
