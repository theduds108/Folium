"use client";

/** Abre a janela de impressão do navegador, onde dá para "Salvar como PDF". O visual de impressão está em globals.css (@media print). */
export function BotaoPdf({ rotulo = "Baixar em PDF" }: { rotulo?: string }) {
  return (
    <button type="button" className="botao botao-contorno botao-pdf" onClick={() => window.print()}>
      {rotulo}
    </button>
  );
}
