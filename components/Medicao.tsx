"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics: conta visitas sem cookies e sem guardar dados pessoais.
 * Só funciona no site publicado na Vercel, depois de ligar "Analytics" no painel do projeto.
 *
 * Antes de enviar, tira os parâmetros do endereço (?u=slug-do-aluno, ?modo=, ?origem=…):
 * assim a medição registra "alguém abriu /perfil/", nunca qual portfólio nem dado do link.
 */
function semParametros(evento: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(evento.url);
    url.search = "";
    url.hash = "";
    return { ...evento, url: url.toString() };
  } catch {
    return null;
  }
}

export function Medicao() {
  return <Analytics beforeSend={semParametros} />;
}
