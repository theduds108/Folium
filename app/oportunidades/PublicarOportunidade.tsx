"use client";

import { useState } from "react";
import { SERVICOS } from "@/lib/data";
import { bancoLigado } from "@/lib/supabase";
import { enviarOportunidade } from "@/lib/repositorio";

const TIPOS = ["Freela", "Projeto", "Estágio"] as const;

/** Formulário para empresas publicarem uma vaga. Ela entra como "pendente" até a equipe aprovar. */
export function PublicarOportunidade() {
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [erro, setErro] = useState("");

  if (enviada)
    return (
      <div className="cartao" id="publicar">
        <h2 style={{ fontSize: "1.5rem" }}>Vaga enviada</h2>
        <p className="suave" style={{ marginBottom: 12 }}>
          A equipe do Fólium confere cada empresa antes de a vaga ir ao ar. Você recebe retorno no contato informado.
        </p>
        <button className="botao botao-contorno" onClick={() => setEnviada(false)}>Enviar outra vaga</button>
      </div>
    );

  return (
    <form
      id="publicar"
      className="cartao form"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const v = (k: string) => String(f.get(k) ?? "").trim();
        setErro("");
        if (!bancoLigado) {
          setEnviada(true);
          return;
        }
        setEnviando(true);
        try {
          await enviarOportunidade({
            titulo: v("titulo"),
            empresa: v("empresa"),
            contato: v("contato"),
            tipo: v("tipo") as (typeof TIPOS)[number],
            servico: v("servico"),
            cidade: v("cidade") || "Bauru, SP",
            orcamento: v("orcamento"),
            prazo: v("prazo"),
            descricao: v("descricao"),
          });
          setEnviada(true);
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setEnviando(false);
        }
      }}
    >
      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: 4 }}>Publicar oportunidade</h2>
        <p className="suave" style={{ margin: 0 }}>Não precisa de conta. A primeira vaga é grátis.</p>
      </div>
      <label className="campo">
        O que você precisa
        <input name="titulo" required minLength={3} maxLength={100} placeholder="Ex.: Logo para minha padaria" />
      </label>
      <div className="linha-dupla">
        <label className="campo">
          Empresa ou nome
          <input name="empresa" required minLength={2} maxLength={80} />
        </label>
        <label className="campo">
          Contato (WhatsApp ou e-mail)
          <input name="contato" required minLength={5} maxLength={120} />
        </label>
      </div>
      <div className="linha-dupla">
        <label className="campo">
          Tipo
          <select name="tipo" defaultValue="Freela">
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="campo">
          Serviço
          <select name="servico" defaultValue={SERVICOS[0]}>
            {SERVICOS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="linha-dupla">
        <label className="campo">
          Orçamento
          <input name="orcamento" maxLength={60} placeholder="Ex.: R$ 400" />
        </label>
        <label className="campo">
          Prazo
          <input name="prazo" maxLength={60} placeholder="Ex.: 2 semanas" />
        </label>
      </div>
      <label className="campo">
        Cidade
        <input name="cidade" maxLength={60} defaultValue="Bauru, SP" />
      </label>
      <label className="campo">
        Descrição
        <textarea name="descricao" required maxLength={600} rows={4} placeholder="Conte o que precisa, para quando e qualquer detalhe importante." />
      </label>
      {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
      <button className="botao botao-verde" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar para análise"}
      </button>
    </form>
  );
}
