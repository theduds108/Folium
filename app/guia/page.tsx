import type { Metadata } from "next";
import { DICAS_SEGURANCA } from "@/lib/conteudo";
import { GuiaConteudo } from "@/components/GuiaPrecos";
import { Anotacao } from "@/components/Zine";
import Link from "next/link";
import { ReverTour } from "@/components/TourGuiado";

export const metadata: Metadata = { title: "Guia do aluno" };

export default function Guia() {
  return (
    <div className="container pagina">
      <h1 className="titulo-pagina">Guia do aluno</h1>
      <Anotacao className="anotacao-perfil">para cobrar justo e trabalhar seguro</Anotacao>
      <p className="suave" style={{ margin: "8px 0 0" }}>
        Primeira vez por aqui? <ReverTour>Fazer o tour pelo app</ReverTour> · <Link href="/instalar">Como instalar no celular</Link>
      </p>

      <section className="secao" id="precos">
        <h2 className="revelar">Quanto cobrar</h2>
        <p className="suave revelar" style={{ maxWidth: "42em" }}>
          Calcule um valor para o seu trabalho, veja faixas por serviço com exemplos de vagas do mural e aprenda a negociar. São estimativas do Fólium para quem está começando na região de Bauru, não uma tabela oficial.
        </p>
        <div className="cartao bloco guia-pagina revelar">
          <GuiaConteudo />
        </div>
      </section>

      <section className="secao" id="seguranca">
        <h2 className="revelar">Como evitar golpe e calote</h2>
        <div className="grade-dicas revelar-grupo">
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
