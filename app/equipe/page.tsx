import type { Metadata } from "next";
import { metadadosPagina } from "@/lib/site";
import { SoComConta } from "@/components/SoComConta";
import { PainelEquipe } from "./PainelEquipe";

export const metadata: Metadata = metadadosPagina({ titulo: "Painel da equipe", caminho: "/equipe/", indexar: false });

export default function Equipe() {
  return (
    <SoComConta titulo="Área da equipe" texto="Entre com a conta da equipe do Fólium.">
      <PainelEquipe />
    </SoComConta>
  );
}
