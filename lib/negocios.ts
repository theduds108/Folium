"use client";

// Convites, combinados, avaliações, estatísticas, link público, vagas novas e painel da equipe.
// Tabelas e regras de acesso em supabase/migrations/20261111120000_combinados_convites_equipe.sql.

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Aluno } from "./data";
import { collabsDoPerfil, meusConvitesCollab, paraAluno, traduzirErro, type PerfilBanco, type TrabalhoBanco } from "./repositorio";
import { supabase } from "./supabase";
import { useConta } from "./conta";

/** A migração de 11/11 ainda não rodou: a tabela ou a função não existe. */
export function semMigracao(e: { code?: string; message?: string } | null | undefined) {
  if (!e) return false;
  return ["PGRST202", "PGRST205", "42883", "42P01", "42703", "PGRST204"].includes(e.code ?? "") || /Could not find|does not exist/i.test(e.message ?? "");
}

// ---------------------------------------------------------------------------------------------
// Link público (5)

/** Portfólio aberto pelo link público, sem login. Sem contatos, currículo nem certificados. */
export async function portfolioPublico(slug: string): Promise<Aluno | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("portfolio_publico", { p_slug: slug });
  if (error) {
    if (semMigracao(error)) return null;
    throw traduzirErro(error);
  }
  if (!data) return null;
  const p = data as PerfilBanco & { trabalhos: TrabalhoBanco[] };
  const aluno = paraAluno({
    ...p,
    whatsapp: "",
    email_contato: "",
    links: {},
    experiencias: [],
    certificados: [],
    curriculo_url: null,
    publicado: true,
  });
  return { ...aluno, publico: true, collabs: await collabsDoPerfil(slug) };
}

/** Id anônimo deste navegador, só para contar visitas sem login (um por dia). */
function idNavegador() {
  try {
    let id = localStorage.getItem("folium-visitante");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("folium-visitante", id);
    }
    return id;
  } catch {
    return null;
  }
}

const MEUS_PORTFOLIOS = "folium-meus-portfolios";

/**
 * Guarda neste navegador o endereço do portfólio de quem está logado, para que o dono
 * não conte como visita quando abrir o próprio link público sem estar logado.
 */
export function lembrarMeuPortfolio(slug: string) {
  if (!slug) return;
  try {
    const lista: string[] = JSON.parse(localStorage.getItem(MEUS_PORTFOLIOS) ?? "[]");
    if (!lista.includes(slug)) localStorage.setItem(MEUS_PORTFOLIOS, JSON.stringify([...lista, slug].slice(-5)));
  } catch {
    /* sem armazenamento: o banco ainda barra o dono quando ele está logado */
  }
}

function ehMeuPortfolio(slug: string) {
  try {
    return (JSON.parse(localStorage.getItem(MEUS_PORTFOLIOS) ?? "[]") as string[]).includes(slug);
  } catch {
    return false;
  }
}

/**
 * Conta a visita no portfólio. Não contam: o próprio dono (logado ou não, neste navegador),
 * navegadores automáticos (robôs) e a mesma pessoa mais de uma vez no dia.
 * O banco ainda limita quantos visitantes anônimos diferentes a mesma conexão soma por dia.
 */
export async function registrarVisita(slug: string) {
  const sb = supabase();
  if (!sb) return;
  if (typeof navigator !== "undefined" && navigator.webdriver) return;
  if (ehMeuPortfolio(slug)) return;
  await sb.rpc("registrar_visita", { p_slug: slug, p_visitante: idNavegador() }).then(
    () => undefined,
    () => undefined,
  );
}

// ---------------------------------------------------------------------------------------------
// Estatísticas (8)

export type Estatisticas = {
  premium: boolean;
  visitas_30: number;
  visitas_7: number | null;
  visitas_contratantes_30: number | null;
  visitas_total: number | null;
  salvos: number | null;
  interesses: number;
  convites: number;
};

export async function minhasEstatisticas(): Promise<Estatisticas | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("minhas_estatisticas");
  if (error) {
    if (semMigracao(error)) return null;
    throw traduzirErro(error);
  }
  return (data as Estatisticas | null) ?? null;
}

// ---------------------------------------------------------------------------------------------
// Vagas novas (10)

/**
 * Quantas vagas foram aprovadas desde a última vez que a pessoa abriu o mural.
 * Para aluno, conta só as dos serviços que ele oferece (se ele marcou algum).
 */
