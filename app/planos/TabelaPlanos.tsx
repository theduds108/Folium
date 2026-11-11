"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANOS, type Plano } from "@/lib/conteudo";
import { pedirPremium, useConta, type TipoConta } from "@/lib/conta";

const GRUPOS: { tipo: Plano["tipo"]; titulo: string; texto: string }[] = [
  { tipo: "colaborador", titulo: "Para colaboradores", texto: "Alunos com e-mail institucional que oferecem trabalho." },
  { tipo: "contratante", titulo: "Para quem contrata", texto: "Empresas, negócios e pessoas que precisam de um freela." },
  { tipo: "instituicao", titulo: "Para instituições", texto: "Universidades que querem uma vitrine própria." },
];

/** Planos separados por tipo de conta. Quem tem conta vê primeiro os do próprio tipo e o plano atual marcado. */
export function TabelaPlanos() {
  const { conta, premium } = useConta();
  const ordem = conta ? [...GRUPOS].sort((a, b) => Number(b.tipo === conta.tipo) - Number(a.tipo === conta.tipo)) : GRUPOS;

  return (
    <div className="planos-grupos">
      {ordem.map((g) => (
        <section key={g.tipo} className="secao planos-grupo" aria-labelledby={`planos-${g.tipo}`}>
          <div className="planos-grupo-cabeca">
            <h2 id={`planos-${g.tipo}`}>{g.titulo}</h2>
            <p className="suave">{g.texto}</p>
          </div>
          <div className="grade-planos">
            {PLANOS.filter((p) => p.tipo === g.tipo).map((p) => {
              const atual = !!conta && conta.tipo === p.tipo && (p.plano === "premium") === premium;
              return (
                <div key={p.nome} className={["cartao plano", p.destaque && "plano-destaque", atual && "plano-atual"].filter(Boolean).join(" ")}>
                  <span className={p.plano === "premium" ? "selo-plano selo-premium" : "etiqueta"}>
                    {p.plano === "premium" ? "Premium" : p.plano === "gratis" ? "Grátis" : "Licença"}
                  </span>
                  <h3 className="h-pequeno" style={{ marginTop: 12 }}>{p.nome}</h3>
                  <p className="plano-preco">{p.preco}</p>
                  <p className="plano-lema">{p.lema}</p>
                  <ul className="lista-check">
                    {p.itens.map((i) => <li key={i}>{i}</li>)}
                    {p.emBreve?.map((i) => <li key={i} className="em-breve">{i} <span className="suave">(em breve)</span></li>)}
                  </ul>
                  {p.nota && <p className="plano-nota">{p.nota}</p>}
                  <AcaoPlano plano={p} atual={atual} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function AcaoPlano({ plano, atual }: { plano: Plano; atual: boolean }) {
  const { conta, premium } = useConta();
  const [estado, setEstado] = useState<"" | "enviando" | "pedido" | "liberado" | "erro">("");

  if (plano.tipo === "instituicao")
    return <Link href="/sobre" className="botao botao-contorno">Falar com a equipe</Link>;

  const tipo = plano.tipo as TipoConta;
  if (!conta)
    return (
      <Link href={`/entrar/?como=${tipo}`} className={plano.destaque ? "botao botao-primario" : "botao botao-contorno"}>
        {plano.plano === "premium" ? "Criar conta e assinar" : "Começar grátis"}
      </Link>
    );

  if (conta.tipo !== tipo)
    return <span className="ajuda plano-outro">Para contas de {tipo === "contratante" ? "contratante" : "colaborador"}.</span>;

  if (atual) return <span className="plano-seu">Seu plano</span>;

  // Premium em vigor e este é o grátis: nada a fazer aqui.
  if (premium) return <span className="ajuda plano-outro">Incluído no seu Premium.</span>;

  if (estado === "pedido" || conta.planoPedido)
    return (
      <p className="salvo" style={{ margin: 0 }}>
        Pedido enviado. O pagamento pelo site ainda está em desenvolvimento, então a equipe libera seu Premium em até 1 dia útil.
      </p>
    );

  return (
    <>
      <button
        type="button"
        className="botao botao-primario"
        disabled={estado === "enviando"}
        onClick={async () => {
          setEstado("enviando");
          try {
            setEstado(await pedirPremium());
          } catch {
            setEstado("erro");
          }
        }}
      >
        {estado === "enviando" ? "Enviando…" : "Quero o Premium"}
      </button>
      <p className="ajuda aviso-desenvolvimento">Pagamento pelo site em desenvolvimento. Por enquanto, a equipe confirma seu pedido e libera o Premium em até 1 dia útil.</p>
      {estado === "erro" && <p className="erro" role="alert">Não deu para enviar o pedido. Tente de novo.</p>}
    </>
  );
}
