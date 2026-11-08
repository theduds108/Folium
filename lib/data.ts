import { MOSTRAR_ALUNOS_EXEMPLO } from "@/lib/config";
import { bancoLigado } from "@/lib/supabase";
// Dados de exemplo. Quando o banco (Supabase) entrar, estas listas viram
// consultas ao banco, e o resto do código continua igual.

export type Trabalho = {
  titulo: string;
  tipo: string;
  descricao: string;
  /** Cor de fundo usada enquanto a imagem carrega (ou se não houver imagem). */
  cor: string;
  /** Imagem: id do Unsplash (demonstração) ou URL completa (enviada pelo aluno). */
  imagem?: string;
  /** Imagens extras do mesmo trabalho (até 4). */
  galeria?: string[];
  /** Para quem foi feito (empresa, cliente, disciplina). */
  cliente?: string;
  ano?: string;
  /** O que o aluno fez no trabalho, quando foi em grupo. */
  papel?: string;
  /** Link externo: Behance, site no ar, vídeo, matéria publicada. */
  link?: string;
};

export type Experiencia = {
  cargo: string;
  lugar: string;
  /** Texto pronto para mostrar, ex.: "Mar/2025 – atual". */
  periodo: string;
  descricao: string;
  /** Mês de início e fim no formato AAAA-MM (usados no editor). */
  inicio?: string;
  fim?: string;
  atual?: boolean;
};
export type Certificado = { nome: string; instituicao: string; ano: string; link?: string; /** PDF ou imagem do certificado enviado pelo aluno. */ arquivo?: string };
export type Idioma = { idioma: string; nivel: string };
export type Links = Partial<Record<(typeof REDES)[number]["chave"], string>>;

export type Aluno = {
  slug: string;
  nome: string;
  curso: string;
  semestre: number;
  cidade: string;
  bio: string;
  servicos: string[];
  habilidades: string[];
  valorReferencia: string;
  disponivel: boolean;
  /** Foto: id do Unsplash (demonstração) ou URL completa (enviada pelo aluno). */
  foto?: string;
  /** Verdadeiro para perfis que vêm do banco (não são exemplos). */
  real?: boolean;
  /** Título profissional curto, ex.: "Designer gráfica e ilustradora". */
  titulo?: string;
  /** Texto mais longo do "Sobre mim". */
  sobre?: string;
  /** Previsão de conclusão do curso, ex.: "Dez/2027". */
  conclusao?: string;
  modalidades?: string[];
  tiposVaga?: string[];
  links?: Links;
  experiencias?: Experiencia[];
  certificados?: Certificado[];
  idiomas?: Idioma[];
  /** Currículo em PDF (URL). */
  curriculo?: string;
  whatsapp: string;
  email: string;
  trabalhos: Trabalho[];
};

/** Cursos de graduação (bacharelado, licenciatura e tecnólogo). Quem não achar o seu escolhe "Outro". */
export const CURSOS = [
  "Administração",
  "Agronomia",
  "Análise e Desenvolvimento de Sistemas",
  "Arquitetura e Urbanismo",
  "Artes Visuais",
  "Biomedicina",
  "Ciência da Computação",
  "Ciências Biológicas",
  "Ciências Contábeis",
  "Ciências Econômicas",
  "Cinema e Audiovisual",
  "Design",
  "Design de Interiores",
  "Design de Moda",
  "Design Gráfico",
  "Direito",
  "Educação Física",
  "Enfermagem",
  "Engenharia Civil",
  "Engenharia de Computação",
  "Engenharia de Produção",
  "Engenharia de Software",
  "Engenharia Elétrica",
  "Engenharia Mecânica",
  "Engenharia Química",
  "Estética e Cosmética",
  "Farmácia",
  "Filosofia",
  "Fisioterapia",
  "Fonoaudiologia",
  "Fotografia",
  "Gastronomia",
  "Gestão Comercial",
  "Gestão de Recursos Humanos",
  "Gestão Financeira",
  "História",
  "Jogos Digitais",
  "Jornalismo",
  "Letras",
  "Marketing",
  "Matemática",
  "Medicina",
  "Medicina Veterinária",
  "Música",
  "Nutrição",
  "Odontologia",
  "Pedagogia",
  "Psicologia",
  "Publicidade e Propaganda",
  "Química",
  "Radialismo",
  "Relações Internacionais",
  "Relações Públicas",
  "Sistemas de Informação",
  "Teologia",
] as const;

