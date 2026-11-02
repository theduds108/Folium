import Link from "next/link";
import { ALUNOS } from "@/lib/data";
import { DEPOIMENTOS, MISSAO, OPORTUNIDADES } from "@/lib/conteudo";
import { ListaTalentos } from "@/components/ListaTalentos";
import { TituloSobe } from "@/components/movimento/TituloSobe";

function Rotulo({ num, texto }: { num: string; texto: string }) {
  return (
    <div className="rotulo-secao">
      <span>{num}</span> / {texto}
    </div>
  );
}

export default function Inicio() {
  return (
    <>
      <section className="abertura">
        <div className="container">
          <p className="rotulo-secao">Portfólios universitários / Bauru, SP / UNISAGRADO</p>
          <TituloSobe
            className="capa-titulo"
            linhas={[
              <>Talento da</>,
              <><em>região,</em> com a</>,
              <>garantia da <em>faculdade.</em></>,
            ]}
          />
          <div className="capa-rodape">
            <p className="capa-texto">
              O Fólium é a vitrine de portfólios dos alunos da UNISAGRADO. Quem precisa de um freela encontra talento
              local e verificado. Quem estuda ganha um endereço para mostrar o que sabe fazer.
            </p>
            <div className="capa-acoes">
              <form className="busca-linha" action="/talentos" role="search">
                <input type="search" name="q" placeholder="Buscar por serviço ou habilidade" aria-label="Buscar talentos" />
                <button type="submit" aria-label="Buscar">→</button>
              </form>
              <Link href="/entrar" className="link-seta">Sou aluno, criar meu portfólio <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="secao-cabeca revelar">
            <Rotulo num="01" texto="Talentos" />
            <h2>Quem está <em>no Fólium</em></h2>
            <Link href="/talentos" className="link-seta">Ver todos com filtros <span aria-hidden="true">↗</span></Link>
          </div>
          <ListaTalentos alunos={ALUNOS} />
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="secao-cabeca revelar">
            <Rotulo num="02" texto="Oportunidades" />
            <h2>Trabalhos <em>abertos</em></h2>
            <Link href="/oportunidades" className="link-seta">Ver o mural <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="grade-vagas revelar-grupo">
            {OPORTUNIDADES.slice(0, 3).map((o) => (
              <Link key={o.id} href="/oportunidades" className="vaga vaga-link">
                <div className="vaga-topo">
                  <span className="etiqueta">{o.tipo}</span>
                  <span className="suave vaga-data">{o.publicadaHa}</span>
                </div>
                <h3>{o.titulo}</h3>
                <p className="suave vaga-empresa">{o.empresa} · {o.orcamento}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="secao-cabeca revelar">
            <Rotulo num="03" texto="Como funciona" />
            <h2>Dois lados, <em>um lugar</em></h2>
          </div>
          <div className="dois-lados revelar-grupo">
            <div className="lado">
              <h3>Para alunos</h3>
              <ol className="passos">
                <li>Entre com seu e-mail institucional da UNISAGRADO.</li>
                <li>Monte seu portfólio com trabalhos, áreas e valores de referência.</li>
                <li>Compartilhe seu link e receba contatos de quem quer contratar.</li>
              </ol>
              <Link href="/guia" className="link-seta">Guia: quanto cobrar e como evitar golpe <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="lado">
              <h3>Para quem contrata</h3>
              <ol className="passos">
                <li>Navegue sem precisar criar conta.</li>
                <li>Filtre por curso, tipo de serviço e habilidade.</li>
                <li>Fale direto com o aluno pelo WhatsApp ou e-mail.</li>
              </ol>
              <Link href="/planos" className="link-seta">Publicar uma oportunidade <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="secao-cabeca revelar">
            <Rotulo num="04" texto="Quem já usou" />
            <h2>O que <em>dizem</em></h2>
          </div>
          <div className="grade-depoimentos revelar-grupo">
            {DEPOIMENTOS.map((d) => (
              <figure key={d.autor} className="depoimento">
                <blockquote>“{d.texto}”</blockquote>
                <figcaption>{d.autor}</figcaption>
              </figure>
            ))}
          </div>
          <p className="suave nota">Depoimentos ilustrativos do protótipo.</p>
        </div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="missao revelar">
            <Rotulo num="05" texto="Missão" />
            <p>{MISSAO}</p>
            <Link href="/sobre" className="link-seta">Conheça o Fólium <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
