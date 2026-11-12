"use client";

// Segurança das pessoas: termos e código de conduta, botão "Preciso de ajuda", denúncia ligada a um
// combinado (nos dois sentidos), defesa da outra parte, decisões da equipe e avaliação por critérios.
// Tabelas e regras em supabase/migrations/20261112180000_seguranca_pessoas.sql.

import { traduzirErro } from "./repositorio";
import { semMigracao } from "./negocios";
import { supabase } from "./supabase";
import { prepararFoto } from "./validarFoto";

import { VERSAO_TERMOS } from "./versao-termos";
export * from "./seguranca-dados";

export { VERSAO_TERMOS };

export async function aceitarTermos() {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("aceitar_termos", { p_versao: VERSAO_TERMOS });
  if (error) {
    if (semMigracao(error)) return;
    throw traduzirErro(error);
  }
}

// ---------------------------------------------------------------------------------------------
// Ocorrências

export type TipoOcorrencia = "ajuda" | "denuncia";
export type StatusOcorrencia = "aberta" | "em_analise" | "aguardando_defesa" | "resolvida" | "arquivada";
export type Decisao = "arquivada" | "advertencia" | "suspensao" | "banimento" | "ma_fe";

export type Ocorrencia = {
  id: string;
  tipo: TipoOcorrencia;
  combinado_id: string | null;
  autor_id: string | null;
  alvo_id: string | null;
  autor_lado: "aluno" | "contratante" | "";
  categoria: string;
  relato: string;
  provas: string[];
  sigilo: boolean;
  avisar_faculdade: boolean;
  pausou_combinado: boolean;
  urgente: boolean;
  status: StatusOcorrencia;
  prazo_em: string | null;
  resumo_defesa: string;
  defesa: string;
  defesa_em: string | null;
  decisao: Decisao | null;
  decisao_texto: string;
  decidida_em: string | null;
  criada_em: string;
  combinado?: { titulo: string; contratante_nome: string; status: string } | null;
};

export type NovaOcorrencia = {
  tipo: TipoOcorrencia;
  combinado_id: string;
  categoria: string;
  relato: string;
  provas: string[];
  avisar_faculdade?: boolean;
  pausou_combinado?: boolean;
};

/** Print ou PDF de prova: vai para provas/<id do usuário>/, pasta que só o autor e a equipe abrem. */
export async function enviarProva(userId: string, arquivo: File): Promise<string> {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  let corpo: Blob = arquivo;
  let tipo = arquivo.type;
  let ext = "pdf";
  if (arquivo.type === "application/pdf") {
    if (arquivo.size > 5 * 1024 * 1024) throw new Error("O PDF passou de 5 MB. Mande um print da parte importante.");
  } else {
    const { blob } = await prepararFoto(arquivo);
    corpo = blob;
    tipo = "image/jpeg";
    ext = "jpeg";
  }
  const caminho = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("provas").upload(caminho, corpo, { contentType: tipo });
  if (error) throw traduzirErro(error);
  return caminho;
}

export async function registrarOcorrencia(o: NovaOcorrencia) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("ocorrencias").insert({
    tipo: o.tipo,
    combinado_id: o.combinado_id,
    categoria: o.categoria,
    relato: o.relato.trim(),
    provas: o.provas,
    avisar_faculdade: !!o.avisar_faculdade,
    pausou_combinado: !!o.pausou_combinado,
  });
  if (!error) return;
  if (semMigracao(error)) throw new Error("Esse recurso ainda está sendo ativado pela equipe. Se for urgente, ligue para os números acima.");
  if (/Muitas ocorrencias/.test(error.message)) throw new Error("Você mandou muitos registros hoje. Se for urgente, ligue para os números acima.");
  throw traduzirErro(error);
}

/** O que eu já registrei (para acompanhar o andamento). */
export async function minhasOcorrencias(autorId: string): Promise<Ocorrencia[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from("ocorrencias").select("*").eq("autor_id", autorId).order("criada_em", { ascending: false });
  if (error) return [];
  return (data as Ocorrencia[]) ?? [];
}

export type PedidoDefesa = { id: string; categoria: string; resumo_defesa: string; titulo_combinado: string; defesa: string; defesa_em: string | null; status: StatusOcorrencia };

/** Denúncias contra mim em que a equipe pediu a minha versão. Nunca traz o relato nem quem denunciou. */
export async function meusPedidosDeDefesa(): Promise<PedidoDefesa[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("meus_pedidos_de_defesa");
  if (error) return [];
  return (data as PedidoDefesa[]) ?? [];
}

export async function enviarDefesa(id: string, texto: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("enviar_defesa", { p_id: id, p_texto: texto });
  if (error) throw traduzirErro(error);
}

// ---------------------------------------------------------------------------------------------
// Equipe

export type HistoricoOcorrencia = { id: number; ocorrencia_id: string; quem: string | null; acao: string; texto: string; em: string };

export async function equipeOcorrencias(): Promise<{ ocorrencias: Ocorrencia[]; historico: HistoricoOcorrencia[] } | null> {
  const sb = supabase();
  if (!sb) return null;
  const [o, h] = await Promise.all([
    sb.from("ocorrencias").select("*, combinado:combinados(titulo, contratante_nome, status)").order("criada_em", { ascending: false }).limit(200),
    sb.from("ocorrencias_historico").select("*").order("em", { ascending: true }).limit(2000),
  ]);
  if (o.error) {
    if (semMigracao(o.error)) return null;
    throw traduzirErro(o.error);
  }
  return { ocorrencias: (o.data as Ocorrencia[]) ?? [], historico: (h.data as HistoricoOcorrencia[]) ?? [] };
}

export async function equipeAndarOcorrencia(id: string, acao: "analisar" | "pedir_defesa" | "decidir", decisao: Decisao | null = null, texto = "") {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("equipe_ocorrencia", { p_id: id, p_acao: acao, p_decisao: decisao, p_texto: texto });
  if (error) throw traduzirErro(error);
}

/** Link que expira em 10 minutos para a equipe abrir um print. */
export async function equipeAbrirProva(caminho: string): Promise<string> {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { data, error } = await sb.storage.from("provas").createSignedUrl(caminho, 600);
  if (error || !data) throw traduzirErro(error ?? { message: "Não deu para abrir o arquivo" });
  return data.signedUrl;
}

export async function equipeTirarSuspensao(id: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("equipe_tirar_suspensao", { p_id: id });
  if (error) throw traduzirErro(error);
}

export async function equipeAnularAvaliacao(id: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.from("avaliacoes").update({ oculta: true }).eq("id", id);
  if (error) throw traduzirErro(error);
}

/** Prazo vencido e ainda sem decisão. */
export function atrasada(o: Pick<Ocorrencia, "prazo_em" | "status">) {
  return !!o.prazo_em && o.prazo_em < new Date().toISOString() && (o.status === "aberta" || o.status === "em_analise" || o.status === "aguardando_defesa");
}

export function dataHora(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

// ---------------------------------------------------------------------------------------------
// Avaliação por critérios (fase 3)

export async function responderAvaliacao(id: string, texto: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const { error } = await sb.rpc("responder_avaliacao", { p_id: id, p_texto: texto });
  if (error) throw traduzirErro(error);
}
