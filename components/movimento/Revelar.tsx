"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { animate, inView, stagger } from "motion";

const SUAVE = [0.22, 1, 0.36, 1] as const;

/**
 * Faz os blocos marcados com .revelar (e os filhos de .revelar-grupo)
 * aparecerem com um leve deslize quando entram na tela. Acontece uma vez só.
 */
export function Revelar() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const paradas: Array<() => void> = [];

    document.querySelectorAll<HTMLElement>(".revelar").forEach((el) => {
      el.style.opacity = "0";
      paradas.push(
        inView(el, () => {
          animate(el, { opacity: [0, 1], y: [18, 0] }, { duration: 0.7, ease: SUAVE });
        }, { amount: 0.2 })
      );
    });

    document.querySelectorAll<HTMLElement>(".revelar-grupo").forEach((grupo) => {
      const filhos = Array.from(grupo.children) as HTMLElement[];
      filhos.forEach((f) => (f.style.opacity = "0"));
      paradas.push(
        inView(grupo, () => {
          animate(filhos, { opacity: [0, 1], y: [18, 0] }, { duration: 0.6, ease: SUAVE, delay: stagger(0.06) });
        }, { amount: 0.1 })
      );
    });

    return () => {
      paradas.forEach((p) => p());
      document.querySelectorAll<HTMLElement>(".revelar, .revelar-grupo > *").forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
  }, [pathname]);

  return null;
}
