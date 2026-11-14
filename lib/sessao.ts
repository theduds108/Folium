"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Sessão do usuário logado. `carregando` fica true até o navegador
 * conferir se já existe login salvo (ou se chegou de um link do e-mail).
 */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const sb = supabase();
    if (!sb) {
      setCarregando(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });
    const { data } = sb.auth.onAuthStateChange((evento, nova) => {
      // Link de "Esqueci a senha": se o Supabase mandar para outra página, leva para criar a senha.
      if (evento === "PASSWORD_RECOVERY" && !window.location.pathname.startsWith("/senha")) window.location.assign("/senha/");
      setSessao(nova);
      setCarregando(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { sessao, usuario: sessao?.user ?? null, carregando };
}

/**
 * Sai da conta só neste aparelho. O padrão do Supabase ("global") desconectaria também o
 * celular, o computador da faculdade etc.; e, sem internet, nem saía. "local" apaga a sessão
 * guardada neste navegador na hora.
 */
export async function sair() {
  await supabase()?.auth.signOut({ scope: "local" });
  // Modo demonstração: esquece a conta de teste (ver lib/conta.ts).
  try {
    localStorage.removeItem("folium-demo-conta");
  } catch {
    /* sem armazenamento */
  }
  window.dispatchEvent(new Event("folium-conta"));
}
