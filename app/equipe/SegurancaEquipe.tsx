"use client";

import { useState } from "react";
import { formatarData } from "@/lib/formato";
import { mudarCombinado, type ContaEquipe } from "@/lib/negocios";
import {
  NOME_DECISAO,
  NOME_STATUS_OCORRENCIA,
  atrasada,
  dataHora,
  equipeAbrirProva,
  equipeAndarOcorrencia,
  equipeTirarSuspensao,
  type Decisao,
  type HistoricoOcorrencia,
  type Ocorrencia,
} from "@/lib/seguranca";

type Props = {
  ocorrencias: Ocorrencia[] | null;
  historico: HistoricoOcorrencia[];
  contas: ContaEquipe[];
  fazer: (acao: () => Promise<void>, ok: string) => void;
};

/**
 * Aba "Segurança" do painel da equipe: pedidos de ajuda (24h) e denúncias de combinado (5 dias úteis).
 * Fluxo: Recebida → Em análise → (pedir a versão da outra parte) → Decisão. Tudo vai para o histórico.
 */
export function SegurancaEquipe({ ocorrencias, historico, contas, fazer }: Props) {
  if (ocorrencias === null)
    return <p className="suave">A segurança ainda não foi ativada: rode o SQL 20261112180000_seguranca_pessoas.sql no Supabase.</p>;

  const nome = (id: string | null) => {
    if (!id) return "conta excluída";
    const c = contas.find((x) => x.id === id);
    return c ? c.empresa || c.nome || c.email : "conta";
  };
  const abertas = ocorrencias.filter((o) => o.status !== "resolvida" && o.status !== "arquivada");
  // Pedidos de ajuda primeiro, depois as de prazo mais curto.
  abertas.sort((a, b) => Number(b.urgente) - Number(a.urgente) || (a.prazo_em ?? "").localeCompare(b.prazo_em ?? ""));
  const fechadas = ocorrencias.filter((o) => o.status === "resolvida" || o.status === "arquivada");
  const suspensas = contas.filter((c) => c.suspensa_ate && c.suspensa_ate > new Date().toISOString());

  return (
    <section className="equipe-lista" aria-label="Segurança">
      <p className="suave" style={{ margin: 0 }}>
        Pedidos de ajuda: responder em até 24 horas. Denúncias: até 5 dias úteis. A outra parte nunca vê o relato nem os prints;
        ao pedir a versão dela, escreva só um resumo do problema, sem dizer quem denunciou nem detalhes que identifiquem.
      </p>
      {!ocorrencias.length && <p className="suave">Nenhum pedido de ajuda nem denúncia de combinado.</p>}
      {abertas.map((o) => <CartaoOcorrencia key={o.id} o={o} historico={historico.filter((h) => h.ocorrencia_id === o.id)} nome={nome} fazer={fazer} />)}
      {fechadas.length > 0 && (
        <details className="equipe-fechadas">
          <summary>Resolvidas e arquivadas ({fechadas.length})</summary>
          <div className="equipe-lista" style={{ marginTop: 12 }}>
            {fechadas.map((o) => <CartaoOcorrencia key={o.id} o={o} historico={historico.filter((h) => h.ocorrencia_id === o.id)} nome={nome} fazer={fazer} />)}
          </div>
        </details>
      )}
      {suspensas.length > 0 && (
        <article className="cartao equipe-item">
          <h2>Contas suspensas ou banidas</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1em", display: "grid", gap: 6 }}>
            {suspensas.map((c) => (
              <li key={c.id}>
                {c.empresa || c.nome || c.email} ·{" "}
                {c.suspensa_ate!.startsWith("infinity") ? "banida" : `até ${formatarData(c.suspensa_ate!.slice(0, 10))}`}{" "}
                <button type="button" className="link-texto" onClick={() => { if (window.confirm(`Tirar a suspensão de ${c.empresa || c.nome || c.email}?`)) fazer(() => equipeTirarSuspensao(c.id), "Suspensão retirada."); }}>
                  Tirar suspensão
                </button>
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

function CartaoOcorrencia({ o, historico, nome, fazer }: { o: Ocorrencia; historico: HistoricoOcorrencia[]; nome: (id: string | null) => string; fazer: Props["fazer"] }) {
  const [resumo, setResumo] = useState("");
  const [decisao, setDecisao] = useState<Decisao | "">("");
  const [motivo, setMotivo] = useState("");
  const [modo, setModo] = useState<"" | "defesa" | "decidir">("");
  const fechada = o.status === "resolvida" || o.status === "arquivada";
  const vencida = atrasada(o);
  const lado = o.autor_lado === "aluno" ? "Aluno" : "Contratante";

  return (
    <article className={`cartao equipe-item ${o.urgente && !fechada ? "ocorrencia-urgente" : ""} ${fechada ? "resolvida" : ""}`}>
      <div className="combinado-topo">
        <span className={`selo-status ${o.urgente ? "selo-recusado" : fechada ? "selo-aceito" : "selo-proposto"}`}>
          {o.urgente ? "Pedido de ajuda" : "Denúncia"} · {NOME_STATUS_OCORRENCIA[o.status]}
        </span>
        <span className={vencida ? "erro" : "suave"}>
          {fechada ? `decidida em ${dataHora(o.decidida_em)}` : `${vencida ? "Prazo vencido: " : "Responder até "}${dataHora(o.prazo_em)}`}
        </span>
      </div>
      <h2>{o.categoria}</h2>
      <p className="suave">
        {lado} <strong>{nome(o.autor_id)}</strong> sobre <strong>{nome(o.alvo_id)}</strong>
        {o.combinado ? ` · combinado “${o.combinado.titulo}” (${o.combinado.status})` : ""} · {dataHora(o.criada_em)}
      </p>
      {(o.pausou_combinado || o.avisar_faculdade) && (
        <p className="aviso" style={{ margin: 0 }}>
          {[o.pausou_combinado && "O aluno pausou o combinado.", o.avisar_faculdade && "O aluno pediu para avisar a faculdade."].filter(Boolean).join(" ")}
        </p>
      )}
      {o.relato ? <p className="equipe-texto">{o.relato}</p> : <p className="suave">Sem relato escrito.</p>}
      {o.provas.length > 0 && (
        <p className="equipe-provas">
          {o.provas.map((p, i) => (
            <button key={p} type="button" className="link-texto" onClick={async () => {
              try {
                window.location.assign(await equipeAbrirProva(p));
              } catch (e) {
                window.alert((e as Error).message);
              }
            }}>
              Anexo {i + 1}
            </button>
          ))}
        </p>
      )}
      {o.resumo_defesa && <p className="ajuda">Resumo enviado à outra parte: {o.resumo_defesa}</p>}
      {o.defesa && <p className="equipe-texto"><strong>Versão de {nome(o.alvo_id)}:</strong> {o.defesa}</p>}
      {o.status === "aguardando_defesa" && !o.defesa && <p className="ajuda">Esperando a versão de {nome(o.alvo_id)}.</p>}
      {fechada && o.decisao && <p className="ajuda"><strong>Decisão:</strong> {NOME_DECISAO[o.decisao]}{o.decisao_texto ? `. ${o.decisao_texto}` : ""}</p>}

      {!fechada && (
        <div className="combinado-acoes">
          {o.status === "aberta" && (
            <button type="button" className="botao botao-primario botao-pequeno" onClick={() => fazer(() => equipeAndarOcorrencia(o.id, "analisar"), "Ocorrência em análise.")}>Começar análise</button>
          )}
          {o.tipo === "denuncia" && o.alvo_id && o.status !== "aguardando_defesa" && (
            <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => setModo(modo === "defesa" ? "" : "defesa")}>Pedir a versão da outra parte</button>
          )}
          <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => setModo(modo === "decidir" ? "" : "decidir")}>Decidir</button>
          {o.combinado_id && (o.combinado?.status === "aceito" || o.combinado?.status === "pausado") && (
            <button type="button" className="botao botao-perigo botao-pequeno" onClick={() => { if (window.confirm("Encerrar este combinado? As duas partes deixam de ter um trabalho em andamento.")) fazer(() => mudarCombinado(o.combinado_id!, "encerrar"), "Combinado encerrado."); }}>
              Encerrar o combinado
            </button>
          )}
        </div>
      )}

      {modo === "defesa" && (
        <form className="form form-compacto" onSubmit={(e) => { e.preventDefault(); fazer(() => equipeAndarOcorrencia(o.id, "pedir_defesa", null, resumo), "Pedido de defesa enviado."); setModo(""); }}>
          <label className="campo">
            Resumo que {nome(o.alvo_id)} vai ler
            <textarea value={resumo} onChange={(e) => setResumo(e.target.value)} rows={3} minLength={10} maxLength={1500} required placeholder="Ex.: Recebemos um relato de atraso no pagamento combinado para 05/11. Conte o que aconteceu." />
          </label>
          <button type="submit" className="botao botao-primario botao-pequeno" disabled={resumo.trim().length < 10}>Enviar pedido de defesa</button>
        </form>
      )}

      {modo === "decidir" && (
        <form
          className="form form-compacto"
          onSubmit={(e) => {
            e.preventDefault();
            if (!decisao) return;
            const pesada = decisao === "suspensao" || decisao === "banimento";
            if (pesada && !window.confirm(`${NOME_DECISAO[decisao]}? A conta fica sem poder fechar combinados${decisao === "banimento" ? " para sempre e o portfólio sai da busca" : " por 30 dias"}.`)) return;
            fazer(() => equipeAndarOcorrencia(o.id, "decidir", decisao, motivo), "Decisão registrada.");
            setModo("");
          }}
        >
          <fieldset className="avaliar-estrelas" style={{ gap: 4 }}>
            <legend>Decisão</legend>
            {(Object.keys(NOME_DECISAO) as Decisao[]).filter((d) => o.tipo === "denuncia" || d !== "ma_fe").map((d) => (
              <label key={d} className="caixa-marcar">
                <input type="radio" name={`decisao-${o.id}`} checked={decisao === d} onChange={() => setDecisao(d)} />
                <span>{NOME_DECISAO[d]}</span>
              </label>
            ))}
          </fieldset>
          <label className="campo">
            Motivo (quem registrou vê esta resposta)
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} maxLength={1500} placeholder="O que a equipe concluiu e o que foi feito." />
          </label>
          <button type="submit" className="botao botao-primario botao-pequeno" disabled={!decisao}>Registrar decisão</button>
        </form>
      )}

      {historico.length > 0 && (
        <details>
          <summary className="ajuda">Histórico ({historico.length})</summary>
          <ol className="equipe-historico">
            {historico.map((h) => (
              <li key={h.id}>{dataHora(h.em)} · {nome(h.quem)}: {h.acao}{h.texto ? ` (${h.texto})` : ""}</li>
            ))}
          </ol>
        </details>
      )}
    </article>
  );
}
