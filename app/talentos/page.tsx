import type { Metadata } from "next";
import { Suspense } from "react";
import { BuscaTalentos } from "./BuscaTalentos";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { EsqueletoGrade } from "@/components/Esqueleto";
import { SoComConta } from "@/components/SoComConta";

export const metadata: Metadata = { title: "Encontrar talentos" };

export default function Talentos() {
  return (
    <SoComConta
      titulo="Entre para ver os talentos"
      texto="A busca de talentos é só para quem tem conta no Fólium. A conta é grátis: aluno usa o e-mail institucional, empresa ou contratante usa qualquer e-mail."
    >
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
    </SoComConta>
  );
}
