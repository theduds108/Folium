import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALUNOS, buscarAluno, iniciais } from "@/lib/data";
import { Capa } from "@/components/Capa";
import { SeloVerificado } from "@/components/Logo";
import { CopiarLink } from "./CopiarLink";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALUNOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const aluno = buscarAluno(slug);
  if (!aluno) return {};
  return {
    title: `${aluno.nome}, ${aluno.curso}`,
    description: aluno.bio,
    openGraph: { title: `${aluno.nome} no Fólium`, description: aluno.bio },
  };
}

export default async function PerfilAluno({ params }: Props) {
  const { slug } = await params;
  const aluno = buscarAluno(slug);
  if (!aluno) notFound();

  const primeiroNome = aluno.nome.split(" ")[0];
  const mensagem = encodeURIComponent(`Olá, ${primeiroNome}! Vi seu portfólio no Fólium e gostaria de conversar sobre um trabalho.`);

  return (
    <div className="container">
      <p style={{ marginTop: 20, marginBottom: 0 }}>
        <Link href="/talentos" className="suave">← Voltar para talentos</Link>
      </p>

      <div className="perfil-topo">
        <div>
          <div className="perfil-identidade">
            <div className="avatar" style={{ width: 96, height: 96, fontSize: "2rem" }}>{iniciais(aluno.nome)}</div>
            <div>
              <h1>{aluno.nome}</h1>
              <p className="suave" style={{ margin: "0 0 8px" }}>
                {aluno.curso} · {aluno.semestre}º semestre · {aluno.cidade}
              </p>
              <SeloVerificado />
            </div>
          </div>
          <p style={{ fontSize: "1.1rem", maxWidth: "38em" }}>{aluno.bio}</p>
          <div className="etiquetas" style={{ marginBottom: 8 }}>
            {aluno.servicos.map((s) => (
              <span key={s} className="etiqueta">{s}</span>
            ))}
            {aluno.habilidades.map((h) => (
              <span key={h} className="etiqueta etiqueta-terra">{h}</span>
            ))}
          </div>
        </div>

        <aside className="cartao contato" aria-label="Contato">
          <span className={aluno.disponivel ? "disponivel" : "disponivel nao"}>
            {aluno.disponivel ? "Disponível para freelas" : "Agenda cheia no momento"}
          </span>
          <dl>
            <dt>Valor de referência</dt>
            <dd>{aluno.valorReferencia}</dd>
          </dl>
          <a className="botao botao-verde" href={`https://wa.me/${aluno.whatsapp}?text=${mensagem}`} target="_blank" rel="noopener noreferrer">
            Conversar no WhatsApp
          </a>
          <a className="botao botao-contorno" href={`mailto:${aluno.email}?subject=${encodeURIComponent("Contato pelo Fólium")}`}>
            Enviar e-mail
          </a>
          <div className="compartilhar">
            <CopiarLink />
          </div>
        </aside>
      </div>

      <section className="secao" style={{ paddingTop: 24 }}>
        <h2>Trabalhos</h2>
        <div className="grade-trabalhos">
          {aluno.trabalhos.map((t) => (
            <article key={t.titulo} className="cartao trabalho">
              <Capa cor={t.cor} titulo={t.titulo} semTexto />
              <div className="trabalho-corpo">
                <span className="etiqueta" style={{ marginBottom: 6 }}>{t.tipo}</span>
                <h3>{t.titulo}</h3>
                <p className="suave">{t.descricao}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
