// Leitura e gravação no banco (Supabase). Tudo aqui roda no navegador.
// No modo demonstração (sem .env.local) as funções devolvem listas vazias.

import type { Aluno, Certificado, Coautor, Experiencia, Formacao, Idioma, Links, Trabalho } from "./data";
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
  /** Detalhes da graduação (migração 20261113120000). */
  formacao?: Formacao;
  modalidades: string[];
  tipos_vaga: string[];
  links: Links;
  experiencias: Experiencia[];
  certificados: Certificado[];
  idiomas: Idioma[];
  curriculo_url: string | null;
  /** Link público (migração 20261111120000): quem tem o link vê o portfólio sem login, sem contatos. */
  link_publico?: boolean;
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
  /** Colegas do trabalho em collab (migração 20261113120000). */
  coautores?: Coautor[];
};

type PerfilComTrabalhos = PerfilBanco & { trabalhos: TrabalhoBanco[] | null; contatos_ocultos?: boolean };

/** Só os dígitos, com 55 na frente se faltar (formato do wa.me). */
export function whatsappParaLink(numero: string) {
  const d = numero.replace(/\D/g, "");
  if (!d) return "";
  return d.startsWith("55") && d.length >= 12 ? d : `55${d}`;
}

const SLUG_VALIDO = /^[a-z0-9][a-z0-9-]{1,79}$/;

/** Só nomes de texto e slugs no formato do site: o que vem do banco nunca vira link estranho. */
export function coautoresValidos(lista: unknown): Coautor[] {
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((c): c is Coautor => !!c && typeof c === "object" && typeof (c as Coautor).nome === "string" && (c as Coautor).nome.trim() !== "")
    .slice(0, 6)
    .map((c) => ({ nome: c.nome.trim().slice(0, 80), ...(typeof c.slug === "string" && SLUG_VALIDO.test(c.slug) ? { slug: c.slug } : {}) }));
}

function formacaoValida(f: unknown): Formacao {
  if (!f || typeof f !== "object") return {};
  const x = f as Formacao;
  const txt = (v: unknown) => (typeof v === "string" ? v : undefined);
  return {
    grau: txt(x.grau),
    situacao: txt(x.situacao),
    turno: txt(x.turno),
    inicio: txt(x.inicio),
    outras: Array.isArray(x.outras) ? x.outras.filter((o) => o && typeof o.curso === "string" && o.curso.trim()) : [],
  };
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
      coautores: coautoresValidos(t.coautores),
    }));
  return {
    id: p.id,
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
    formacao: formacaoValida(p.formacao),
    modalidades: p.modalidades ?? [],
    tiposVaga: p.tipos_vaga ?? [],
    links: p.links ?? {},
    experiencias: p.experiencias ?? [],
    certificados: p.certificados ?? [],
    idiomas: p.idiomas ?? [],
    curriculo: p.curriculo_url ?? undefined,
    contatosOcultos: p.contatos_ocultos || undefined,
  };
}

/**
 * Colunas do portfólio que qualquer conta lê. WhatsApp, e-mail, currículo e certificados ficam de
 * fora: vêm de contatos_perfis(), que só entrega para alunos, equipe e contratantes aprovados
 * (migração 20261112000000_seguranca_auditoria.sql).
 */
const CAMPOS_PERFIL = "id, slug, nome, curso, semestre, cidade, bio, servicos, habilidades, valor_referencia, foto_url, disponivel, publicado, titulo, sobre_longo, conclusao, formacao, modalidades, tipos_vaga, links, experiencias, idiomas, link_publico, trabalhos!perfil_id(*)" as const;
/** Banco sem a coluna formacao (SQL de 13/11 ainda não rodado): lê o resto, como antes. */
const CAMPOS_SEM_FORMACAO = CAMPOS_PERFIL.replace(" formacao,", "");
let semFormacao = false;
const colunaAusente = (e: { message?: string } | null, coluna: string) => !!e && new RegExp(coluna).test(e.message ?? "");

