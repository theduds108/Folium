import type { Metadata } from "next";
import { metadadosPagina } from "@/lib/site";
import { Suspense } from "react";
import { BuscaTalentos } from "./BuscaTalentos";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { EsqueletoGrade } from "@/components/Esqueleto";
import { SoComConta } from "@/components/SoComConta";
import { VITRINE_ABERTA } from "@/lib/config";

export const metadata: Metadata = metadadosPagina({ titulo: "Encontrar talentos", descricao: "Busque portfólios de universitários da UNISAGRADO por curso e serviço e chame para o seu próximo freela.", caminho: "/talentos/" });

export default function Talentos() {
  const conteudo = (
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
  // Vitrine aberta (temporária): sem conta, a busca mostra os portfólios sem contatos (BuscaTalentos decide).
  if (VITRINE_ABERTA) return conteudo;
  return (
    <SoComConta
      titulo="Entre para ver os talentos"
      texto="A busca de talentos é só para quem tem conta no Fólium. A conta é grátis: aluno usa o e-mail institucional, empresa ou contratante usa qualquer e-mail."
    >
      {conteudo}
    </SoComConta>
  );
}
