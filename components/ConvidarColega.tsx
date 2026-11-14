"use client";

import { useState } from "react";

/**
 * "Chame um colega": compartilha o link do primeiro acesso do Fólium.
 * No celular abre a folha de compartilhar do aparelho (WhatsApp, Instagram…); no computador copia o link.
 */
export function ConvidarColega() {
  const [copiado, setCopiado] = useState(false);

  const convidar = async () => {
    const url = `${window.location.origin}/entrar/?modo=primeiro`;
    const texto = "Tô montando meu portfólio no Fólium, a vitrine dos alunos da UNISAGRADO para quem quer contratar freela. Cria o seu também:";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Fólium", text: texto, url });
        return;
      }
      await navigator.clipboard.writeText(`${texto} ${url}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* cancelou o compartilhamento */
    }
  };

  return (
    <div className="cartao convidar-colega">
      <strong>Chame um colega</strong>
      <p className="suave">Quanto mais alunos no Fólium, mais empresas procuram aqui. Mande o convite para a sua turma.</p>
      <button type="button" className="botao botao-contorno botao-pequeno" onClick={convidar}>
        {copiado ? "Convite copiado" : "Convidar colegas"}
      </button>
      <span className="visualmente-oculto" role="status" aria-live="polite">{copiado ? "Convite copiado. Cole no WhatsApp da turma." : ""}</span>
    </div>
  );
}
