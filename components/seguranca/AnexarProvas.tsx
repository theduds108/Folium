"use client";

import { useId, useState } from "react";
import { enviarProva } from "@/lib/seguranca";

const MAXIMO = 6;

/** Prints ou PDFs que ajudam a entender o que aconteceu. Vão para uma pasta que só você e a equipe abrem. */
export function AnexarProvas({ userId, provas, onMudar }: { userId: string; provas: string[]; onMudar: (p: string[]) => void }) {
  const id = useId();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  return (
    <div className="campo anexar-provas">
      <span>Prints ou PDF (opcional, até {MAXIMO})</span>
      <label htmlFor={id} className={`botao botao-contorno botao-pequeno anexar-botao${enviando || provas.length >= MAXIMO ? " desligado" : ""}`}>
        {provas.length ? "Anexar mais" : "Escolher arquivos"}
      </label>
      <input
        id={id}
        className="visualmente-oculto"
        type="file"
        accept="image/*,application/pdf"
        multiple
        disabled={enviando || provas.length >= MAXIMO}
        onChange={async (e) => {
          const arquivos = Array.from(e.target.files ?? []).slice(0, MAXIMO - provas.length);
          e.target.value = "";
          if (!arquivos.length) return;
          setEnviando(true);
          setErro("");
          const novos: string[] = [];
          try {
            for (const a of arquivos) novos.push(await enviarProva(userId, a));
          } catch (err) {
            setErro((err as Error).message);
          } finally {
            onMudar([...provas, ...novos]);
            setEnviando(false);
          }
        }}
      />
      <span className="ajuda" aria-live="polite">
        {enviando ? "Enviando…" : provas.length ? `${provas.length} ${provas.length === 1 ? "arquivo anexado" : "arquivos anexados"}.` : "Só você e a equipe do Fólium veem."}
      </span>
      {provas.length > 0 && !enviando && (
        <button type="button" className="link-texto" onClick={() => onMudar([])}>Tirar os anexos</button>
      )}
      {erro && <span className="erro" role="alert">{erro}</span>}
    </div>
  );
}
