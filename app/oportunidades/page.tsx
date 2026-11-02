import type { Metadata } from "next";
import { MuralOportunidades } from "./MuralOportunidades";
import { AvisoEmpresa } from "./AreaVagas";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";

export const metadata: Metadata = { title: "Oportunidades" };

export default function Oportunidades() {
  return (
    <div className="container pagina">
      <CabecalhoArquivo
        rotulo="Mural de oportunidades · região de Bauru"
        titulo="Oportunidades"
        descricao="Freelas, projetos e estágios publicados por negócios da região. Cada vaga passa pela equipe antes de ir ao ar."
      >
        <AvisoEmpresa />
      </CabecalhoArquivo>
      <MuralOportunidades />
    </div>
  );
}
