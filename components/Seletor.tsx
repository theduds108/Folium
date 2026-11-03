"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type OpcaoSeletor = string | { valor: string; rotulo: string };
export type GrupoSeletor = { titulo?: string; opcoes: readonly OpcaoSeletor[] };

const val = (o: OpcaoSeletor) => (typeof o === "string" ? o : o.valor);
const rot = (o: OpcaoSeletor) => (typeof o === "string" ? o : o.rotulo);
const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Props = {
  valor: string;
  onMudar: (valor: string) => void;
  grupos: readonly GrupoSeletor[];
  /** Texto quando nada está escolhido. */
  placeholder?: string;
  /** Mostra a caixa de busca (por padrão, quando há mais de 8 opções). */
  busca?: boolean;
  /** Nome para envio em <form> (cria um campo escondido). */
  name?: string;
  required?: boolean;
  "aria-label": string;
};

/** Lista de escolha no estilo do Fólium, no lugar do <select> do navegador. */
export function Seletor({ valor, onMudar, grupos, placeholder = "Escolha", busca, name, required, ...resto }: Props) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [ativo, setAtivo] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const campoBusca = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const total = grupos.reduce((n, g) => n + g.opcoes.length, 0);
  const comBusca = busca ?? total > 8;

  const filtrados = useMemo(() => {
    const q = normalizar(texto.trim());
    if (!q) return grupos;
    return grupos
      .map((g) => ({ ...g, opcoes: g.opcoes.filter((o) => normalizar(rot(o)).includes(q)) }))
      .filter((g) => g.opcoes.length > 0);
  }, [grupos, texto]);

  const planas = useMemo(() => filtrados.flatMap((g) => g.opcoes.map(val)), [filtrados]);

  const atual = useMemo(() => {
    for (const g of grupos) for (const o of g.opcoes) if (val(o) === valor) return rot(o);
    return "";
  }, [grupos, valor]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    setAtivo(Math.max(0, planas.indexOf(valor)));
    if (comBusca) campoBusca.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  useEffect(() => {
    lista.current?.querySelector('[data-ativo="true"]')?.scrollIntoView({ block: "nearest" });
  }, [ativo, aberto]);

  const fechar = (devolverFoco = true) => {
    setAberto(false);
    setTexto("");
    if (devolverFoco) botao.current?.focus();
  };

  const escolher = (v: string) => {
    onMudar(v);
    fechar();
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!aberto) return setAberto(true);
      setAtivo((a) => Math.min(a + 1, planas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!aberto) return setAberto(true);
      setAtivo((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home" && aberto) {
      e.preventDefault();
      setAtivo(0);
    } else if (e.key === "End" && aberto) {
      e.preventDefault();
      setAtivo(planas.length - 1);
    } else if (e.key === "Enter" && aberto) {
      e.preventDefault();
      if (planas[ativo] !== undefined) escolher(planas[ativo]!);
    } else if (e.key === "Escape" && aberto) {
      e.preventDefault();
      fechar();
    } else if (e.key === "Tab" && aberto) {
      fechar(false);
    }
  };

  let indice = -1;

  return (
    <div className="seletor" ref={caixa} onKeyDown={teclas}>
      {name && <input type="hidden" name={name} value={valor} />}
      <button
        ref={botao}
        type="button"
        className={`seletor-botao${aberto ? " aberto" : ""}${atual ? "" : " vazio"}`}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-label={`${resto["aria-label"]}: ${atual || placeholder}`}
        onClick={() => setAberto((a) => !a)}
      >
        <span>{atual || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {required && (
        <input className="seletor-requerido" tabIndex={-1} aria-hidden="true" value={valor} required onChange={() => {}} />
      )}
      {aberto && (
        <div className="seletor-painel">
          {comBusca && (
            <div className="seletor-busca">
              <input
                ref={campoBusca}
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setAtivo(0);
                }}
                placeholder="Buscar…"
                aria-label="Buscar na lista"
                autoComplete="off"
              />
            </div>
          )}
          <ul className="seletor-lista" id={`${id}-lista`} role="listbox" ref={lista} tabIndex={-1}>
            {filtrados.length === 0 && <li className="seletor-vazio">Nada encontrado</li>}
            {filtrados.map((g, gi) => (
              <li key={g.titulo ?? gi} role="presentation">
                {g.titulo && <span className="seletor-grupo" role="presentation">{g.titulo}</span>}
                <ul role="group" aria-label={g.titulo}>
                  {g.opcoes.map((o) => {
                    indice += 1;
                    const v = val(o);
                    const i = indice;
                    return (
                      <li
                        key={v}
                        role="option"
                        aria-selected={v === valor}
                        data-ativo={i === ativo}
                        className={`seletor-opcao${v === valor ? " escolhida" : ""}${i === ativo ? " ativa" : ""}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => escolher(v)}
                        onMouseMove={() => setAtivo(i)}
                      >
                        <span>{rot(o)}</span>
                        {v === valor && (
                          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
