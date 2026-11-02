import type { Metadata } from "next";
import { MuralOportunidades } from "./MuralOportunidades";
import { PublicarOportunidade } from "./PublicarOportunidade";
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
        <div className="aviso-empresa cartao">
          <div>
            <strong>Tem um trabalho para oferecer?</strong>
            <span className="suave"> A primeira vaga é grátis.</span>
          </div>
          <a href="#publicar" className="botao botao-verde">Publicar oportunidade</a>
        </div>
      </CabecalhoArquivo>
      <MuralOportunidades />
      <section className="secao">
        <PublicarOportunidade />
      </section>
    </div>
  );
}
