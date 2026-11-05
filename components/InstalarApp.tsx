"use client";

import { useEffect, useState } from "react";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/**
 * Botão "Instalar o app". No Android e no Chrome/Edge do computador abre o pedido de instalação
 * do navegador; no iPhone/iPad (Safari não tem esse pedido) mostra o passo a passo numa janela,
 * dentro do site. Some quando o Fólium já está aberto como app.
 */
export function InstalarApp({ className = "link-texto" }: { className?: string }) {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [ios, setIos] = useState(false);
  const [instalado, setInstalado] = useState(true);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalado(standalone);
    const ua = navigator.userAgent;
    setIos(/iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1));
    const aoPedir = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    const aoInstalar = () => {
      setInstalado(true);
      setEvento(null);
    };
    window.addEventListener("beforeinstallprompt", aoPedir);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPedir);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  if (instalado || (!evento && !ios)) return null;

  const instalar = async () => {
    if (evento) {
      await evento.prompt();
      const { outcome } = await evento.userChoice;
      if (outcome === "accepted") setInstalado(true);
      setEvento(null);
      return;
    }
    setAberto(true);
  };

  return (
    <>
      <button type="button" className={className} onClick={instalar}>
        Instalar o app
      </button>
      {aberto && (
        <div className="janela-fundo" role="presentation" onClick={() => setAberto(false)}>
          <div className="janela cartao" role="dialog" aria-modal="true" aria-labelledby="instalar-titulo" onClick={(e) => e.stopPropagation()}>
            <h2 id="instalar-titulo" style={{ fontSize: "1.4rem", marginTop: 0 }}>Instalar o Fólium no iPhone</h2>
            <ol className="passos-instalar">
              <li>Abra o Fólium no <strong>Safari</strong>.</li>
              <li>Toque em <strong>Compartilhar</strong> (o quadrado com a seta para cima).</li>
              <li>Escolha <strong>Adicionar à Tela de Início</strong> e toque em <strong>Adicionar</strong>.</li>
            </ol>
            <p className="suave" style={{ fontSize: "0.92rem" }}>O ícone da folha aparece junto com seus outros apps.</p>
            <button type="button" className="botao botao-primario" style={{ width: "100%" }} onClick={() => setAberto(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
