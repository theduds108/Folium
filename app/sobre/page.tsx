import type { Metadata } from "next";
import Link from "next/link";
import { COMPARACAO, EQUIPE, EXPANSAO, MISSAO, PARCEIROS_ATUAIS, VALORES, VISAO } from "@/lib/conteudo";
import { Anotacao, Ornamentos } from "@/components/Zine";

export const metadata: Metadata = { title: "Sobre" };

export default function Sobre() {
  return (
    <div className="container pagina">
      <div className="rotulos">
        <span>Sobre o Fólium</span>
        <span>Bauru · SP · 2026</span>
      </div>
      <h1 className="titulo-pagina">Folium = folha</h1>
      <Anotacao className="anotacao-perfil">do latim, a raiz da palavra portfólio</Anotacao>

      <p className="texto-grande revelar">
        A palavra portfólio vem do latim <em>folium</em>, a folha que o artesão carregava para provar o que sabia
        fazer. Séculos depois, o aluno ainda carrega suas folhas sozinho. O Fólium dá a ele um endereço, e a quem
        contrata, a garantia de uma instituição.
      </p>

      <section className="sb-manifesto" aria-labelledby="sb-missao">
        <p className="sb-numero" aria-hidden="true">01</p>
        <div>
          <h2 className="sb-rotulo" id="sb-missao">Missão</h2>
          <p className="sb-destaque revelar">{MISSAO}</p>
        </div>
      </section>

      <section className="sb-duas" aria-label="Visão e valores">
        <div className="revelar">
          <h2 className="sb-rotulo">Visão</h2>
          <p className="sb-texto">{VISAO}</p>
        </div>
        <div className="revelar">
          <h2 className="sb-rotulo">Valores</h2>
          <ol className="sb-valores">
            {VALORES.map((v, i) => (
              <li key={v.titulo}>
                <span className="sb-valor-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span><strong>{v.titulo}</strong> <span className="suave">{v.texto}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sb-secao" aria-labelledby="sb-problema">
        <div className="secao-titulo">
          <h2 id="sb-problema">O problema</h2>
          <span className="rotulos"><span>dos dois lados</span></span>
        </div>
        <div className="sb-problema revelar-grupo">
          <article>
            <p className="sb-quem">Para o aluno</p>
            <p className="sb-frase">Tem trabalho pronto, mas ninguém acha.</p>
            <p className="sb-texto">
              Posta solto no Instagram ou no Canva. Não sabe quanto cobrar, tem medo de golpe e não tem um canal
              confiável dentro da faculdade para ser encontrado.
            </p>
          </article>
          <article>
            <p className="sb-quem">Para quem contrata</p>
            <p className="sb-frase">Precisa de gente e não sabe onde buscar.</p>
            <p className="sb-texto">
              Quer um freela de comunicação, design ou tecnologia, mas não encontra mão de obra local, jovem e
              qualificada. Depende de indicação ou de anúncios soltos em grupos.
            </p>
          </article>
        </div>
      </section>

      <section className="sb-secao" aria-labelledby="sb-por-que">
        <div className="secao-titulo">
          <h2 id="sb-por-que">Por que o Fólium</h2>
          <span className="rotulos"><span>frente ao que existe hoje</span></span>
        </div>
        <p className="sb-texto revelar" style={{ maxWidth: "40em" }}>
          Portfólio visual, curadoria local e o vínculo com a instituição, juntos num lugar só.
        </p>
        <ul className="sb-comparacao">
          {COMPARACAO.map((c) => (
            <li key={c.nome} className="revelar">
              <h3 className="sb-alt">{c.nome}</h3>
              <p><span className="sb-tag">Tem</span> {c.forte}</p>
              <p><span className="sb-tag sb-tag-folium">Falta</span> {c.fraco}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sb-secao" aria-labelledby="sb-parcerias">
        <div className="secao-titulo">
          <h2 id="sb-parcerias">Parcerias</h2>
        </div>
        <ul className="sb-parceiros">
          {PARCEIROS_ATUAIS.map((p) => (
            <li key={p.nome} className="revelar">
              <span className="sb-quem">Parceria atual</span>
              <strong className="sb-parceiro-nome">{p.nome}</strong>
              <span className="suave">{p.papel}</span>
            </li>
          ))}
        </ul>
        <p className="sb-expansao revelar">
          <span className="sb-quem">Expansão regional, a médio prazo</span>
          {EXPANSAO.join("  ·  ")}
        </p>
      </section>

      <section className="sb-fecho" aria-labelledby="sb-equipe">
        <Ornamentos claro />
        <h2 id="sb-equipe">Quem faz</h2>
        <p className="sb-fecho-sub">
          Projeto da disciplina de Empreendedorismo, Ciência da Computação e Jornalismo, UNISAGRADO.
        </p>
        <ul className="sb-equipe">
          {EQUIPE.map((nome) => (
            <li key={nome}>{nome}</li>
          ))}
        </ul>
        <Link href="/talentos" className="botao botao-claro">Conhecer os talentos</Link>
      </section>
    </div>
  );
}
