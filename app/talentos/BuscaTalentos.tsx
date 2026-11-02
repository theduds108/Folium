"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ALUNOS, CURSOS, SERVICOS, type Aluno } from "@/lib/data";
import { CartaoAluno } from "@/components/CartaoAluno";
import { MOSTRAR_EXEMPLOS } from "@/lib/config";
import { listarAlunosReais } from "@/lib/repositorio";
import { bancoLigado } from "@/lib/supabase";

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function BuscaTalentos() {
  const params = useSearchParams();
  const [texto, setTexto] = useState(params.get("q") ?? "");
  const [curso, setCurso] = useState("");
  const [servico, setServico] = useState("");
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  const [reais, setReais] = useState<Aluno[]>([]);

  useEffect(() => {
    listarAlunosReais().then(setReais);
  }, []);

  const todos = useMemo(() => (MOSTRAR_EXEMPLOS || !bancoLigado ? [...reais, ...ALUNOS] : reais), [reais]);

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

  const limpar = () => {
    setTexto("");
    setCurso("");
    setServico("");
    setSoDisponiveis(false);
  };

  return (
    <>
      <div className="cartao filtros" role="search">
        <label className="campo">
          Buscar
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Nome, habilidade, tipo de trabalho…"
          />
        </label>
        <label className="campo">
          Curso
          <select value={curso} onChange={(e) => setCurso(e.target.value)}>
            <option value="">Todos</option>
            {CURSOS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="campo">
          Serviço
          <select value={servico} onChange={(e) => setServico(e.target.value)}>
            <option value="">Todos</option>
            {SERVICOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="filtro-check">
          <input type="checkbox" checked={soDisponiveis} onChange={(e) => setSoDisponiveis(e.target.checked)} />
          Só disponíveis
        </label>
      </div>

      <p className="suave" aria-live="polite">
        {resultado.length === 1 ? "1 talento encontrado" : `${resultado.length} talentos encontrados`}
      </p>

      {resultado.length > 0 ? (
        <div className="grade-alunos revelar-grupo">
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
    </>
  );
}
