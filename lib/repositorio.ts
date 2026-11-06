// Leitura e gravação no banco (Supabase). Tudo aqui roda no navegador.
// No modo demonstração (sem .env.local) as funções devolvem listas vazias.

import type { Aluno, Certificado, Experiencia, Idioma, Links, Trabalho } from "./data";
import type { Oportunidade } from "./conteudo";
import { supabase } from "./supabase";
import { mb, prepararFoto } from "./validarFoto";

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

/**
 * Envia uma imagem para fotos/<id do usuário>/ e devolve o endereço público.
 * A foto é validada e reduzida no aparelho (ver lib/validarFoto.ts); `aoAvisar` recebe o aviso
 * quando ela foi reduzida ou convertida. Erros chegam como ErroFoto, com texto pronto.
 */
export async function enviarFoto(userId: string, arquivo: File, aoAvisar?: (aviso: string) => void) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { blob, aviso } = await prepararFoto(arquivo);
  const caminho = `${userId}/${crypto.randomUUID()}.jpeg`;
  const { error } = await sb.storage.from("fotos").upload(caminho, blob, { contentType: "image/jpeg" });
  if (error) throw traduzirErro(error);
  if (aviso) aoAvisar?.(aviso);
  return sb.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

/** Envia o currículo em PDF para curriculos/<id do usuário>/ e devolve o endereço público. */
export async function enviarCurriculo(userId: string, arquivo: File) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  if (arquivo.type !== "application/pdf") throw new Error("Formato não compatível: aqui só entra arquivo PDF.");
  if (arquivo.size > 3 * 1024 * 1024) throw new Error(`O PDF passou do tamanho máximo: tem ${mb(arquivo.size)} e o limite é 3 MB. Comprima o PDF e tente de novo.`);
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
  destaque: boolean;
  status: "pendente" | "aprovada" | "recusada";
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
    .eq("status", "aprovada")
    .order("destaque", { ascending: false })
    .order("criada_em", { ascending: false })
    .limit(100);
  if (error) {
    console.error("Erro ao listar oportunidades", error);
    return [];
  }
  return (data as LinhaOportunidade[]).map(paraOportunidade);
}

function paraOportunidade(o: LinhaOportunidade): Oportunidade {
  return {
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
    destaque: !!o.destaque,
  };
}

export type NovaOportunidade = Omit<LinhaOportunidade, "id" | "criada_em" | "status">;

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
  if (/row-level security/i.test(msg)) return new Error("Sua conta não tem permissão para isso. Confira se entrou com o e-mail certo.");
  if (e?.code === "invalid_credentials" || /invalid login credentials/i.test(msg))
    return new Error("Usuário ou senha incorretos. Se você ainda não criou sua senha, use “Esqueci a senha”.");
  if (e?.code === "same_password" || /different from the old/i.test(msg)) return new Error("A senha nova precisa ser diferente da atual.");
  if (e?.code === "weak_password" || /password should/i.test(msg))
    return new Error("Senha fraca. Ela precisa ter pelo menos 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.");
  if (/muitas_tentativas/.test(msg))
    return new Error("Muitas tentativas erradas com esse usuário. Espere 15 minutos, entre com o e-mail no lugar do usuário ou use “Esqueci a senha”.");
  if (/nomes_usuario|email_para_login|nome_usuario_livre/.test(msg))
    return new Error("O login por nome de usuário ainda não foi ligado no banco. Avise a equipe do Fólium.");
  if (e?.code === "signup_disabled") return new Error("Novos cadastros estão fechados no momento.");
  if (/Limite de 6 trabalhos/.test(msg)) return new Error("O plano grátis permite até 6 trabalhos. Com o Premium não há limite.");
  if (/Muitas vagas/.test(msg)) return new Error("Você publicou muitas vagas nas últimas 24 horas. Espere um pouco e tente de novo.");
  if (/Limite de 1 vaga/.test(msg)) return new Error("O plano grátis permite 1 vaga por mês. Com o Premium as vagas são ilimitadas.");
  // Mesmo e-mail pedindo de novo antes do intervalo mínimo ("you can only request this after 42 seconds").
  const espera = msg.match(/after (\d+) seconds?/i);
  if (espera) return new Error(`Já mandamos um e-mail para este endereço agora há pouco. Espere ${espera[1]} segundos para pedir outro, ou confira a caixa de entrada e o spam.`);
  // Limite de e-mails do projeto (o envio padrão do Supabase manda só poucos por hora no projeto todo).
  if (e?.code === "over_email_send_rate_limit" || /email rate limit/i.test(msg))
    return new Error(
      "O envio de e-mails do Fólium chegou ao limite desta hora. Tente de novo daqui a pouco. Se você já criou usuário e senha, entre com eles, que não depende de e-mail."
    );
  if (e?.code === "over_request_rate_limit" || /rate limit|too many/i.test(msg))
    return new Error("Muitas tentativas seguidas deste aparelho. Espere alguns minutos e tente de novo.");
  // Falha do servidor de e-mail (SMTP) ao mandar o link: problema de configuração nosso, não da pessoa.
  if (/error sending .*email/i.test(msg))
    return new Error("Não conseguimos enviar o e-mail de acesso agora. O problema é do nosso lado; tente de novo em alguns minutos.");
  if (/fetch|network/i.test(msg)) return new Error("Sem conexão com o servidor. Confira sua internet.");
  return new Error(msg || "Algo deu errado. Tente de novo.");
}

