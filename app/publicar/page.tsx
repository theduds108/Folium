"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, SeloPlano, TravaPremium } from "@/components/Area";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { RECURSOS, type Conta } from "@/lib/conta";
import { minhasVagas } from "@/lib/repositorio";
import { PublicarOportunidade } from "../oportunidades/PublicarOportunidade";

/**
 * Tela só de publicação de oportunidades, da área do contratante.
 * Visitante vê o convite para entrar; colaborador é mandado para a própria área.
 */
export default function Publicar() {
  return (
    <Area tipo="contratante">
      {({ conta, premium }) => <TelaPublicar conta={conta!} premium={premium} />}
    </Area>
  );
}

function TelaPublicar({ conta, premium }: { conta: Conta; premium: boolean }) {
  const [noMes, setNoMes] = useState<number | null>(null);
  const limite = RECURSOS.contratante[premium ? "premium" : "gratis"].vagasPorMes;

  useEffect(() => {
    minhasVagas().then((v) => setNoMes(v.filter((x) => Date.now() - new Date(x.criadaEm).getTime() < 30 * 86_400_000).length));
  }, []);

  const esgotou = noMes !== null && noMes >= limite;

  return (
    <div className="container pagina">
      <CabecalhoArquivo
        rotulo="Para quem contrata"
        titulo="Publicar oportunidade"
        descricao="Conte o que você precisa. A equipe confere a vaga em até 1 dia útil e ela vai para o mural, onde os alunos marcam interesse e falam direto com você."
      >
        <div className="publicar-status">
          <SeloPlano premium={premium} />
          <span className="suave">
            {premium
              ? "Vagas ilimitadas, com opção de destaque no topo do mural."
              : noMes === null
                ? "Conferindo suas vagas do mês…"
                : esgotou
                  ? "Você já usou a vaga grátis deste mês."
                  : "Você tem 1 vaga grátis disponível este mês."}
          </span>
          <Link href="/painel" className="link-mao">ver minhas vagas →</Link>
        </div>
      </CabecalhoArquivo>

      {esgotou && !premium ? (
        <TravaPremium
          titulo="Publique quantas vagas precisar"
          texto="No plano grátis é 1 vaga a cada 30 dias. Com o Contratante Premium as vagas são ilimitadas, podem ficar em destaque no topo do mural e você ainda salva talentos e recebe o Jornal do Fólium."
        />
      ) : (
        <PublicarOportunidade conta={conta} premium={premium} />
      )}
    </div>
  );
}
