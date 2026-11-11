import type { Metadata } from "next";
import { SoComConta } from "@/components/SoComConta";
import { PainelEquipe } from "./PainelEquipe";

export const metadata: Metadata = { title: "Painel da equipe", robots: { index: false } };

export default function Equipe() {
  return (
    <SoComConta titulo="Área da equipe" texto="Entre com a conta da equipe do Fólium.">
      <PainelEquipe />
    </SoComConta>
  );
}
