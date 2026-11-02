"use client";

import dynamic from "next/dynamic";
import animacao from "@/public/lottie/salvo.json";

// Lottie: o pacote é pesado, então só carrega quando a animação aparece.
const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), { ssr: false });

export function SalvoLottie() {
  return (
    <span style={{ display: "inline-block", width: 28, height: 28 }} aria-hidden="true">
      <Lottie src={animacao} loop={false} autoplay />
    </span>
  );
}
