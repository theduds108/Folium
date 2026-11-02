import type { Metadata } from "next";
import { Suspense } from "react";
import { BuscaTalentos } from "./BuscaTalentos";

export const metadata: Metadata = { title: "Encontrar talentos" };

export default function Talentos() {
  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)" }}>Encontrar talentos</h1>
      <p className="suave" style={{ maxWidth: "40em" }}>
        Universitários da UNISAGRADO com portfólio verificado. Filtre pelo que você precisa e fale direto com quem fez.
      </p>
      <Suspense>
        <BuscaTalentos />
      </Suspense>
    </div>
  );
}
