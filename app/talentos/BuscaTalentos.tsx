"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ALUNOS_VITRINE, CURSOS, type Aluno } from "@/lib/data";
import { GRUPOS_SERVICOS_FILTRO } from "@/components/OpcoesServicos";
import { Seletor } from "@/components/Seletor";
import { CartaoAluno } from "@/components/CartaoAluno";
import { EsqueletoPolaroide } from "@/components/Esqueleto";
import { listarAlunosReais } from "@/lib/repositorio";
import { bancoLigado } from "@/lib/supabase";

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function BuscaTalentos() {
  const params = useSearchParams();
  const idExtra = useId();
  const [texto, setTexto] = useState(params.get("q") ?? "");
  const [curso, setCurso] = useState("");
  const [servico, setServico] = useState(params.get("servico") ?? "");
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  const [reais, setReais] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(bancoLigado);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  useEffect(() => {
    let ativo = true;
    setFalhou(false);
    if (tentativa) setCarregando(true);
    listarAlunosReais(true)
      .then((r) => ativo && setReais(r))
      .catch(() => ativo && setFalhou(true))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const todos = useMemo(() => [...reais, ...ALUNOS_VITRINE], [reais]);

  const cursos = useMemo(() => [...new Set([...CURSOS, ...todos.map((a) => a.curso)])].sort((a, b) => a.localeCompare(b, "pt-BR")), [todos]);

  const resultado = useMemo(() => {
    const termos = normalizar(texto).split(/\s+/).filter(Boolean);
    return todos.filter((a) => {
      if (curso && a.curso !== curso) return false;
      if (servico && !a.servicos.includes(servico)) return false;
      if (soDisponiveis && !a.disponivel) return false;
      if (termos.length === 0) return true;
      const alvo = normalizar(
        [a.nome, a.titulo ?? "", a.curso, a.bio, ...a.servicos, ...a.habilidades, ...a.trabalhos.map((t) => t.titulo)].join(" ")
      );
      return termos.every((t) => alvo.includes(t));
    });
  }, [todos, texto, curso, servico, soDisponiveis]);

  const ativos = [curso, servico, soDisponiveis ? "Só disponíveis" : ""].filter(Boolean);
  const temFiltro = ativos.length > 0 || texto.trim() !== "";

  const limpar = () => {
    setTexto("");
    setCurso("");
    setServico("");
    setSoDisponiveis(false);
  };

  const total = resultado.length;

  return (
    <div className="arquivo">
      <section className="mesa" aria-labelledby={`${idExtra}-titulo`}>
        <div className="mesa-topo">
          <h2 className="mesa-titulo" id={`${idExtra}-titulo`}>Mesa de pesquisa</h2>
          {temFiltro && (
            <button type="button" className="mesa-limpar" onClick={limpar}>
              Limpar
            </button>
          )}
        </div>
        <form className="mesa-form" role="search" onSubmit={(e) => e.preventDefault()}>
          <label className="campo">
            Buscar
            <input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nome, habilidade, tipo de trabalho…"
            />
          </label>
          <button
            type="button"
            className="mesa-alternar"
            aria-expanded={filtrosAbertos}
            aria-controls={`${idExtra}-extra`}
            onClick={() => setFiltrosAbertos((x) => !x)}
          >
            <span>Filtros{ativos.length > 0 ? ` (${ativos.length})` : ""}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="mesa-extra" id={`${idExtra}-extra`} data-aberta={filtrosAbertos}>
            <div className="mesa-extra-interno">
              <div className="campo">
                Curso
                <Seletor
                  aria-label="Curso"
                  valor={curso}
                  onMudar={setCurso}
                  placeholder="Todos"
                  grupos={[{ opcoes: [{ valor: "", rotulo: "Todos" }, ...cursos] }]}
                />
              </div>
              <div className="campo">
                Serviço
                <Seletor aria-label="Serviço" valor={servico} onMudar={setServico} placeholder="Todos" grupos={GRUPOS_SERVICOS_FILTRO} />
              </div>
              <label className="filtro-check">
                <input type="checkbox" checked={soDisponiveis} onChange={(e) => setSoDisponiveis(e.target.checked)} />
                Só quem está disponível
              </label>
            </div>
          </div>
        </form>
      </section>

      <div className="arquivo-resultados">
        <p className="contagem" aria-live="polite">
          <strong>{total}</strong> {total === 1 ? "talento" : "talentos"}
          {ativos.length > 0 && <span className="contagem-filtros"> · {ativos.join(" · ")}</span>}
          {carregando && <span className="contagem-filtros"> · carregando perfis…</span>}
        </p>

        {falhou && !carregando && reais.length === 0 ? (
          <div className="cartao vazio" role="alert">
            <h3>Não deu para carregar os talentos</h3>
            <p className="suave">Deve ter sido a internet. Confira a conexão e tente de novo.</p>
            <button className="botao botao-contorno" onClick={() => setTentativa((t) => t + 1)}>Tentar de novo</button>
          </div>
        ) : total > 0 || carregando ? (
          <div className="grade-alunos">
            {carregando && [0, 1, 2].map((i) => <EsqueletoPolaroide key={`esq-${i}`} />)}
            {resultado.map((a) => (
              <CartaoAluno key={(a.real ? "r-" : "e-") + a.slug} aluno={a} />
            ))}
          </div>
        ) : (
          <div className="cartao vazio">
            <h3>Nenhum talento com esses filtros</h3>
            <p className="suave">Tente outra palavra ou tire algum filtro.</p>
            <button className="botao botao-contorno" onClick={limpar}>Limpar filtros</button>
          </div>
        )}
      </div>
    </div>
  );
}
