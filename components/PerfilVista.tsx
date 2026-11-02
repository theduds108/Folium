import Link from "next/link";
import { iniciais, unsplash, type Aluno } from "@/lib/data";
import { Anotacao } from "@/components/Zine";
import { SeloVerificado } from "@/components/Logo";
import { CopiarLink } from "@/components/CopiarLink";
import { Denunciar } from "@/components/Denunciar";
import type { Avaliacao } from "@/lib/conteudo";

/** Página pública do portfólio, usada pelos exemplos e pelos perfis do banco. */
export function PerfilVista({ aluno, avaliacoes = [] }: { aluno: Aluno; avaliacoes?: Avaliacao[] }) {
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
        <div className="perfil-ola revelar-grupo">
          <div className="moldura">
            {aluno.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="foto-cobrir" src={unsplash(aluno.foto, 500)} alt={`Foto de ${aluno.nome}`} />
            ) : (
              <span className="moldura-iniciais" aria-hidden="true">{iniciais(aluno.nome)}</span>
            )}
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
            {aluno.habilidades.length > 0 && (
              <>
                <h3>Habilidades</h3>
                <div className="etiquetas">
                  {aluno.habilidades.map((h) => (
                    <span key={h} className="etiqueta etiqueta-terra">{h}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="cartao contato revelar" aria-label="Contato">
          <span className={aluno.disponivel ? "disponivel" : "disponivel nao"}>
            {aluno.disponivel ? "Disponível para freelas" : "Agenda cheia no momento"}
          </span>
          {aluno.valorReferencia && (
            <dl>
              <dt>Valor de referência</dt>
              <dd>{aluno.valorReferencia}</dd>
            </dl>
          )}
          {aluno.whatsapp && (
            <a className="botao botao-verde" href={`https://wa.me/${aluno.whatsapp}?text=${mensagem}`} target="_blank" rel="noopener noreferrer">
              Conversar no WhatsApp
            </a>
          )}
          {aluno.email && (
            <a className="botao botao-contorno" href={`mailto:${aluno.email}?subject=${encodeURIComponent("Contato pelo Fólium")}`}>
              Enviar e-mail
            </a>
          )}
          <div className="compartilhar">
            <CopiarLink />
          </div>
          <Denunciar alvo={aluno.slug} />
        </aside>
      </div>

      {aluno.trabalhos.length > 0 && (
      <section className="secao" style={{ paddingTop: 40 }}>
        <h2 className="revelar-esquerda">Trabalhos</h2>
        <div className="grade-trabalhos revelar-grupo">
          {aluno.trabalhos.map((t, i) => (
            <article key={`${i}-${t.titulo}`} className="trabalho">
              <div
                className="trabalho-capa"
                style={{
                  backgroundColor: t.cor,
                  backgroundImage: t.imagem
                    ? `linear-gradient(180deg, rgba(47,62,42,.55) 0%, rgba(47,62,42,0) 35%, rgba(47,62,42,0) 50%, rgba(47,62,42,.8) 100%), url(${unsplash(t.imagem, 700)})`
                    : undefined,
                }}
              >
                <span>{t.tipo}</span>
                <strong>{t.titulo}</strong>
              </div>
              <p className="trabalho-desc">{t.descricao}</p>
            </article>
          ))}
        </div>
      </section>
      )}

      {avaliacoes.length > 0 && (
      <section className="secao" style={{ paddingTop: 0 }}>
        <h2 className="revelar-esquerda">Avaliações</h2>
        <div className="dois-lados revelar-grupo" style={{ marginTop: 16 }}>
          {avaliacoes.map((a) => (
            <figure key={a.autor} className="cartao lado avaliacao">
              <span className="estrelas" aria-label={`${a.nota} de 5 estrelas`}>
                {"★".repeat(a.nota)}
                <span className="estrela-vazia">{"★".repeat(5 - a.nota)}</span>
              </span>
              <blockquote>{a.texto}</blockquote>
              <figcaption className="suave">{a.autor} · contratante verificado</figcaption>
            </figure>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}