/**
 * Lê perfis com os trabalhos. Se o banco recusar (coluna nova ainda não criada, relação ambígua
 * entre perfis e trabalhos, cache do Supabase desatualizado…), tenta de novo de jeitos mais
 * simples, e no último lê os trabalhos numa consulta separada. A lista de portfólios nunca
 * some por causa de uma mudança no banco.
 */
async function lerPerfis<T>(consulta: (campos: string) => PromiseLike<{ data: T; error: { message?: string; code?: string } | null }>) {
  if (!semFormacao) {
    const r = await consulta(CAMPOS_PERFIL);
    if (!r.error) return r;
    console.error("Leitura de perfis falhou, tentando sem a formação", r.error);
    if (colunaAusente(r.error, "formacao")) semFormacao = true;
  }
  const r2 = await consulta(semFormacao ? CAMPOS_SEM_FORMACAO : CAMPOS_PERFIL.replace("!perfil_id", ""));
  if (!r2.error) return r2;
  console.error("Leitura de perfis falhou de novo, lendo os trabalhos à parte", r2.error);
  const campos = (semFormacao ? CAMPOS_SEM_FORMACAO : CAMPOS_PERFIL).replace(", trabalhos!perfil_id(*)", "");
  let r3 = await consulta(campos);
  if (r3.error && colunaAusente(r3.error, "formacao")) r3 = await consulta(campos.replace(" formacao,", ""));
  if (r3.error || !r3.data) return r3;
  const sb = supabase();
  const lista = (Array.isArray(r3.data) ? r3.data : [r3.data]) as { id: string; trabalhos?: TrabalhoBanco[] }[];
  if (sb && lista.length) {
    const t = await sb.from("trabalhos").select("*").in("perfil_id", lista.map((p) => p.id));
    const porPerfil = new Map<string, TrabalhoBanco[]>();
    for (const x of (t.data ?? []) as (TrabalhoBanco & { perfil_id: string })[]) porPerfil.set(x.perfil_id, [...(porPerfil.get(x.perfil_id) ?? []), x]);
    for (const p of lista) p.trabalhos = porPerfil.get(p.id) ?? [];
  }
  return r3;
}

type Contatos = Pick<PerfilBanco, "id" | "whatsapp" | "email_contato" | "curriculo_url" | "certificados">;

/**
 * Junta os contatos aos perfis. Quem não pode ver (contratante em análise) recebe os perfis
 * sem contatos e com `contatos_ocultos`. Se a função ainda não existe no banco (SQL não rodado),
 * lê as colunas direto, como antes.
 */
async function comContatos(perfis: PerfilComTrabalhos[]): Promise<PerfilComTrabalhos[]> {
  const sb = supabase();
  if (!sb || !perfis.length) return perfis;
  const ids = perfis.map((p) => p.id);
  let lista: Contatos[] | null = null;
  const r = await sb.rpc("contatos_perfis", { p_ids: ids });
  if (!r.error) lista = (r.data as Contatos[] | null) ?? [];
  else if (funcaoAusente(r.error)) {
    const d = await sb.from("perfis").select("id, whatsapp, email_contato, curriculo_url, certificados").in("id", ids);
    if (d.error) throw traduzirErro(d.error);
    lista = (d.data as Contatos[]) ?? [];
  } else throw traduzirErro(r.error);
  const porId = new Map(lista.map((c) => [c.id, c]));
  return perfis.map((p) => {
    const c = porId.get(p.id);
    return c
      ? { ...p, ...c }
      : { ...p, whatsapp: "", email_contato: "", curriculo_url: null, certificados: [], contatos_ocultos: true };
  });
}

