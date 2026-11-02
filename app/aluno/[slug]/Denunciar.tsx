"use client";

import { useState } from "react";

const MOTIVOS = ["Trabalho que não é do aluno", "Golpe ou cobrança indevida", "Conteúdo ofensivo", "Outro motivo"];

/** Denúncia de perfil. Na demonstração só confirma; com o banco, vai para a fila de moderação. */
export function Denunciar() {
  const [aberto, setAberto] = useState(false);
  const [enviado, setEnviado] = useState(false);

  if (enviado) return <p className="salvo" style={{ margin: 0 }}>Denúncia recebida. A equipe vai analisar.</p>;

  if (!aberto)
    return (
      <button type="button" className="link-denuncia" onClick={() => setAberto(true)}>
        Denunciar este perfil
      </button>
    );

  return (
    <form
      className="form"
      style={{ gap: 10 }}
      onSubmit={(e) => {
        e.preventDefault();
        setEnviado(true);
      }}
    >
      <label className="campo">
        Motivo
        <select required defaultValue="">
          <option value="" disabled>Escolha</option>
          {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <button className="botao botao-contorno" type="submit">Enviar denúncia</button>
    </form>
  );
}