/** Quantos convites de collab esperam resposta do aluno logado (bolinha no "Meu portfólio"). */
export function useConvitesCollabPendentes() {
  const { conta } = useConta();
  const [pendentes, setPendentes] = useState(0);
  const contaId = conta?.id;
  const tipo = conta?.tipo;
  const pathname = usePathname() ?? "";
  useEffect(() => {
    if (!contaId || tipo !== "colaborador") {
      setPendentes(0);
      return;
    }
    let ativo = true;
    meusConvitesCollab()
      .then((l) => ativo && setPendentes(l.filter((c) => c.status === "pendente").length))
      .catch(() => ativo && setPendentes(0));
    return () => {
      ativo = false;
    };
  }, [contaId, tipo, pathname]);
  return pendentes;
}

export function useVagasNovas() {
  const { conta } = useConta();
  const [novas, setNovas] = useState(0);
  const contaId = conta?.id;
  const tipo = conta?.tipo;
  // No próprio mural as vagas já estão sendo vistas.
  const noMural = (usePathname() ?? "").startsWith("/oportunidades");

  useEffect(() => {
    const sb = supabase();
    if (!sb || !contaId || tipo !== "colaborador" || noMural) {
      setNovas(0);
      return;
    }
    let ativo = true;
    const contar = async () => {
      const [{ data: c }, { data: p }] = await Promise.all([
        sb.from("contas").select("vagas_vistas_em, criada_em").eq("id", contaId).maybeSingle(),
        sb.from("perfis").select("servicos").eq("id", contaId).maybeSingle(),
      ]);
      const desde = (c as { vagas_vistas_em?: string | null; criada_em?: string } | null)?.vagas_vistas_em
        ?? (c as { criada_em?: string } | null)?.criada_em;
      if (!desde) return;
      const { data } = await sb.from("oportunidades").select("id, servico, aprovada_em").eq("status", "aprovada").gt("aprovada_em", desde).limit(50);
      const servicos = ((p as { servicos?: string[] } | null)?.servicos ?? []);
      const lista = (data as { servico: string; aprovada_em: string | null }[] | null) ?? [];
      const n = lista.filter((o) => o.aprovada_em && o.aprovada_em > desde && (!servicos.length || servicos.includes(o.servico))).length;
      if (ativo) setNovas(n);
    };
    contar().catch(() => undefined);
    const aoVer = () => setNovas(0);
    window.addEventListener("folium-vagas-vistas", aoVer);
    return () => {
      ativo = false;
      window.removeEventListener("folium-vagas-vistas", aoVer);
    };
  }, [contaId, tipo, noMural]);

  return noMural ? 0 : novas;
}

/** Abriu o mural: as vagas de agora já foram vistas. */
export async function marcarVagasVistas() {
  const sb = supabase();
  if (!sb) return;
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return;
  await sb.from("contas").update({ vagas_vistas_em: new Date().toISOString() }).eq("id", u.user.id).then(
    () => undefined,
    () => undefined,
  );
  window.dispatchEvent(new Event("folium-vagas-vistas"));
}

// ---------------------------------------------------------------------------------------------
// Convites (12)

export type Convite = {
  id: string;
  oportunidade_id: string;
  perfil_id: string;
  contratante_id: string;
  mensagem: string;
  status: "enviado" | "aceito" | "recusado";
  criado_em: string;
  vaga?: { titulo: string; empresa: string; tipo: string; servico: string; orcamento: string; prazo: string; descricao: string; contato: string } | null;
  perfil?: { nome: string; slug: string } | null;
};

const SELECT_CONVITE = "*, vaga:oportunidades(titulo, empresa, tipo, servico, orcamento, prazo, descricao, contato), perfil:perfis(nome, slug)";

export async function convitesRecebidos(perfilId: string): Promise<Convite[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from("convites").select(SELECT_CONVITE).eq("perfil_id", perfilId).order("criado_em", { ascending: false });
  if (error) {
    if (semMigracao(error)) return [];
    throw traduzirErro(error);
  }
  return (data as Convite[]) ?? [];
}

export async function convitesEnviados(contratanteId: string): Promise<Convite[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from("convites").select(SELECT_CONVITE).eq("contratante_id", contratanteId).order("criado_em", { ascending: false });
  if (error) {
    if (semMigracao(error)) return [];
    throw traduzirErro(error);
  }
  return (data as Convite[]) ?? [];
}

export async function convidar(oportunidadeId: string, perfilId: string, mensagem: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("convites").insert({ oportunidade_id: oportunidadeId, perfil_id: perfilId, mensagem: mensagem.trim() });
  if (!error) return;
  if (error.code === "23505") throw new Error("Você já convidou esse aluno para essa vaga.");
  if (semMigracao(error)) throw new Error("Os convites ainda não foram ativados pela equipe.");
  if (/Muitos convites/.test(error.message)) throw new Error("Você mandou muitos convites hoje. Tente amanhã.");
  throw traduzirErro(error);
}

