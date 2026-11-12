"use client";

import { useEffect, useState } from "react";
import { formatarData } from "@/lib/formato";
import {
  NOME_STATUS_OCORRENCIA,
  dataHora,
  enviarDefesa,
  meusPedidosDeDefesa,
  minhasOcorrencias,
  type Ocorrencia,
  type PedidoDefesa,
} from "@/lib/seguranca";

/**
 * Topo da página de combinados:
 *  - pedidos de defesa (a equipe quer a sua versão sobre uma denúncia);
 *  - o andamento do que você registrou (pedidos de ajuda e denúncias).
 */
export function AcompanharSeguranca({ userId, versao }: { userId: string; versao: number }) {
  const [pedidos, setPedidos] = useState<PedidoDefesa[]>([]);
  const [minhas, setMinhas] = useState<Ocorrencia[]>([]);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let ativo = true;
    meusPedidosDeDefesa().then((l) => ativo && setPedidos(l), () => undefined);
    minhasOcorrencias(userId).then((l) => ativo && setMinhas(l), () => undefined);
    return () => {
      ativo = false;
    };
  }, [userId, versao, recarga]);

  const abertos = pedidos.filter((p) => p.status === "aguardando_defesa");
  if (!abertos.length && !minhas.length) return null;

  return (
    <>
      {abertos.map((p) => <PedidoDeDefesa key={p.id} p={p} onEnviado={() => setRecarga((n) => n + 1)} />)}
      {minhas.length > 0 && (
        <section className="cartao convites-enviados" aria-labelledby="minhas-oc-t">
          <h2 id="minhas-oc-t">Seus pedidos de ajuda e denúncias</h2>
          <ul>
            {minhas.map((o) => (
              <li key={o.id}>
                <strong>{o.tipo === "ajuda" ? "Pedido de ajuda" : "Denúncia"}</strong>: {o.categoria}
                <span className="suave"> · {formatarData(o.criada_em.slice(0, 10))} · </span>
                <span className={`selo-status ${o.status === "resolvida" || o.status === "arquivada" ? "selo-aceito" : "selo-proposto"}`}>{NOME_STATUS_OCORRENCIA[o.status]}</span>
                {o.decisao_texto && <p className="ajuda" style={{ margin: "4px 0 0" }}>Resposta da equipe: {o.decisao_texto}</p>}
                {!o.decisao_texto && o.prazo_em && o.status !== "resolvida" && o.status !== "arquivada" && (
                  <span className="ajuda"> · resposta até {dataHora(o.prazo_em)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function PedidoDeDefesa({ p, onEnviado }: { p: PedidoDefesa; onEnviado: () => void }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  return (
    <section className="cartao defesa" aria-labelledby={`defesa-${p.id}`}>
      <h2 id={`defesa-${p.id}`}>A equipe quer ouvir a sua versão</h2>
      <p className="suave" style={{ margin: 0 }}>
        Recebemos uma denúncia sobre o combinado <strong>{p.titulo_combinado}</strong> ({p.categoria}). Ninguém é punido sem poder
        contar o próprio lado.
      </p>
      <blockquote className="defesa-resumo">{p.resumo_defesa}</blockquote>
      <form
        className="form"
        style={{ gap: 10 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setEnviando(true);
          setErro("");
          try {
            await enviarDefesa(p.id, texto);
            onEnviado();
          } catch (err) {
            setErro((err as Error).message);
          } finally {
            setEnviando(false);
          }
        }}
      >
        <label className="campo">
          Sua versão
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} minLength={10} maxLength={3000} rows={5} required placeholder="Conte o que aconteceu do seu ponto de vista, com datas." />
        </label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button type="submit" className="botao botao-primario" disabled={enviando || texto.trim().length < 10}>{enviando ? "Enviando…" : "Enviar minha versão"}</button>
      </form>
    </section>
  );
}
