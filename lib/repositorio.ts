// Leitura e gravação no banco (Supabase). Tudo aqui roda no navegador.
// No modo demonstração (sem .env.local) as funções devolvem listas vazias.

import type { Aluno, Certificado, Experiencia, Idioma, Links, Trabalho } from "./data";
import type { Oportunidade } from "./conteudo";
import { supabase } from "./supabase";

const CORES = ["#4F7A3A", "#B0673B", "#6B4A34", "#2F3E2A", "#C98A4B", "#7C8B5A"];

export type PerfilBanco = {
  id: string;
  slug: string;
  nome: string;
  curso: string;
  semestre: number;
  cidade: string;
  bio: string;
  servicos: string[];
  habilidades: string[];
  valor_referencia: string;
  whatsapp: string;
  email_contato: string;
  foto_url: string | null;
  disponivel: boolean;
  publicado: boolean;
  titulo: string;
  sobre_longo: string;
  conclusao: string;
  modalidades: string[];
  tipos_vaga: string[];
  links: Links;
  experiencias: Experiencia[];
  certificados: Certificado[];
  idiomas: Idioma[];
  curriculo_url: string | null;
};

export type TrabalhoBanco = {
  id?: string;
  perfil_id?: string;
  titulo: string;
  tipo: string;
  descricao: string;
  imagem_url: string | null;
  ordem: number;
  cliente: string;
  ano: string;
  link: string;
  papel: string;
  galeria: string[];
};

type PerfilComTrabalhos = PerfilBanco & { trabalhos: TrabalhoBanco[] | null };

/** Só os dígitos, com 55 na frente se faltar (formato do wa.me). */
export function whatsappParaLink(numero: string) {
  const d = numero.replace(/\D/g, "");
  if (!d) return "";
  return d.startsWith("55") && d.length >= 12 ? d : `55${d}`;
}

export function paraAluno(p: PerfilComTrabalhos): Aluno {
  const trabalhos: Trabalho[] = [...(p.trabalhos ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map((t, i) => ({
      titulo: t.titulo,
      tipo: t.tipo,
      descricao: t.descricao,
      cor: CORES[i % CORES.length]!,
      imagem: t.imagem_url ?? undefined,
      galeria: t.galeria ?? [],
      cliente: t.cliente ?? "",
      ano: t.ano ?? "",
      link: t.link ?? "",
      papel: t.papel ?? "",
    }));
  return {
    slug: p.slug,
    nome: p.nome,
    curso: p.curso,
    semestre: p.semestre,
    cidade: p.cidade,
    bio: p.bio,
    servicos: p.servicos,
    habilidades: p.habilidades,
    valorReferencia: p.valor_referencia,
    disponivel: p.disponivel,
    foto: p.foto_url ?? undefined,
    whatsapp: whatsappParaLink(p.whatsapp),
    email: p.email_contato,
    trabalhos,
    real: true,
    titulo: p.titulo ?? "",
    sobre: p.sobre_longo ?? "",
    conclusao: p.conclusao ?? "",
    modalidades: p.modalidades ?? [],
    tiposVaga: p.tipos_vaga ?? [],
    links: p.links ?? {},
    experiencias: p.experiencias ?? [],
    certificados: p.certificados ?? [],
    idiomas: p.idiomas ?? [],
    curriculo: p.curriculo_url ?? undefined,
  };
}

const CAMPOS_PERFIL = "*, trabalhos(*)";

/** Perfis publicados, mais recentes primeiro. */
export async function listarAlunosReais(): Promise<Aluno[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("perfis")
    .select(CAMPOS_PERFIL)
    .eq("publicado", true)
    .order("atualizado_em", { ascending: false })
    .limit(200);
  if (error) {
    console.error("Erro ao listar perfis", error);
    return [];
  }
  return (data as PerfilComTrabalhos[]).map(paraAluno);
}

export async function buscarAlunoReal(slug: string): Promise<Aluno | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.from("perfis").select(CAMPOS_PERFIL).eq("slug", slug).maybeSingle();
  return data ? paraAluno(data as PerfilComTrabalhos) : null;
}

/** Perfil e trabalhos do usuário logado, para o editor. */
export async function meuPerfil(userId: string) {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from("perfis").select(CAMPOS_PERFIL).eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as PerfilComTrabalhos | null;
}

/** Transforma o nome em endereço: "Eduarda Corrêa" vira "eduarda-correa". */
export function criarSlug(nome: string) {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return base.length >= 3 ? base : `aluno-${base || "novo"}`;
}

/**
 * Grava o perfil e substitui a lista de trabalhos.
 * Se o endereço (slug) já for de outra pessoa, tenta com um número no fim.
 */
export async function salvarPerfil(perfil: Omit<PerfilBanco, "slug"> & { slug?: string }, trabalhos: TrabalhoBanco[]) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");

  let slug = perfil.slug || criarSlug(perfil.nome);
  for (let tentativa = 0; ; tentativa++) {
    const { error } = await sb.from("perfis").upsert({ ...perfil, slug });
    if (!error) break;
    if (error.code === "23505" && error.message.includes("slug") && tentativa < 5) {
      slug = `${criarSlug(perfil.nome).slice(0, 45)}-${Math.floor(100 + Math.random() * 900)}`;
      continue;
    }
    throw traduzirErro(error);
  }

  const apagar = await sb.from("trabalhos").delete().eq("perfil_id", perfil.id);
  if (apagar.error) throw traduzirErro(apagar.error);
  const validos = trabalhos.filter((t) => t.titulo.trim());
  if (validos.length) {
    const { error } = await sb
      .from("trabalhos")
      .insert(
        validos.map((t, i) => ({
          perfil_id: perfil.id,
          titulo: t.titulo,
          tipo: t.tipo,
          descricao: t.descricao,
          imagem_url: t.imagem_url,
          ordem: i,
          cliente: t.cliente,
          ano: t.ano,
          link: t.link,
          papel: t.papel,
          galeria: t.galeria,
        }))
      );
    if (error) throw traduzirErro(error);
  }
  return slug;
}

