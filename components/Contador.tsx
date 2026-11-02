"use client";

import { useEffect, useState } from "react";

/** Campo numérico com botões − e +, que deixa apagar e digitar o número à vontade. */
export function Contador({
  valor,
  onMudar,
  min,
  max,
  sufixo,
  "aria-label": rotulo,
}: {
  valor: number;
  onMudar: (n: number) => void;
  min: number;
  max: number;
  sufixo?: string;
  "aria-label": string;
}) {
  const [texto, setTexto] = useState(String(valor));

  useEffect(() => {
    setTexto(String(valor));
  }, [valor]);

  const limitar = (n: number) => Math.min(max, Math.max(min, n));
  const confirmar = (t: string) => {
    const n = parseInt(t, 10);
    const final = Number.isNaN(n) ? valor : limitar(n);
    onMudar(final);
    setTexto(String(final));
  };

  return (
    <div className="contador">
      <button type="button" aria-label={`Diminuir ${rotulo}`} disabled={valor <= min} onClick={() => onMudar(limitar(valor - 1))}>−</button>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={texto}
        aria-label={rotulo}
        onChange={(e) => {
          const t = e.target.value.replace(/\D/g, "").slice(0, String(max).length);
          setTexto(t);
          const n = parseInt(t, 10);
          if (!Number.isNaN(n) && n >= min && n <= max) onMudar(n);
        }}
        onBlur={(e) => confirmar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            onMudar(limitar(valor + 1));
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onMudar(limitar(valor - 1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            confirmar((e.target as HTMLInputElement).value);
          }
        }}
      />
      {sufixo && <span className="contador-sufixo">{sufixo}</span>}
      <button type="button" aria-label={`Aumentar ${rotulo}`} disabled={valor >= max} onClick={() => onMudar(limitar(valor + 1))}>+</button>
    </div>
  );
}
