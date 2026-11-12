// Conteúdo institucional e dados de exemplo das páginas novas.
// Textos de missão, visão, valores e parcerias vêm do Canvas do plano de negócio.

export const MISSAO =
  "Conectar universitários talentosos a oportunidades reais, transformando portfólios em pontes entre quem busca talento e quem busca crescer.";

export const VISAO =
  "Ser um espaço seguro de vitrine e reconhecimento para universitários, com a ambição de, a longo prazo, ser referência em outros centros universitários da região.";

export const VALORES = [
  { titulo: "Responsabilidade", texto: "com o futuro dos jovens." },
  { titulo: "Credibilidade", texto: "nas conexões que criamos." },
  { titulo: "Impacto social", texto: "como compromisso de cada conexão." },
];

export const PARCEIROS_ATUAIS = [
  { nome: "UNISAGRADO", papel: "Apoio institucional e acesso aos alunos" },
  { nome: "Claude (Anthropic)", papel: "Suporte técnico no desenvolvimento da plataforma" },
];

export const EXPANSAO = ["UNESP", "FIB", "ITE", "UNIP", "FACOP", "USP", "UNINOVE", "FATEC"];

export const EQUIPE = ["Giovana Buscariolo de Lima", "Eduarda Ferreira Corrêa", "Lauren Zareski de Oliveira"];

/** Comparação com as alternativas que o aluno e o contratante usam hoje. */
export const COMPARACAO = [
  { nome: "LinkedIn", forte: "Rede enorme e conhecida", fraco: "Genérico, sem portfólio visual; quem não tem experiência some" },
  { nome: "Start Carreiras", forte: "Muitas empresas e estudantes", fraco: "Foco em estágio e trainee, sem vínculo com a faculdade local" },
  { nome: "CIEE", forte: "Presente em quase todas as faculdades de Bauru", fraco: "Só estágio formal e processo burocrático" },
  { nome: "Workana, 99Freelas, Fiverr", forte: "Muitos pedidos de freela", fraco: "Público geral, sem curadoria nem selo de instituição" },
  { nome: "Grupos de WhatsApp e Instagram", forte: "Rápido e gratuito", fraco: "Desorganizado, sem segurança e com risco de golpe" },
];

export type Oportunidade = {
  id: string;
  titulo: string;
  empresa: string;
  tipo: "Freela" | "Estágio" | "Projeto";
  servico: string;
  cidade: string;
  orcamento: string;
  prazo: string;
  descricao: string;
  publicadaHa: string;
  /** Contato da empresa (só nas vagas reais, aprovadas pela equipe). */
  contato?: string;
  /** Verdadeiro para vagas que vêm do banco. */
  real?: boolean;
  /** Vaga em destaque no topo do mural (contratante Premium). */
  destaque?: boolean;
};

export const OPORTUNIDADES: Oportunidade[] = [
  {
    id: "logo-hamburgueria",
    titulo: "Logo e cardápio para hamburgueria",
    empresa: "Brasa Burger",
    tipo: "Freela",
    servico: "Identidade visual",
    cidade: "Bauru, SP",
    orcamento: "R$ 600 a R$ 900",
    prazo: "3 semanas",
    descricao: "Precisamos de logo, paleta e cardápio impresso e digital para a abertura em dezembro.",
    publicadaHa: "há 2 dias",
  },
  {
    id: "fotos-produtos",
    titulo: "Fotos de produto para loja online",
    empresa: "Ateliê Ramos",
    tipo: "Freela",
    servico: "Fotografia",
    cidade: "Bauru, SP",
    orcamento: "R$ 300",
    prazo: "1 semana",
    descricao: "Ensaio de 20 peças de bijuteria com fundo neutro, para Instagram e loja virtual.",
    publicadaHa: "há 3 dias",
  },
  {
    id: "social-clinica",
    titulo: "Social media para clínica veterinária",
    empresa: "Clínica Pata Amiga",
    tipo: "Projeto",
    servico: "Social media",
    cidade: "Agudos, SP",
    orcamento: "R$ 500 por mês",
    prazo: "3 meses",
    descricao: "Planejamento e criação de 12 posts por mês, com legenda e stories.",
    publicadaHa: "há 5 dias",
  },
  {
    id: "estagio-redacao",
    titulo: "Estágio em redação e assessoria",
    empresa: "Agência Ponte",
    tipo: "Estágio",
    servico: "Redação e revisão",
    cidade: "Bauru, SP",
    orcamento: "Bolsa de R$ 1.100",
    prazo: "6 meses",
    descricao: "Apoio na produção de releases, textos de site e newsletter de clientes locais.",
    publicadaHa: "há 1 semana",
  },
  {
    id: "site-escola",
    titulo: "Site para escola de idiomas",
    empresa: "Fala Bauru Idiomas",
    tipo: "Freela",
    servico: "Sites e sistemas",
    cidade: "Bauru, SP",
    orcamento: "R$ 1.200",
    prazo: "1 mês",
    descricao: "Site institucional com páginas de cursos, formulário de matrícula e blog.",
    publicadaHa: "há 1 semana",
  },
  {
    id: "video-evento",
    titulo: "Vídeo de cobertura de evento",
    empresa: "Associação Comercial",
    tipo: "Freela",
    servico: "Vídeo e edição",
    cidade: "Lençóis Paulista, SP",
    orcamento: "R$ 450",
    prazo: "Evento em 22/11",
    descricao: "Captação e edição de um vídeo de 1 minuto e 3 reels do evento de fim de ano.",
    publicadaHa: "há 2 semanas",
  },
];

