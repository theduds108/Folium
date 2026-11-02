import type { Metadata } from "next";
import Link from "next/link";
import { PLANOS } from "@/lib/conteudo";

export const metadata: Metadata = { title: "Planos" };

export default function Planos() {
  return (
    <div className="container pagina">
      <h1 className="titulo-pagina">Planos</h1>
      <p className="suave" style={{ maxWidth: "40em" }}>
        Para o aluno, o Fólium é gratuito. Quem quiser mais visibilidade pode usar o Destaque. Empresas pagam para
        publicar oportunidades, e instituições podem ter uma licença própria.
      </p>
      <div className="grade-planos revelar-grupo">
        {PLANOS.map((p) => (
          <div key={p.nome} className={p.destaque ? "cartao plano plano-destaque" : "cartao plano"}>
            <span className="etiqueta">{p.publico}</span>
            <h2 className="h-pequeno" style={{ marginTop: 12 }}>{p.nome}</h2>
            <p className="plano-preco">{p.preco}</p>
            <ul className="lista-check">
              {p.itens.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <Link href={p.publico === "Aluno" ? "/entrar" : "/sobre"} className={p.destaque ? "botao botao-primario" : "botao botao-contorno"}>
              {p.publico === "Aluno" ? "Começar" : "Falar com a equipe"}
            </Link>
          </div>
        ))}
      </div>
      <p className="suave" style={{ marginTop: 20, fontSize: "0.9rem" }}>
        Preços em validação com alunos e empresas durante o protótipo.
      </p>
    </div>
  );
}
