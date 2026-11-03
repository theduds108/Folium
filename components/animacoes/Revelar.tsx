"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { reduzirMovimento } from "./movimento";

/**
 * ScrollReveal: seções abaixo da dobra aparecem uma vez ao entrar na tela.
 *
 * Objetivo: continuidade de leitura ao rolar, não decoração. Por isso é uma única
 * transição curta (opacity + 10px para cima, 400ms) e grupos com intervalo de 40ms,
 * sem cascatas longas nem entradas pela lateral. ".revelar-esquerda" ficou como
 * sinônimo de ".revelar" (mesmo movimento vertical).
 * Listas que mudam com filtros (talentos, vagas) não usam reveal.
 * Não roda com prefers-reduced-motion: reduce: o conteúdo já aparece no lugar.
 */
export function Revelar() {
  const pathname = usePathname();

  useEffect(() => {
    if (reduzirMovimento()) return;
    let sr: { reveal: (sel: string, opts?: object) => void; destroy: () => void } | undefined;
    let cancelado = false;

    import("scrollreveal").then((mod) => {
      if (cancelado) return;
      sr = mod.default({ distance: "10px", duration: 400, easing: "cubic-bezier(.2,.7,.2,1)", origin: "bottom", viewFactor: 0.15, cleanup: true });
      sr!.reveal(".revelar, .revelar-esquerda");
      sr!.reveal(".revelar-grupo > *", { interval: 40 });
    });

    return () => {
      cancelado = true;
      sr?.destroy();
    };
  }, [pathname]);

  return null;
}