/** Serviços que os alunos oferecem, agrupados por área. */
export const SERVICOS_POR_AREA = [
  {
    area: "Design e artes",
    servicos: ["Identidade visual", "Design gráfico", "Design editorial", "Ilustração", "UX/UI design", "Design de embalagem", "Modelagem 3D", "Moda e figurino"],
  },
  {
    area: "Foto, vídeo e áudio",
    servicos: ["Fotografia", "Vídeo e edição", "Motion design e animação", "Locução e podcast", "Produção musical"],
  },
  {
    area: "Comunicação e marketing",
    servicos: ["Social media", "Marketing digital e tráfego pago", "Redação e revisão", "Assessoria de imprensa", "Roteiro", "Tradução", "Organização de eventos"],
  },
  {
    area: "Tecnologia",
    servicos: [
      "Sites e sistemas",
      "Landing page",
      "Loja virtual",
      "Manutenção de sites",
      "Aplicativos",
      "Banco de dados e APIs",
      "Chatbot e atendimento automático",
      "Automação e planilhas",
      "Análise de dados",
      "Dashboards e BI",
      "SEO e desempenho de sites",
      "Testes e qualidade de software",
      "Segurança e LGPD básica",
      "Domínio, e-mail e hospedagem",
      "Suporte e manutenção de computadores",
      "Jogos digitais",
    ],
  },
  {
    area: "Arquitetura e engenharia",
    servicos: ["Projeto de interiores", "Projeto arquitetônico", "Maquete e renderização", "Desenho técnico (CAD)"],
  },
  {
    area: "Negócios",
    servicos: ["Plano de negócios", "Pesquisa de mercado", "Consultoria financeira e contábil", "Gestão de redes e atendimento"],
  },
  {
    area: "Educação",
    servicos: ["Aulas particulares e reforço", "Aulas de idiomas", "Aulas de música"],
  },
] as const;

export const SERVICOS = SERVICOS_POR_AREA.flatMap((a) => a.servicos);

export const MODALIDADES = ["Presencial", "Remoto", "Híbrido"] as const;
export const TIPOS_VAGA = ["Freela", "Projeto", "Estágio"] as const;
export const NIVEIS_IDIOMA = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"] as const;

export const REDES = [
  { chave: "instagram", rotulo: "Instagram", exemplo: "instagram.com/seuperfil" },
  { chave: "behance", rotulo: "Behance", exemplo: "behance.net/seuperfil" },
  { chave: "linkedin", rotulo: "LinkedIn", exemplo: "linkedin.com/in/seuperfil" },
  { chave: "github", rotulo: "GitHub", exemplo: "github.com/seuperfil" },
  { chave: "site", rotulo: "Site ou outro link", exemplo: "seusite.com.br" },
] as const;

