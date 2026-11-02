"use client";

import { useEffect, useState } from "react";
import { CURSOS, SERVICOS, type Aluno } from "@/lib/data";
import { CartaoAluno } from "@/components/CartaoAluno";

const CHAVE = "folium-rascunho-perfil";
const CORES = ["#4F7A3A", "#B0673B", "#6B4A34", "#2F3E2A", "#C98A4B", "#7C8B5A"];

type Rascunho = {
  nome: string;
  curso: string;
  semestre: number;
  cidade: string;
  bio: string;
  servicos: string[];
  habilidades: string;
  valorReferencia: string;
  whatsapp: string;
  disponivel: boolean;
  trabalhos: { titulo: string; tipo: string; descricao: string }[];
};

const VAZIO: Rascunho = {
  nome: "",
  curso: CURSOS[0],
  semestre: 1,
  cidade: "Bauru, SP",
  bio: "",
  servicos: [],
  habilidades: "",
  valorReferencia: "",
  whatsapp: "",
  disponivel: true,
  trabalhos: [{ titulo: "", tipo: SERVICOS[0], descricao: "" }],
};

function paraAluno(r: Rascunho): Aluno {
  return {
    slug: "previa",
    nome: r.nome || "Seu nome",
    curso: r.curso,
    semestre: r.semestre,
    cidade: r.cidade,
    bio: r.bio,
    servicos: r.servicos.length ? r.servicos : ["Escolha seus serviços"],
    habilidades: r.habilidades.split(",").map((h) => h.trim()).filter(Boolean),
    valorReferencia: r.valorReferencia,
    disponivel: r.disponivel,
    whatsapp: r.whatsapp,
    email: "",
    trabalhos: r.trabalhos.map((t, i) => ({ ...t, cor: CORES[i % CORES.length]! })),
  };
}

export default function MeuPerfil() {
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CHAVE);
      if (guardado) setR({ ...VAZIO, ...JSON.parse(guardado) });
    } catch {
      /* sem acesso ao armazenamento: começa vazio */
    }
  }, []);

  const mudar = <K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) => {
    setR((atual) => ({ ...atual, [campo]: valor }));
    setSalvo(false);
  };

  const alternarServico = (s: string) =>
    mudar("servicos", r.servicos.includes(s) ? r.servicos.filter((x) => x !== s) : [...r.servicos, s]);

  const mudarTrabalho = (i: number, campo: keyof Rascunho["trabalhos"][number], valor: string) =>
    mudar("trabalhos", r.trabalhos.map((t, j) => (j === i ? { ...t, [campo]: valor } : t)));

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(CHAVE, JSON.stringify(r));
    } catch {
      /* ignora */
    }
    setSalvo(true);
  };

  return (
    <div className="container editor">
      <form className="cartao editor-form form" onSubmit={salvar}>
        <div>
          <h1 style={{ fontSize: "1.9rem", marginBottom: 4 }}>Meu portfólio</h1>
          <p className="suave" style={{ margin: 0 }}>Preencha e veja ao lado como os contratantes vão ver seu cartão.</p>
        </div>

        <label className="campo">
          Nome
          <input value={r.nome} onChange={(e) => mudar("nome", e.target.value)} placeholder="Como quer aparecer" required />
        </label>

        <div className="linha-dupla">
          <label className="campo">
            Curso
            <select value={r.curso} onChange={(e) => mudar("curso", e.target.value)}>
              {CURSOS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="campo">
            Semestre
            <input type="number" min={1} max={12} value={r.semestre} onChange={(e) => mudar("semestre", Number(e.target.value) || 1)} />
          </label>
        </div>

        <label className="campo">
          Sobre você
          <textarea value={r.bio} onChange={(e) => mudar("bio", e.target.value)} maxLength={280} placeholder="Em duas frases: o que você faz e para quem." />
          <span className="ajuda">{r.bio.length}/280</span>
        </label>

        <fieldset className="campo" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: 6 }}>Serviços que você oferece</legend>
          <div className="opcoes">
            {SERVICOS.map((s) => (
              <label key={s} className="opcao">
                <input type="checkbox" checked={r.servicos.includes(s)} onChange={() => alternarServico(s)} />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="campo">
          Habilidades e ferramentas
          <input value={r.habilidades} onChange={(e) => mudar("habilidades", e.target.value)} placeholder="Figma, Lightroom, Redação…" />
          <span className="ajuda">Separe por vírgula.</span>
        </label>

        <div className="linha-dupla">
          <label className="campo">
            Valor de referência
            <input value={r.valorReferencia} onChange={(e) => mudar("valorReferencia", e.target.value)} placeholder="A partir de R$ 150" />
          </label>
          <label className="campo">
            WhatsApp
            <input type="tel" inputMode="tel" value={r.whatsapp} onChange={(e) => mudar("whatsapp", e.target.value)} placeholder="(14) 99999-0000" />
          </label>
        </div>

        <label className="filtro-check">
          <input type="checkbox" checked={r.disponivel} onChange={(e) => mudar("disponivel", e.target.checked)} />
          Estou disponível para freelas
        </label>

        <fieldset className="campo" style={{ border: 0, padding: 0, margin: 0, gap: 12 }}>
          <legend style={{ marginBottom: 6 }}>Trabalhos</legend>
          {r.trabalhos.map((t, i) => (
            <div key={i} className="cartao" style={{ padding: 14, boxShadow: "none", display: "grid", gap: 10 }}>
              <div className="linha-dupla">
                <input className="entrada" value={t.titulo} onChange={(e) => mudarTrabalho(i, "titulo", e.target.value)} placeholder="Título do trabalho" aria-label={`Título do trabalho ${i + 1}`} />
                <select className="entrada" value={t.tipo} onChange={(e) => mudarTrabalho(i, "tipo", e.target.value)} aria-label={`Tipo do trabalho ${i + 1}`}>
                  {SERVICOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <input className="entrada" value={t.descricao} onChange={(e) => mudarTrabalho(i, "descricao", e.target.value)} placeholder="Uma linha sobre o trabalho" aria-label={`Descrição do trabalho ${i + 1}`} />
              <span className="ajuda">Upload de imagens entra junto com o banco de dados.</span>
              {r.trabalhos.length > 1 && (
                <button type="button" className="botao botao-contorno" style={{ justifySelf: "start", minHeight: 36, padding: "4px 14px" }} onClick={() => mudar("trabalhos", r.trabalhos.filter((_, j) => j !== i))}>
                  Remover
                </button>
              )}
            </div>
          ))}
          {r.trabalhos.length < 6 && (
            <button type="button" className="botao botao-contorno" style={{ justifySelf: "start" }} onClick={() => mudar("trabalhos", [...r.trabalhos, { titulo: "", tipo: SERVICOS[0], descricao: "" }])}>
              + Adicionar trabalho
            </button>
          )}
        </fieldset>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button className="botao botao-primario" type="submit">Salvar rascunho</button>
          {salvo && <span className="salvo">Rascunho salvo neste aparelho</span>}
        </div>
      </form>

      <div className="editor-previa">
        <p className="suave" style={{ fontWeight: 600, marginBottom: 8 }}>Prévia do seu cartão</p>
        <div style={{ maxWidth: 360, pointerEvents: "none" }}>
          <CartaoAluno aluno={paraAluno(r)} />
        </div>
      </div>
    </div>
  );
}
