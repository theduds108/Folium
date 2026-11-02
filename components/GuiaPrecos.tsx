"use client";

import { useId, useMemo, useRef, useState } from "react";
import { OPORTUNIDADES } from "@/lib/conteudo";
import { NEGOCIACAO, NIVEIS, SERVICOS_PRECO, TAMANHOS, brl, redondo } from "@/lib/precos";

const ABAS = ["Calculadora", "Faixas e exemplos", "Como negociar"] as const;

/**
 * "Não sabe quanto cobrar?" abre o guia numa janela dentro do próprio site, por cima do editor:
 * quem está preenchendo não sai da página e não perde nada. A calculadora pode devolver o valor
 * sugerido direto para o campo "Valor de referência".
 */
/** Calculadora, faixas com exemplos e dicas: usado na janela do editor e na página do Guia. */
export function GuiaConteudo({ onUsar, onFechar }: { onUsar?: (texto: string) => void; onFechar?: () => void }) {
  const id = useId();
  const [aba, setAba] = useState<(typeof ABAS)[number]>("Calculadora");
  const [servicoId, setServicoId] = useState(SERVICOS_PRECO[0].id);
  const [nivel, setNivel] = useState<string>("meio");
  const [tamanho, setTamanho] = useState<string>("medio");
  const [urgente, setUrgente] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);

  const s = SERVICOS_PRECO.find((x) => x.id === servicoId)!;
  const fN = NIVEIS.find((n) => n.id === nivel)!.fator;
  const fT = TAMANHOS.find((t) => t.id === tamanho)!.fator;
  const fU = urgente ? 1.3 : 1;

  const calc = useMemo(() => {
    const meio = (s.min + s.max) / 2;
    const base = meio * fN * fT * fU;
    const de = redondo(Math.max(s.min * 0.8, base * 0.85));
    const ate = redondo(Math.min(s.max * 1.4, base * 1.15));
    const sugerido = redondo(base);
    const horas = ((s.horas[0] + s.horas[1]) / 2) * fT;
    return { de, ate, sugerido, hora: sugerido / horas, horas };
  }, [s, fN, fT, fU]);

  const vagas = (servico: string) => OPORTUNIDADES.filter((o) => o.servico === servico);

  const fechar = () => onFechar?.();

  return (
    <>
<div className="guia-abas" role="tablist" aria-label="Seções do guia">
        {ABAS.map((a) => (
          <button key={a} type="button" role="tab" aria-selected={aba === a} className={aba === a ? "atual" : ""} onClick={() => setAba(a)}>
            {a}
          </button>
        ))}
      </div>

      {aba === "Calculadora" && (
        <div role="tabpanel" className="guia-calc">
          <label className="campo">
            O que você vai fazer?
            <select value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
              {SERVICOS_PRECO.map((x) => <option key={x.id} value={x.id}>{x.servico}</option>)}
            </select>
          </label>
          <fieldset className="campo">
            <legend>Sua experiência</legend>
            <div className="opcoes">
              {NIVEIS.map((n) => (
                <label key={n.id} className="opcao">
                  <input type="radio" name={`${id}-n`} checked={nivel === n.id} onChange={() => setNivel(n.id)} />
                  {n.rotulo}
                </label>
              ))}
            </div>
            <span className="ajuda">{NIVEIS.find((n) => n.id === nivel)!.detalhe}</span>
          </fieldset>
          <fieldset className="campo">
            <legend>Tamanho do trabalho</legend>
            <div className="opcoes">
              {TAMANHOS.map((t) => (
                <label key={t.id} className="opcao">
                  <input type="radio" name={`${id}-t`} checked={tamanho === t.id} onChange={() => setTamanho(t.id)} />
                  {t.rotulo}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="opcao">
            <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
            Prazo curto (menos de uma semana)
          </label>

          <div className="guia-resultado" aria-live="polite">
            <span className="rotulos"><span>Sugestão ({s.base})</span></span>
            <p className="guia-valor">{brl(calc.sugerido)}</p>
            <p className="suave" style={{ margin: 0 }}>
              Faixa razoável: {brl(calc.de)} a {brl(calc.ate)}. Isso dá cerca de <strong>{brl(calc.hora)} por hora</strong>,
              considerando uns {Math.round(calc.horas)} h de trabalho.
            </p>
            <p style={{ margin: "10px 0 0" }}>
              <strong>Já está incluso:</strong> {s.inclui.join(", ")}.
            </p>
            <p style={{ margin: "6px 0 0" }}>
              <strong>Cobre mais se tiver:</strong> {s.sobe.join(", ")}.
            </p>
          </div>
        </div>
      )}

      {aba === "Faixas e exemplos" && (
        <div role="tabpanel" className="guia-lista">
          {SERVICOS_PRECO.map((x) => {
            const exemplos = vagas(x.vaga);
            const ab = aberto === x.id;
            return (
              <section key={x.id} className="guia-item">
                <button type="button" className="guia-item-topo" aria-expanded={ab} onClick={() => setAberto(ab ? null : x.id)}>
                  <span><strong>{x.servico}</strong><span className="suave"> · {x.base}</span></span>
                  <span className="guia-faixa">{brl(x.min)} a {brl(x.max)}</span>
                </button>
                {ab && (
                  <div className="guia-item-corpo">
                    <p><strong>Normalmente inclui:</strong> {x.inclui.join(", ")}.</p>
                    <p><strong>Cobre mais se:</strong> {x.sobe.join(", ")}.</p>
                    {exemplos.length > 0 ? (
                      <>
                        <p className="rotulos"><span>Exemplos de vagas do mural do Fólium</span></p>
                        <ul className="guia-exemplos">
                          {exemplos.map((o) => (
                            <li key={o.id}>
                              <strong>{o.titulo}</strong>
                              <span className="suave"> · {o.empresa}, {o.cidade}</span>
                              <br />
                              {o.orcamento} · prazo {o.prazo}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="suave">Ainda não há vagas deste serviço no mural.</p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {aba === "Como negociar" && (
        <div role="tabpanel" className="guia-lista">
          {NEGOCIACAO.map((n) => (
            <div key={n.titulo} className="guia-item guia-item-corpo">
              <p style={{ margin: 0 }}><strong>{n.titulo}.</strong> {n.texto}</p>
            </div>
          ))}
          <p className="suave" style={{ marginBottom: 0 }}>
            A conta de bolso: horas do trabalho × valor da sua hora + 20% para reuniões e ajustes.
          </p>
        </div>
      )}


      {onFechar && (
        <div className="enquadrar-acoes">
          {onUsar && aba === "Calculadora" && (
            <button
              type="button"
              className="botao botao-primario"
              onClick={() => {
                onUsar(`${s.servico.replace(/ \(.*\)/, "")}: a partir de ${brl(calc.sugerido)} (${s.base})`);
                fechar();
              }}
            >
              Usar {brl(calc.sugerido)} no meu perfil
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" className={onUsar && aba === "Calculadora" ? "botao botao-contorno" : "botao botao-primario"} onClick={fechar}>Fechar</button>
        </div>
      )}
    </>
  );
}

export function GuiaPrecos({ onUsar }: { onUsar?: (texto: string) => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <>
      <button type="button" className="link-ajuda" onClick={() => dialogo.current?.showModal()}>
        Não sabe quanto cobrar? Calcule aqui.
      </button>
      <dialog ref={dialogo} className="enquadrar guia-precos" aria-labelledby={`${id}-t`}>
        <h2 id={`${id}-t`}>Quanto cobrar</h2>
        <p className="suave" style={{ margin: "0 0 12px" }}>
          Valores de referência para quem está começando na região de Bauru. São estimativas do Fólium, não uma tabela oficial.
        </p>
        <GuiaConteudo onUsar={onUsar} onFechar={() => dialogo.current?.close()} />
      </dialog>
    </>
  );
}
