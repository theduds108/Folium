// Dados de exemplo. Quando o banco (Supabase) entrar, estas listas viram
// consultas ao banco, e o resto do código continua igual.

export type Trabalho = {
  titulo: string;
  tipo: string;
  descricao: string;
  /** Cor da capa provisória, enquanto não há upload de imagens. */
  cor: string;
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
    whatsapp: "5514999990001",
    email: "ana.ribeiro@exemplo.com",
    trabalhos: [
      { titulo: "Café Raiz", tipo: "Identidade visual", descricao: "Logo, paleta e embalagens para cafeteria de bairro.", cor: "#6B4A34" },
      { titulo: "Ateliê Lume", tipo: "Social media", descricao: "Grade de 12 posts e guia de tom de voz.", cor: "#B0673B" },
      { titulo: "Feira Verde", tipo: "Identidade visual", descricao: "Marca para feira de produtores locais.", cor: "#4F7A3A" },
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
    whatsapp: "5514999990002",
    email: "bruno.matsuda@exemplo.com",
    trabalhos: [
      { titulo: "Linha Terra", tipo: "Fotografia", descricao: "Ensaio de cerâmicas artesanais para loja online.", cor: "#8A5A3C" },
      { titulo: "Formatura Jornalismo 2026", tipo: "Fotografia", descricao: "Cobertura completa do evento.", cor: "#2F3E2A" },
      { titulo: "Bastidores Padaria Sol", tipo: "Vídeo e edição", descricao: "Reels de 30 segundos para Instagram.", cor: "#C98A4B" },
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
    whatsapp: "5514999990003",
    email: "carla.souza@exemplo.com",
    trabalhos: [
      { titulo: "Newsletter Bauru Cultural", tipo: "Redação e revisão", descricao: "Edição semanal com agenda da cidade.", cor: "#3E5C4A" },
      { titulo: "Site Clínica Vida", tipo: "Redação e revisão", descricao: "Textos institucionais e páginas de serviço.", cor: "#7C8B5A" },
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
    whatsapp: "5514999990004",
    email: "diego.alves@exemplo.com",
    trabalhos: [
      { titulo: "Agenda Barbearia 22", tipo: "Sites e sistemas", descricao: "Sistema de agendamento online.", cor: "#2F3E2A" },
      { titulo: "Site Escritório Lima", tipo: "Sites e sistemas", descricao: "Site institucional com blog.", cor: "#4F7A3A" },
      { titulo: "Cardápio digital", tipo: "Sites e sistemas", descricao: "Cardápio por QR code para restaurante.", cor: "#B0673B" },
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
    whatsapp: "5514999990005",
    email: "eduarda.lima@exemplo.com",
    trabalhos: [
      { titulo: "Capa Zine Margem", tipo: "Ilustração", descricao: "Capa e miolo de zine independente.", cor: "#A0522D" },
      { titulo: "Mascote Semana Acadêmica", tipo: "Ilustração", descricao: "Personagem e variações para evento.", cor: "#5E7F45" },
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
    whatsapp: "5514999990006",
    email: "felipe.costa@exemplo.com",
    trabalhos: [
      { titulo: "Home office 9 m²", tipo: "Projeto de interiores", descricao: "Planta, 3D e orçamento de móveis.", cor: "#7A6A55" },
      { titulo: "Loja Brisa", tipo: "Projeto de interiores", descricao: "Layout de loja de roupas com provador.", cor: "#3E5C4A" },
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
    whatsapp: "5514999990007",
    email: "giulia.santos@exemplo.com",
    trabalhos: [
      { titulo: "Festival Sabores", tipo: "Social media", descricao: "Plano de comunicação e cobertura ao vivo.", cor: "#B0673B" },
      { titulo: "Release ONG Abraço", tipo: "Redação e revisão", descricao: "Releases que saíram em 3 veículos locais.", cor: "#6B4A34" },
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
    whatsapp: "5514999990008",
    email: "henrique.dias@exemplo.com",
    trabalhos: [
      { titulo: "Academia Forma", tipo: "Vídeo e edição", descricao: "Série de 8 reels de treino.", cor: "#2F3E2A" },
      { titulo: "Lançamento App Rota", tipo: "Vídeo e edição", descricao: "Vídeo animado de 45 segundos.", cor: "#4F7A3A" },
      { titulo: "Loja Ponto Doce", tipo: "Social media", descricao: "Conteúdo mensal em vídeo.", cor: "#C98A4B" },
    ],
  },
];

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
