import type { Metadata } from "next";
import { MuralOportunidades } from "./MuralOportunidades";
import { PublicarOportunidade } from "./PublicarOportunidade";

export const metadata: Metadata = { title: "Oportunidades" };

export default function Oportunidades() {
  return (
    <div className="container pagina">
      <h1 className="titulo-pagina">Oportunidades</h1>
      <p className="suave" style={{ maxWidth: "40em" }}>
        Freelas, projetos e estágios publicados por negócios da região. Cada empresa é conferida antes de a vaga ir
        ao ar.
      </p>
      <div className="aviso-empresa cartao revelar">
        <div>
          <strong>Tem um trabalho para oferecer?</strong>
          <span className="suave"> A primeira vaga é grátis.</span>
        </div>
        <a href="#publicar" className="botao botao-verde">Publicar oportunidade</a>
      </div>
      <MuralOportunidades />
      <section className="secao" style={{ maxWidth: 720 }}>
        <PublicarOportunidade />
      </section>
    </div>
  );
}
