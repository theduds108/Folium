"use client";

import { useState } from "react";
import { OPORTUNIDADES } from "@/lib/conteudo";
import { SERVICOS } from "@/lib/data";

const TIPOS = ["Freela", "Projeto", "Estágio"] as const;

export function MuralOportunidades() {
  const [tipo, setTipo] = useState("");
  const [servico, setServico] = useState("");
  const [interesse, setInteresse] = useState<string[]>([]);

  const lista = OPORTUNIDADES.filter((o) => (!tipo || o.tipo === tipo) && (!servico || o.servico === servico));

  return (
    <>
      <div className="cartao filtros filtros-dois">
        <label className="campo">
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="campo">
          Serviço
          <select value={servico} onChange={(e) => setServico(e.target.value)}>
            <option value="">Todos</option>
            {SERVICOS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <p className="suave" aria-live="polite">
        {lista.length === 1 ? "1 oportunidade" : `${lista.length} oportunidades`}
      </p>

      <div className="grade-vagas revelar-grupo">
        {lista.map((o) => {
          const marcada = interesse.includes(o.id);
          return (
            <article key={o.id} className="cartao vaga">
              <div className="vaga-topo">
                <span className={o.tipo === "Estágio" ? "etiqueta etiqueta-terra" : "etiqueta"}>{o.tipo}</span>
                <span className="suave vaga-data">{o.publicadaHa}</span>
              </div>
              <h3>{o.titulo}</h3>
              <p className="suave vaga-empresa">{o.empresa} · {o.cidade}</p>
              <p>{o.descricao}</p>
              <dl className="vaga-dados">
                <div><dt>Orçamento</dt><dd>{o.orcamento}</dd></div>
                <div><dt>Prazo</dt><dd>{o.prazo}</dd></div>
              </dl>
              <button
                type="button"
                className={marcada ? "botao botao-contorno" : "botao botao-primario"}
                onClick={() => setInteresse((x) => (marcada ? x.filter((i) => i !== o.id) : [...x, o.id]))}
              >
                {marcada ? "Interesse enviado ✓" : "Tenho interesse"}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
