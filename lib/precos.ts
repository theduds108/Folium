/**
 * Dados do guia "Quanto cobrar".
 *
 * De onde vêm os valores (pesquisa de nov/2026, detalhes em docs/precos-fontes-de-mercado.md):
 * - "mercado": faixa ajustada a partir de preços publicados para o serviço (Cronoshare, que reúne
 *   orçamentos de profissionais do Brasil todo; Superprof, média dos professores de Bauru).
 *   Esses números são de profissionais formados, então a faixa do Fólium fica na parte de baixo deles.
 * - "hora": não há preço publicado do serviço; a faixa é horas típicas × R$ 30 a 60 por hora, que é a
 *   hora de quem está começando (dev júnior no Brasil cobra R$ 40 a 80/h, segundo a jobrise, mai/2026).
 * - "estimativa": sem dado público confiável; valor escrito pelo Fólium, marcado assim na tela.
 * As vagas usadas como exemplo vêm do mural de oportunidades do próprio Fólium.
 */
export type TipoFonte = "mercado" | "hora" | "estimativa";

export type Fonte = {
  tipo: TipoFonte;
  /** Quem publicou o número, curto, para a tela. */
  nome?: string;
  /** Mês em que a fonte publicou ou atualizou o valor. */
  data?: string;
  /** O que a fonte diz, em uma frase, para quem quer conferir. */
  nota?: string;
};

/** Quando a pesquisa das fontes foi feita. */
/** Hora de quem está começando, usada nos serviços sem preço publicado (tipo "hora"). */
export const HORA_INICIANTE: [number, number] = [30, 60];

export const CONSULTADO_EM = "nov/2026";

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
  fonte: Fonte;
};

type Linha = [servico: string, min: number, max: number, base: string, horas: [number, number], inclui: string[], sobe: string[]];

