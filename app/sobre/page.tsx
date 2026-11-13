import type { Metadata } from "next";
import Link from "next/link";
import { COMPARACAO, DIFERENCIAIS, EQUIPE, EXPANSAO, MISSAO, PARCEIROS_ATUAIS, VALORES, VISAO } from "@/lib/conteudo";
import { Anotacao, Ornamentos, PapelRasgado } from "@/components/Zine";
import { FolhaMarca } from "@/components/Marca";

export const metadata: Metadata = { title: "Sobre" };

const PASSOS = [
  {
    titulo: "O aluno monta a vitrine",
    texto: "Entra com o e-mail da faculdade e publica os trabalhos que já fez, com fotos, ficha técnica e valores de referência.",
  },
  {
    titulo: "Quem contrata encontra",
    texto: "Um contratante aprovado pela equipe filtra por curso e serviço, abre o portfólio e chama o aluno.",
  },
  {
    titulo: "Os dois combinam com segurança",
    texto: "O combinado fica registrado, com código de conduta, denúncia e pedido de ajuda à mão, e no fim cada um avalia o outro.",
  },
];

/**
 * Página Sobre: conta a história do Fólium para quem acabou de chegar.
 * Ordem: abertura → problema → como funciona → diferenciais → comparação → missão → parcerias → equipe.
 * Os diferenciais vêm de lib/conteudo.ts e só citam o que já existe na plataforma.
 */
