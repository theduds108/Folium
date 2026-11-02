import Link from "next/link";
import { REDES, iniciais, linkExterno, unsplash, type Aluno } from "@/lib/data";
import { Anotacao } from "@/components/Zine";
import { SeloVerificado } from "@/components/Logo";
import { CopiarLink } from "@/components/CopiarLink";
import { Denunciar } from "@/components/Denunciar";
import type { Avaliacao } from "@/lib/conteudo";
import { formatarMes, formatarPeriodo } from "@/lib/formato";

/** Página pública do portfólio, usada pelos exemplos e pelos perfis do banco. */
export function PerfilVista({ aluno, avaliacoes = [] }: { aluno: Aluno; avaliacoes?: Avaliacao[] }) {
  const primeiroNome = aluno.nome.split(" ")[0];
  const mensagem = encodeURIComponent(`Olá, ${primeiroNome}! Vi seu portfólio no Fólium e gostaria de conversar sobre um trabalho.`);
  const links = REDES.filter((r) => aluno.links?.[r.chave]);
  const experiencias = aluno.experiencias ?? [];
  const certificados = aluno.certificados ?? [];
  const idiomas = aluno.idiomas ?? [];
  const interesses = [...(aluno.tiposVaga ?? []), ...(aluno.modalidades ?? [])];

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
        {aluno.titulo && <p className="perfil-titulo">{aluno.titulo}</p>}
        <Anotacao className="anotacao-perfil">
          {aluno.semestre}º semestre, UNISAGRADO{aluno.conclusao ? ` · forma em ${formatarMes(aluno.conclusao)}` : ""}
        </Anotacao>
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
            {aluno.disponivel ? "Disponível para novos trabalhos" : "Agenda cheia no momento"}
          </span>
          {aluno.valorReferencia && (
            <dl>
              <dt>Valor de referência</dt>
              <dd>{aluno.valorReferencia}</dd>
            </dl>
          )}
          {interesses.length > 0 && (
            <dl>
              <dt>Aceita</dt>
              <dd className="etiquetas" style={{ marginTop: 6 }}>
                {interesses.map((i) => <span key={i} className="etiqueta">{i}</span>)}
              </dd>
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
          {aluno.curriculo && (
            <a className="botao botao-contorno" href={aluno.curriculo} target="_blank" rel="noopener noreferrer">
              Baixar currículo (PDF)
            </a>
          )}
          {links.length > 0 && (
            <ul className="perfil-links">
              {links.map((r) => (
                <li key={r.chave}>
                  <a href={linkExterno(aluno.links![r.chave]!)} target="_blank" rel="noopener noreferrer nofollow">
                    {r.rotulo} ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="compartilhar">
            <CopiarLink />
          </div>
          <Denunciar alvo={aluno.slug} />
        </aside>
      </div>

      {aluno.sobre && (
        <section className="secao" style={{ paddingTop: 40, paddingBottom: 0 }}>
          <h2 className="revelar-esquerda">Sobre mim</h2>
          <div className="perfil-sobre revelar">
            {aluno.sobre.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>
      )}

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
                {(t.galeria?.length ?? 0) > 0 && (
                  <div className="trabalho-galeria">
                    {t.galeria!.map((g) => (
                      <a key={g} href={unsplash(g, 1400)} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={unsplash(g, 300)} alt={`Mais uma imagem de ${t.titulo}`} loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
                {(t.cliente || t.ano) && (
                  <p className="trabalho-meta">{[t.cliente, t.ano].filter(Boolean).join(" · ")}</p>
                )}
                <p className="trabalho-desc">{t.descricao}</p>
                {t.papel && <p className="trabalho-papel"><strong>Minha parte:</strong> {t.papel}</p>}
                {t.link && (
                  <a className="link-mao trabalho-link" href={linkExterno(t.link)} target="_blank" rel="noopener noreferrer nofollow">
                    ver projeto →
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {experiencias.length > 0 && (
        <section className="secao" style={{ paddingTop: 0 }}>
          <h2 className="revelar-esquerda">Experiência</h2>
          <ol className="linha-tempo revelar-grupo">
            {experiencias.map((x, i) => (
              <li key={i}>
                <span className="linha-tempo-periodo">{x.inicio || x.fim || x.atual ? formatarPeriodo(x.inicio, x.fim, x.atual) : x.periodo}</span>
                <h3>{x.cargo}</h3>
                <p className="suave linha-tempo-lugar">{x.lugar}</p>
                {x.descricao && <p>{x.descricao}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {(certificados.length > 0 || idiomas.length > 0) && (
        <section className="secao" style={{ paddingTop: 0 }}>
          <div className="dois-lados revelar-grupo">
            {certificados.length > 0 && (
              <div className="cartao lado">
                <h2 className="titulo-bloco">Cursos e certificados</h2>
                <ul className="lista-cursos">
                  {certificados.map((c, i) => (
                    <li key={i}>
                      <strong>
                        {c.link ? (
                          <a href={linkExterno(c.link)} target="_blank" rel="noopener noreferrer nofollow">{c.nome} ↗</a>
                        ) : (
                          c.nome
                        )}
                      </strong>
                      <span className="suave">{[c.instituicao, c.ano].filter(Boolean).join(" · ")}</span>
                      {c.arquivo && (
                        <a className="link-certificado" href={c.arquivo} target="_blank" rel="noopener noreferrer">ver certificado ↗</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {idiomas.length > 0 && (
              <div className="cartao lado">
                <h2 className="titulo-bloco">Idiomas</h2>
                <ul className="lista-cursos">
                  {idiomas.map((x, i) => (
                    <li key={i}>
                      <strong>{x.idioma}</strong>
                      <span className="suave">{x.nivel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
