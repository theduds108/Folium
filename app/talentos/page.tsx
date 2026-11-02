import type { Metadata } from "next";
import { Suspense } from "react";
import { BuscaTalentos } from "./BuscaTalentos";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { EsqueletoGrade } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Encontrar talentos" };

export default function Talentos() {
  return (
    <div className="container pagina">
      <CabecalhoArquivo
        rotulo="Arquivo de talentos · UNISAGRADO"
        titulo="Encontrar talentos"
        descricao="Universitários com vínculo conferido pela instituição. Filtre pelo que você precisa e fale direto com quem fez."
      />
      <Suspense fallback={<EsqueletoGrade tipo="talento" />}>
        <BuscaTalentos />
      </Suspense>
    </div>
  );
}