/** Envia uma imagem para fotos/<id do usuário>/ e devolve o endereço público. */
export async function enviarFoto(userId: string, arquivo: File) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) throw new Error("Use uma imagem JPG, PNG ou WebP.");
  if (arquivo.size > 5 * 1024 * 1024) throw new Error("A imagem precisa ter até 5 MB.");
  const ext = arquivo.type.split("/")[1];
  const caminho = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("fotos").upload(caminho, arquivo, { contentType: arquivo.type });
  if (error) throw traduzirErro(error);
  return sb.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

/** Envia o currículo em PDF para curriculos/<id do usuário>/ e devolve o endereço público. */
export async function enviarCurriculo(userId: string, arquivo: File) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  if (arquivo.type !== "application/pdf") throw new Error("O currículo precisa ser um PDF.");
  if (arquivo.size > 3 * 1024 * 1024) throw new Error("O PDF precisa ter até 3 MB.");
  const caminho = `${userId}/${crypto.randomUUID()}.pdf`;
  const { error } = await sb.storage.from("curriculos").upload(caminho, arquivo, { contentType: "application/pdf" });
  if (error) throw traduzirErro(error);
  return sb.storage.from("curriculos").getPublicUrl(caminho).data.publicUrl;
}

type LinhaOportunidade = {
  id: string;
  titulo: string;
  empresa: string;
  contato: string;
  tipo: Oportunidade["tipo"];
  servico: string;
  cidade: string;
  orcamento: string;
  prazo: string;
  descricao: string;
  criada_em: string;
};

function tempoDesde(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  if (dias < 7) return `há ${dias} dias`;
  const semanas = Math.floor(dias / 7);
  return semanas === 1 ? "há 1 semana" : `há ${semanas} semanas`;
}

/** Oportunidades aprovadas pela equipe. */
export async function listarOportunidadesReais(): Promise<Oportunidade[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("oportunidades")
    .select("*")
    .order("criada_em", { ascending: false })
    .limit(100);
  if (error) {
    console.error("Erro ao listar oportunidades", error);
    return [];
  }
  return (data as LinhaOportunidade[]).map((o) => ({
    id: o.id,
    titulo: o.titulo,
    empresa: o.empresa,
    tipo: o.tipo,
    servico: o.servico,
    cidade: o.cidade,
    orcamento: o.orcamento || "A combinar",
    prazo: o.prazo || "A combinar",
    descricao: o.descricao,
    publicadaHa: tempoDesde(o.criada_em),
    contato: o.contato,
    real: true,
  }));
}

export type NovaOportunidade = Omit<LinhaOportunidade, "id" | "criada_em">;

/** Envia a vaga para análise. Ela só aparece no mural depois de aprovada. */
export async function enviarOportunidade(o: NovaOportunidade) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("oportunidades").insert({ ...o, status: "pendente" });
  if (error) throw traduzirErro(error);
}

export async function marcarInteresse(oportunidadeId: string, perfilId: string) {
  const sb = supabase();
  if (!sb) return;
  await sb.from("interesses").upsert({ oportunidade_id: oportunidadeId, perfil_id: perfilId });
}

export async function denunciar(alvoTipo: "perfil" | "oportunidade", alvo: string, motivo: string, detalhes: string) {
  const sb = supabase();
  if (!sb) return;
  const { error } = await sb.from("denuncias").insert({ alvo_tipo: alvoTipo, alvo, motivo, detalhes });
  if (error) throw traduzirErro(error);
}

/** Mensagens de erro do Supabase em português, para mostrar ao usuário. */
export function traduzirErro(e: { message?: string; code?: string } | null | undefined): Error {
  const msg = e?.message ?? "";
  if (/row-level security/i.test(msg)) return new Error("Sem permissão. Confira se você entrou com o e-mail institucional.");
  if (/Limite de 6 trabalhos/.test(msg)) return new Error("O plano grátis permite até 6 trabalhos.");
  if (/rate limit|too many/i.test(msg)) return new Error("Muitas tentativas seguidas. Espere um minuto e tente de novo.");
  if (/fetch|network/i.test(msg)) return new Error("Sem conexão com o servidor. Confira sua internet.");
  return new Error(msg || "Algo deu errado. Tente de novo.");
}