/** Faixas de preço de referência para quem está começando. Valores aproximados para orientar, não tabela oficial. */
export const PRECOS = [
  { servico: "Identidade visual (logo + paleta)", faixa: "R$ 300 a R$ 1.200", base: "por projeto" },
  { servico: "Social media", faixa: "R$ 400 a R$ 1.000", base: "por mês, 8 a 12 posts" },
  { servico: "Fotografia de produto", faixa: "R$ 150 a R$ 500", base: "por ensaio" },
  { servico: "Cobertura de evento", faixa: "R$ 300 a R$ 800", base: "por evento" },
  { servico: "Vídeo curto (reels)", faixa: "R$ 80 a R$ 250", base: "por vídeo" },
  { servico: "Texto de blog ou site", faixa: "R$ 60 a R$ 200", base: "por texto" },
  { servico: "Site institucional", faixa: "R$ 600 a R$ 2.500", base: "por projeto" },
  { servico: "Ilustração", faixa: "R$ 100 a R$ 400", base: "por peça" },
];

export const DICAS_SEGURANCA = [
  { titulo: "Combine tudo por escrito", texto: "Escopo, prazo, valor e número de alterações. Uma mensagem de WhatsApp confirmando já ajuda." },
  { titulo: "Peça um sinal", texto: "O comum é 30% a 50% antes de começar e o restante na entrega." },
  { titulo: "Entregue com marca d'água", texto: "Mande prévias em baixa resolução ou com marca d'água até receber o pagamento final." },
  { titulo: "Nunca pague para trabalhar", texto: "Ninguém sério cobra taxa de cadastro, teste ou material. Se pedirem, denuncie." },
  { titulo: "Desconfie de pressa e preço alto demais", texto: "Proposta boa demais, urgente e sem detalhes costuma ser golpe." },
  { titulo: "Denuncie", texto: "Use o botão de denúncia no perfil ou na vaga. A equipe do Fólium analisa cada caso." },
];

export const DEPOIMENTOS = [
  { texto: "Achei uma fotógrafa da UNISAGRADO em dois dias. O selo me deu segurança para fechar.", autor: "Marina, dona do Ateliê Ramos" },
  { texto: "Meu primeiro freela pago veio daqui. O guia de preços me ajudou a não cobrar barato demais.", autor: "Aluna de Publicidade, 5º semestre" },
  { texto: "Prefiro contratar gente da região, e aqui eu vejo o trabalho antes de conversar.", autor: "Carlos, Agência Ponte" },
];

/**
 * Planos por tipo de conta. Preços sugeridos para validar com alunos e empresas; ainda não são definitivos.
 * O que cada plano libera de verdade no site está em RECURSOS (lib/conta.ts).
 */
export type Plano = {
  tipo: "colaborador" | "contratante" | "instituicao";
  plano: "gratis" | "premium" | "licenca";
  nome: string;
  preco: string;
  /** Frase curta com o principal motivo de escolher o plano. */
  lema: string;
  /** Linha pequena logo abaixo do preço (comparação, equivalência). */
  nota?: string;
  destaque?: boolean;
  itens: string[];
  /** Itens que ainda vão chegar. */
  emBreve?: string[];
};