export type Empresa = { nome: string; cidade: string };

/** Lista inicial usada no modo demonstração (no banco, a tabela "empresas" tem a mesma base). */
const EMPRESAS_DEMO: Empresa[] = [
  "UNISAGRADO|Bauru, SP", "Agência Júnior UNISAGRADO|Bauru, SP", "Prefeitura Municipal de Bauru|Bauru, SP",
  "Jornal da Cidade|Bauru, SP", "TV TEM|Bauru, SP", "Tilibra|Bauru, SP", "Paschoalotto|Bauru, SP",
  "Supermercados Confiança|Bauru, SP", "UNESP Bauru|Bauru, SP", "USP Bauru|Bauru, SP",
  "Hospital Estadual de Bauru|Bauru, SP", "SENAC Bauru|Bauru, SP", "SEBRAE|Bauru, SP", "CIEE|", "Autônomo / freelancer|",
].map((l) => {
  const [nome, cidade] = l.split("|");
  return { nome: nome!, cidade: cidade ?? "" };
});

function semAcento(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Empresas cujo nome contém o texto digitado. */
export async function buscarEmpresas(texto: string): Promise<Empresa[]> {
  const q = texto.trim();
  if (q.length < 2) return [];
  const sb = supabase();
  if (!sb) return EMPRESAS_DEMO.filter((e) => semAcento(e.nome).includes(semAcento(q))).slice(0, 8);
  const { data, error } = await sb
    .from("empresas")
    .select("nome, cidade")
    .ilike("chave", `%${q.toLowerCase().replace(/[%_]/g, "")}%`)
    .order("nome")
    .limit(8);
  if (error) return [];
  return data as Empresa[];
}

/** Adiciona ao catálogo as empresas novas digitadas nas experiências. Falhas são ignoradas. */
export async function cadastrarEmpresas(nomes: string[]) {
  const sb = supabase();
  const limpos = [...new Set(nomes.map((n) => n.trim().replace(/\s+/g, " ")).filter((n) => n.length >= 2 && n.length <= 80))];
  if (!sb || !limpos.length) return;
  await sb.from("empresas").upsert(limpos.map((nome) => ({ nome })), { onConflict: "chave", ignoreDuplicates: true });
}

/* ---------- Área do contratante ---------- */

export type MinhaVaga = Oportunidade & { status: LinhaOportunidade["status"]; interessados: number; criadaEm: string };

const CHAVE_VAGAS_DEMO = "folium-demo-vagas";

/** Vagas enviadas no modo demonstração ficam no navegador, para o painel mostrar algo. */
export function guardarVagaDemo(o: NovaOportunidade) {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_VAGAS_DEMO) ?? "[]") as LinhaOportunidade[];
    lista.unshift({ ...o, id: `demo-${Date.now()}`, criada_em: new Date().toISOString(), status: "pendente" });
    localStorage.setItem(CHAVE_VAGAS_DEMO, JSON.stringify(lista.slice(0, 20)));
  } catch {
    /* sem armazenamento */
  }
}