export default function Sobre() {
  return (
    <div className="container pagina sb">
      <header className="sb-abertura">
        <div className="sb-abertura-texto">
          <div className="rotulos">
            <span>Sobre o Fólium</span>
            <span>Bauru · SP · 2026</span>
          </div>
          <h1 className="sb-titulo">
            Não somos mais um <span className="sb-riscado">site de vagas</span>.
          </h1>
          <Anotacao className="sb-anotacao">somos a vitrine que faltava</Anotacao>
          <p className="sb-lead">
            O Fólium é a vitrine que o universitário nunca teve, com uma universidade por trás. Quem estuda mostra o que
            sabe fazer; quem contrata encontra gente nova, da região, com a segurança de saber com quem está falando.
          </p>
          <div className="sb-acoes">
            <Link href="/talentos" className="botao botao-primario">Ver talentos</Link>
            <Link href="/entrar?modo=primeiro" className="botao botao-contorno">Criar meu portfólio</Link>
          </div>
        </div>

        <aside className="sb-verbete" aria-label="Origem do nome">
          <FolhaMarca tamanho={44} cor="var(--verde-folio)" className="sb-verbete-folha" />
          <p className="sb-verbete-palavra">fó·li·um</p>
          <p className="sb-verbete-classe">do latim <em>folium</em>, folha</p>
          <ol>
            <li>A folha que o artesão carregava para provar o que sabia fazer. Raiz da palavra <em>portfólio</em>.</li>
            <li>Lugar onde o universitário deixa de carregar as folhas sozinho.</li>
          </ol>
        </aside>
      </header>

      <section className="sb-bloco" aria-labelledby="sb-problema">
        <p className="sb-sobretitulo">O problema</p>
        <h2 className="sb-h2" id="sb-problema">Talento sobrando, vitrine faltando.</h2>
        <div className="sb-lados revelar-grupo">
          <article>
            <p className="sb-quem">Para o aluno</p>
            <h3 className="sb-frase">Tem trabalho pronto, mas ninguém acha.</h3>
            <p>
              Posta solto no Instagram, não sabe quanto cobrar, tem medo de golpe e não tem um canal confiável dentro da
              faculdade para ser encontrado.
            </p>
          </article>
          <article>
            <p className="sb-quem">Para quem contrata</p>
            <h3 className="sb-frase">Precisa de gente e não sabe onde buscar.</h3>
            <p>
              Quer um freela de comunicação, design ou tecnologia, mas depende de indicação ou de anúncio solto em grupo,
              sem saber se a pessoa é quem diz ser.
            </p>
          </article>
        </div>
      </section>

      <section className="sb-bloco" aria-labelledby="sb-como">
        <p className="sb-sobretitulo">Como funciona</p>
        <h2 className="sb-h2" id="sb-como">Do trabalho guardado ao primeiro freela.</h2>
        <ol className="sb-passos revelar-grupo">
          {PASSOS.map((p, i) => (
            <li key={p.titulo}>
              <span className="sb-passo-num" aria-hidden="true">{i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sb-diferenciais" aria-labelledby="sb-dif">
        <PapelRasgado />
        <div className="sb-diferenciais-miolo">
          <p className="sb-sobretitulo">Nossos diferenciais</p>
          <h2 className="sb-h2" id="sb-dif">O que só o Fólium tem.</h2>
          <p className="sb-dif-intro">
            Não é mais uma rede social nem mais um mural de vagas. Cada peça daqui existe para que o aluno seja levado a
            sério e para que quem contrata confie no que vê.
          </p>
          <ul className="sb-dif-grade revelar-grupo">
            {DIFERENCIAIS.map((d, i) => (
              <li key={d.titulo}>
                <span className="sb-dif-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
                {d.link && (
                  <Link href={d.link.href} className="sb-dif-link">{d.link.rotulo} →</Link>
                )}
              </li>
            ))}
          </ul>
          <p className="sb-dif-extra">
            <span>Grátis para alunos e para quem contrata</span>
            <span aria-hidden="true">✦</span>
            <span>Vira app no celular, <Link href="/instalar">sem loja de aplicativos</Link></span>
          </p>
        </div>
        <PapelRasgado inverter />
      </section>

      <section className="sb-bloco" aria-labelledby="sb-comp">
        <p className="sb-sobretitulo">Frente ao que existe</p>
        <h2 className="sb-h2" id="sb-comp">Onde os outros param, a gente começa.</h2>
        <div className="sb-tabela-moldura">
          <table className="sb-tabela">
            <thead>
              <tr>
                <th scope="col">Hoje, em…</th>
                <th scope="col">O que falta</th>
                <th scope="col" className="sb-col-folium">No Fólium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARACAO.map((c) => (
                <tr key={c.nome}>
                  <th scope="row">{c.nome}</th>
                  <td data-rotulo="O que falta">{c.fraco}</td>
                  <td data-rotulo="No Fólium" className="sb-col-folium">{c.folium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sb-bloco sb-missao" aria-labelledby="sb-missao">
        <p className="sb-sobretitulo" id="sb-missao">Missão</p>
        <blockquote className="sb-citacao revelar">{MISSAO}</blockquote>
        <div className="sb-mvv">
          <div>
            <h2 className="sb-quem">Visão</h2>
            <p>{VISAO}</p>
          </div>
          <div>
            <h2 className="sb-quem">Valores</h2>
            <ul className="sb-valores">
              {VALORES.map((v) => (
                <li key={v.titulo}><strong>{v.titulo}</strong> {v.texto}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="sb-bloco" aria-labelledby="sb-parcerias">
        <p className="sb-sobretitulo">Parcerias</p>
        <h2 className="sb-h2" id="sb-parcerias">Quem caminha com a gente.</h2>
        <ul className="sb-parceiros">
          {PARCEIROS_ATUAIS.map((p) => (
            <li key={p.nome}>
              <strong>{p.nome}</strong>
              <span>{p.papel}</span>
            </li>
          ))}
        </ul>
        <p className="sb-expansao">
          <span className="sb-quem">Próximos campi, a médio prazo</span>
          {EXPANSAO.join("  ·  ")}
        </p>
      </section>

      <section className="sb-fecho" aria-labelledby="sb-equipe">
        <Ornamentos claro />
        <h2 id="sb-equipe">Quem faz</h2>
        <p className="sb-fecho-sub">
          Feito por universitárias, para universitários. Projeto da disciplina de Empreendedorismo, Ciência da
          Computação e Jornalismo, UNISAGRADO.
        </p>
        <ul className="sb-equipe">
          {EQUIPE.map((nome) => (
            <li key={nome}>{nome}</li>
          ))}
        </ul>
        <div className="sb-acoes sb-acoes-centro">
          <Link href="/talentos" className="botao botao-claro">Ver talentos</Link>
          <Link href="/entrar?modo=primeiro" className="botao botao-contorno-claro">Criar meu portfólio</Link>
        </div>
      </section>
    </div>
  );
}
