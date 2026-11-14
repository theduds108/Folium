"use client";

import { useId, useRef, useState } from "react";

/**
 * Abas do portfólio, como no perfil do Instagram: "Obras" (do próprio aluno) e "Collabs"
 * (trabalhos de colegas em que ele aceitou o collab). Na impressão/PDF as duas aparecem.
 */
export function AbasObras({
  obras,
  collabs,
  nObras,
  nCollabs,
}: {
  obras: React.ReactNode;
  collabs: React.ReactNode;
  nObras: number;
  nCollabs: number;
}) {
  const id = useId();
  const [aba, setAba] = useState<"obras" | "collabs">(nObras ? "obras" : "collabs");
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const abas = [
    { chave: "obras" as const, rotulo: "Obras", n: nObras },
    { chave: "collabs" as const, rotulo: "Collabs", n: nCollabs },
  ];

  return (
    <section className="perfil-secao abas-obras" aria-label="Trabalhos">
      <div className="abas-obras-lista" role="tablist" aria-label="Trabalhos do portfólio">
        {abas.map((a, i) => (
          <button
            key={a.chave}
            ref={(el) => {
              botoes.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-${a.chave}-aba`}
            aria-selected={aba === a.chave}
            aria-controls={`${id}-${a.chave}`}
            tabIndex={aba === a.chave ? 0 : -1}
            className={aba === a.chave ? "atual" : ""}
            onClick={() => setAba(a.chave)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const j = (i + 1) % abas.length;
              setAba(abas[j]!.chave);
              botoes.current[j]?.focus();
            }}
          >
            {a.rotulo} <span className="abas-obras-n">{a.n}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-obras`} aria-labelledby={`${id}-obras-aba`} hidden={aba !== "obras"} className="abas-obras-painel">
        {nObras ? obras : <p className="suave">Ainda sem obras próprias publicadas.</p>}
      </div>
      <div role="tabpanel" id={`${id}-collabs`} aria-labelledby={`${id}-collabs-aba`} hidden={aba !== "collabs"} className="abas-obras-painel">
        <p className="anotacao-ficha abas-obras-dica">Trabalhos feitos com colegas. Cada um mostra o que esta pessoa fez.</p>
        {collabs}
      </div>
    </section>
  );
}