export const PLANOS: Plano[] = [
  {
    tipo: "colaborador",
    plano: "gratis",
    nome: "Colaborador Grátis",
    preco: "R$ 0",
    lema: "Monte seu portfólio e comece a ser encontrado, sem pagar nada.",
    itens: [
      "Portfólio com até 6 trabalhos",
      "Link próprio para mandar a clientes, com opção de link público",
      "Selo de aluno verificado pela UNISAGRADO",
      "Mural de oportunidades e botão Tenho interesse",
      "Guia de quanto cobrar, com calculadora",
      "Combinados por escrito e avaliações de quem te contratou",
      "Visitas ao portfólio no último mês",
    ],
  },
  {
    tipo: "colaborador",
    plano: "premium",
    nome: "Colaborador Premium",
    preco: "R$ 9,90/mês",
    nota: "Cerca de R$ 0,33 por dia. Planos pagos de outras plataformas de freela e carreira começam entre R$ 29 e R$ 40 por mês.",
    lema: "Mostre tudo o que você já fez e fique por dentro das melhores oportunidades.",
    destaque: true,
    itens: [
      "Tudo do plano grátis",
      "Mais trabalhos no portfólio, sem o limite de 6",
      "Jornal do Fólium da semana: vagas, quanto cobrar e matérias para quem está começando",
      "Chance de ser o perfil da semana no jornal",
      "Estatísticas completas: visitas de contratantes e quantos te salvaram",
    ],
    emBreve: ["Perfil em destaque nas buscas"],
  },
  {
    tipo: "contratante",
    plano: "gratis",
    nome: "Contratante Grátis",
    preco: "R$ 0",
    lema: "Veja os trabalhos antes de conversar e fale direto com o aluno.",
    itens: [
      "Todos os portfólios, com contato direto",
      "Vagas no mural sem limite, por enquanto",
      "Painel para acompanhar suas vagas e quem se interessou",
      "Convide alunos para suas vagas e feche combinados por escrito",
      "Alunos com e-mail institucional verificado",
    ],
  },
  {
    tipo: "contratante",
    plano: "premium",
    nome: "Contratante Premium",
    preco: "R$ 49/mês",
    nota: "Valor fixo, sem comissão sobre o que você combinar com o aluno. Plataformas de freela costumam ficar com 5% a 20% de cada projeto: em um trabalho de R$ 1.500, isso são de R$ 75 a R$ 300.",
    lema: "Contrate mais rápido: sua vaga no topo e os melhores talentos guardados.",
    destaque: true,
    itens: [
      "Tudo do plano grátis",
      "Vagas ilimitadas, com destaque no topo do mural",
      "Lista de talentos salvos para chamar quando precisar",
      "Jornal do Fólium da semana: talentos em alta, recém-chegados e quanto pagar",
    ],
  },
  {
    tipo: "instituicao",
    plano: "licenca",
    nome: "Licença institucional",
    preco: "Sob consulta",
    lema: "Uma vitrine oficial para mostrar o talento dos seus alunos.",
    itens: ["Painel com dados dos alunos", "Selo oficial da instituição", "Vitrine para eventos e extensão"],
  },
];

export type Avaliacao = {
  nota: number; texto: string; autor: string; /** Linha abaixo do nome. */ selo?: string;
  /** Notas por critério (avaliações reais depois de 12/11/2026). */
  criterios?: Record<string, number> | null;
  /** Direito de resposta de quem recebeu. */
  resposta?: string;
};

const AVALIACOES: Avaliacao[] = [
  { nota: 5, texto: "Entregou antes do prazo e explicou cada escolha. Contrataria de novo.", autor: "Padaria Sol" },
  { nota: 5, texto: "Muito profissional, ouviu o que a gente queria e fez melhor.", autor: "Loja Ponto Doce" },
  { nota: 4, texto: "Trabalho ótimo. Precisou de um ajuste a mais, mas resolveu rápido.", autor: "Clínica Vida" },
  { nota: 5, texto: "Comunicação fácil pelo WhatsApp e resultado acima do esperado.", autor: "Ateliê Lume" },
  { nota: 5, texto: "Ficamos com material para o ano inteiro. Recomendo.", autor: "Festival Sabores" },
];

/** Duas avaliações de exemplo por aluno, escolhidas a partir do slug. */
export function avaliacoesDe(slug: string): Avaliacao[] {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return [AVALIACOES[h % AVALIACOES.length]!, AVALIACOES[(h + 2) % AVALIACOES.length]!];
}
