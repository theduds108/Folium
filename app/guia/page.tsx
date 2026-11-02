import type { Metadata } from "next";
import { DICAS_SEGURANCA, PRECOS } from "@/lib/conteudo";
import { Anotacao } from "@/components/Zine";

export const metadata: Metadata = { title: "Guia do aluno" };

export default function Guia() {
  return (
    <div className="container pagina">
      <h1 className="titulo-pagina">Guia do aluno</h1>
      <Anotacao className="anotacao-perfil">para cobrar justo e trabalhar seguro</Anotacao>

      <section className="secao" id="precos">
        <h2 className="revelar">Quanto cobrar</h2>
        <p className="suave revelar" style={{ maxWidth: "42em" }}>
          Faixas de referência para quem está começando na região. Use como ponto de partida e ajuste pelo tamanho do
          trabalho, pelo prazo e pela sua experiência. São valores aproximados, não uma tabela oficial.
        </p>
        <div className="tabela-rolagem revelar">
          <table className="tabela">
            <thead>
              <tr><th>Serviço</th><th>Faixa de preço</th><th>Base</th></tr>
            </thead>
            <tbody>
              {PRECOS.map((p) => (
                <tr key={p.servico}>
                  <td><strong>{p.servico}</strong></td>
                  <td>{p.faixa}</td>
                  <td className="suave">{p.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cartao bloco revelar" style={{ marginTop: 16 }}>
          <h3 className="h-pequeno">Uma conta simples</h3>
          <p style={{ margin: 0 }}>
            Some as horas que o trabalho leva, multiplique pelo valor da sua hora e acrescente 20% para reuniões e
            ajustes. Se o resultado ficar muito abaixo da faixa acima, você provavelmente está cobrando pouco.
          </p>
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
