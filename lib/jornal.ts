/**
 * Jornal do Fólium: uma edição por semana, montada com o que já está no site
 * (portfólios, vagas, faixas de preço) mais as matérias da equipe.
 * Cada tipo de conta tem a sua edição; o texto completo é do plano Premium.
 */
import type { Materia } from "./repositorio";

/** Primeira edição: semana de 2 de novembro de 2026. */
const INICIO = Date.UTC(2026, 10, 2);
const SEMANA = 7 * 86_400_000;

export function edicaoAtual(agora = new Date()) {
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const diaSemana = (new Date(hoje).getUTCDay() + 6) % 7; // segunda = 0
  const segunda = hoje - diaSemana * 86_400_000;
  const numero = Math.max(1, Math.floor((segunda - INICIO) / SEMANA) + 1);
  const data = new Date(segunda).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return { numero, data };
}

/**
 * Matérias de exemplo, usadas enquanto a equipe não publica as próprias
 * na tabela jornal_materias do Supabase.
 */
export const MATERIAS_EXEMPLO: Materia[] = [
  {
    id: "ex-primeiro-freela",
    publico: "colaborador",
    editoria: "Carreira",
    titulo: "Primeiro freela: o que combinar antes de abrir o arquivo",
    linhaFina: "Prazo, número de ajustes e forma de pagamento evitam a maior parte das dores de cabeça. Um roteiro para a primeira conversa com o cliente.",
    texto:
      "Antes de começar, mande por escrito o que vai ser entregue, em que formato e até quando. Uma mensagem de WhatsApp já serve como registro.\n\nCombine quantas rodadas de ajuste estão incluídas. Duas é o comum para quem está começando; a partir daí, cada rodada é cobrada à parte.\n\nPeça um sinal de 30% a 50% e entregue as prévias com marca d'água até receber o restante. Cliente sério entende, e quem reclama do sinal costuma ser quem não paga no fim.",
    autor: "Redação Fólium",
    publicadaEm: "2026-11-02",
  },
  {
    id: "ex-briefing",
    publico: "contratante",
    editoria: "Como contratar",
    titulo: "Briefing em cinco linhas: o pedido que todo aluno entende",
    linhaFina: "O que você precisa, para onde vai, até quando, quanto pode pagar e um exemplo de que gosta. Com isso, o orçamento chega certo na primeira vez.",
    texto:
      "Diga o que precisa em uma frase: \"logo para uma padaria de bairro\" ajuda mais do que \"uma identidade forte\".\n\nConte onde o trabalho vai ser usado (Instagram, fachada, cardápio impresso) e a data em que precisa dele pronto.\n\nInforme a faixa de orçamento. Os alunos do Fólium usam o guia de preços do site; dizer o valor desde o início poupa idas e vindas. Por fim, mande um ou dois exemplos de que você gosta. Referência vale mais que adjetivo.",
    autor: "Redação Fólium",
    publicadaEm: "2026-11-02",
  },
  {
    id: "ex-curadoria",
    publico: "todos",
    editoria: "Bastidores",
    titulo: "Por que cada vaga passa pela equipe antes de ir ao mural",
    linhaFina: "A conferência leva até um dia útil e é o que mantém o Fólium longe dos golpes que circulam em grupos de freela.",
    texto:
      "Toda vaga entra como \"em análise\". A equipe confere se a empresa existe, se o contato responde e se a proposta não pede pagamento do aluno para começar.\n\nVagas com promessa boa demais, urgência sem detalhe ou pedido de taxa são recusadas. Se algo passar, o botão de denúncia em cada vaga chega direto à equipe.",
    autor: "Redação Fólium",
    publicadaEm: "2026-11-02",
  },
];
