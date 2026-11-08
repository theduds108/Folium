"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { emailInstitucional, VAGAS_LIBERADAS } from "./config";
import { supabase } from "./supabase";
import { useSessao } from "./sessao";

/**
 * Tipos de conta e planos do Fólium.
 *
 * colaborador = aluno com portfólio (só com e-mail institucional).
 * contratante = empresa ou pessoa que contrata (qualquer e-mail).
 *
 * Cada tipo tem o plano grátis e o Premium. O Premium libera o Jornal do Fólium
 * (uma edição para cada tipo) e recursos extras de cada área.
 */
export type TipoConta = "colaborador" | "contratante";
export type PlanoConta = "gratis" | "premium";

export type Conta = {
  id: string;
  tipo: TipoConta;
  plano: PlanoConta;
  planoAte: string | null;
  planoPedido: PlanoConta | null;
  nome: string;
  empresa: string;
  whatsapp: string;
  cidade: string;
  email: string;
  /** Já viu o tour guiado (guardado na conta, vale em qualquer aparelho). */
  tourVisto: boolean;
};

type LinhaConta = {
  id: string;
  tipo: TipoConta;
  plano: PlanoConta;
  plano_ate: string | null;
  plano_pedido: PlanoConta | null;
  nome: string;
  empresa: string;
  whatsapp: string;
  cidade: string;
  /** Coluna da migração 20261108000000_tour_visto.sql; some se ela ainda não rodou. */
  tour_visto_em?: string | null;
};

/** O que cada plano libera. Usado nas telas para decidir o que mostrar ou bloquear. */
export const RECURSOS = {
  colaborador: {
    gratis: { trabalhos: 6, destaqueBusca: false, jornal: false, estatisticas: false },
    premium: { trabalhos: 50, destaqueBusca: true, jornal: true, estatisticas: true },
  },
  contratante: {
    gratis: { vagasPorMes: VAGAS_LIBERADAS ? Infinity : 1, vagaDestaque: false, salvarTalentos: false, jornal: false },
    premium: { vagasPorMes: Infinity, vagaDestaque: true, salvarTalentos: true, jornal: true },
  },
} as const;

export const NOME_TIPO: Record<TipoConta, string> = { colaborador: "Colaborador", contratante: "Contratante" };
export const NOME_PLANO: Record<PlanoConta, string> = { gratis: "Grátis", premium: "Premium" };

/** Página inicial de cada tipo de conta depois de entrar. */
export const INICIO_DA_AREA: Record<TipoConta, string> = { colaborador: "/meu-perfil", contratante: "/painel" };

/** Plano em vigor: Premium vencido conta como grátis. */
export function planoEmVigor(c: Pick<Conta, "plano" | "planoAte">): PlanoConta {
  if (c.plano !== "premium") return "gratis";
  if (!c.planoAte) return "premium";
  return c.planoAte >= new Date().toISOString().slice(0, 10) ? "premium" : "gratis";
}

const DE_LINHA = (l: LinhaConta, email: string): Conta => ({
  id: l.id,
  tipo: l.tipo,
  plano: l.plano,
  planoAte: l.plano_ate,
  planoPedido: l.plano_pedido,
  nome: l.nome,
  empresa: l.empresa,
  whatsapp: l.whatsapp,
  cidade: l.cidade,
  email,
  tourVisto: !!l.tour_visto_em,
});

/* ---------- Modo demonstração (sem banco): a conta fica no navegador ---------- */

const CHAVE_DEMO = "folium-demo-conta";
/** Tipo escolhido na tela de entrar, usado para criar a conta quando a pessoa volta pelo link do e-mail. */
const CHAVE_TIPO = "folium-tipo-pretendido";
const EVENTO = "folium-conta";

function lerDemo(): Conta | null {
  try {
    const bruto = localStorage.getItem(CHAVE_DEMO);
    if (!bruto) return null;
    const c = JSON.parse(bruto) as Partial<Conta>;
    if (c.tipo !== "colaborador" && c.tipo !== "contratante") return null;
    return {
      id: "demo",
      tipo: c.tipo,
      plano: c.plano === "premium" ? "premium" : "gratis",
      planoAte: null,
      planoPedido: null,
      nome: c.nome ?? "",
      empresa: c.empresa ?? "",
      whatsapp: c.whatsapp ?? "",
      cidade: c.cidade ?? "Bauru, SP",
      tourVisto: !!c.tourVisto,
      email: c.tipo === "colaborador" ? "aluna.25111585@alunos.unisagrado.edu.br" : "contato@empresa.com",
    };
  } catch {
    return null;
  }
}

