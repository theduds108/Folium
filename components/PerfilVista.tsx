import Link from "next/link";
import { REDES, iniciais, linkExterno, unsplash, type Aluno, type Trabalho } from "@/lib/data";
import { Anotacao } from "@/components/Zine";
import { SeloVerificado } from "@/components/Logo";
import { CopiarLink } from "@/components/CopiarLink";
import { Denunciar } from "@/components/Denunciar";
import type { Avaliacao } from "@/lib/conteudo";
import { formatarMes, formatarPeriodo } from "@/lib/formato";

/**
 * Uma obra do portfólio, como peça editorial: imagem inteira num passe-partout
 * (object-fit: contain, nunca recortada) e legenda abaixo com tipo, título e créditos.
 */
function Obra({ t, destaque = false }: { t: Trabalho; destaque?: boolean }) {
  const largura = destaque ? 1400 : 800;
  const meta = [t.tipo, t.cliente, t.ano].filter(Boolean).join(" · ");
  return (
    <figure className={destaque ? "obra obra-destaque" : "obra"}>
      <div className="obra-quadro" style={{ backgroundColor: t.cor }}>
        {t.imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unsplash(t.imagem, largura)}
            alt={`${t.tipo}: ${t.titulo}`}
            width={largura}
            height={Math.round(largura * 0.75)}
            loading={destaque ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <span className="obra-sem-imagem" aria-hidden="true">{t.titulo}</span>
        )}
      </div>
      <figcaption className="obra-legenda">
        {meta && <span className="obra-meta">{meta}</span>}
        <h3 className="obra-titulo">{t.titulo}</h3>
        {t.descricao && <p className="obra-desc">{t.descricao}</p>}
        {t.papel && <p className="obra-papel"><strong>Minha parte:</strong> {t.papel}</p>}
        {(t.galeria?.length ?? 0) > 0 && (
          <div className="trabalho-galeria">
            {t.galeria!.map((g, i) => (
              <a key={g} href={unsplash(g, 1400)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir imagem ${i + 2} de ${t.titulo}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={unsplash(g, 300)} alt="" width={300} height={300} loading="lazy" decoding="async" />
              </a>
            ))}
          </div>
        )}
        {t.link && (
          <a className="link-mao obra-link" href={linkExterno(t.link)} target="_blank" rel="noopener noreferrer nofollow">
            ver projeto →
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/** Página pública do portfólio, usada pelos exemplos e pelos perfis do banco. */
export function PerfilVista({ aluno, avaliacoes = [] }: { aluno: Aluno; avaliacoes?: Avaliacao[] }) {
  const primeiroNome = aluno.nome.split(" ")[0];
  const mensagem = encodeURIComponent(`Olá, ${primeiroNome}! Vi seu portfólio no Fólium e gostaria de conversar sobre um trabalho.`);
  const links = REDES.filter((r) => aluno.links?.[r.chave]);
  const experiencias = aluno.experiencias ?? [];
  const certificados = aluno.certificados ?? [];
  const idiomas = aluno.idiomas ?? [];
  const interesses = [...(aluno.tiposVaga ?? []), ...(aluno.modalidades ?? [])];
  const [destaque, ...demais] = aluno.trabalhos;

  // Ficha técnica: cada bloco ganha um rótulo editorial numerado, sem painéis novos.
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <div className="container perfil">
      <p className="perfil-voltar">
        <Link href="/talentos" className="suave">← Voltar para talentos</Link>
      </p>

      <div className="perfil-grade">
        <header className="perfil-ident">
          <div className="rotulos">
            <span>Portfólio · {aluno.curso}</span>
            <span>{aluno.cidade}</span>
          </div>
          <h1 className="perfil-nome">{aluno.nome}</h1>
          {aluno.titulo && <p className="perfil-titulo">{aluno.titulo}</p>}
          <Anotacao className="anotacao-perfil">
            {aluno.semestre}º semestre, UNISAGRADO{aluno.conclusao ? ` · forma em ${formatarMes(aluno.conclusao)}` : ""}
          </Anotacao>

          <div className="perfil-apresenta">
            <div className="moldura">
              {aluno.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="foto-cobrir" src={unsplash(aluno.foto, 500)} alt={`Foto de ${aluno.nome}`} width={500} height={667} decoding="async" />
              ) : (
                <span className="moldura-iniciais" aria-hidden="true">{iniciais(aluno.nome)}</span>
              )}
              <i /><i /><i /><i />
            </div>
            <div className="perfil-bio-bloco">
              <p className="titulo-ola" aria-hidden="true">Olá</p>
              <p className="perfil-bio">{aluno.bio}</p>
              <SeloVerificado />
            </div>
          </div>
        </header>

        <aside className="cartao contato perfil-contato" aria-label={`Contato com ${primeiroNome}`}>
          <span className="contato-rotulo">Contato direto</span>
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
          <div className="compartilhar">
            <CopiarLink />
          </div>
          <Denunciar alvo={aluno.slug} />
        </aside>

        <div className="perfil-corpo">
          {destaque && (
            <section className="perfil-secao" aria-labelledby="obras-titulo">
              <div className="secao-titulo">
                <h2 id="obras-titulo">Obras</h2>
                <span className="rotulos"><span>{aluno.trabalhos.length} {aluno.trabalhos.length === 1 ? "peça" : "peças"}</span></span>
              </div>
              <Obra t={destaque} destaque />
              {demais.length > 0 && (
                <div className="obras-grade">
                  {demais.map((t, i) => (
                    <Obra key={`${i}-${t.titulo}`} t={t} />
                  ))}
                </div>
              )}
            </section>
          )}

          {aluno.sobre && (
            <section className="perfil-secao revelar" aria-labelledby="sobre-titulo">
              <h2 id="sobre-titulo">Sobre mim</h2>
              <div className="perfil-sobre">
                {aluno.sobre.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          )}

          <section className="perfil-secao revelar" aria-labelledby="ficha-titulo">
            <h2 id="ficha-titulo">Ficha técnica</h2>
            <dl className="ficha-tecnica">
              <div>
                <dt><span>{num()}</span> Serviços</dt>
                <dd className="etiquetas">
                  {aluno.servicos.map((s) => <span key={s} className="etiqueta">{s}</span>)}
                </dd>
              </div>
              {aluno.habilidades.length > 0 && (
                <div>
                  <dt><span>{num()}</span> Habilidades</dt>
                  <dd className="ficha-lista-texto">{aluno.habilidades.join(" · ")}</dd>
                </div>
              )}
              <div>
                <dt><span>{num()}</span> Formação</dt>
                <dd>
                  <strong>{aluno.curso}</strong>
                  <span className="suave"> · UNISAGRADO · {aluno.semestre}º semestre{aluno.conclusao ? ` · conclusão em ${formatarMes(aluno.conclusao)}` : ""}</span>
                  {certificados.length > 0 && (
                    <ul className="lista-cursos ficha-sublista">
                      {certificados.map((c, i) => (
                        <li key={i}>
                          <span>
                            {c.link ? (
                              <a href={linkExterno(c.link)} target="_blank" rel="noopener noreferrer nofollow">{c.nome} ↗</a>
                            ) : (
                              c.nome
                            )}
                          </span>
                          <span className="suave">{[c.instituicao, c.ano].filter(Boolean).join(" · ")}</span>
                          {c.arquivo && (
                            <a className="link-certificado" href={c.arquivo} target="_blank" rel="noopener noreferrer">ver certificado ↗</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
              {experiencias.length > 0 && (
                <div>
                  <dt><span>{num()}</span> Experiência</dt>
                  <dd>
                    <ol className="linha-tempo">
                      {experiencias.map((x, i) => (
                        <li key={i}>
                          <span className="linha-tempo-periodo">{x.inicio || x.fim || x.atual ? formatarPeriodo(x.inicio, x.fim, x.atual) : x.periodo}</span>
                          <h3>{x.cargo}</h3>
                          <p className="suave linha-tempo-lugar">{x.lugar}</p>
                          {x.descricao && <p>{x.descricao}</p>}
                        </li>
                      ))}
                    </ol>
                  </dd>
                </div>
              )}
              {idiomas.length > 0 && (
                <div>
                  <dt><span>{num()}</span> Idiomas</dt>
                  <dd className="ficha-lista-texto">
                    {idiomas.map((x) => `${x.idioma} (${x.nivel.toLowerCase()})`).join(" · ")}
                  </dd>
                </div>
              )}
              {links.length > 0 && (
                <div>
                  <dt><span>{num()}</span> Links</dt>
                  <dd>
                    <ul className="perfil-links">
                      {links.map((r) => (
                        <li key={r.chave}>
                          <a href={linkExterno(aluno.links![r.chave]!)} target="_blank" rel="noopener noreferrer nofollow">
                            {r.rotulo} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {avaliacoes.length > 0 && (
            <section className="perfil-secao" aria-labelledby="avaliacoes-titulo">
              <h2 id="avaliacoes-titulo">Avaliações</h2>
              <div className="dois-lados revelar-grupo" style={{ marginTop: 16 }}>
                {avaliacoes.map((a) => (
                  <figure key={a.autor} className="cartao lado avaliacao">
                    <span className="estrelas" role="img" aria-label={`${a.nota} de 5 estrelas`}>
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
      </div>
    </div>
  );
}
