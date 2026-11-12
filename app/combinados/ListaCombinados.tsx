"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useConta } from "@/lib/conta";
import { formatarData } from "@/lib/formato";
import { AcompanharSeguranca } from "@/components/seguranca/AcompanharSeguranca";
import { BotaoAjuda } from "@/components/seguranca/BotaoAjuda";
import { DenunciarCombinado } from "@/components/seguranca/DenunciarCombinado";
import { CRITERIOS_ALUNO, CRITERIOS_CONTRATANTE, ROTULO_CRITERIO, responderAvaliacao } from "@/lib/seguranca";
import {
  NOME_STATUS,
  avaliacoesDe,
  avaliar,
  convitesEnviados,
  media,
  meusCombinados,
  minhasAvaliacoesFeitas,
  mudarCombinado,
  type AcaoCombinado,
  type AvaliacaoReal,
  type Combinado,
  type Convite,
} from "@/lib/negocios";

export function ListaCombinados() {
  const { conta } = useConta();
  const [lista, setLista] = useState<Combinado[] | null>(null);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [avaliados, setAvaliados] = useState<string[]>([]);
  const [recebidas, setRecebidas] = useState<AvaliacaoReal[]>([]);
  const [notasContratante, setNotasContratante] = useState<Record<string, { media: number | null; total: number }>>({});
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);
  const contratante = conta?.tipo === "contratante";
  const id = conta?.id;

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setErro("");
    meusCombinados()
      .then(async (l) => {
        if (!ativo) return;
        setLista(l);
        setAvaliados(await minhasAvaliacoesFeitas(id));
        // Avaliações que recebi (só chegam depois de reveladas: as duas partes avaliaram ou 14 dias).
        avaliacoesDe(id).then((r) => ativo && setRecebidas(r), () => undefined);
        if (!contratante) {
          // O aluno vê a nota de quem está propondo, antes de aceitar.
          const ids = Array.from(new Set(l.map((c) => c.contratante_id)));
          const notas: Record<string, { media: number | null; total: number }> = {};
          await Promise.all(ids.map(async (cid) => {
            const av = await avaliacoesDe(cid);
            notas[cid] = { media: media(av), total: av.length };
          }));
          if (ativo) setNotasContratante(notas);
        }
      })
      .catch((e) => ativo && (setErro((e as Error).message), setLista([])));
    if (contratante) convitesEnviados(id).then((l) => ativo && setConvites(l), () => undefined);
    return () => {
      ativo = false;
    };
  }, [id, contratante, versao]);

  if (!conta) return null;
  if (lista === null) return <p className="suave">Carregando…</p>;

  return (
    <div className="combinados">
      {erro && (
        <p className="erro" role="alert">
          {erro} <button type="button" className="link-texto" onClick={recarregar}>Tentar de novo</button>
        </p>
      )}
      {!lista.length && !erro && (
        <div className="cartao combinado-vazio">
          {contratante ? (
            <p>
              Para propor um combinado, abra o portfólio de um aluno em <Link href="/talentos">Talentos</Link> e clique em
              <strong> Propor um combinado</strong>.
            </p>
          ) : (
            <p>Quando um contratante te mandar uma proposta, ela aparece aqui para você aceitar ou recusar.</p>
          )}
        </div>
      )}
      <AcompanharSeguranca userId={conta.id} versao={versao} />
      {lista.map((c) => (
        <CartaoCombinado
          key={c.id}
          c={c}
          userId={conta.id}
          souContratante={contratante}
          jaAvaliei={avaliados.includes(c.id)}
          recebida={recebidas.find((a) => a.combinado_id === c.id)}
          nota={notasContratante[c.contratante_id]}
          onMudou={recarregar}
        />
      ))}

      {contratante && convites.length > 0 && (
        <section className="cartao convites-enviados" aria-labelledby="enviados-titulo">
          <h2 id="enviados-titulo">Convites que você enviou</h2>
          <ul>
            {convites.map((v) => (
              <li key={v.id}>
                <Link href={`/perfil/?u=${v.perfil?.slug ?? ""}`}>{v.perfil?.nome ?? "Aluno"}</Link>
                <span className="suave"> · {v.vaga?.titulo ?? "vaga"} · </span>
                <span className={`selo-status selo-${v.status}`}>
                  {v.status === "enviado" ? "Esperando resposta" : v.status === "aceito" ? "Tem interesse" : "Não pôde agora"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CartaoCombinado({ c, userId, souContratante, jaAvaliei, recebida, nota, onMudou }: {
  c: Combinado;
  userId: string;
  souContratante: boolean;
  jaAvaliei: boolean;
  recebida?: AvaliacaoReal;
  nota?: { media: number | null; total: number };
  onMudou: () => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const aluno = c.perfil?.nome ?? "Aluno";

  const agir = async (acao: AcaoCombinado) => {
    setOcupado(true);
    setErro("");
    try {
      await mudarCombinado(c.id, acao);
      onMudou();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <article className="cartao combinado" aria-labelledby={`comb-${c.id}`}>
      <div className="combinado-topo">
        <span className={`selo-status selo-${c.status}`}>{NOME_STATUS[c.status]}</span>
        <span className="suave">Proposto em {formatarData(c.criado_em.slice(0, 10))}</span>
      </div>
      <h2 id={`comb-${c.id}`}>{c.titulo}</h2>
      <p className="suave combinado-partes">
        {c.contratante_nome} contrata{" "}
        {c.perfil?.slug ? <Link href={`/perfil/?u=${c.perfil.slug}`}>{aluno}</Link> : aluno}
        {!souContratante && nota && nota.media !== null && (
          <> · nota do contratante: <strong>{nota.media.toLocaleString("pt-BR")}</strong> ({nota.total} avaliações)</>
        )}
      </p>
      <dl className="combinado-ficha">
        <div><dt>O que está incluso</dt><dd>{c.escopo}</dd></div>
        <div><dt>Valor</dt><dd>{c.valor}</dd></div>
        <div><dt>Sinal</dt><dd>{c.sinal || "Sem sinal"}</dd></div>
        <div><dt>Entrega</dt><dd>{c.prazo ? formatarData(c.prazo) : "A combinar"}</dd></div>
        {c.pagamento && <div><dt>Pagamento</dt><dd>{c.pagamento}</dd></div>}
        {c.ajustes && <div><dt>Ajustes</dt><dd>{c.ajustes}</dd></div>}
      </dl>

      <div className="combinado-acoes so-tela">
        {c.status === "proposto" && !souContratante && (
          <>
            <button type="button" className="botao botao-primario" disabled={ocupado} onClick={() => agir("aceitar")}>Aceitar o combinado</button>
            <button type="button" className="link-texto" disabled={ocupado} onClick={() => agir("recusar")}>Recusar</button>
          </>
        )}
        {c.status === "proposto" && souContratante && (
          <button type="button" className="link-texto" disabled={ocupado} onClick={() => agir("cancelar")}>Cancelar proposta</button>
        )}
        {c.status === "aceito" && souContratante && (
          <button type="button" className="botao botao-primario" disabled={ocupado} onClick={() => agir("concluir")}>Trabalho entregue: concluir</button>
        )}
        {c.status === "aceito" && !souContratante && (
          <span className="ajuda">Quando o trabalho for entregue, o contratante marca como concluído e vocês se avaliam.</span>
        )}
        {c.status === "pausado" && !souContratante && (
          <>
            <span className="ajuda">Você pausou este combinado. Sem multa e sem nota baixa: retome só se for seguro.</span>
            <button type="button" className="botao botao-contorno botao-pequeno" disabled={ocupado} onClick={() => agir("retomar")}>Retomar o combinado</button>
          </>
        )}
        {c.status === "pausado" && souContratante && (
          <span className="ajuda">O aluno pausou este combinado. A equipe do Fólium pode entrar em contato.</span>
        )}
        {(c.status === "aceito" || c.status === "concluido") && (
          <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => window.print()}>Guardar em PDF</button>
        )}
      </div>
      {erro && <p className="erro" role="alert">{erro}</p>}

      {["aceito", "pausado", "concluido", "cancelado"].includes(c.status) && !(c.status === "cancelado" && !c.aceito_em) && (
        <div className="combinado-seguranca so-tela">
          {!souContratante && (c.status === "aceito" || c.status === "pausado") && (
            <BotaoAjuda combinadoId={c.id} userId={userId} pausado={c.status === "pausado"} onEnviado={onMudou} />
          )}
          <DenunciarCombinado combinadoId={c.id} userId={userId} souContratante={souContratante} nomeOutro={souContratante ? aluno : c.contratante_nome} onEnviado={onMudou} />
        </div>
      )}

      {c.status === "concluido" && !jaAvaliei && (
        <FormAvaliacao
          combinadoId={c.id}
          alvoId={souContratante ? c.perfil_id : c.contratante_id}
          nomeAlvo={souContratante ? aluno : c.contratante_nome}
          avaliaAluno={souContratante}
          onFeito={onMudou}
        />
      )}
      {c.status === "concluido" && jaAvaliei && (
        <p className="salvo so-tela" style={{ margin: 0 }}>
          Você já avaliou este trabalho. Obrigado!{!recebida && " Sua nota aparece quando a outra parte avaliar também, ou em 14 dias."}
        </p>
      )}
      {recebida && <AvaliacaoRecebida a={recebida} onRespondeu={onMudou} />}
    </article>
  );
}

function FormAvaliacao({ combinadoId, alvoId, nomeAlvo, avaliaAluno, onFeito }: { combinadoId: string; alvoId: string; nomeAlvo: string; avaliaAluno: boolean; onFeito: () => void }) {
  const criterios = avaliaAluno ? CRITERIOS_ALUNO : CRITERIOS_CONTRATANTE;
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const completo = criterios.every((c) => notas[c.chave]);
  return (
    <form
      className="form form-compacto so-tela"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!completo) return;
        setEnviando(true);
        setErro("");
        try {
          await avaliar(combinadoId, alvoId, notas, texto);
          onFeito();
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setEnviando(false);
        }
      }}
    >
      <p style={{ margin: 0, fontWeight: "var(--peso-medio)" }}>Como foi trabalhar com {nomeAlvo}?</p>
      <p className="ajuda" style={{ margin: 0 }}>Sua nota fica escondida até {nomeAlvo} avaliar também (ou por 14 dias). Assim ninguém avalia por vingança.</p>
      {criterios.map((cr) => (
        <fieldset key={cr.chave} className="avaliar-estrelas avaliar-criterio">
          <legend>{cr.rotulo}</legend>
          <div className="estrelas-escolha">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className={n <= (notas[cr.chave] ?? 0) ? "estrela-op ativa" : "estrela-op"}>
                <input type="radio" name={`nota-${combinadoId}-${cr.chave}`} value={n} checked={notas[cr.chave] === n} onChange={() => setNotas((o) => ({ ...o, [cr.chave]: n }))} className="visualmente-oculto" />
                <span aria-hidden="true">★</span>
                <span className="visualmente-oculto">{n} de 5</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="campo">
        Comentário (aparece no perfil)
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} rows={3} placeholder="Ex.: Entregou no prazo e explicou cada escolha." />
      </label>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <button type="submit" className="botao botao-primario" disabled={enviando || !completo}>{enviando ? "Enviando…" : "Enviar avaliação"}</button>
    </form>
  );
}

/** A avaliação que a outra parte me deu, com direito de resposta (uma vez). */
function AvaliacaoRecebida({ a, onRespondeu }: { a: AvaliacaoReal; onRespondeu: () => void }) {
  const [texto, setTexto] = useState("");
  const [abrir, setAbrir] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  return (
    <div className="avaliacao-recebida so-tela">
      <p style={{ margin: 0 }}>
        <strong>Nota que você recebeu:</strong>{" "}
        <span className="estrelas" role="img" aria-label={`${a.nota} de 5 estrelas`}>{"★".repeat(a.nota)}<span className="estrela-vazia">{"★".repeat(5 - a.nota)}</span></span>
      </p>
      {a.criterios && Object.keys(a.criterios).length > 0 && (
        <p className="ajuda" style={{ margin: 0 }}>{Object.entries(a.criterios).map(([k, v]) => `${ROTULO_CRITERIO[k] ?? k}: ${v}`).join(" · ")}</p>
      )}
      {a.texto && <blockquote className="defesa-resumo">{a.texto}</blockquote>}
      {a.resposta ? (
        <p className="ajuda" style={{ margin: 0 }}>Sua resposta: {a.resposta}</p>
      ) : abrir ? (
        <form
          className="form"
          style={{ gap: 8 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setEnviando(true);
            setErro("");
            try {
              await responderAvaliacao(a.id, texto);
              onRespondeu();
            } catch (err) {
              setErro((err as Error).message);
            } finally {
              setEnviando(false);
            }
          }}
        >
          <label className="campo">
            Sua resposta (aparece abaixo da avaliação, só uma vez)
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} rows={3} required minLength={3} />
          </label>
          {erro && <p className="erro" role="alert">{erro}</p>}
          <button type="submit" className="botao botao-contorno botao-pequeno" disabled={enviando || texto.trim().length < 3}>{enviando ? "Enviando…" : "Publicar resposta"}</button>
        </form>
      ) : (
        <button type="button" className="link-texto" onClick={() => setAbrir(true)}>Responder a esta avaliação</button>
      )}
    </div>
  );
}