export async function responderConvite(id: string, aceitar: boolean) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("responder_convite", { p_id: id, p_aceitar: aceitar });
  if (error) throw traduzirErro(error);
}

// ---------------------------------------------------------------------------------------------
// Combinados (1)

export type StatusCombinado = "proposto" | "aceito" | "pausado" | "recusado" | "concluido" | "cancelado";

export type Combinado = {
  id: string;
  contratante_id: string;
  perfil_id: string;
  oportunidade_id: string | null;
  contratante_nome: string;
  titulo: string;
  escopo: string;
  prazo: string | null;
  valor: string;
  sinal: string;
  pagamento: string;
  ajustes: string;
  status: StatusCombinado;
  criado_em: string;
  aceito_em: string | null;
  concluido_em: string | null;
  pausado_em?: string | null;
  perfil?: { nome: string; slug: string; curso: string } | null;
};

export type NovoCombinado = Pick<Combinado, "perfil_id" | "titulo" | "escopo" | "valor" | "sinal" | "pagamento" | "ajustes"> & {
  prazo: string;
  oportunidade_id?: string | null;
};

export const NOME_STATUS: Record<StatusCombinado, string> = {
  proposto: "Esperando o aluno",
  aceito: "Combinado fechado",
  pausado: "Pausado pelo aluno",
  recusado: "Recusado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export async function meusCombinados(): Promise<Combinado[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from("combinados").select("*, perfil:perfis(nome, slug, curso)").order("criado_em", { ascending: false });
  if (error) {
    if (semMigracao(error)) return [];
    throw traduzirErro(error);
  }
  return (data as Combinado[]) ?? [];
}

export async function proporCombinado(c: NovoCombinado) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("combinados").insert({ ...c, prazo: c.prazo || null, oportunidade_id: c.oportunidade_id || null });
  if (!error) return;
  if (semMigracao(error)) throw new Error("Os combinados ainda não foram ativados pela equipe.");
  if (/Muitos combinados/.test(error.message)) throw new Error("Você mandou muitas propostas hoje. Tente amanhã.");
  throw traduzirErro(error);
}

export type AcaoCombinado = "aceitar" | "recusar" | "cancelar" | "concluir" | "pausar" | "retomar" | "encerrar";

export async function mudarCombinado(id: string, acao: AcaoCombinado) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("mudar_combinado", { p_id: id, p_acao: acao });
  if (error) throw traduzirErro(error);
}

// ---------------------------------------------------------------------------------------------
// Avaliações (2)

export type AvaliacaoReal = {
  id: string; combinado_id: string; autor_id: string | null; alvo_id: string; autor_nome: string; nota: number; texto: string; criado_em: string;
  /** Notas por critério (SQL de 12/11 à tarde). Avaliações antigas vêm vazias. */
  criterios?: Record<string, number> | null;
  resposta?: string;
  resposta_em?: string | null;
  oculta?: boolean;
};

export async function avaliacoesDe(alvoId: string): Promise<AvaliacaoReal[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from("avaliacoes").select("*").eq("alvo_id", alvoId).order("criado_em", { ascending: false }).limit(30);
  if (error) return [];
  return (data as AvaliacaoReal[]) ?? [];
}

/** Avaliações que eu já fiz, para não mostrar o formulário de novo. */
export async function minhasAvaliacoesFeitas(autorId: string): Promise<string[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data } = await sb.from("avaliacoes").select("combinado_id").eq("autor_id", autorId);
  return ((data as { combinado_id: string }[] | null) ?? []).map((a) => a.combinado_id);
}

/**
 * Avalia a outra parte. Com critérios, a nota geral é a média deles (o banco recalcula).
 * A avaliação fica escondida até a outra parte avaliar também, ou por 14 dias.
 */
export async function avaliar(combinadoId: string, alvoId: string, criterios: Record<string, number>, texto: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const valores = Object.values(criterios);
  const nota = Math.round(valores.reduce((s, v) => s + v, 0) / Math.max(1, valores.length));
  let { error } = await sb.from("avaliacoes").insert({ combinado_id: combinadoId, alvo_id: alvoId, nota, criterios, texto: texto.trim() });
  // SQL de 12/11 à tarde ainda não rodado: grava só a nota geral, como antes.
  if (error && semMigracao(error)) ({ error } = await sb.from("avaliacoes").insert({ combinado_id: combinadoId, alvo_id: alvoId, nota, texto: texto.trim() }));
  if (!error) return;
  if (error.code === "23505") throw new Error("Você já avaliou esse trabalho.");
  throw traduzirErro(error);
}

