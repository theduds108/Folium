import type { Metadata } from "next";
import { metadadosPagina } from "@/lib/site";
import { JornalEdicao } from "./JornalEdicao";
import { SoComConta } from "@/components/SoComConta";

export const metadata: Metadata = metadadosPagina({ titulo: "Jornal", descricao: "O Jornal do Fólium: os portfólios e as vagas da semana dos universitários da UNISAGRADO.", caminho: "/jornal/" });

export default function Jornal() {
  return (
    <SoComConta
      titulo="Entre para ler o Jornal"
      texto="O Jornal do Fólium traz portfólios e vagas da semana, por isso é só para quem tem conta. A conta é grátis."
    >
      <JornalEdicao />
    </SoComConta>
  );
}
