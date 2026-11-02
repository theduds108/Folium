"use client";

import { useEffect } from "react";
import { reduzirMovimento } from "./movimento";

/**
 * anime.js: animação de entrada do topo da página inicial.
 * As letras sobem uma a uma, o bloco cobre cresce, a folha gira,
 * e o leque de fichas se abre como cartas sendo distribuídas.
 */
export function EntradaCapa() {
  useEffect(() => {
    if (reduzirMovimento()) return;
    let cancelado = false;
    let parar: (() => void) | undefined;

    import("animejs").then(({ createTimeline, stagger, animate }) => {
      if (cancelado) return;
      const tl = createTimeline({ defaults: { ease: "outExpo", duration: 900 } });

      tl.add(".marca-gigante > span:not(.bloco-cobre)", {
        translateY: ["60%", "0%"],
        opacity: [0, 1],
        delay: stagger(70),
      })
        .add(".bloco-cobre", { scaleY: [0, 1], duration: 700 }, "-=800")
        .add(".letra-folha svg", { rotate: [-200, 0], scale: [0.4, 1], duration: 1200, ease: "outElastic(1, .6)" }, "-=900")
        .add(".capa-zine .rotulos span, .capa-zine .ornamentos svg", { opacity: [0, 1], translateY: [10, 0], delay: stagger(60) }, "-=900")
        .add(".capa-zine .anotacao", { opacity: [0, 1], translateX: [-16, 0] }, "-=700")
        .add(".capa-zine .lead-zine, .capa-zine .busca-rapida, .capa-zine .hero-acoes", { opacity: [0, 1], translateY: [16, 0], delay: stagger(90) }, "-=800")
        .add(".leque .ficha", { "--abre": [0, 1], opacity: [0, 1], delay: stagger(90, { from: "center" }), duration: 1100 }, "-=700");

      // Ornamentos giram devagar depois da entrada.
      const giro = animate(".capa-zine .ornamentos svg", {
        rotate: 360,
        duration: 9000,
        loop: true,
        ease: "linear",
        delay: stagger(600),
      });

      parar = () => {
        tl.pause();
        giro.pause();
      };
    });

    return () => {
      cancelado = true;
      parar?.();
    };
  }, []);

  return null;
}