/** Média das notas. Abaixo de 3 avaliações devolve null: poucas notas não dizem muito e expõem quem avaliou. */
export function media(lista: { nota: number }[]) {
  if (lista.length < 3) return null;
  return Math.round((lista.reduce((s, a) => s + a.nota, 0) / lista.length) * 10) / 10;
}

// ---------------------------------------------------------------------------------------------
// Equipe (17)

export function useEquipe() {
  const { conta } = useConta();
  const [equipe, setEquipe] = useState(false);
  const id = conta?.id;
  useEffect(() => {
    const sb = supabase();
    if (!sb || !id) {
      setEquipe(false);
      return;
    }
    let ativo = true;
    sb.rpc("eh_equipe").then(({ data }) => {
      if (ativo) setEquipe(data === true);
    }, () => undefined);
    return () => {
      ativo = false;
    };
  }, [id]);
  return equipe;
}

export type VagaEquipe = {
  id: string; titulo: string; empresa: string; contato: string; tipo: string; servico: string; cidade: string;
  orcamento: string; prazo: string; descricao: string; status: "pendente" | "aprovada" | "recusada"; criada_em: string;
};
export type DenunciaEquipe = { id: string; alvo_tipo: string; alvo: string; motivo: string; detalhes: string; criada_em: string; resolvida: boolean };
export type FeedbackEquipe = { id: string; tipo: string; mensagem: string; pagina: string; nota: number | null; criado_em: string };
export type ContaEquipe = { id: string; email: string; tipo: string; plano: string; plano_ate: string | null; plano_pedido: string | null; nome: string; empresa: string; criada_em: string;
  /** Vazio = contratante em análise. Ausente = SQL de 12/11 ainda não rodado. */
  aprovada_em?: string | null;
  /** SQL de 12/11 à tarde: aceite dos termos e suspensão. */
  termos_aceitos_em?: string | null;
  suspensa_ate?: string | null };

export async function equipeDados() {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const [vagas, denuncias, feedbacks, contas, perfis] = await Promise.all([
    sb.from("oportunidades").select("*").order("criada_em", { ascending: false }).limit(100),
    sb.from("denuncias").select("*").order("criada_em", { ascending: false }).limit(100),
    sb.from("feedbacks").select("*").order("criado_em", { ascending: false }).limit(100),
    sb.rpc("equipe_contas"),
    sb.from("perfis").select("id, nome").limit(1000),
  ]);
  const erro = vagas.error || denuncias.error || feedbacks.error || contas.error;
  if (erro) throw traduzirErro(erro);
  return {
    vagas: (vagas.data as VagaEquipe[]) ?? [],
    denuncias: (denuncias.data as DenunciaEquipe[]) ?? [],
    feedbacks: (feedbacks.data as FeedbackEquipe[]) ?? [],
    // O nome do portfólio completa contas que ainda não têm nome próprio.
    contas: ((contas.data as ContaEquipe[]) ?? []).map((c) => ({
      ...c,
      nome: c.nome || ((perfis.data as { id: string; nome: string }[] | null) ?? []).find((p) => p.id === c.id)?.nome || "",
    })),
  };
}

export async function equipeMudarVaga(id: string, status: "aprovada" | "recusada" | "pendente") {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("oportunidades").update({ status }).eq("id", id);
  if (error) throw traduzirErro(error);
}

export async function equipeResolverDenuncia(id: string, resolvida: boolean) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("denuncias").update({ resolvida }).eq("id", id);
  if (error) throw traduzirErro(error);
}

/** Libera (ou tira) o Premium. `ate` vazio = sem data para acabar. */
export async function equipeMudarPlano(id: string, plano: "gratis" | "premium", ate: string | null) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("contas").update({ plano, plano_ate: ate || null, plano_pedido: null }).eq("id", id);
  if (error) throw traduzirErro(error);
}

export async function equipeTirarPerfil(slug: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("perfis").update({ publicado: false }).eq("slug", slug);
  if (error) throw traduzirErro(error);
}

/** Aprova (ou volta para análise) um contratante: só aprovado vê contatos dos alunos. */
export async function equipeAprovarContratante(id: string, aprovar: boolean) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("contas").update({ aprovada_em: aprovar ? new Date().toISOString() : null }).eq("id", id);
  if (error) throw traduzirErro(error);
}
