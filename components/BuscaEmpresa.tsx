"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buscarEmpresas, type Empresa } from "@/lib/repositorio";

/** Campo de empresa com sugestões enquanto digita, como no LinkedIn. Aceita empresa nova. */
export function BuscaEmpresa({
  valor,
  onMudar,
  rotulo,
}: {
  valor: string;
  onMudar: (nome: string) => void;
  rotulo: string;
}) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [sugestoes, setSugestoes] = useState<Empresa[]>([]);
  const [ativo, setAtivo] = useState(-1);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    let cancelado = false;
    const t = setTimeout(() => {
      buscarEmpresas(valor).then((s) => {
        if (!cancelado) {
          setSugestoes(s);
          setAtivo(-1);
        }
      });
    }, 200);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [valor, aberto]);

  useEffect(() => {
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  const escolher = (nome: string) => {
    onMudar(nome);
    setAberto(false);
  };

  const exato = sugestoes.some((s) => s.nome.toLowerCase() === valor.trim().toLowerCase());
  const mostrar = aberto && valor.trim().length >= 2;

  return (
    <div className="busca-empresa" ref={caixa}>
      <input
        className="entrada"
        value={valor}
        onChange={(e) => {
          onMudar(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => {
          if (!mostrar) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAtivo((a) => Math.min(a + 1, sugestoes.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setAtivo((a) => Math.max(a - 1, -1));
          } else if (e.key === "Enter" && ativo >= 0) {
            e.preventDefault();
            escolher(sugestoes[ativo]!.nome);
          } else if (e.key === "Escape") {
            setAberto(false);
          }
        }}
        placeholder="Empresa ou projeto (comece a digitar)"
        maxLength={80}
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        aria-label={rotulo}
        autoComplete="off"
      />
      {mostrar && (
        <ul className="busca-empresa-lista" id={`${id}-lista`} role="listbox">
          {sugestoes.map((s, i) => (
            <li
              key={s.nome}
              role="option"
              aria-selected={i === ativo}
              className={i === ativo ? "ativo" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(s.nome);
              }}
            >
              <span className="busca-empresa-logo" aria-hidden="true">{s.nome.charAt(0).toUpperCase()}</span>
              <span>
                <strong>{s.nome}</strong>
                {s.cidade && <small>{s.cidade}</small>}
              </span>
            </li>
          ))}
          {!exato && (
            <li
              role="option"
              aria-selected={false}
              className="busca-empresa-nova"
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(valor.trim());
              }}
            >
              <span className="busca-empresa-logo" aria-hidden="true">+</span>
              <span>Usar “{valor.trim()}”</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