/** Garante https:// no começo do link digitado pelo aluno. */
export function linkExterno(url: string) {
  const u = url.trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u.replace(/^@/, "instagram.com/")}`;
}

const BASE: Aluno[] = [
  {
    slug: "ana-ribeiro",
    nome: "Ana Ribeiro",
    curso: "Publicidade e Propaganda",
    semestre: 6,
    cidade: "Bauru, SP",
    bio: "Crio identidades visuais e conteúdo para pequenos negócios que querem parecer tão bons quanto são. Gosto de marcas com cara de gente.",
    servicos: ["Identidade visual", "Social media"],
    habilidades: ["Illustrator", "Figma", "Branding", "Canva"],
    valorReferencia: "A partir de R$ 350 por identidade visual",
    disponivel: true,
    foto: "1612203304476-2ed23c55b5b9",
    whatsapp: "5514999990001",
    email: "ana.ribeiro@exemplo.com",
    trabalhos: [
      { titulo: "Café Raiz", tipo: "Identidade visual", descricao: "Logo, paleta e embalagens para cafeteria de bairro.", cliente: "Café Raiz", ano: "2025", papel: "Criação da marca e das embalagens", cor: "#6B4A34", imagem: "1767515341199-451947d081ef" },
      { titulo: "Ateliê Lume", tipo: "Social media", descricao: "Grade de 12 posts e guia de tom de voz.", cliente: "Ateliê Lume", ano: "2025", cor: "#B0673B", imagem: "1603145733146-ae562a55031e" },
      { titulo: "Feira Verde", tipo: "Identidade visual", descricao: "Marca para feira de produtores locais.", cliente: "Projeto de extensão UNISAGRADO", ano: "2024", papel: "Dupla com Henrique Dias, fiquei com logo e sinalização", cor: "#4F7A3A", imagem: "1591586116988-62fe65164f8d" },
    ],
  },
  {
    slug: "bruno-matsuda",
    nome: "Bruno Matsuda",
    curso: "Fotografia",
    semestre: 4,
    cidade: "Bauru, SP",
    bio: "Fotografia de produto e de eventos. Luz natural sempre que possível, edição sem exagero.",
    servicos: ["Fotografia", "Vídeo e edição"],
    habilidades: ["Lightroom", "Fotografia de produto", "Eventos", "Premiere"],
    valorReferencia: "A partir de R$ 200 por ensaio de produto",
    disponivel: true,
    foto: "1535713875002-d1d0cf377fde",
    whatsapp: "5514999990002",
    email: "bruno.matsuda@exemplo.com",
    trabalhos: [
      { titulo: "Linha Terra", tipo: "Fotografia", descricao: "Ensaio de cerâmicas artesanais para loja online.", cor: "#8A5A3C", imagem: "1631125915902-d8abe9225ff2" },
      { titulo: "Formatura Jornalismo 2026", tipo: "Fotografia", descricao: "Cobertura completa do evento.", cliente: "Comissão de formatura", ano: "2026", cor: "#2F3E2A", imagem: "1541339907198-e08756dedf3f" },
      { titulo: "Bastidores Padaria Sol", tipo: "Vídeo e edição", descricao: "Reels de 30 segundos para Instagram.", cor: "#C98A4B", imagem: "1568254183919-78a4f43a2877" },
    ],
  },
  {
    slug: "carla-souza",
    nome: "Carla Souza",
    curso: "Jornalismo",
    semestre: 7,
    cidade: "Agudos, SP",
    bio: "Escrevo textos que as pessoas leem até o fim: matérias, roteiros, newsletters e textos de site.",
    servicos: ["Redação e revisão", "Social media"],
    habilidades: ["Redação", "SEO", "Roteiro", "Revisão"],
    valorReferencia: "A partir de R$ 80 por texto de blog",
    disponivel: true,
    foto: "1517462964-21fdcec3f25b",
    whatsapp: "5514999990003",
    email: "carla.souza@exemplo.com",
    trabalhos: [
      { titulo: "Newsletter Bauru Cultural", tipo: "Redação e revisão", descricao: "Edição semanal com agenda da cidade.", cliente: "Bauru Cultural", ano: "2025", link: "bauruculturalnews.com.br", cor: "#3E5C4A", imagem: "1504711434969-e33886168f5c" },
      { titulo: "Site Clínica Vida", tipo: "Redação e revisão", descricao: "Textos institucionais e páginas de serviço.", cor: "#7C8B5A", imagem: "1544474560-5b2a788d024a" },
    ],
  },
  {
    slug: "diego-alves",
    nome: "Diego Alves",
    curso: "Ciência da Computação",
    semestre: 5,
    cidade: "Bauru, SP",
    bio: "Faço sites rápidos e fáceis de atualizar para negócios locais, e pequenos sistemas sob medida.",
    servicos: ["Sites e sistemas"],
    habilidades: ["React", "Next.js", "WordPress", "Banco de dados"],
    valorReferencia: "A partir de R$ 600 por site institucional",
    disponivel: false,
    foto: "1600603406200-5b2a104684ac",
    whatsapp: "5514999990004",
    email: "diego.alves@exemplo.com",
    trabalhos: [
      { titulo: "Agenda Barbearia 22", tipo: "Sites e sistemas", descricao: "Sistema de agendamento online.", cliente: "Barbearia 22", ano: "2025", link: "github.com/diegoalves/agenda", cor: "#2F3E2A", imagem: "1511707171634-5f897ff02aa9" },
      { titulo: "Site Escritório Lima", tipo: "Sites e sistemas", descricao: "Site institucional com blog.", cor: "#4F7A3A", imagem: "1678690832311-bb6e361989ca" },
      { titulo: "Cardápio digital", tipo: "Sites e sistemas", descricao: "Cardápio por QR code para restaurante.", cor: "#B0673B", imagem: "1767324672864-68a0f610ccbc" },
    ],
  },
  {
    slug: "eduarda-lima",
    nome: "Eduarda Lima",
    curso: "Design",
    semestre: 3,
    cidade: "Bauru, SP",
    bio: "Ilustração digital e editorial. Desenho personagens, capas e materiais para eventos.",
    servicos: ["Ilustração", "Identidade visual"],
    habilidades: ["Procreate", "Ilustração", "Photoshop", "Editorial"],
    valorReferencia: "A partir de R$ 150 por ilustração",
    disponivel: true,
    foto: "1517256673644-36ad11246d21",
    whatsapp: "5514999990005",
    email: "eduarda.lima@exemplo.com",
    trabalhos: [
      { titulo: "Capa Zine Margem", tipo: "Ilustração", descricao: "Capa e miolo de zine independente.", cor: "#A0522D", imagem: "1505569127510-bde1536937bc" },
      { titulo: "Mascote Semana Acadêmica", tipo: "Ilustração", descricao: "Personagem e variações para evento.", cor: "#5E7F45", imagem: "1495232416988-d26458b7a5fb" },
    ],
  },
  {
    slug: "felipe-costa",
    nome: "Felipe Costa",
    curso: "Arquitetura e Urbanismo",
    semestre: 8,
    cidade: "Lençóis Paulista, SP",
    bio: "Projetos de interiores para espaços pequenos: quartos, home office e lojas. Entrego planta, 3D e lista de compras.",
    servicos: ["Projeto de interiores"],
    habilidades: ["SketchUp", "AutoCAD", "Renderização", "Interiores"],
    valorReferencia: "A partir de R$ 40 por m²",
    disponivel: true,
    foto: "1604494747044-2e080876c5f1",
    whatsapp: "5514999990006",
    email: "felipe.costa@exemplo.com",
    trabalhos: [
      { titulo: "Home office 9 m²", tipo: "Projeto de interiores", descricao: "Planta, 3D e orçamento de móveis.", cor: "#7A6A55", imagem: "1600494603989-9650cf6ddd3d" },
      { titulo: "Loja Brisa", tipo: "Projeto de interiores", descricao: "Layout de loja de roupas com provador.", cor: "#3E5C4A", imagem: "1729487151777-b4be9098ecbb" },
    ],
  },
  {
    slug: "giulia-santos",
    nome: "Giulia Santos",
    curso: "Relações Públicas",
    semestre: 6,
    cidade: "Bauru, SP",
    bio: "Planejo a comunicação de eventos e marcas pequenas: calendário, releases e relacionamento com imprensa.",
    servicos: ["Social media", "Redação e revisão"],
    habilidades: ["Planejamento", "Assessoria de imprensa", "Eventos", "Métricas"],
    valorReferencia: "A partir de R$ 500 por plano mensal",
    disponivel: true,
    foto: "1558499932-9609acb6f443",
    whatsapp: "5514999990007",
    email: "giulia.santos@exemplo.com",
    trabalhos: [
      { titulo: "Festival Sabores", tipo: "Social media", descricao: "Plano de comunicação e cobertura ao vivo.", cor: "#B0673B", imagem: "1555939594-58d7cb561ad1" },
      { titulo: "Release ONG Abraço", tipo: "Redação e revisão", descricao: "Releases que saíram em 3 veículos locais.", cor: "#6B4A34", imagem: "1579532536935-619928decd08" },
    ],
  },
  {
    slug: "henrique-dias",
    nome: "Henrique Dias",
    curso: "Publicidade e Propaganda",
    semestre: 5,
    cidade: "Bauru, SP",
    bio: "Vídeos curtos para redes sociais, do roteiro à edição final. Também faço motion simples.",
    servicos: ["Vídeo e edição", "Social media"],
    habilidades: ["Premiere", "After Effects", "CapCut", "Roteiro"],
    valorReferencia: "A partir de R$ 120 por vídeo curto",
    disponivel: true,
    foto: "1726140871959-89036cd0d6a3",
    whatsapp: "5514999990008",
    email: "henrique.dias@exemplo.com",
    trabalhos: [
      { titulo: "Academia Forma", tipo: "Vídeo e edição", descricao: "Série de 8 reels de treino.", cor: "#2F3E2A", imagem: "1517836357463-d25dfeac3438" },
      { titulo: "Lançamento App Rota", tipo: "Vídeo e edição", descricao: "Vídeo animado de 45 segundos.", cor: "#4F7A3A", imagem: "1512941937669-90a1b58e7e9c" },
      { titulo: "Loja Ponto Doce", tipo: "Social media", descricao: "Conteúdo mensal em vídeo.", cor: "#C98A4B", imagem: "1563262924-641a8b3d397f" },
    ],
  },
];

/** Informações extras dos alunos de exemplo, para mostrar o portfólio completo. */
const EXTRAS: Record<string, Partial<Aluno>> = {
  "ana-ribeiro": {
    titulo: "Designer de marcas para pequenos negócios",
    sobre:
      "Comecei fazendo a identidade da padaria da minha tia e não parei mais. Hoje atendo cafés, ateliês e feiras da região, sempre partindo de uma conversa sobre a história do negócio. Gosto de entregar um guia simples, para o cliente conseguir usar a marca sozinho no dia a dia.",
    conclusao: "Dez/2026",
    modalidades: ["Presencial", "Remoto"],
    tiposVaga: ["Freela", "Projeto"],
    links: { instagram: "instagram.com/ana.ribeiro.design", behance: "behance.net/anaribeiro" },
    experiencias: [
      { cargo: "Estagiária de design", lugar: "Agência Ponte", periodo: "Fev/2025 – Dez/2025", descricao: "Peças para redes sociais e apoio em identidades de clientes locais." },
      { cargo: "Diretora de arte", lugar: "Agência Júnior UNISAGRADO", periodo: "2024", descricao: "Coordenei 3 calouros na criação de campanhas para ONGs." },
    ],
    certificados: [
      { nome: "Branding e identidade visual", instituicao: "Escola Britânica de Artes Criativas (EBAC)", ano: "2024" },
      { nome: "Figma do zero ao protótipo", instituicao: "Alura", ano: "2023" },
    ],
    idiomas: [{ idioma: "Inglês", nivel: "Intermediário" }],
  },
  "bruno-matsuda": {
    titulo: "Fotógrafo de produto e eventos",
    sobre:
      "Fotografo produto para lojas online e cubro eventos pequenos e médios. Tenho estúdio portátil com fundo infinito e entrego as fotos tratadas em até 5 dias.",
    conclusao: "Jun/2028",
    modalidades: ["Presencial"],
    tiposVaga: ["Freela", "Estágio"],
    links: { instagram: "instagram.com/brunomatsuda.foto" },
    experiencias: [
      { cargo: "Fotógrafo freelancer", lugar: "Autônomo", periodo: "2024 – atual", descricao: "Mais de 30 ensaios de produto e 12 eventos cobertos." },
    ],
    certificados: [{ nome: "Iluminação de estúdio", instituicao: "SENAC", ano: "2024" }],
    idiomas: [{ idioma: "Japonês", nivel: "Intermediário" }, { idioma: "Inglês", nivel: "Básico" }],
  },
  "carla-souza": {
    titulo: "Redatora e repórter",
    sobre:
      "Escrevo para web desde o primeiro semestre. Já fiz newsletter cultural, textos de site para clínicas e roteiros para vídeo. Trabalho com pauta, entrevista e checagem, e entrego o texto revisado e otimizado para busca.",
    conclusao: "Dez/2026",
    modalidades: ["Remoto", "Híbrido"],
    tiposVaga: ["Freela", "Estágio"],
    links: { linkedin: "linkedin.com/in/carlasouza", site: "carlasouza.com.br" },
    experiencias: [
      { cargo: "Repórter estagiária", lugar: "Jornal da Cidade", periodo: "Mar/2025 – atual", descricao: "Cobertura de cultura e cidades, com 40 matérias publicadas." },
      { cargo: "Editora", lugar: "Revista laboratório do curso", periodo: "2024", descricao: "Edição de pautas e revisão de textos da turma." },
    ],
    certificados: [
      { nome: "SEO para redatores", instituicao: "Rock Content", ano: "2024" },
      { nome: "Jornalismo de dados", instituicao: "Abraji", ano: "2025" },
    ],
    idiomas: [{ idioma: "Inglês", nivel: "Avançado" }, { idioma: "Espanhol", nivel: "Intermediário" }],
  },
  "diego-alves": {
    titulo: "Desenvolvedor web",
    sobre:
      "Construo sites rápidos e pequenos sistemas sob medida. Gosto de entender o processo do cliente antes de escrever código, para resolver o problema certo.",
    conclusao: "Dez/2027",
    modalidades: ["Remoto", "Híbrido"],
    tiposVaga: ["Freela", "Projeto", "Estágio"],
    links: { github: "github.com/diegoalves", linkedin: "linkedin.com/in/diegoalves" },
    experiencias: [
      { cargo: "Bolsista de iniciação científica", lugar: "UNISAGRADO", periodo: "2025", descricao: "Aplicativo de agendamento para a clínica-escola." },
    ],
    certificados: [{ nome: "React", instituicao: "Rocketseat", ano: "2024" }],
    idiomas: [{ idioma: "Inglês", nivel: "Avançado" }],
  },
  "eduarda-lima": {
    titulo: "Ilustradora",
    conclusao: "Dez/2028",
    modalidades: ["Remoto"],
    tiposVaga: ["Freela", "Projeto"],
    links: { instagram: "instagram.com/edu.desenha", behance: "behance.net/eduardalima" },
    certificados: [{ nome: "Ilustração editorial", instituicao: "Domestika", ano: "2025" }],
    idiomas: [{ idioma: "Inglês", nivel: "Intermediário" }],
  },
  "felipe-costa": {
    titulo: "Projetos de interiores para espaços pequenos",
    conclusao: "Dez/2026",
    modalidades: ["Presencial", "Híbrido"],
    tiposVaga: ["Freela", "Estágio"],
    links: { instagram: "instagram.com/felipecosta.arq" },
    experiencias: [
      { cargo: "Estagiário", lugar: "Escritório Lima Arquitetura", periodo: "2025", descricao: "Detalhamento de marcenaria e renders." },
    ],
    idiomas: [{ idioma: "Inglês", nivel: "Intermediário" }],
  },
  "giulia-santos": {
    titulo: "Comunicação e assessoria de imprensa",
    conclusao: "Dez/2026",
    modalidades: ["Presencial", "Remoto"],
    tiposVaga: ["Projeto", "Estágio"],
    links: { linkedin: "linkedin.com/in/giuliasantos" },
    experiencias: [
      { cargo: "Assessora voluntária", lugar: "ONG Abraço", periodo: "2024 – atual", descricao: "Releases e relacionamento com a imprensa local." },
    ],
    certificados: [{ nome: "Gestão de crise", instituicao: "Aberje", ano: "2025" }],
    idiomas: [{ idioma: "Inglês", nivel: "Fluente" }],
  },
  "henrique-dias": {
    titulo: "Editor de vídeo e motion",
    conclusao: "Jun/2027",
    modalidades: ["Remoto"],
    tiposVaga: ["Freela"],
    links: { instagram: "instagram.com/henrique.edita" },
    certificados: [{ nome: "After Effects essencial", instituicao: "Udemy", ano: "2024" }],
    idiomas: [{ idioma: "Inglês", nivel: "Intermediário" }],
  },
};

export const ALUNOS: Aluno[] = BASE.map((a) => ({ ...a, ...EXTRAS[a.slug] }));

/** Alunos de exemplo que entram na vitrine (vazio quando os fictícios estão desligados). */
export const ALUNOS_VITRINE: Aluno[] = MOSTRAR_ALUNOS_EXEMPLO || !bancoLigado ? ALUNOS : [];

/**
 * Imagens de demonstração do Unsplash (uso gratuito, sem atribuição obrigatória).
 * Servem só para visualizar o layout; os alunos reais vão subir as próprias fotos.
 */
export function unsplash(id: string, largura = 800) {
  if (/^(https?:|data:|blob:)/.test(id)) return id;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${largura}&q=70`;
}

/** Endereço do perfil público: exemplos têm página própria; perfis reais abrem por parâmetro. */
export function linkPerfil(a: Pick<Aluno, "slug" | "real">) {
  return a.real ? `/perfil/?u=${encodeURIComponent(a.slug)}` : `/aluno/${a.slug}`;
}

export function buscarAluno(slug: string) {
  return ALUNOS_VITRINE.find((a) => a.slug === slug);
}

export function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
