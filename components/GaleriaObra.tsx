"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { unsplash } from "@/lib/data";
import { ImgSegura } from "@/lib/arquivos";

/**
 * Galeria de uma obra: capa + imagens extras num carrossel.
 * Cada imagem ocupa a largura inteira do quadro, sem corte (object-fit: contain).
 * Navegação: deslizar (scroll-snap), setas, pontos de posição e teclado.
 * Tocar na imagem abre a visualização ampliada dentro do próprio site.
 */
export function GaleriaObra({
  imagens,
  titulo,
  tipo,
  cor,
  destaque = false,
}: {
  imagens: string[];
  titulo: string;
  tipo: string;
  cor?: string;
  destaque?: boolean;
}) {
  const largura = destaque ? 1400 : 900;
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [ampliada, setAmpliada] = useState<number | null>(null);
  const total = imagens.length;

  const irPara = useCallback((i: number, suave = true) => {
    const el = trilho.current;
    if (!el) return;
    const alvo = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: alvo * el.clientWidth, behavior: suave ? "smooth" : "auto" });
  }, [total]);

  // Posição atual a partir da rolagem (vale para deslizar com o dedo também).
  useEffect(() => {
    const el = trilho.current;
    if (!el || total < 2) return;
    const aoRolar = () => setAtual(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", aoRolar, { passive: true });
    return () => el.removeEventListener("scroll", aoRolar);
  }, [total]);

  if (total === 0) {
    return (
      <div className="obra-quadro" style={{ backgroundColor: cor }}>
        <span className="obra-sem-imagem" aria-hidden="true">{titulo}</span>
      </div>
    );
  }

  const varias = total > 1;

  return (
    <div className="galeria" role={varias ? "region" : undefined} aria-roledescription={varias ? "carrossel" : undefined} aria-label={varias ? `Imagens de ${titulo}` : undefined}>
      <div
        className="obra-quadro galeria-quadro"
        style={{ backgroundColor: cor }}
      >
        <div
          ref={trilho}
          className="galeria-trilho"
          tabIndex={varias ? 0 : undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); irPara(atual + 1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); irPara(atual - 1); }
          }}
        >
          {imagens.map((img, i) => (
            <button
              key={`${i}-${img}`}
              type="button"
              className="galeria-slide"
              onClick={() => setAmpliada(i)}
              aria-label={`Ampliar imagem ${i + 1} de ${total}: ${titulo}`}
              aria-roledescription={varias ? "slide" : undefined}
            >
              <ImgSegura
                src={unsplash(img, largura)}
                alt={i === 0 ? `${tipo}: ${titulo}` : `${titulo}, imagem ${i + 1}`}
                width={largura}
                height={Math.round(largura * 0.75)}
                loading={destaque && i === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
            </button>
          ))}
        </div>

        {varias && (
          <>
            <button type="button" className="galeria-seta galeria-seta-ant" onClick={() => irPara(atual - 1)} disabled={atual === 0} aria-label="Imagem anterior">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="galeria-seta galeria-seta-prox" onClick={() => irPara(atual + 1)} disabled={atual >= total - 1} aria-label="Próxima imagem">
              <span aria-hidden="true">›</span>
            </button>
            <span className="galeria-contador" aria-live="polite">{atual + 1} / {total}</span>
          </>
        )}
      </div>

      {varias && (
        <div className="galeria-pontos">
          {imagens.map((img, i) => (
            <button
              key={`p-${i}-${img}`}
              type="button"
              className={i === atual ? "galeria-ponto ativo" : "galeria-ponto"}
              onClick={() => irPara(i)}
              aria-label={`Ver imagem ${i + 1} de ${total}`}
              aria-current={i === atual ? "true" : undefined}
            />
          ))}
        </div>
      )}

      {ampliada !== null && (
        <Ampliada
          imagens={imagens}
          titulo={titulo}
          inicio={ampliada}
          aoFechar={(ultima) => {
            setAmpliada(null);
            irPara(ultima, false);
          }}
        />
      )}
    </div>
  );
}

/** Visualização ampliada em tela cheia, dentro do site (sem abrir nova aba). */
function Ampliada({ imagens, titulo, inicio, aoFechar }: { imagens: string[]; titulo: string; inicio: number; aoFechar: (ultima: number) => void }) {
  const trilho = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const [atual, setAtual] = useState(inicio);
  const atualRef = useRef(inicio);
  atualRef.current = atual;
  const total = imagens.length;

  const irPara = useCallback((i: number, suave = true) => {
    const el = trilho.current;
    if (!el) return;
    const alvo = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: alvo * el.clientWidth, behavior: suave ? "smooth" : "auto" });
  }, [total]);

  useEffect(() => {
    const el = trilho.current;
    if (el) el.scrollLeft = inicio * el.clientWidth;
    const antes = document.activeElement as HTMLElement | null;
    fechar.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const aoRolar = () => el && setAtual(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el?.addEventListener("scroll", aoRolar, { passive: true });
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar(atualRef.current);
      if (e.key === "ArrowRight") irPara(atualRef.current + 1);
      if (e.key === "ArrowLeft") irPara(atualRef.current - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = overflow;
      el?.removeEventListener("scroll", aoRolar);
      window.removeEventListener("keydown", tecla);
      antes?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const varias = total > 1;

  return createPortal(
    <div className="galeria-ampliada" role="dialog" aria-modal="true" aria-label={`${titulo}: imagem ${atual + 1} de ${total}`}>
      <div className="galeria-ampliada-topo">
        <span className="galeria-ampliada-titulo">{titulo}{varias && <span> · {atual + 1} / {total}</span>}</span>
        <button ref={fechar} type="button" className="galeria-fechar" onClick={() => aoFechar(atual)} aria-label="Fechar">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div ref={trilho} className="galeria-trilho galeria-ampliada-trilho">
        {imagens.map((img, i) => (
          <div key={`a-${i}-${img}`} className="galeria-slide galeria-ampliada-slide" onClick={(e) => e.target === e.currentTarget && aoFechar(atual)}>
            <ImgSegura src={unsplash(img, 2000)} alt={`${titulo}, imagem ${i + 1}`} loading={Math.abs(i - inicio) <= 1 ? "eager" : "lazy"} decoding="async" draggable={false} />
          </div>
        ))}
      </div>
      {varias && (
        <>
          <button type="button" className="galeria-seta galeria-seta-ant" onClick={() => irPara(atual - 1)} disabled={atual === 0} aria-label="Imagem anterior">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="galeria-seta galeria-seta-prox" onClick={() => irPara(atual + 1)} disabled={atual >= total - 1} aria-label="Próxima imagem">
            <span aria-hidden="true">›</span>
          </button>
          <div className="galeria-pontos galeria-ampliada-pontos">
            {imagens.map((img, i) => (
              <button key={`ap-${i}-${img}`} type="button" className={i === atual ? "galeria-ponto ativo" : "galeria-ponto"} onClick={() => irPara(i)} aria-label={`Ver imagem ${i + 1} de ${total}`} aria-current={i === atual ? "true" : undefined} />
            ))}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
