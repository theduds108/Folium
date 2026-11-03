"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import animacao from "@/public/lottie/salvo.json";
import { reduzirMovimento } from "./movimento";

// Lottie: o pacote é pesado, então só carrega quando a animação aparece.
const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), { ssr: false });

/**
 * Confirmação de "salvo": o check se desenha uma vez, em ~250ms (a animação tem 1s; speed 4).
 * Com prefers-reduced-motion: reduce, mostra o check pronto, sem animar.
 */
export function SalvoLottie() {
  const [estatico, setEstatico] = useState(false);
  useEffect(() => setEstatico(reduzirMovimento()), []);

  return (
    <span style={{ display: "inline-block", width: 28, height: 28 }} aria-hidden="true">
      {estatico ? (
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12" fill="#4F7A3A" />
          <path d="m8.5 14.4 3.7 3.7 7.3-7.4" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <Lottie src={animacao} loop={false} autoplay speed={4} />
      )}
    </span>
  );
}
