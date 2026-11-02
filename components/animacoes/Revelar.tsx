"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { reduzirMovimento } from "./movimento";

/**
 * ScrollReveal: faz títulos, cartões e trabalhos aparecerem
 * suavemente conforme a pessoa rola a página.
 */
export function Revelar() {
  const pathname = usePathname();

  useEffect(() => {
    if (reduzirMovimento()) return;
    let sr: { reveal: (sel: string, opts?: object) => void; destroy: () => void } | undefined;
    let cancelado = false;

    import("scrollreveal").then((mod) => {
      if (cancelado) return;
      sr = mod.default({ distance: "28px", duration: 750, easing: "cubic-bezier(.2,.7,.2,1)", origin: "bottom", viewFactor: 0.15, cleanup: true });
      sr!.reveal(".revelar");
      sr!.reveal(".revelar-grupo > *", { interval: 110 });
      sr!.reveal(".revelar-esquerda", { origin: "left", distance: "40px" });
    });

    return () => {
      cancelado = true;
      sr?.destroy();
    };
  }, [pathname]);

  return null;
}
