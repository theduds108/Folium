"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useConta } from "@/lib/conta";
import { formatarData } from "@/lib/formato";
import {
  NOME_STATUS,
  avaliacoesDe,
  avaliar,
  convitesEnviados,
  media,
  meusCombinados,
  minhasAvaliacoesFeitas,
  mudarCombinado,
  type Combinado,
  type Convite,
} from "@/lib/negocios";

export function ListaCombinados() {
  const { conta } = useConta();
  const [lista, setLista] = useState<Combinado[] | null>(null);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [avaliados, setAvaliados] = useState<string[]>([]);
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
      {lista.map((c) => (
        <CartaoCombinado
          key={c.id}
          c={c}
          souContratante={contratante}
          jaAvaliei={avaliados.includes(c.id)}
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

function CartaoCombinado({ c, souContratante, jaAvaliei, nota, onMudou }: {
  c: Combinado;
  souContratante: boolean;
  jaAvaliei: boolean;
  nota?: { media: number | null; total: number };
  onMudou: () => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const aluno = c.perfil?.nome ?? "Aluno";

  const agir = async (acao: "aceitar" | "recusar" | "cancelar" | "concluir") => {
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
        {!souContratante && nota && nota.total > 0 && (
          <> · nota do contratante: <strong>{nota.media?.toLocaleString("pt-BR")}</strong> ({nota.total} {nota.total === 1 ? "avaliação" : "avaliações"})</>
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
        {(c.status === "aceito" || c.status === "concluido") && (
          <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => window.print()}>Guardar em PDF</button>
        )}
      </div>
      {erro && <p className="erro" role="alert">{erro}</p>}

      {c.status === "concluido" && !jaAvaliei && (
        <FormAvaliacao
          combinadoId={c.id}
          alvoId={souContratante ? c.perfil_id : c.contratante_id}
          nomeAlvo={souContratante ? aluno : c.contratante_nome}
          onFeito={onMudou}
        />
      )}
      {c.status === "concluido" && jaAvaliei && <p className="salvo so-tela" style={{ margin: 0 }}>Você já avaliou este trabalho. Obrigado!</p>}
    </article>
  );
}

function FormAvaliacao({ combinadoId, alvoId, nomeAlvo, onFeito }: { combinadoId: string; alvoId: string; nomeAlvo: string; onFeito: () => void }) {
  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  return (
    <form
      className="form form-compacto so-tela"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!nota) return;
        setEnviando(true);
        setErro("");
        try {
          await avaliar(combinadoId, alvoId, nota, texto);
          onFeito();
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setEnviando(false);
        }
      }}
    >
      <fieldset className="avaliar-estrelas">
        <legend>Como foi trabalhar com {nomeAlvo}?</legend>
        <div className="estrelas-escolha">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={n <= nota ? "estrela-op ativa" : "estrela-op"}>
              <input type="radio" name={`nota-${combinadoId}`} value={n} checked={nota === n} onChange={() => setNota(n)} className="visualmente-oculto" />
              <span aria-hidden="true">★</span>
              <span className="visualmente-oculto">{n} de 5</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="campo">
        Comentário (aparece no perfil)
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} rows={3} placeholder="Ex.: Entregou no prazo e explicou cada escolha." />
      </label>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <button type="submit" className="botao botao-primario" disabled={enviando || !nota}>{enviando ? "Enviando…" : "Enviar avaliação"}</button>
    </form>
  );
}
