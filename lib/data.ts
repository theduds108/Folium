// Dados de exemplo. Quando o banco (Supabase) entrar, estas listas viram
// consultas ao banco, e o resto do código continua igual.

export type Trabalho = {
  titulo: string;
  tipo: string;
  descricao: string;
  /** Cor de fundo usada enquanto a imagem carrega (ou se não houver imagem). */
  cor: string;
  /** Imagem de demonstração (Unsplash). */
  imagem?: string;
};

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
  /** Foto de demonstração (Unsplash). */
  foto?: string;
  whatsapp: string;
  email: string;
  trabalhos: Trabalho[];
};

export const CURSOS = [
  "Arquitetura e Urbanismo",
  "Ciência da Computação",
  "Design",
  "Fotografia",
  "Jornalismo",
  "Publicidade e Propaganda",
  "Relações Públicas",
] as const;

export const SERVICOS = [
  "Identidade visual",
  "Social media",
  "Fotografia",
  "Vídeo e edição",
  "Redação e revisão",
  "Sites e sistemas",
  "Ilustração",
  "Projeto de interiores",
] as const;

export const ALUNOS: Aluno[] = [
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
      { titulo: "Café Raiz", tipo: "Identidade visual", descricao: "Logo, paleta e embalagens para cafeteria de bairro.", cor: "#6B4A34", imagem: "1767515341199-451947d081ef" },
      { titulo: "Ateliê Lume", tipo: "Social media", descricao: "Grade de 12 posts e guia de tom de voz.", cor: "#B0673B", imagem: "1603145733146-ae562a55031e" },
      { titulo: "Feira Verde", tipo: "Identidade visual", descricao: "Marca para feira de produtores locais.", cor: "#4F7A3A", imagem: "1591586116988-62fe65164f8d" },
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
      { titulo: "Formatura Jornalismo 2026", tipo: "Fotografia", descricao: "Cobertura completa do evento.", cor: "#2F3E2A", imagem: "1541339907198-e08756dedf3f" },
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
      { titulo: "Newsletter Bauru Cultural", tipo: "Redação e revisão", descricao: "Edição semanal com agenda da cidade.", cor: "#3E5C4A", imagem: "1504711434969-e33886168f5c" },
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
      { titulo: "Agenda Barbearia 22", tipo: "Sites e sistemas", descricao: "Sistema de agendamento online.", cor: "#2F3E2A", imagem: "1511707171634-5f897ff02aa9" },
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

/**
 * Imagens de demonstração do Unsplash (uso gratuito, sem atribuição obrigatória).
 * Servem só para visualizar o layout; os alunos reais vão subir as próprias fotos.
 */
export function unsplash(id: string, largura = 800) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${largura}&q=70`;
}

export function buscarAluno(slug: string) {
  return ALUNOS.find((a) => a.slug === slug);
}

export function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