/** Vagas publicadas por quem está logado, com o status da análise e quantos alunos se interessaram. */
export async function minhasVagas(): Promise<MinhaVaga[]> {
  const sb = supabase();
  if (!sb) {
    try {
      const lista = JSON.parse(localStorage.getItem(CHAVE_VAGAS_DEMO) ?? "[]") as LinhaOportunidade[];
      return lista.map((o) => ({ ...paraOportunidade(o), status: o.status, interessados: 0, criadaEm: o.criada_em }));
    } catch {
      return [];
    }
  }
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return [];
  const { data, error } = await sb
    .from("oportunidades")
    .select("*, interesses(count)")
    .eq("autor_id", u.user.id)
    .order("criada_em", { ascending: false });
  if (error) {
    console.error("Erro ao listar minhas vagas", error);
    return [];
  }
  return (data as (LinhaOportunidade & { interesses: { count: number }[] })[]).map((o) => ({
    ...paraOportunidade(o),
    status: o.status,
    interessados: o.interesses?.[0]?.count ?? 0,
    criadaEm: o.criada_em,
  }));
}

const CHAVE_SALVOS_DEMO = "folium-demo-salvos";

/** Endereços (slugs) dos talentos salvos pelo contratante. */
export async function listarSalvos(): Promise<string[]> {
  const sb = supabase();
  if (!sb) {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_SALVOS_DEMO) ?? "[]") as string[];
    } catch {
      return [];
    }
  }
  const { data, error } = await sb.from("salvos").select("perfil_slug").order("criado_em", { ascending: false });
  if (error) return [];
  return (data as { perfil_slug: string }[]).map((l) => l.perfil_slug);
}

export async function alternarSalvo(slug: string, salvar: boolean) {
  const sb = supabase();
  if (!sb) {
    const atual = await listarSalvos();
    const nova = salvar ? [slug, ...atual.filter((s) => s !== slug)] : atual.filter((s) => s !== slug);
    try {
      localStorage.setItem(CHAVE_SALVOS_DEMO, JSON.stringify(nova));
    } catch {
      /* sem armazenamento */
    }
    return;
  }
  const { data: u } = await sb.auth.getUser();
  if (!u.user) throw new Error("Entre para salvar talentos.");
  const r = salvar
    ? await sb.from("salvos").upsert({ contratante_id: u.user.id, perfil_slug: slug }, { ignoreDuplicates: true })
    : await sb.from("salvos").delete().eq("contratante_id", u.user.id).eq("perfil_slug", slug);
  if (r.error) throw traduzirErro(r.error);
}

/* ---------- Jornal do Fólium ---------- */

export type Materia = {
  id: string;
  publico: "todos" | "colaborador" | "contratante";
  editoria: string;
  titulo: string;
  linhaFina: string;
  texto: string;
  autor: string;
  imagem?: string;
  publicadaEm: string;
};

/** Matérias da equipe. O banco só devolve para assinantes Premium (regra no Supabase). */
export async function listarMaterias(): Promise<Materia[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("jornal_materias")
    .select("*")
    .eq("publicada", true)
    .order("publicada_em", { ascending: false })
    .limit(12);
  if (error) return [];
  return (
    data as { id: string; publico: Materia["publico"]; editoria: string; titulo: string; linha_fina: string; texto: string; autor: string; imagem_url: string | null; publicada_em: string }[]
  ).map((m) => ({
    id: m.id,
    publico: m.publico,
    editoria: m.editoria,
    titulo: m.titulo,
    linhaFina: m.linha_fina,
    texto: m.texto,
    autor: m.autor,
    imagem: m.imagem_url ?? undefined,
    publicadaEm: m.publicada_em,
  }));
}

/* ---------- Feedback ---------- */

export type TipoFeedback = "sugestao" | "problema" | "elogio" | "outro";

/**
 * Envia um feedback para a equipe. O banco só aceita inserir (quem mandou não consegue ler de volta);
 * a equipe lê na tabela "feedbacks" pelo Table Editor do Supabase.
 */
export async function enviarFeedback(f: { tipo: TipoFeedback; mensagem: string; pagina: string; nota: number | null }) {
  const sb = supabase();
  if (!sb) return; // modo demonstração: não guarda nada
  const { data: u } = await sb.auth.getUser();
  if (!u.user) throw new Error("Entre na sua conta para mandar feedback.");
  const { error } = await sb.from("feedbacks").insert({
    autor_id: u.user.id,
    tipo: f.tipo,
    mensagem: f.mensagem.trim().slice(0, 1500),
    pagina: f.pagina.slice(0, 120),
    nota: f.nota,
  });
  if (error) {
    if (/Muitos feedbacks/.test(error.message)) throw new Error("Você mandou vários feedbacks seguidos. Espere um pouco e tente de novo.");
    if (/relation .*feedbacks|does not exist|schema cache/i.test(error.message))
      throw new Error("O feedback ainda não foi ligado no banco. Avise a equipe do Fólium.");
    throw traduzirErro(error);
  }
}
