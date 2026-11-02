"use client";

import { useState } from "react";
import { definirContaDemo, useConta } from "@/lib/conta";

/**
 * Só no modo demonstração (sem banco): troca entre visitante, colaborador e contratante,
 * grátis ou Premium, para ver como cada tela fica para cada tipo de usuário.
 */
export function VisaoDemo() {
  const { conta, demo, premium } = useConta();
  const [aberta, setAberta] = useState(false);
  if (!demo) return null;

  const atual = conta ? `${conta.tipo === "contratante" ? "Contratante" : "Colaborador"} ${premium ? "Premium" : "Grátis"}` : "Visitante";

  return (
    <div className="visao-demo" role="region" aria-label="Ver o site como outro tipo de usuário">
      <button type="button" className="visao-demo-botao" aria-expanded={aberta} onClick={() => setAberta((a) => !a)}>
        Ver como: <strong>{atual}</strong>
      </button>
      {aberta && (
        <div className="visao-demo-painel">
          <p className="ajuda" style={{ margin: 0 }}>Modo demonstração. Troque para ver as telas de cada tipo de conta.</p>
          <div className="opcoes">
            {[
              { rotulo: "Visitante", valor: null },
              { rotulo: "Colaborador", valor: "colaborador" as const },
              { rotulo: "Contratante", valor: "contratante" as const },
            ].map((o) => (
              <label key={o.rotulo} className="opcao">
                <input
                  type="radio"
                  name="visao-tipo"
                  checked={(conta?.tipo ?? null) === o.valor}
                  onChange={() => definirContaDemo(o.valor ? { tipo: o.valor } : null)}
                />
                {o.rotulo}
              </label>
            ))}
          </div>
          {conta && (
            <div className="opcoes">
              {(["gratis", "premium"] as const).map((p) => (
                <label key={p} className="opcao">
                  <input type="radio" name="visao-plano" checked={(premium ? "premium" : "gratis") === p} onChange={() => definirContaDemo({ plano: p })} />
                  {p === "premium" ? "Premium" : "Grátis"}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
