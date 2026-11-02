/**
 * Dados do guia "Quanto cobrar". Os valores são estimativas de referência para quem está
 * começando (estudantes da região de Bauru), não uma tabela oficial. As vagas usadas como
 * exemplo vêm do mural de oportunidades do próprio Fólium.
 */
export type ServicoPreco = {
  id: string;
  servico: string;
  area: string;
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

type Linha = [servico: string, min: number, max: number, base: string, horas: [number, number], inclui: string[], sobe: string[]];

const AREAS: { area: string; itens: Linha[] }[] = [
  { area: "Design e artes", itens: [
    ["Identidade visual", 300, 1200, "por projeto", [12, 40], ["2 a 3 propostas de logo", "paleta e tipografia", "arquivos finais (PNG, PDF e vetor)", "2 rodadas de ajustes"], ["manual de marca completo", "papelaria e cardápio", "prazo curto", "uso comercial em grande escala"]],
    ["Design gráfico", 80, 400, "por peça ou kit", [3, 12], ["arte para redes, cartaz ou folder", "arquivos para web e impressão", "1 a 2 ajustes"], ["muitas peças", "impressão acompanhada", "prazo curto"]],
    ["Design editorial", 300, 1500, "por projeto", [15, 50], ["diagramação de miolo", "capa", "arquivos prontos para gráfica", "2 rodadas de ajustes"], ["muitas páginas", "tratamento de imagens", "e-book interativo"]],
    ["Ilustração", 100, 400, "por peça", [3, 10], ["esboço aprovado antes", "arte final em alta", "1 rodada de ajustes", "arquivo para web e impressão"], ["uso comercial amplo", "muitos personagens", "fundo elaborado", "prazo curto"]],
    ["UX/UI design", 500, 2500, "por projeto", [20, 60], ["pesquisa rápida e fluxo de telas", "protótipo no Figma", "guia de componentes", "1 rodada de ajustes"], ["muitas telas", "teste com usuários", "design system completo"]],
    ["Design de embalagem", 300, 1200, "por projeto", [10, 35], ["arte da embalagem", "planificação para gráfica", "mockup de apresentação"], ["várias versões", "acompanhamento de impressão", "rótulos regulamentados"]],
    ["Modelagem 3D", 150, 800, "por modelo", [5, 25], ["modelo 3D e texturas", "renders ou arquivo para impressão 3D", "1 rodada de ajustes"], ["alto nível de detalhe", "animação", "uso em jogo ou comercial"]],
    ["Moda e figurino", 100, 600, "por peça ou projeto", [5, 25], ["croqui", "ficha técnica", "pesquisa de referências"], ["confecção da peça", "modelagem", "prova e ajustes"]],
  ] },
  { area: "Foto, vídeo e áudio", itens: [
    ["Fotografia", 150, 800, "por ensaio ou evento", [3, 14], ["fotos tratadas em alta", "ajuste de cor", "entrega em 3 a 7 dias"], ["deslocamento", "produção de cenário", "muitos itens", "direito de uso em anúncio"]],
    ["Vídeo e edição", 80, 800, "por vídeo ou evento", [2, 14], ["edição com cortes e legenda", "trilha livre de direitos", "correção de cor", "1 ajuste"], ["captação no local", "roteiro", "animações", "entrega urgente"]],
    ["Motion design e animação", 150, 900, "por vídeo", [6, 30], ["animação de logo ou texto", "arquivo em vídeo", "1 rodada de ajustes"], ["personagens", "narração", "mais de 30 segundos"]],
    ["Locução e podcast", 60, 400, "por gravação ou episódio", [2, 10], ["gravação e limpeza de áudio", "edição básica", "arquivo final"], ["mixagem e trilha", "vários locutores", "roteiro"]],
    ["Produção musical", 150, 900, "por faixa", [8, 30], ["arranjo e gravação", "mixagem simples", "arquivo final"], ["masterização", "músicos extras", "direitos de uso"]],
  ] },
  { area: "Comunicação e marketing", itens: [
    ["Social media", 400, 1000, "por mês, 8 a 12 posts", [16, 40], ["planejamento do mês", "arte e legenda de cada post", "stories", "relatório simples"], ["gravação de vídeos", "atendimento de comentários", "mais de 12 posts"]],
    ["Marketing digital e tráfego pago", 400, 1500, "por mês", [12, 40], ["configuração das campanhas", "otimização semanal", "relatório mensal"], ["mais plataformas", "criação de páginas", "verba alta de anúncio"]],
    ["Redação e revisão", 60, 300, "por texto", [1.5, 6], ["pesquisa do tema", "texto original", "revisão ortográfica", "1 rodada de ajustes"], ["tema técnico", "SEO", "entrevistas", "mais de 800 palavras"]],
    ["Assessoria de imprensa", 400, 1500, "por mês", [12, 35], ["releases", "contato com veículos", "clipping mensal"], ["gestão de crise", "eventos", "muitos veículos"]],
    ["Roteiro", 100, 600, "por roteiro", [4, 20], ["roteiro completo", "1 rodada de ajustes", "pesquisa de referências"], ["duração longa", "vários episódios", "direitos de adaptação"]],
    ["Tradução", 40, 250, "por página ou texto", [1, 5], ["tradução fiel", "revisão final", "glossário simples"], ["texto técnico", "prazo curto", "legendagem"]],
    ["Organização de eventos", 300, 1500, "por evento", [10, 40], ["planejamento e cronograma", "contato com fornecedores", "coordenação no dia"], ["muitos convidados", "equipe extra", "cerimonial completo"]],
  ] },
  { area: "Tecnologia", itens: [
    ["Sites e sistemas", 600, 2500, "por projeto", [20, 70], ["layout responsivo", "até 5 páginas", "formulário de contato", "publicação no ar"], ["loja virtual", "painel de edição", "mais páginas", "integrações"]],
    ["Aplicativos", 1000, 5000, "por projeto", [40, 150], ["telas principais", "funcionamento básico", "publicação na loja"], ["login e banco de dados", "notificações", "iOS e Android"]],
    ["Automação e planilhas", 100, 800, "por projeto", [3, 20], ["planilha ou script sob medida", "explicação de uso", "1 ajuste"], ["integração com outros sistemas", "painéis e relatórios", "treinamento"]],
    ["Análise de dados", 200, 1200, "por projeto", [8, 30], ["limpeza dos dados", "análise e gráficos", "relatório com conclusões"], ["muitos dados", "painel interativo", "apresentação"]],
    ["Suporte e manutenção de computadores", 50, 250, "por atendimento", [1, 4], ["diagnóstico", "limpeza e ajustes", "instalação de programas"], ["troca de peças", "recuperação de dados", "atendimento no local"]],
    ["Jogos digitais", 500, 3000, "por projeto", [30, 120], ["protótipo jogável", "arte básica", "build para teste"], ["mais fases", "arte original", "publicação"]],
  ] },
  { area: "Arquitetura e engenharia", itens: [
    ["Projeto de interiores", 400, 2500, "por ambiente", [12, 50], ["levantamento do local", "layout e paleta", "imagens de apresentação"], ["detalhamento", "acompanhamento de obra", "mobiliário sob medida"]],
    ["Projeto arquitetônico", 800, 4000, "por projeto", [25, 100], ["estudo preliminar", "plantas e cortes", "1 rodada de ajustes"], ["aprovação na prefeitura", "projeto complementar", "área grande"]],
    ["Maquete e renderização", 150, 900, "por cena", [5, 25], ["modelo 3D", "imagens renderizadas", "1 rodada de ajustes"], ["vídeo ou tour", "muitos ambientes", "alta resolução"]],
    ["Desenho técnico (CAD)", 80, 600, "por desenho", [3, 20], ["desenho em escala", "arquivo DWG e PDF", "1 ajuste"], ["muitas pranchas", "levantamento no local", "prazo curto"]],
  ] },
  { area: "Negócios", itens: [
    ["Plano de negócios", 300, 1500, "por plano", [12, 40], ["análise de mercado", "plano financeiro simples", "documento final"], ["apresentação para investidores", "projeções detalhadas"]],
    ["Pesquisa de mercado", 200, 1200, "por pesquisa", [8, 30], ["questionário", "coleta e análise", "relatório com conclusões"], ["amostra grande", "entrevistas", "apresentação"]],
    ["Consultoria financeira e contábil", 100, 800, "por projeto ou mês", [3, 20], ["organização de planilhas", "fluxo de caixa", "orientações"], ["declarações", "acompanhamento mensal"]],
    ["Gestão de redes e atendimento", 300, 900, "por mês", [15, 40], ["respostas e moderação", "relatório mensal", "horário combinado"], ["atendimento em mais canais", "fins de semana"]],
  ] },
  { area: "Educação", itens: [
    ["Aulas particulares e reforço", 30, 80, "por hora", [1, 1], ["plano da aula", "material de apoio", "acompanhamento do aluno"], ["pacote mensal", "prova ou vestibular", "aula em grupo"]],
    ["Aulas de idiomas", 35, 90, "por hora", [1, 1], ["plano da aula", "material de apoio", "prática de conversação"], ["preparação para prova", "aulas em grupo"]],
    ["Aulas de música", 40, 100, "por hora", [1, 1], ["plano da aula", "partituras ou cifras", "acompanhamento"], ["instrumento levado até o aluno", "aula em grupo"]],
  ] },
];

const slug = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const SERVICOS_PRECO: ServicoPreco[] = AREAS.flatMap((g) =>
  g.itens.map(([servico, min, max, base, horas, inclui, sobe]) => ({
    id: slug(servico), servico, area: g.area, vaga: servico, min, max, base, horas, inclui, sobe,
  })),
);

/** Agrupado por área, no formato do Seletor. */
export const GRUPOS_PRECO = AREAS.map((g) => ({
  titulo: g.area,
  opcoes: g.itens.map(([servico]) => ({ valor: slug(servico), rotulo: servico })),
}));

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
