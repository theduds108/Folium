import type { Metadata } from "next";
import { SoComConta } from "@/components/SoComConta";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { ListaCombinados } from "./ListaCombinados";

export const metadata: Metadata = { title: "Combinados" };

export default function Combinados() {
  return (
    <SoComConta titulo="Entre para ver seus combinados" texto="Os combinados ficam guardados na sua conta. A conta é grátis.">
      <div className="container pagina">
        <CabecalhoArquivo
          rotulo="Tudo por escrito"
          titulo="Combinados"
          descricao="O que foi combinado entre aluno e contratante: o que está incluso, prazo, valor e sinal. Depois do trabalho, cada um avalia o outro."
        />
        <ListaCombinados />
      </div>
    </SoComConta>
  );
}
