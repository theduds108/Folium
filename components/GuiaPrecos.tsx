"use client";

import { useRef } from "react";
import { PRECOS } from "@/lib/conteudo";

/**
 * "Não sabe quanto cobrar?" abre as faixas de referência numa janela dentro do próprio site,
 * por cima do editor. Quem está preenchendo não sai da página e não perde nada.
 */
export function GuiaPrecos() {
  const dialogo = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="link-ajuda" onClick={() => dialogo.current?.showModal()}>
        Não sabe quanto cobrar? Veja as faixas de referência.
      </button>
      <dialog ref={dialogo} className="enquadrar guia-precos" aria-labelledby="guia-precos-titulo">
        <h2 id="guia-precos-titulo">Quanto cobrar</h2>
        <p className="suave" style={{ margin: "0 0 12px" }}>
          Faixas de referência para quem está começando na região. São valores aproximados: ajuste pelo tamanho do
          trabalho, pelo prazo e pela sua experiência.
        </p>
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr><th>Serviço</th><th>Faixa de preço</th><th>Base</th></tr>
            </thead>
            <tbody>
              {PRECOS.map((p) => (
                <tr key={p.servico}>
                  <td><strong>{p.servico}</strong></td>
                  <td>{p.faixa}</td>
                  <td className="suave">{p.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ margin: "14px 0 0" }}>
          <strong>Uma conta simples:</strong> some as horas do trabalho, multiplique pelo valor da sua hora e acrescente
          20% para reuniões e ajustes.
        </p>
        <div className="enquadrar-acoes">
          <span style={{ flex: 1 }} />
          <button type="button" className="botao botao-primario" onClick={() => dialogo.current?.close()}>Fechar</button>
        </div>
      </dialog>
    </>
  );
}
