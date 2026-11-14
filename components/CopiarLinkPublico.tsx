"use client";

import { useState } from "react";

/** Copia (ou compartilha) o link público do portfólio, para mandar a clientes que não têm conta. */
export function CopiarLinkPublico({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/perfil/?u=${slug}`;
  return (
    <div className="link-publico-linha">
      <code className="link-publico-url">{url.replace(/^https?:\/\//, "")}</code>
      <button
        type="button"
        className="botao botao-contorno botao-pequeno"
        onClick={async () => {
          try {
            if (navigator.share) {
              await navigator.share({ title: "Meu portfólio no Fólium", url });
              return;
            }
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          } catch {
            /* cancelou */
          }
        }}
      >
        {copiado ? "Link copiado" : "Copiar link"}
      </button>
      <span className="visualmente-oculto" role="status" aria-live="polite">{copiado ? "Link público copiado." : ""}</span>
    </div>
  );
}
