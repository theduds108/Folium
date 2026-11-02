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

      <section className="secao">
        <div className="tres-colunas revelar-grupo">
          <div className="cartao bloco">
            <h2 className="h-pequeno">Missão</h2>
            <p>{MISSAO}</p>
          </div>
          <div className="cartao bloco">
            <h2 className="h-pequeno">Visão</h2>
            <p>{VISAO}</p>
          </div>
          <div className="cartao bloco">
            <h2 className="h-pequeno">Valores</h2>
            <ul className="lista-limpa">
              {VALORES.map((v) => (
                <li key={v.titulo}>
                  <strong>{v.titulo}</strong> {v.texto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="secao">
        <h2 className="revelar">O problema</h2>
        <div className="dois-lados revelar-grupo" style={{ marginTop: 16 }}>
          <div className="cartao lado">
            <h3>O aluno</h3>
            <p>
              Tem trabalhos prontos, mas posta solto no Instagram ou no Canva. Não sabe quanto cobrar, tem medo de
              golpe e não tem um canal confiável dentro da faculdade para ser encontrado.
            </p>
          </div>
          <div className="cartao lado">
            <h3>Quem contrata</h3>
            <p>
              Precisa de um freela de comunicação, design ou tecnologia e não sabe onde achar mão de obra local, jovem e
              qualificada. Depende de indicação ou de anúncios soltos em grupos.
            </p>
          </div>
        </div>
      </section>

      <section className="secao">
        <h2 className="revelar">Por que o Fólium</h2>
        <p className="suave revelar" style={{ maxWidth: "40em" }}>
          Portfólio visual, curadoria local e o vínculo com a instituição, juntos num lugar só.
        </p>
        <div className="tabela-rolagem revelar">
          <table className="tabela">
            <thead>
              <tr>
                <th>Alternativa</th>
                <th>Ponto forte</th>
                <th>Onde o Fólium é diferente</th>
              </tr>
            </thead>
            <tbody>
              {COMPARACAO.map((c) => (
                <tr key={c.nome}>
                  <td><strong>{c.nome}</strong></td>
                  <td>{c.forte}</td>
                  <td>{c.fraco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="secao">
        <h2 className="revelar">Parcerias</h2>
        <div className="dois-lados revelar-grupo" style={{ marginTop: 16 }}>
          {PARCEIROS_ATUAIS.map((p) => (
            <div key={p.nome} className="cartao lado">
              <span className="etiqueta">Parceria atual</span>
              <h3 style={{ marginTop: 10 }}>{p.nome}</h3>
              <p className="suave" style={{ margin: 0 }}>{p.papel}</p>
            </div>
          ))}
        </div>
        <h3 className="revelar" style={{ marginTop: 28 }}>Expansão regional, a médio prazo</h3>
        <div className="etiquetas revelar">
          {EXPANSAO.map((e) => (
            <span key={e} className="etiqueta etiqueta-terra">{e}</span>
          ))}
        </div>
      </section>

      <section className="secao">
        <div className="centro"><Ornamentos /></div>
        <h2 className="revelar" style={{ textAlign: "center" }}>Quem faz</h2>
        <p className="suave revelar" style={{ textAlign: "center" }}>
          Projeto da disciplina de Empreendedorismo, Ciência da Computação e Jornalismo, UNISAGRADO.
        </p>
        <div className="equipe revelar-grupo">
          {EQUIPE.map((nome) => (
            <span key={nome} className="cartao equipe-item">{nome}</span>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/talentos" className="botao botao-primario">Conhecer os talentos</Link>
        </p>
      </section>
    </div>
  );
}
