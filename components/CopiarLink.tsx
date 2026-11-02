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
    <>
      <button type="button" className="botao botao-contorno" style={{ width: "100%", borderColor: "var(--linha)" }} onClick={copiar}>
        {copiado ? (
          <span className="confirmacao" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="m4 9.2 3.2 3.2L14 5.6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Link copiado
          </span>
        ) : (
          "Compartilhar portfólio"
        )}
      </button>
      <span className="visualmente-oculto" role="status" aria-live="polite">{copiado ? "Link do portfólio copiado." : ""}</span>
    </>
  );
}
