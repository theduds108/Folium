"use client";

import { Denunciar } from "@/components/Denunciar";
import { useConta } from "@/lib/conta";
import { DenunciarPessoa } from "./DenunciarPessoa";

// Denúncia antes do combinado. Quem tem a ligação certa recebe a denúncia completa
// (relato, prints, prazo de 5 dias úteis, defesa da outra parte); os outros ficam com
// a denúncia simples de conteúdo, como antes.

/** No portfólio: contratante aprovado denuncia o aluno. */
export function DenunciarPerfil({ alunoId, slug, nome }: { alunoId?: string; slug: string; nome: string }) {
  const { conta, demo } = useConta();
  if (alunoId && conta && !demo && conta.tipo === "contratante" && conta.aprovada && conta.id !== alunoId)
    return <DenunciarPessoa ligacao={{ perfil_id: alunoId }} userId={conta.id} souContratante nomeOutro={nome} rotulo="Denunciar este aluno" />;
  return <Denunciar alvo={slug} />;
}

/** No mural: aluno denuncia quem publicou a vaga. */
export function DenunciarVaga({ vagaId, empresa }: { vagaId: string; empresa: string }) {
  const { conta, demo } = useConta();
  if (conta && !demo && conta.tipo === "colaborador")
    return <DenunciarPessoa ligacao={{ oportunidade_id: vagaId }} userId={conta.id} souContratante={false} nomeOutro={empresa || "quem publicou a vaga"} rotulo="Denunciar esta vaga ou quem publicou" />;
  return <Denunciar alvo={vagaId} tipo="oportunidade" />;
}
