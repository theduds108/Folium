import type { Metadata } from "next";
import { DICAS_SEGURANCA } from "@/lib/conteudo";
import { GuiaConteudo } from "@/components/GuiaPrecos";
import { SOBRE_AS_FAIXAS } from "@/lib/precos";
import { GuiaContratante } from "@/components/GuiaContratante";
import { GuiaPorConta } from "@/components/GuiaPorConta";
import { Anotacao } from "@/components/Zine";
import Link from "next/link";
import { ReverTour } from "@/components/TourGuiado";

export const metadata: Metadata = { title: "Guia" };

/** Guia do aluno (alunos e visitantes) ou Guia do contratante, conforme a conta. */
export default function Guia() {
  return <GuiaPorConta aluno={<GuiaAluno />} contratante={<GuiaContratante />} />;
}

function GuiaAluno() {
  return (
    <div className="container pagina">
      <h1 className="titulo-pagina">Guia do aluno</h1>
      <Anotacao className="anotacao-perfil">para cobrar justo e trabalhar seguro</Anotacao>
      <p className="suave" style={{ margin: "8px 0 0" }}>
        Primeira vez por aqui? <ReverTour>Fazer o tour pelo app</ReverTour> · <Link href="/instalar">Como instalar no celular</Link>
      </p>

      <section className="secao" id="precos">
        <h2>Quanto cobrar</h2>
        <p className="suave" style={{ maxWidth: "42em" }}>
          Calcule um valor para o seu trabalho, veja faixas por serviço com exemplos de vagas do mural e aprenda a negociar. {SOBRE_AS_FAIXAS}
        </p>
        <div className="cartao bloco guia-pagina">
          <GuiaConteudo />
        </div>
      </section>

      <section className="secao" id="seguranca">
        <h2>Como evitar golpe e calote</h2>
        <div className="grade-dicas">
          {DICAS_SEGURANCA.map((d, i) => (
            <div key={d.titulo} className="cartao bloco dica">
              <span className="dica-numero">{i + 1}</span>
              <h3 className="h-pequeno">{d.titulo}</h3>
              <p style={{ margin: 0 }}>{d.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
