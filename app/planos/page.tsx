import type { Metadata } from "next";
import { TabelaPlanos } from "./TabelaPlanos";

export const metadata: Metadata = { title: "Planos" };

export default function Planos() {
  return (
    <div className="container pagina">
      <h1 className="titulo-pagina">Planos</h1>
      <p className="suave" style={{ maxWidth: "42em" }}>
        Cada tipo de conta tem o seu plano. Colaborador é o aluno que monta portfólio; contratante é quem publica vagas e
        chama os alunos. Os dois começam grátis, e o Premium inclui o Jornal do Fólium, com uma edição para cada um.
      </p>
      <TabelaPlanos />
      <p className="suave" style={{ marginTop: 20, fontSize: "var(--t-sec)" }}>
        Preços em validação com alunos e empresas durante o protótipo. Enquanto o pagamento pelo site não está pronto, a
        equipe confirma cada pedido de Premium e libera em até 1 dia útil.
      </p>
    </div>
  );
}
