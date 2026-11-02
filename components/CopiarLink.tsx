"use client";

import { useState } from "react";

export function CopiarLink() {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* usuário cancelou o compartilhamento */
    }
  };

  return (
    <button type="button" className="botao botao-contorno" style={{ width: "100%", borderColor: "var(--linha)" }} onClick={copiar}>
      {copiado ? "Link copiado" : "Compartilhar portfólio"}
    </button>
  );
}