/** Perfis publicados, mais recentes primeiro. Com `lancarErro`, a falha vira erro (a tela avisa em vez de mostrar "nenhum"). */
export async function listarAlunosReais(lancarErro = false): Promise<Aluno[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await lerPerfis((campos) =>
    sb.from("perfis").select(campos).eq("publicado", true).order("atualizado_em", { ascending: false }).limit(200)
  );
  if (error) {
    console.error("Erro ao listar perfis", error);
    if (lancarErro) throw traduzirErro(error);
    return [];
  }
  try {
    return (await comContatos(data as unknown as PerfilComTrabalhos[])).map(paraAluno);
  } catch (e) {
    console.error("Erro ao ler contatos", e);
    if (lancarErro) throw e;
    return [];
  }
}

export async function buscarAlunoReal(slug: string): Promise<Aluno | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await lerPerfis((campos) => sb.from("perfis").select(campos).eq("slug", slug).maybeSingle());
  // Falha de rede ou do banco: avisa quem chamou, para não confundir com "portfólio não encontrado".
  if (error) throw traduzirErro(error);
  if (!data) return null;
  const [[completo], collabs] = await Promise.all([comContatos([data as unknown as PerfilComTrabalhos]), collabsDoPerfil(slug)]);
  return { ...paraAluno(completo!), collabs };
}

