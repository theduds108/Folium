// Textos e regras de segurança sem acesso ao banco: servem também a páginas do servidor (ex.: /conduta).
// As funções que falam com o banco ficam em lib/seguranca.ts.

import type { Decisao, StatusOcorrencia } from "./seguranca";

/** Prazos que a equipe se compromete a cumprir. */
export const PRAZO_AJUDA = "24 horas";
export const PRAZO_DENUNCIA = "5 dias úteis";

// Telefones de apoio (gratuitos, 24 horas)

export const TELEFONES_APOIO = [
  { numero: "190", nome: "Polícia Militar", quando: "Perigo agora: ameaça, agressão ou alguém te impedindo de sair." },
  { numero: "180", nome: "Ligue 180", quando: "Violência ou assédio contra a mulher. Também orienta e encaminha." },
  { numero: "100", nome: "Disque 100", quando: "Assédio, discriminação e outras violações de direitos humanos." },
  { numero: "188", nome: "CVV", quando: "Apoio emocional, para conversar com alguém agora." },
];

export const CATEGORIAS_AJUDA = [
  "Assédio sexual",
  "Assédio moral ou pressão",
  "Risco à minha segurança física",
  "Discriminação",
  "Outro problema sério",
];

/** O aluno denuncia o contratante. */
export const CATEGORIAS_ALUNO = [
  "Assédio ou desrespeito",
  "Não pagou ou atrasou o pagamento",
  "Pediu trabalho fora do combinado",
  "Pediu trabalho de graça ou “teste” sem pagar",
  "Pediu pagamento por fora ou parece golpe",
  "Outro motivo",
];

/** O contratante denuncia o aluno. */
export const CATEGORIAS_CONTRATANTE = [
  "Causou prejuízo à empresa",
  "Abandonou o trabalho sem avisar",
  "Entregou trabalho de outra pessoa",
  "Desrespeito ou assédio",
  "Usou dados ou material da empresa sem permissão",
  "Outro motivo",
];

export const NOME_STATUS_OCORRENCIA: Record<StatusOcorrencia, string> = {
  aberta: "Recebida",
  em_analise: "Em análise",
  aguardando_defesa: "Esperando a outra parte",
  resolvida: "Resolvida",
  arquivada: "Arquivada",
};

export const NOME_DECISAO: Record<Decisao, string> = {
  arquivada: "Arquivar (sem provas suficientes)",
  advertencia: "Advertência à outra parte",
  suspensao: "Suspender a outra parte por 30 dias",
  banimento: "Banir a outra parte",
  ma_fe: "Denúncia de má-fé: advertir quem denunciou",
};

/** O contratante avalia o aluno nestes critérios. */
export const CRITERIOS_ALUNO = [
  { chave: "pontualidade", rotulo: "Pontualidade" },
  { chave: "qualidade", rotulo: "Qualidade do trabalho" },
  { chave: "comunicacao", rotulo: "Comunicação" },
  { chave: "respeito", rotulo: "Respeito" },
] as const;

/** O aluno avalia o contratante nestes critérios. */
export const CRITERIOS_CONTRATANTE = [
  { chave: "respeito", rotulo: "Respeito" },
  { chave: "pagamento", rotulo: "Pagamento em dia" },
  { chave: "clareza", rotulo: "Clareza no pedido" },
  { chave: "ambiente", rotulo: "Ambiente seguro" },
] as const;

export const ROTULO_CRITERIO: Record<string, string> = Object.fromEntries(
  [...CRITERIOS_ALUNO, ...CRITERIOS_CONTRATANTE].map((c) => [c.chave, c.rotulo]),
);

/** A média só aparece a partir deste número de avaliações. */
export const MINIMO_PARA_MEDIA = 3;

/** Média de cada critério, só com avaliações que têm critérios. */
export function mediasPorCriterio(lista: { criterios?: Record<string, number> | null }[]) {
  const soma: Record<string, { s: number; n: number }> = {};
  for (const a of lista) {
    for (const [k, v] of Object.entries(a.criterios ?? {})) {
      soma[k] ??= { s: 0, n: 0 };
      soma[k].s += Number(v);
      soma[k].n += 1;
    }
  }
  return Object.entries(soma).map(([chave, { s, n }]) => ({ chave, rotulo: ROTULO_CRITERIO[chave] ?? chave, media: Math.round((s / n) * 10) / 10 }));
}

