"use client";

import { useState } from "react";
import { denunciar } from "@/lib/repositorio";
import { Seletor } from "@/components/Seletor";

const MOTIVOS = ["Trabalho que não é do aluno", "Golpe ou cobrança indevida", "Conteúdo ofensivo", "Outro motivo"];

/** Denúncia de perfil ou vaga. Com o banco ligado, vai para a tabela "denuncias" para a equipe analisar. */
export function Denunciar({ alvo, tipo = "perfil" }: { alvo: string; tipo?: "perfil" | "oportunidade" }) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [motivo, setMotivo] = useState("");

  if (enviado) return <p className="salvo" style={{ margin: 0 }}>Denúncia recebida. A equipe vai analisar.</p>;

  if (!aberto)
    return (
      <button type="button" className="link-denuncia" onClick={() => setAberto(true)}>
        {tipo === "perfil" ? "Denunciar este perfil" : "Denunciar esta vaga"}
      </button>
    );

  return (
    <form
      className="form"
      style={{ gap: 10 }}
      onSubmit={async (e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        setEnviando(true);
        setErro("");
        try {
          await denunciar(tipo, alvo, String(dados.get("motivo")), String(dados.get("detalhes") ?? ""));
          setEnviado(true);
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setEnviando(false);
        }
      }}
    >
      <div className="campo">
        Motivo
        <Seletor aria-label="Motivo da denúncia" name="motivo" required valor={motivo} onMudar={setMotivo} placeholder="Escolha" grupos={[{ opcoes: MOTIVOS }]} />
      </div>
      <label className="campo">
        Detalhes (opcional)
        <textarea name="detalhes" maxLength={600} rows={3} />
      </label>
      {erro && <span className="erro">{erro}</span>}
      <button className="botao botao-contorno" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar denúncia"}
      </button>
    </form>
  );
}
