import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Verdadeiro quando o site está ligado a um projeto Supabase (.env.local preenchido). */
export const bancoLigado = Boolean(url && chave);

let cliente: SupabaseClient | null = null;

/** Cliente do Supabase, ou null no modo demonstração. Só usar no navegador. */
export function supabase(): SupabaseClient | null {
  if (!bancoLigado) return null;
  cliente ??= createClient(url!, chave!, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" },
  });
  return cliente;
}