/** Troca a conta de demonstração (ou sai, com null). Só vale sem banco ligado. */
export function definirContaDemo(c: Partial<Conta> | null) {
  try {
    if (c) localStorage.setItem(CHAVE_DEMO, JSON.stringify({ ...lerDemo(), ...c }));
    else localStorage.removeItem(CHAVE_DEMO);
  } catch {
    /* navegador sem armazenamento: a troca vale só até recarregar */
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function guardarTipoPretendido(tipo: TipoConta) {
  try {
    localStorage.setItem(CHAVE_TIPO, tipo);
  } catch {
    /* sem armazenamento: cai na regra pelo e-mail */
  }
}

function tipoPretendido(): TipoConta | null {
  try {
    const t = localStorage.getItem(CHAVE_TIPO);
    return t === "colaborador" || t === "contratante" ? t : null;
  } catch {
    return null;
  }
}

/* ---------- Banco ---------- */

const cache = new Map<string, Promise<Conta | null>>();

/**
 * Lê a conta de quem entrou. Se ainda não existir, cria: com o tipo escolhido na tela de
 * entrar, ou pelo e-mail (institucional vira colaborador, os outros viram contratante).
 */
async function carregarConta(usuario: User): Promise<Conta | null> {
  const sb = supabase();
  if (!sb) return null;
  const email = usuario.email ?? "";
  const { data, error } = await sb.from("contas").select("*").eq("id", usuario.id).maybeSingle();
  if (error) {
    console.error("Erro ao ler a conta", error);
    return null;
  }
  if (data) return DE_LINHA(data as LinhaConta, email);

  const institucional = emailInstitucional(email);
  let tipo = tipoPretendido() ?? (institucional ? "colaborador" : "contratante");
  if (tipo === "colaborador" && !institucional) tipo = "contratante";
  const nova = await sb.from("contas").insert({ id: usuario.id, tipo }).select("*").single();
  if (nova.error) {
    // Outra aba pode ter criado a conta ao mesmo tempo.
    const outra = await sb.from("contas").select("*").eq("id", usuario.id).maybeSingle();
    return outra.data ? DE_LINHA(outra.data as LinhaConta, email) : null;
  }
  try {
    localStorage.removeItem(CHAVE_TIPO);
  } catch {
    /* ok */
  }
  return DE_LINHA(nova.data as LinhaConta, email);
}

export type EstadoConta = {
  /** Conta de quem entrou; null para visitante (ou se não deu para ler). */
  conta: Conta | null;
  /** Plano em vigor (grátis para visitantes). */
  plano: PlanoConta;
  premium: boolean;
  carregando: boolean;
  demo: boolean;
  logado: boolean;
  recarregar: () => void;
};

/** Conta, tipo e plano de quem está usando o site. */
export function useConta(): EstadoConta {
  const { usuario, carregando: carregandoSessao } = useSessao();
  const demo = !supabase();
  const [conta, setConta] = useState<Conta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  const contaDe = useRef<string | null>(null);

  useEffect(() => {
    const aoMudar = () => setVersao((v) => v + 1);
    window.addEventListener(EVENTO, aoMudar);
    return () => window.removeEventListener(EVENTO, aoMudar);
  }, []);

  useEffect(() => {
    if (demo) {
      setConta(lerDemo());
      setCarregando(false);
      return;
    }
    if (carregandoSessao) return;
    if (!usuario) {
      contaDe.current = null;
      setConta(null);
      setCarregando(false);
      return;
    }
    let ativo = true;
    // Só mostra "carregando" na primeira vez. Quando o Supabase renova o login sozinho
    // (ao voltar para a aba, a cada hora), a conta continua na tela enquanto confere.
    if (contaDe.current !== usuario.id) setCarregando(true);
    let promessa = cache.get(usuario.id);
    if (!promessa) {
      promessa = carregarConta(usuario);
      cache.set(usuario.id, promessa);
    }
    promessa.then((c) => {
      if (!ativo) return;
      contaDe.current = usuario.id;
      setConta(c);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
    // Depende do id, não do objeto: cada renovação do login traz um objeto novo do mesmo usuário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, usuario?.id, carregandoSessao, versao]);

  const plano = conta ? planoEmVigor(conta) : "gratis";
  return {
    conta,
    plano,
    premium: plano === "premium",
    carregando,
    demo,
    logado: demo ? !!conta : !!usuario,
    recarregar: () => {
      cache.clear();
      window.dispatchEvent(new Event(EVENTO));
    },
  };
}

/** Grava nome, empresa, WhatsApp e cidade da conta. */
export async function salvarDadosConta(c: Pick<Conta, "nome" | "empresa" | "whatsapp" | "cidade">) {
  const sb = supabase();
  if (!sb) {
    definirContaDemo(c);
    return;
  }
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Entre de novo para salvar.");
  const { error } = await sb.from("contas").update(c).eq("id", data.user.id);
  if (error) throw new Error(error.message);
  cache.clear();
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Pede o Premium. Sem pagamento no site ainda: a equipe vê o pedido na tabela "contas"
 * e libera. No modo demonstração o Premium é ligado na hora, para dar para testar as telas.
 */
export async function pedirPremium() {
  const sb = supabase();
  if (!sb) {
    definirContaDemo({ plano: "premium" });
    return "liberado" as const;
  }
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Entre para pedir o Premium.");
  const { error } = await sb.from("contas").update({ plano_pedido: "premium" }).eq("id", data.user.id);
  if (error) throw new Error(error.message);
  cache.clear();
  window.dispatchEvent(new Event(EVENTO));
  return "pedido" as const;
}

/**
 * Marca na conta que a pessoa já viu o tour guiado, para ele não voltar em outro aparelho
 * ou navegador. Se a coluna ainda não existir no banco, fica só a marca do navegador.
 */
export async function marcarTourVistoNaConta() {
  const sb = supabase();
  if (!sb) {
    if (lerDemo()) definirContaDemo({ tourVisto: true });
    return;
  }
  const { data } = await sb.auth.getUser();
  if (!data.user) return;
  const { error } = await sb.from("contas").update({ tour_visto_em: new Date().toISOString() }).eq("id", data.user.id);
  if (error) {
    console.warn("Não deu para guardar o tour na conta (rode a migração tour_visto)", error.message);
    return;
  }
  // Atualiza a conta guardada em memória sem recarregar a tela.
  const id = data.user.id;
  const antes = cache.get(id);
  if (antes) cache.set(id, antes.then((c) => (c ? { ...c, tourVisto: true } : c)));
}