const AREAS: { area: string; itens: Linha[] }[] = [
  { area: "Design e artes", itens: [
    ["Identidade visual", 400, 1500, "por projeto", [12, 40], ["2 a 3 propostas de logo", "paleta e tipografia", "arquivos finais (PNG, PDF e vetor)", "2 rodadas de ajustes"], ["manual de marca completo", "papelaria e cardápio", "prazo curto", "uso comercial em grande escala"]],
    ["Design gráfico", 100, 450, "por peça ou kit", [3, 12], ["arte para redes, cartaz ou folder", "arquivos para web e impressão", "1 a 2 ajustes"], ["muitas peças", "impressão acompanhada", "prazo curto"]],
    ["Design editorial", 450, 3000, "por projeto", [15, 50], ["diagramação de miolo", "capa", "arquivos prontos para gráfica", "2 rodadas de ajustes"], ["muitas páginas", "tratamento de imagens", "e-book interativo"]],
    ["Ilustração", 150, 500, "por peça", [3, 10], ["esboço aprovado antes", "arte final em alta", "1 rodada de ajustes", "arquivo para web e impressão"], ["uso comercial amplo", "muitos personagens", "fundo elaborado", "prazo curto"]],
    ["UX/UI design", 600, 2500, "por projeto", [20, 60], ["pesquisa rápida e fluxo de telas", "protótipo no Figma", "guia de componentes", "1 rodada de ajustes"], ["muitas telas", "teste com usuários", "design system completo"]],
    ["Design de embalagem", 300, 1200, "por projeto", [10, 35], ["arte da embalagem", "planificação para gráfica", "mockup de apresentação"], ["várias versões", "acompanhamento de impressão", "rótulos regulamentados"]],
    ["Modelagem 3D", 150, 1500, "por modelo", [5, 25], ["modelo 3D e texturas", "renders ou arquivo para impressão 3D", "1 rodada de ajustes"], ["alto nível de detalhe", "animação", "uso em jogo ou comercial"]],
    ["Moda e figurino", 100, 600, "por peça ou projeto", [5, 25], ["croqui", "ficha técnica", "pesquisa de referências"], ["confecção da peça", "modelagem", "prova e ajustes"]],
  ] },
  { area: "Foto, vídeo e áudio", itens: [
    ["Fotografia", 200, 900, "por ensaio ou evento", [3, 14], ["fotos tratadas em alta", "ajuste de cor", "entrega em 3 a 7 dias"], ["deslocamento", "produção de cenário", "muitos itens", "direito de uso em anúncio"]],
    ["Vídeo e edição", 100, 900, "por vídeo ou evento", [2, 14], ["edição com cortes e legenda", "trilha livre de direitos", "correção de cor", "1 ajuste"], ["captação no local", "roteiro", "animações", "entrega urgente"]],
    ["Motion design e animação", 180, 1800, "por vídeo", [6, 30], ["animação de logo ou texto", "arquivo em vídeo", "1 rodada de ajustes"], ["personagens", "narração", "mais de 30 segundos"]],
    ["Locução e podcast", 60, 400, "por gravação ou episódio", [2, 10], ["gravação e limpeza de áudio", "edição básica", "arquivo final"], ["mixagem e trilha", "vários locutores", "roteiro"]],
    ["Produção musical", 150, 900, "por faixa", [8, 30], ["arranjo e gravação", "mixagem simples", "arquivo final"], ["masterização", "músicos extras", "direitos de uso"]],
  ] },
  { area: "Comunicação e marketing", itens: [
    ["Social media", 500, 1200, "por mês, 8 a 12 posts", [16, 40], ["planejamento do mês", "arte e legenda de cada post", "stories", "relatório simples"], ["gravação de vídeos", "atendimento de comentários", "mais de 12 posts"]],
    ["Marketing digital e tráfego pago", 400, 1500, "por mês", [12, 40], ["configuração das campanhas", "otimização semanal", "relatório mensal"], ["mais plataformas", "criação de páginas", "verba alta de anúncio"]],
    ["Redação e revisão", 40, 360, "por texto", [1.5, 6], ["pesquisa do tema", "texto original", "revisão ortográfica", "1 rodada de ajustes"], ["tema técnico", "SEO", "entrevistas", "mais de 800 palavras"]],
    ["Assessoria de imprensa", 600, 2000, "por mês", [12, 35], ["releases", "contato com veículos", "clipping mensal"], ["gestão de crise", "eventos", "muitos veículos"]],
    ["Roteiro", 120, 1200, "por roteiro", [4, 20], ["roteiro completo", "1 rodada de ajustes", "pesquisa de referências"], ["duração longa", "vários episódios", "direitos de adaptação"]],
    ["Tradução", 30, 70, "por página (até 250 palavras)", [0.8, 1.5], ["tradução fiel", "revisão final", "glossário simples"], ["texto técnico", "prazo curto", "legendagem"]],
    ["Organização de eventos", 300, 1500, "por evento", [10, 40], ["planejamento e cronograma", "contato com fornecedores", "coordenação no dia"], ["muitos convidados", "equipe extra", "cerimonial completo"]],
  ] },
  { area: "Tecnologia", itens: [
    ["Sites e sistemas", 500, 2500, "por projeto", [20, 70], ["layout responsivo", "até 5 páginas", "formulário de contato", "publicação no ar"], ["painel de edição", "mais páginas", "integrações", "prazo curto"]],
    ["Landing page", 400, 1500, "por página", [8, 30], ["uma página responsiva", "formulário ou botão de WhatsApp", "textos e imagens fornecidos pelo cliente", "publicação no ar"], ["redação dos textos", "pixel e métricas", "animações", "domínio e hospedagem configurados"]],
    ["Loja virtual", 1000, 3500, "por loja", [15, 50], ["loja em plataforma pronta (Nuvemshop, WooCommerce)", "cadastro de até 20 produtos", "meios de pagamento e frete", "treinamento de uso"], ["mais produtos", "layout exclusivo", "integração com estoque", "marketplaces"]],
    ["Manutenção de sites", 100, 400, "por mês", [3, 8], ["correções e pequenas mudanças", "atualização de plugins", "cópia de segurança"], ["mais páginas", "suporte com prazo de resposta", "mudanças de layout"]],
    ["Aplicativos", 1500, 6000, "por projeto", [40, 150], ["telas principais", "funcionamento básico", "publicação na loja"], ["login e banco de dados", "notificações", "iOS e Android"]],
    ["Banco de dados e APIs", 300, 2400, "por projeto", [10, 40], ["modelagem das tabelas", "API para as telas ou o app", "documentação básica"], ["muitas integrações", "regras de segurança", "volume alto de dados"]],
    ["Chatbot e atendimento automático", 240, 1800, "por projeto", [8, 30], ["fluxo de perguntas e respostas", "configuração no WhatsApp ou site", "treinamento de uso"], ["integração com sistema", "inteligência artificial", "vários canais"]],
    ["Automação e planilhas", 90, 1200, "por projeto", [3, 20], ["planilha ou script sob medida", "explicação de uso", "1 ajuste"], ["integração com outros sistemas", "painéis e relatórios", "treinamento"]],
    ["Análise de dados", 240, 1800, "por projeto", [8, 30], ["limpeza dos dados", "análise e gráficos", "relatório com conclusões"], ["muitos dados", "painel interativo", "apresentação"]],
    ["Dashboards e BI", 240, 1800, "por painel", [8, 30], ["conexão com a planilha ou banco", "painel no Power BI ou Looker Studio", "indicadores combinados", "1 rodada de ajustes"], ["muitas fontes de dados", "atualização automática", "treinamento da equipe"]],
    ["SEO e desempenho de sites", 250, 1200, "por projeto", [6, 25], ["diagnóstico do site", "ajustes de títulos, textos e velocidade", "relatório com o antes e depois"], ["pesquisa de palavras-chave", "mais páginas", "acompanhamento mensal"]],
    ["Testes e qualidade de software", 150, 1500, "por projeto", [5, 25], ["roteiro de testes", "relatório dos erros encontrados", "nova rodada após correções"], ["testes automatizados", "vários dispositivos", "acompanhamento contínuo"]],
    ["Segurança e LGPD básica", 300, 1000, "por checagem", [4, 20], ["checklist de segurança", "revisão de senhas e acessos", "orientações para a LGPD"], ["política de privacidade completa", "treinamento da equipe", "acompanhamento"]],
    ["Domínio, e-mail e hospedagem", 30, 360, "por configuração", [1, 6], ["registro e configuração do domínio", "e-mails profissionais", "publicação do site"], ["migração de outro servidor", "muitas contas de e-mail", "atendimento no local"]],
    ["Suporte e manutenção de computadores", 60, 150, "por atendimento", [1, 4], ["diagnóstico", "limpeza e ajustes", "instalação de programas"], ["troca de peças", "recuperação de dados", "atendimento no local"]],
    ["Jogos digitais", 900, 7200, "por projeto", [30, 120], ["protótipo jogável", "arte básica", "build para teste"], ["mais fases", "arte original", "publicação"]],
  ] },
  { area: "Arquitetura e engenharia", itens: [
    ["Projeto de interiores", 500, 2000, "por ambiente", [12, 50], ["levantamento do local", "layout e paleta", "imagens de apresentação"], ["detalhamento", "acompanhamento de obra", "mobiliário sob medida"]],
    ["Projeto arquitetônico", 800, 4000, "por projeto", [25, 100], ["estudo preliminar", "plantas e cortes", "1 rodada de ajustes"], ["aprovação na prefeitura", "projeto complementar", "área grande"]],
    ["Maquete e renderização", 150, 1500, "por cena", [5, 25], ["modelo 3D", "imagens renderizadas", "1 rodada de ajustes"], ["vídeo ou tour", "muitos ambientes", "alta resolução"]],
    ["Desenho técnico (CAD)", 90, 1200, "por desenho", [3, 20], ["desenho em escala", "arquivo DWG e PDF", "1 ajuste"], ["muitas pranchas", "levantamento no local", "prazo curto"]],
  ] },
  { area: "Negócios", itens: [
    ["Plano de negócios", 300, 1500, "por plano", [12, 40], ["análise de mercado", "plano financeiro simples", "documento final"], ["apresentação para investidores", "projeções detalhadas"]],
    ["Pesquisa de mercado", 200, 1200, "por pesquisa", [8, 30], ["questionário", "coleta e análise", "relatório com conclusões"], ["amostra grande", "entrevistas", "apresentação"]],
    ["Consultoria financeira e contábil", 100, 800, "por projeto ou mês", [3, 20], ["organização de planilhas", "fluxo de caixa", "orientações"], ["declarações", "acompanhamento mensal"]],
    ["Gestão de redes e atendimento", 300, 900, "por mês", [15, 40], ["respostas e moderação", "relatório mensal", "horário combinado"], ["atendimento em mais canais", "fins de semana"]],
  ] },
  { area: "Educação", itens: [
    ["Aulas particulares e reforço", 30, 60, "por hora", [1, 1], ["plano da aula", "material de apoio", "acompanhamento do aluno"], ["pacote mensal", "prova ou vestibular", "aula em grupo"]],
    ["Aulas de idiomas", 35, 65, "por hora", [1, 1], ["plano da aula", "material de apoio", "prática de conversação"], ["preparação para prova", "aulas em grupo"]],
    ["Aulas de música", 40, 70, "por hora", [1, 1], ["plano da aula", "partituras ou cifras", "acompanhamento"], ["instrumento levado até o aluno", "aula em grupo"]],
  ] },
];