/** Perfil e trabalhos do usuário logado, para o editor. */
export async function meuPerfil(userId: string) {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await lerPerfis((campos) => sb.from("perfis").select(campos).eq("id", userId).maybeSingle());
  if (error) throw error;
  if (!data) return null;
  const [completo] = await comContatos([data as unknown as PerfilComTrabalhos]);
  return completo!;
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

/** A função ainda não existe no banco (migração não rodada). */
function funcaoAusente(error: { code?: string; message?: string }) {
  return error.code === "PGRST202" || error.code === "42883" || /Could not find the function/i.test(error.message ?? "");
}

/**
 * Grava o perfil e substitui a lista de trabalhos.
 * Se o endereço (slug) já for de outra pessoa, tenta com um número no fim.
 */
export async function salvarPerfil(perfil: Omit<PerfilBanco, "slug"> & { slug?: string }, trabalhos: TrabalhoBanco[]) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");

  let slug = perfil.slug || criarSlug(perfil.nome);
  let dados: typeof perfil = perfil;
  for (let tentativa = 0; ; tentativa++) {
    // Atualiza se já existe; senão cria. (Sem upsert: o upsert pediria leitura das colunas de
    // contato, que o banco só libera pela função contatos_perfis.)
    const atualizado = await sb.from("perfis").update({ ...dados, slug }).eq("id", dados.id).select("id");
    let error = atualizado.error;
    if (!error && !atualizado.data?.length) error = (await sb.from("perfis").insert({ ...dados, slug })).error;
    if (!error) break;
    // Banco sem a coluna do link público (SQL de 11/11 ainda não rodado): salva o resto.
    if ("link_publico" in dados && /link_publico/.test(error.message ?? "") && tentativa < 5) {
      const { link_publico: _semColuna, ...resto } = dados;
      void _semColuna;
      dados = resto;
      continue;
    }
    // Banco sem a coluna formacao (SQL de 13/11 ainda não rodado): salva o resto.
    if ("formacao" in dados && colunaAusente(error, "formacao") && tentativa < 5) {
      const { formacao: _semColuna, ...resto } = dados;
      void _semColuna;
      dados = resto;
      continue;
    }
    if (error.code === "23505" && error.message.includes("slug") && tentativa < 5) {
      slug = `${criarSlug(perfil.nome).slice(0, 45)}-${Math.floor(100 + Math.random() * 900)}`;
      continue;
    }
    throw traduzirErro(error);
  }

  const validos = trabalhos
    .filter((t) => t.titulo.trim())
    .map((t, i) => ({
      ...(t.id ? { id: t.id } : {}),
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
      coautores: coautoresValidos(t.coautores),
    }));

  // Caminho principal: o banco troca a lista inteira numa transação só (tudo ou nada).
  // Ver supabase/migrations/20261111000000_salvar_trabalhos_excluir_conta.sql.
  const rpc = await sb.rpc("salvar_trabalhos", { p_trabalhos: validos });
  // A função nova (SQL de 13/11, collab) devolve os ids na ordem: o editor guarda para a próxima
  // gravação atualizar os mesmos trabalhos e os convites de collab não se perderem.
  if (!rpc.error) return { slug, idsTrabalhos: Array.isArray(rpc.data) ? (rpc.data as string[]) : null };
  if (!funcaoAusente(rpc.error)) throw traduzirErro(rpc.error);

  // Banco ainda sem a função (SQL de 11/11 não rodado): troca em duas etapas e, se a gravação
  // dos novos falhar (internet caiu, limite do plano), devolve os antigos para o aluno não perder nada.
  const antigos = await sb.from("trabalhos").select("*").eq("perfil_id", perfil.id);
  if (antigos.error) throw traduzirErro(antigos.error);
  const apagar = await sb.from("trabalhos").delete().eq("perfil_id", perfil.id);
  if (apagar.error) throw traduzirErro(apagar.error);
  if (validos.length) {
    let { error } = await sb.from("trabalhos").insert(validos.map(({ id: _id, ...t }) => (void _id, { ...t, perfil_id: perfil.id })));
    // Banco sem a coluna coautores: grava sem ela.
    if (colunaAusente(error, "coautores"))
      ({ error } = await sb.from("trabalhos").insert(validos.map(({ coautores: _c, id: _id, ...t }) => (void _c, void _id, { ...t, perfil_id: perfil.id }))));
    if (error) {
      if (antigos.data?.length) await sb.from("trabalhos").insert(antigos.data);
      throw traduzirErro(error);
    }
  }
  return { slug, idsTrabalhos: null };
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
export async function listarOportunidadesReais(lancarErro = false): Promise<Oportunidade[]> {
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
    if (lancarErro) throw traduzirErro(error);
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
  const { error } = await sb
    .from("interesses")
    .upsert({ oportunidade_id: oportunidadeId, perfil_id: perfilId }, { onConflict: "oportunidade_id,perfil_id", ignoreDuplicates: true });
  if (!error) return;
  // Sem portfólio salvo não há o que mandar para a empresa (perfil_id aponta para perfis).
  if (error.code === "23503") throw new Error("Salve seu portfólio antes: é ele que a empresa recebe quando você tem interesse.");
  throw traduzirErro(error);
}

/** Retira o interesse numa vaga (a empresa deixa de ver o aluno na lista). */
export async function desmarcarInteresse(oportunidadeId: string, perfilId: string) {
  const sb = supabase();
  if (!sb) return;
  const { error } = await sb.from("interesses").delete().eq("oportunidade_id", oportunidadeId).eq("perfil_id", perfilId);
  if (error) throw traduzirErro(error);
}

/** Vagas em que o aluno já marcou interesse, para o botão continuar marcado depois de recarregar. */
export async function meusInteresses(perfilId: string): Promise<string[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from("interesses").select("oportunidade_id").eq("perfil_id", perfilId);
  if (error) return [];
  return (data ?? []).map((l) => l.oportunidade_id as string);
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
  if (/Muitas denuncias/.test(msg)) return new Error("Você enviou muitas denúncias na última hora. Espere um pouco e tente de novo.");
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

/**
 * Exclui a conta de quem está logado (LGPD).
 * 1. Apaga as fotos e PDFs da pessoa (pastas fotos/<id>/ e curriculos/<id>/).
 * 2. Chama excluir_minha_conta() no banco, que apaga login, perfil, trabalhos, conta e salvos.
 * 3. Sai deste aparelho.
 */
export async function excluirMinhaConta(userId: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  for (const bucket of ["fotos", "curriculos"]) {
    const { data } = await sb.storage.from(bucket).list(userId, { limit: 1000 });
    const caminhos = (data ?? []).filter((f) => f.name).map((f) => `${userId}/${f.name}`);
    if (caminhos.length) {
      const { error } = await sb.storage.from(bucket).remove(caminhos);
      if (error) throw new Error("Não consegui apagar seus arquivos agora. Nada foi excluído; tente de novo em instantes.");
    }
  }
  const { error } = await sb.rpc("excluir_minha_conta");
  if (error) {
    if (funcaoAusente(error)) throw new Error("A exclusão de conta ainda não foi ativada pela equipe. Fale com a gente pela página Feedback.");
    throw traduzirErro(error);
  }
  await sb.auth.signOut({ scope: "local" });
}

/** Colega do Fólium para marcar num trabalho em collab: só nome, curso e endereço do portfólio. */
export type Colega = { slug: string; nome: string; curso: string; foto_url: string | null };

/** Procura portfólios publicados pelo nome (para marcar colegas num trabalho). Sem contatos. */
export async function buscarColegas(texto: string, meuId?: string): Promise<Colega[]> {
  const sb = supabase();
  const t = texto.trim().replace(/[%_,()*\\]/g, " ").trim();
  if (!sb || t.length < 2) return [];
  let q = sb.from("perfis").select("id, slug, nome, curso, foto_url").eq("publicado", true).ilike("nome", `%${t}%`).limit(6);
  if (meuId) q = q.neq("id", meuId);
  const { data, error } = await q;
  if (error) return [];
  return ((data ?? []) as (Colega & { id: string })[]).map(({ slug, nome, curso, foto_url }) => ({ slug, nome, curso, foto_url }));
}

// ---------------------------------------------------------------------------------------------
// Trabalho em collab no portfólio dos colegas (migração 20261113180000_collab_no_portfolio.sql)

/** Convite de collab que chegou para quem foi marcado num trabalho. */
export type ConviteCollab = {
  trabalho_id: string;
  titulo: string;
  tipo: string;
  imagem_url: string | null;
  status: "pendente" | "aceito";
  papel: string;
  dono_nome: string;
  dono_slug: string;
};

/** Convites pendentes e aceitos da pessoa logada. Banco sem o SQL: lista vazia. */
export async function meusConvitesCollab(): Promise<ConviteCollab[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("meus_convites_collab");
  if (error) {
    if (funcaoAusente(error)) return [];
    throw traduzirErro(error);
  }
  return Array.isArray(data) ? (data as ConviteCollab[]) : [];
}

/** Aceita (com a parte da pessoa), edita a parte, recusa ou tira do portfólio. */
export async function responderCollab(trabalhoId: string, aceitar: boolean, papel = "") {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("responder_collab", { p_trabalho: trabalhoId, p_aceitar: aceitar, p_papel: papel.trim().slice(0, 200) });
  if (error) throw traduzirErro(error);
}

type CollabBanco = TrabalhoBanco & { dono_nome: string; dono_slug: string };

/**
 * Trabalhos de outros alunos em que esta pessoa aceitou o collab, prontos para o portfólio dela:
 * os créditos mostram quem publicou e os outros colegas, e "Minha parte" é a dela.
 */
export async function collabsDoPerfil(slug: string): Promise<Trabalho[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("collabs_do_perfil", { p_slug: slug });
  if (error || !Array.isArray(data)) return [];
  return (data as CollabBanco[]).map((t, i) => ({
    titulo: t.titulo,
    tipo: t.tipo,
    descricao: t.descricao ?? "",
    cor: CORES[(i + 3) % CORES.length]!,
    imagem: t.imagem_url ?? undefined,
    galeria: t.galeria ?? [],
    cliente: t.cliente ?? "",
    ano: t.ano ?? "",
    link: t.link ?? "",
    papel: t.papel ?? "",
    coautores: coautoresValidos([{ nome: t.dono_nome, slug: t.dono_slug }, ...coautoresValidos(t.coautores).filter((c) => c.slug !== slug)]),
  }));
}
