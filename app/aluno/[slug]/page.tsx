import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALUNOS, buscarAluno, iniciais } from "@/lib/data";
import { Anotacao } from "@/components/Zine";
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

      <div className="perfil-cabeca">
        <div className="rotulos">
          <span>Portfólio · {aluno.curso}</span>
          <span>{aluno.cidade}</span>
        </div>
        <h1 className="perfil-nome">{aluno.nome}</h1>
        <Anotacao className="anotacao-perfil">{aluno.semestre}º semestre, UNISAGRADO</Anotacao>
      </div>

      <div className="perfil-topo">
        <div className="perfil-ola">
          <div className="moldura" aria-hidden="true">
            <span className="moldura-iniciais">{iniciais(aluno.nome)}</span>
            <i /><i /><i /><i />
          </div>
          <div>
            <h2 className="titulo-ola">Olá</h2>
            <p className="perfil-bio">{aluno.bio}</p>
            <SeloVerificado />
          </div>
          <div className="perfil-colunas">
            <h3>Serviços</h3>
            <div className="etiquetas">
              {aluno.servicos.map((s) => (
                <span key={s} className="etiqueta">{s}</span>
              ))}
            </div>
            <h3>Habilidades</h3>
            <div className="etiquetas">
              {aluno.habilidades.map((h) => (
                <span key={h} className="etiqueta etiqueta-terra">{h}</span>
              ))}
            </div>
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

      <section className="secao" style={{ paddingTop: 40 }}>
        <h2>Trabalhos</h2>
        <div className="grade-trabalhos">
          {aluno.trabalhos.map((t) => (
            <article key={t.titulo} className="trabalho">
              <div className="trabalho-capa" style={{ background: t.cor }}>
                <span>{t.tipo}</span>
                <strong>{t.titulo}</strong>
              </div>
              <p className="trabalho-desc">{t.descricao}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