/** Fonte de cada faixa. Quem não está aqui é estimativa do Fólium. */
const FONTES: Record<string, Fonte> = {
  "Identidade visual": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Logo básico R$ 600 a 800; logo completo R$ 1.500 a 2.000; identidade completa de agência R$ 3.000 a 10.000." },
  "Design gráfico": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "fev/2026", nota: "Designer júnior cobra R$ 50 a 60 por hora; cartão de visita sai de R$ 100 a 500." },
  "Design editorial": { tipo: "hora" },
  "Ilustração": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Uma ilustração fica em torno de R$ 500; projeto completo até R$ 2.000." },
  "UX/UI design": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Não há preço só de UX/UI. O mais próximo é web design de empresa: R$ 2.000 a 6.000." },
  "Modelagem 3D": { tipo: "hora" },
  "Fotografia": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Fotógrafo cobra R$ 800 a 2.500 por trabalho, ou R$ 150 a 500 por hora." },
  "Vídeo e edição": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Só há preço de vídeo de casamento: R$ 1.200 a 3.000, com captação. Edição avulsa fica abaixo." },
  "Motion design e animação": { tipo: "hora" },
  "Social media": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Gestão de redes por agência: R$ 600 a 7.000 por mês, o comum a partir de R$ 1.500." },
  "Marketing digital e tráfego pago": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Gestão de tráfego pago: R$ 400 a 2.500 por mês, fora a verba dos anúncios." },
  "Redação e revisão": { tipo: "hora" },
  "Assessoria de imprensa": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Assessoria mensal R$ 2.500 a 10.000 (em São Paulo R$ 3.000 a 6.000); release avulso R$ 500 a 1.500." },
  "Roteiro": { tipo: "hora" },
  "Tradução": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Tradução juramentada sai por R$ 50 a 70 a página, ou R$ 0,15 a 0,18 a palavra. A comum, sem juramento, fica abaixo." },
  "Sites e sistemas": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Site simples R$ 400 a 2.000; site completo R$ 2.500 a 10.000." },
  "Landing page": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Landing page R$ 800 a 2.000 com profissional; a jobrise (mai/2026) cita R$ 1.500 a 4.000." },
  "Loja virtual": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Loja virtual a partir de R$ 1.000, o comum de R$ 1.500 a 15.000." },
  "Manutenção de sites": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Manutenção básica R$ 150 a 250 por mês; completa R$ 250 a 400." },
  "Aplicativos": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Aplicativo com empresa sai de R$ 15.000 a 30.000. Desenvolvedor remoto cobra a partir de R$ 30 por hora." },
  "Banco de dados e APIs": { tipo: "hora" },
  "Chatbot e atendimento automático": { tipo: "hora" },
  "Automação e planilhas": { tipo: "hora" },
  "Análise de dados": { tipo: "hora" },
  "Dashboards e BI": { tipo: "hora" },
  "SEO e desempenho de sites": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Consultor de SEO cobra R$ 30 a 55 por hora; projeto de R$ 2.000 a 8.000." },
  "Testes e qualidade de software": { tipo: "hora" },
  "Segurança e LGPD básica": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Auditoria de site a partir de R$ 500; adequação à LGPD de microempresa R$ 2.000 a 5.000." },
  "Domínio, e-mail e hospedagem": { tipo: "hora" },
  "Suporte e manutenção de computadores": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Formatação com programas sai em média R$ 110 (R$ 100 a 150); remoção de vírus R$ 80 a 100; visita em casa mais R$ 30." },
  "Jogos digitais": { tipo: "hora" },
  "Projeto de interiores": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Arquiteto cobra R$ 50 a 250 por m². Um quarto de 12 m² dá R$ 600 a 3.000." },
  "Projeto arquitetônico": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Projeto arquitetônico de R$ 2.300 a 6.900, ou R$ 20 a 80 por m². Para aprovar na prefeitura, precisa de arquiteto com registro no CAU." },
  "Maquete e renderização": { tipo: "hora" },
  "Desenho técnico (CAD)": { tipo: "hora" },
  "Consultoria financeira e contábil": { tipo: "mercado", nome: "Cronoshare, orçamentos de profissionais (média nacional)", data: "jan/2026", nota: "Contador para autônomo cobra R$ 300 a 450 por mês. Declarações e balanço exigem contador com registro no CRC." },
  "Aulas particulares e reforço": { tipo: "mercado", nome: "Superprof, média dos professores de Bauru", data: "out/2026", nota: "Matemática R$ 52/h e reforço escolar R$ 49/h em média, com 165 a 170 professores. Os perfis vão de R$ 20 a 100." },
  "Aulas de idiomas": { tipo: "mercado", nome: "Superprof, média dos professores de Bauru", data: "out/2026", nota: "Espanhol R$ 62/h em média, com 21 professores (perfis de R$ 45 a 100)." },
  "Aulas de música": { tipo: "mercado", nome: "Superprof, média dos professores de Bauru", data: "out/2026", nota: "Violão R$ 63/h, piano R$ 58/h e canto R$ 73/h em média, com 7 a 23 professores por instrumento." },
};

