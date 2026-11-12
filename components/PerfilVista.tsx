import Link from "next/link";
import { REDES, iniciais, linkExterno, unsplash, type Aluno, type Trabalho } from "@/lib/data";
import { Anotacao } from "@/components/Zine";
import { FotoEnquadrada } from "@/components/FotoEnquadrada";
import { LinkSeguro } from "@/lib/arquivos";
import { GaleriaObra } from "@/components/GaleriaObra";
import { SeloVerificado } from "@/components/Logo";
import { SalvarTalento } from "./SalvarTalento";
import { CopiarLink } from "@/components/CopiarLink";
import { Denunciar } from "@/components/Denunciar";
import { BotaoPdf } from "@/components/BotaoPdf";
import type { Avaliacao } from "@/lib/conteudo";
import { MINIMO_PARA_MEDIA, ROTULO_CRITERIO, mediasPorCriterio } from "@/lib/seguranca-dados";
import { formatarMes, formatarPeriodo } from "@/lib/formato";

/**
 * Uma obra do portfólio, como peça editorial: imagens inteiras num passe-partout
 * (object-fit: contain, nunca recortadas), em carrossel quando há mais de uma,
 * e legenda abaixo com tipo, título e créditos.
 */
function Obra({ t, destaque = false }: { t: Trabalho; destaque?: boolean }) {
  const meta = [t.tipo, t.cliente, t.ano].filter(Boolean).join(" · ");
  const imagens = [t.imagem, ...(t.galeria ?? [])].filter((x): x is string => !!x);
  return (
    <figure className={destaque ? "obra obra-destaque" : "obra"}>
      <GaleriaObra imagens={imagens} titulo={t.titulo} tipo={t.tipo} cor={t.cor} destaque={destaque} />
      <figcaption className="obra-legenda">
        {meta && <span className="obra-meta">{meta}</span>}
        <h3 className="obra-titulo">{t.titulo}</h3>
        {t.descricao && <p className="obra-desc">{t.descricao}</p>}
        {t.papel && <p className="obra-papel"><strong>Minha parte:</strong> {t.papel}</p>}
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
export function PerfilVista({ aluno, avaliacoes = [], acoes }: { aluno: Aluno; avaliacoes?: Avaliacao[]; acoes?: React.ReactNode }) {
  const publico = !!aluno.publico;
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
      {!publico && (
        <p className="perfil-voltar">
          <Link href="/talentos" className="suave">← Voltar para talentos</Link>
        </p>
      )}

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
                <FotoEnquadrada className="foto-cobrir" src={unsplash(aluno.foto, 500)} alt={`Foto de ${aluno.nome}`} width={500} height={667} />
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
          {publico ? (
            <>
              <p className="suave perfil-publico-aviso">
                Para falar com {primeiroNome} e ver currículo e certificados, entre no Fólium. A conta é grátis.
              </p>
              <Link href="/entrar?modo=primeiro" className="botao botao-primario">Criar conta grátis</Link>
              <Link href="/entrar" className="botao botao-contorno">Já tenho conta</Link>
            </>
          ) : (
            <>
            {aluno.contatosOcultos && (
              <p className="aviso perfil-publico-aviso" role="status">
                Seu cadastro de contratante está em análise pela equipe do Fólium. Assim que for aprovado,
                o WhatsApp, o e-mail e o currículo de {primeiroNome} aparecem aqui.
              </p>
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
              <LinkSeguro className="botao botao-contorno" href={aluno.curriculo} target="_blank" rel="noopener noreferrer">
                Baixar currículo (PDF)
              </LinkSeguro>
            )}
            <SalvarTalento slug={aluno.slug} />
            <div className="compartilhar">
              <CopiarLink />
            </div>
            <Denunciar alvo={aluno.slug} />
            </>
          )}
          {acoes}
          <BotaoPdf />
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
                          <span className="curso-nome">
                            {c.link ? (
                              <a href={linkExterno(c.link)} target="_blank" rel="noopener noreferrer nofollow">{c.nome} ↗</a>
                            ) : (
                              c.nome
                            )}
                          </span>
                          <span className="curso-meta">
                            {[c.instituicao, c.ano && !c.instituicao.includes(c.ano) ? c.ano : ""].filter(Boolean).join(" · ")}
                            {c.arquivo && (
                              <LinkSeguro className="link-certificado" href={c.arquivo} target="_blank" rel="noopener noreferrer">certificado ↗</LinkSeguro>
                            )}
                          </span>
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
              <ResumoAvaliacoes avaliacoes={avaliacoes} />
              <div className="dois-lados revelar-grupo" style={{ marginTop: 16 }}>
                {avaliacoes.map((a, i) => (
                  <figure key={`${i}-${a.autor}`} className="cartao lado avaliacao">
                    <span className="estrelas" role="img" aria-label={`${a.nota} de 5 estrelas`}>
                      {"★".repeat(a.nota)}
                      <span className="estrela-vazia">{"★".repeat(5 - a.nota)}</span>
                    </span>
                    <blockquote>{a.texto}</blockquote>
                    {a.criterios && Object.keys(a.criterios).length > 0 && (
                      <p className="ajuda avaliacao-criterios">{Object.entries(a.criterios).map(([k, v]) => `${ROTULO_CRITERIO[k] ?? k} ${v}`).join(" · ")}</p>
                    )}
                    <figcaption className="suave">{a.autor} · {a.selo ?? "contratante verificado"}</figcaption>
                    {a.resposta && <p className="avaliacao-resposta"><strong>Resposta de {aluno.nome.split(" ")[0]}:</strong> {a.resposta}</p>}
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

/** Média geral e por critério. Só aparece a partir de 3 avaliações. */
function ResumoAvaliacoes({ avaliacoes }: { avaliacoes: Avaliacao[] }) {
  if (avaliacoes.length < MINIMO_PARA_MEDIA)
    return <p className="suave" style={{ margin: "6px 0 0" }}>A média aparece a partir de {MINIMO_PARA_MEDIA} avaliações.</p>;
  const geral = Math.round((avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length) * 10) / 10;
  const criterios = mediasPorCriterio(avaliacoes);
  return (
    <p className="resumo-avaliacoes" style={{ margin: "6px 0 0" }}>
      <strong>{geral.toLocaleString("pt-BR")} de 5</strong> em {avaliacoes.length} avaliações
      {criterios.length > 0 && <span className="suave"> · {criterios.map((c) => `${c.rotulo} ${c.media.toLocaleString("pt-BR")}`).join(" · ")}</span>}
    </p>
  );
}
