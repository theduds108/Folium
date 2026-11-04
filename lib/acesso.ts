"use client";

import { SENHA_MINIMA } from "./config";
import { traduzirErro } from "./repositorio";
import { supabase } from "./supabase";

/**
 * Login do Fólium: o primeiro acesso é pelo link no e-mail (garante que é aluno UNISAGRADO);
 * depois a pessoa cria nome de usuário + senha em /senha e entra com eles.
 * Tabela nomes_usuario e funções em supabase/migrations/20261104220000_nome_usuario.sql.
 */

export const NOME_USUARIO_VALIDO = /^[a-z0-9._]{3,30}$/;

/** Deixa o nome no formato aceito: minúsculo, sem acento, sem espaço. */
export function normalizarNomeUsuario(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 30);
}

/** Sugestão a partir do e-mail: nome.ra@alunos... vira "nome". */
export function sugerirNomeUsuario(email: string) {
  const local = (email.split("@")[0] ?? "").replace(/\.\d+$/, "");
  return normalizarNomeUsuario(local);
}

export function problemaNomeUsuario(nome: string) {
  if (nome.length < 3) return "O nome de usuário precisa ter pelo menos 3 caracteres.";
  if (!NOME_USUARIO_VALIDO.test(nome)) return "Use só letras minúsculas, números, ponto ou sublinhado.";
  return "";
}

export function problemaSenha(senha: string, repetida: string) {
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (senha !== repetida) return "As duas senhas não são iguais.";
  return "";
}

/** Entra com e-mail ou nome de usuário + senha. */
export async function entrarComSenha(login: string, senha: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  let email = login.trim().toLowerCase();
  if (!email.includes("@")) {
    const { data, error } = await sb.rpc("email_para_login", { p_usuario: email });
    if (error) throw traduzirErro(error);
    // Mesma mensagem de senha errada, para não revelar quais nomes existem.
    if (!data) throw new Error("Usuário ou senha incorretos.");
    email = data as string;
  }
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw traduzirErro(error);
}

/** Nome de usuário de quem está logado (vazio se ainda não criou). */
export async function lerNomeUsuario(userId: string) {
  const sb = supabase();
  if (!sb) return "";
  const { data } = await sb.from("nomes_usuario").select("nome").eq("id", userId).maybeSingle();
  return (data?.nome as string | undefined) ?? "";
}

/** Grava o nome de usuário e a senha de quem está logado. Senha vazia mantém a atual. */
export async function salvarLogin(userId: string, nome: string, senha: string) {
  const sb = supabase();
  if (!sb) throw new Error("Banco não configurado");
  const livre = await sb.rpc("nome_usuario_livre", { p_nome: nome });
  if (livre.error) throw traduzirErro(livre.error);
  if (livre.data === false) throw new Error("Esse nome de usuário já está em uso. Tente outro.");
  const gravar = await sb
    .from("nomes_usuario")
    .upsert({ id: userId, nome, atualizado_em: new Date().toISOString() }, { onConflict: "id" });
  if (gravar.error) {
    if (gravar.error.code === "23505") throw new Error("Esse nome de usuário já está em uso. Tente outro.");
    throw traduzirErro(gravar.error);
  }
  const { error } = await sb.auth.updateUser({
    ...(senha ? { password: senha } : {}),
    data: { nome_usuario: nome, tem_senha: true },
  });
  if (error) throw traduzirErro(error);
}