const slug = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const SERVICOS_PRECO: ServicoPreco[] = AREAS.flatMap((g) =>
  g.itens.map(([servico, min, max, base, horas, inclui, sobe]) => ({
    id: slug(servico), servico, area: g.area, vaga: servico, min, max, base, horas, inclui, sobe,
    fonte: FONTES[servico] ?? { tipo: "estimativa" },
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

/** Frase curta que diz de onde vem a faixa, para mostrar junto do valor. */
export function origemFaixa(f: Fonte): { titulo: string; detalhe: string } {
  if (f.tipo === "mercado")
    return {
      titulo: `Baseado em ${f.nome}, publicado em ${f.data}, consultado em ${CONSULTADO_EM}.`,
      detalhe: `${f.nota} A faixa do Fólium fica na parte de baixo, para quem está começando.`,
    };
  if (f.tipo === "hora")
    return {
      titulo: `Calculado pela hora: não achamos preço publicado deste serviço (consulta em ${CONSULTADO_EM}).`,
      detalhe: `A faixa é horas típicas × ${brl(HORA_INICIANTE[0])} a ${brl(HORA_INICIANTE[1])} por hora. Para comparar: dev júnior no Brasil cobra R$ 40 a 80/h (jobrise, mai/2026) e designer júnior R$ 50 a 60/h (Cronoshare, fev/2026).`,
    };
  return {
    titulo: `Estimativa do Fólium: não achamos dado público confiável deste serviço (consulta em ${CONSULTADO_EM}).`,
    detalhe: "Use como ponto de partida e compare com colegas da área e com as vagas do mural.",
  };
}

/** Quantos serviços têm cada tipo de fonte, para o resumo do guia. */
export const RESUMO_FONTES = {
  mercado: SERVICOS_PRECO.filter((s) => s.fonte.tipo === "mercado").length,
  hora: SERVICOS_PRECO.filter((s) => s.fonte.tipo === "hora").length,
  estimativa: SERVICOS_PRECO.filter((s) => s.fonte.tipo === "estimativa").length,
};

/** Texto curto sobre a origem das faixas, usado no topo do guia. */
export const SOBRE_AS_FAIXAS =
  `Faixas para quem está começando, ajustadas a partir de preços publicados (Cronoshare e, nas aulas, a média dos professores de Bauru no Superprof), consultados em ${CONSULTADO_EM}. ` +
  `${RESUMO_FONTES.mercado} serviços têm preço de mercado, ${RESUMO_FONTES.hora} são calculados pela hora de quem está começando e ${RESUMO_FONTES.estimativa} ainda são estimativas do Fólium. Cada serviço mostra de onde veio o número.`;
