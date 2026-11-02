/**
 * Dados do guia "Quanto cobrar". Os valores são estimativas de referência para quem está
 * começando (estudantes da região de Bauru), não uma tabela oficial. As vagas usadas como
 * exemplo vêm do mural de oportunidades do próprio Fólium.
 */
export type ServicoPreco = {
  id: string;
  servico: string;
  /** Nome do serviço nas vagas do mural, para mostrar projetos reais como exemplo. */
  vaga: string;
  min: number;
  max: number;
  base: string;
  /** Horas típicas de trabalho por unidade (mín, máx), para conferir o valor da hora. */
  horas: [number, number];
  inclui: string[];
  sobe: string[];
};

export const SERVICOS_PRECO: ServicoPreco[] = [
  {
    id: "identidade", servico: "Identidade visual (logo + paleta)", vaga: "Identidade visual", min: 300, max: 1200,
    base: "por projeto", horas: [12, 40],
    inclui: ["2 a 3 propostas de logo", "paleta e tipografia", "arquivos finais (PNG, PDF e vetor)", "2 rodadas de ajustes"],
    sobe: ["manual de marca completo", "papelaria e cardápio", "prazo curto", "uso comercial em grande escala"],
  },
  {
    id: "social", servico: "Social media", vaga: "Social media", min: 400, max: 1000,
    base: "por mês, 8 a 12 posts", horas: [16, 40],
    inclui: ["planejamento do mês", "arte e legenda de cada post", "stories", "relatório simples no fim do mês"],
    sobe: ["gravação de vídeos", "gestão de anúncios", "atendimento de comentários", "mais de 12 posts"],
  },
  {
    id: "foto", servico: "Fotografia de produto", vaga: "Fotografia", min: 150, max: 500,
    base: "por ensaio", horas: [3, 8],
    inclui: ["fotos tratadas e entregues em alta", "fundo neutro", "ajuste de cor", "entrega em 3 a 7 dias"],
    sobe: ["deslocamento", "produção de cenário", "muitos itens", "direito de uso em anúncio"],
  },
  {
    id: "evento", servico: "Cobertura de evento", vaga: "Vídeo e edição", min: 300, max: 800,
    base: "por evento", horas: [6, 14],
    inclui: ["captação no local", "edição e correção de cor", "entrega digital organizada", "1 rodada de ajustes"],
    sobe: ["evento longo", "equipe extra", "entrega no mesmo dia", "transmissão ao vivo"],
  },
  {
    id: "video", servico: "Vídeo curto (reels)", vaga: "Vídeo e edição", min: 80, max: 250,
    base: "por vídeo", horas: [2, 6],
    inclui: ["edição com cortes e legenda", "trilha livre de direitos", "formato vertical", "1 ajuste"],
    sobe: ["roteiro e gravação", "animações", "várias versões", "entrega urgente"],
  },
  {
    id: "texto", servico: "Texto de blog ou site", vaga: "Redação e revisão", min: 60, max: 200,
    base: "por texto", horas: [1.5, 4],
    inclui: ["pesquisa do tema", "texto original", "revisão ortográfica", "1 rodada de ajustes"],
    sobe: ["tema técnico", "otimização para buscas (SEO)", "entrevistas", "mais de 800 palavras"],
  },
  {
    id: "site", servico: "Site institucional", vaga: "Sites e sistemas", min: 600, max: 2500,
    base: "por projeto", horas: [20, 70],
    inclui: ["layout responsivo", "até 5 páginas", "formulário de contato", "publicação no ar"],
    sobe: ["loja virtual", "painel de edição", "mais páginas", "textos e imagens por sua conta"],
  },
  {
    id: "ilustracao", servico: "Ilustração", vaga: "Ilustração", min: 100, max: 400,
    base: "por peça", horas: [3, 10],
    inclui: ["esboço aprovado antes", "arte final em alta", "1 rodada de ajustes", "arquivo para web e impressão"],
    sobe: ["uso comercial amplo", "muitos personagens", "fundo elaborado", "prazo curto"],
  },
];

export const NIVEIS = [
  { id: "comeco", rotulo: "Estou começando", detalhe: "poucos trabalhos no portfólio", fator: 0.8 },
  { id: "meio", rotulo: "Já tenho alguns trabalhos", detalhe: "portfólio com 3 ou mais obras", fator: 1 },
  { id: "pro", rotulo: "Tenho experiência", detalhe: "estágio, freelas pagos ou clientes recorrentes", fator: 1.3 },
] as const;

export const TAMANHOS = [
  { id: "simples", rotulo: "Simples", fator: 0.7 },
  { id: "medio", rotulo: "Médio", fator: 1 },
  { id: "grande", rotulo: "Grande", fator: 1.5 },
] as const;

export const brl = (n: number) =>
  "R$ " + Math.round(n).toLocaleString("pt-BR");

/** Arredonda para cima de 10 em 10, para o valor parecer uma proposta e não uma conta. */
export const redondo = (n: number) => Math.max(10, Math.round(n / 10) * 10);

export const NEGOCIACAO = [
  { titulo: "Nunca diga só o preço", texto: "Diga o que está incluso: quantas propostas, quantos ajustes e a data de entrega. Isso evita o cliente pedir mais pelo mesmo valor." },
  { titulo: "Peça sinal de 30% a 50%", texto: "Você começa com parte paga e o cliente se compromete. O restante vai na entrega final." },
  { titulo: "Se pedirem desconto, tire escopo", texto: "Em vez de baixar o valor, ofereça menos: um ajuste a menos, menos peças ou prazo maior." },
  { titulo: "Cobrar pouco demais afasta", texto: "Quem paga muito abaixo do mercado costuma pedir mais. Prefira o meio da faixa e justifique com o portfólio." },
  { titulo: "Primeiro trabalho por indicação", texto: "Vale um preço de estreia, com depoimento em troca. Combine isso por escrito e uma única vez." },
];
