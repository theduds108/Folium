import type { Metadata } from "next";
import { JornalEdicao } from "./JornalEdicao";
import { SoComConta } from "@/components/SoComConta";

export const metadata: Metadata = { title: "Jornal do Fólium" };

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
