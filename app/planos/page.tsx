import type { Metadata } from "next";
import { metadadosPagina } from "@/lib/site";
import { TabelaPlanos } from "./TabelaPlanos";

export const metadata: Metadata = metadadosPagina({ titulo: "Planos", descricao: "Planos do Fólium para alunos e contratantes: comece grátis e veja o que o Premium acrescenta.", caminho: "/planos/" });

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
        Preços em validação com alunos e empresas durante o protótipo. O Premium ainda não está à venda: a forma de
        pagamento está sendo definida. Quem entrar na lista fica sabendo primeiro quando abrir.
      </p>
    </div>
  );
}
