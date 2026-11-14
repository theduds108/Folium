"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Coautor } from "@/lib/data";
import { buscarColegas, type Colega } from "@/lib/repositorio";

export const MAX_COAUTORES = 6;

/**
 * Marca os colegas de um trabalho em collab. Quem está no Fólium aparece nas sugestões e vira
 * link para o portfólio dele; quem não está entra só com o nome.
 */
export function CampoCoautores({
  valor,
  onMudar,
  rotulo,
  meuId,
}: {
  valor: Coautor[];
  onMudar: (lista: Coautor[]) => void;
  rotulo: string;
  meuId?: string;
}) {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [sugestoes, setSugestoes] = useState<Colega[]>([]);
  const [ativo, setAtivo] = useState(-1);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto || texto.trim().length < 2) {
      setSugestoes([]);
      return;
    }
    let cancelado = false;
    const t = setTimeout(() => {
      buscarColegas(texto, meuId).then((s) => {
        if (cancelado) return;
        setSugestoes(s.filter((c) => !valor.some((v) => v.slug === c.slug)));
        setAtivo(-1);
      });
    }, 200);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [texto, aberto, meuId, valor]);

  useEffect(() => {
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  const cheio = valor.length >= MAX_COAUTORES;
  const adicionar = (c: Coautor) => {
    const nome = c.nome.trim().slice(0, 80);
    if (!nome || cheio) return;
    if (valor.some((v) => (c.slug ? v.slug === c.slug : !v.slug && v.nome.toLowerCase() === nome.toLowerCase()))) return;
    onMudar([...valor, { ...c, nome }]);
    setTexto("");
    setAberto(false);
  };

  const mostrar = aberto && texto.trim().length >= 2;

  return (
    <div className="coautores">
      {valor.length > 0 && (
        <ul className="coautores-lista" aria-label="Colegas marcados">
          {valor.map((c, i) => (
            <li key={`${c.slug ?? c.nome}-${i}`} className="coautor">
              <span>{c.nome}</span>
              {c.slug && <small>no Fólium</small>}
              <button type="button" aria-label={`Tirar ${c.nome}`} onClick={() => onMudar(valor.filter((_, j) => j !== i))}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {!cheio && (
        <div className="busca-empresa" ref={caixa}>
          <input
            className="entrada"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setAberto(true);
            }}
            onFocus={() => setAberto(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && mostrar) {
                e.preventDefault();
                setAtivo((a) => Math.min(a + 1, sugestoes.length - 1));
              } else if (e.key === "ArrowUp" && mostrar) {
                e.preventDefault();
                setAtivo((a) => Math.max(a - 1, -1));
              } else if (e.key === "Enter") {
                // Enter aqui marca o colega; nunca envia o formulário inteiro.
                e.preventDefault();
                const s = sugestoes[ativo];
                adicionar(s ? { nome: s.nome, slug: s.slug } : { nome: texto });
              } else if (e.key === "Escape") {
                setAberto(false);
              }
            }}
            placeholder="Nome do colega (comece a digitar)"
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
                  key={s.slug}
                  role="option"
                  aria-selected={i === ativo}
                  className={i === ativo ? "ativo" : ""}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    adicionar({ nome: s.nome, slug: s.slug });
                  }}
                >
                  <span className="busca-empresa-logo" aria-hidden="true">{s.nome.charAt(0).toUpperCase()}</span>
                  <span>
                    <strong>{s.nome}</strong>
                    <small>{s.curso} · portfólio no Fólium</small>
                  </span>
                </li>
              ))}
              <li
                role="option"
                aria-selected={false}
                className="busca-empresa-nova"
                onMouseDown={(e) => {
                  e.preventDefault();
                  adicionar({ nome: texto });
                }}
              >
                <span className="busca-empresa-logo" aria-hidden="true">+</span>
                <span>Adicionar “{texto.trim()}” (sem portfólio aqui)</span>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
