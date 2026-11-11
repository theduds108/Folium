"use client";

import { useSyncExternalStore } from "react";

/**
 * Instalar o Fólium como app (PWA).
 *
 * Chrome, Edge e Samsung Internet avisam com o evento `beforeinstallprompt` quando o site pode ser
 * instalado. Esse evento chega uma vez só por carregamento, às vezes antes do React montar; por isso
 * um script no <head> (lib/instalar-script.ts) já guarda o evento em window.__foliumPedido, e este
 * arquivo assume a partir dali. Qualquer botão "Instalar app" do site usa o mesmo estado.
 *
 * Safari (iPhone e Mac) e Firefox não têm esse pedido: aí o botão abre a janela com o passo a passo
 * do navegador da pessoa, dentro do próprio site (nunca em nova aba).
 */

export type EventoInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type Plataforma =
  | "iphone-safari"
  | "iphone-outro"
  | "app-interno"
  | "android"
  | "mac-safari"
  | "firefox-computador"
  | "computador";

type Estado = {
  pronto: boolean;
  instalado: boolean;
  pedido: EventoInstalar | null;
  plataforma: Plataforma;
  janelaAberta: boolean;
};

declare global {
  interface Window {
    __foliumPedido?: EventoInstalar | null;
  }
}

const INICIAL: Estado = { pronto: false, instalado: false, pedido: null, plataforma: "computador", janelaAberta: false };
let estado: Estado = INICIAL;
let iniciado = false;
const ouvintes = new Set<() => void>();

function mudar(parcial: Partial<Estado>) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((o) => o());
}

export function detectarPlataforma(ua: string, toque: number): Plataforma {
  // Navegador de dentro de outro app (Instagram, Facebook, WhatsApp, TikTok, LinkedIn...): não instala nada.
  if (/Instagram|FBAN|FBAV|FB_IAB|FBIOS|WhatsApp|musical_ly|TikTok|BytedanceWebview|LinkedInApp|Line\/|Snapchat|Pinterest|; wv\)/i.test(ua)) {
    return "app-interno";
  }
  const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && toque > 1);
  if (ios) return /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\//.test(ua) ? "iphone-outro" : "iphone-safari";
  if (/Android/i.test(ua)) return "android";
  if (/Firefox\//.test(ua)) return "firefox-computador";
  if (ua.includes("Macintosh") && /Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return "mac-safari";
  return "computador";
}

function estaInstalado() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function iniciar() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  mudar({
    pronto: true,
    instalado: estaInstalado(),
    pedido: window.__foliumPedido ?? null,
    plataforma: detectarPlataforma(navigator.userAgent, navigator.maxTouchPoints || 0),
  });
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__foliumPedido = e as EventoInstalar;
    mudar({ pedido: e as EventoInstalar });
  });
  window.addEventListener("appinstalled", () => {
    window.__foliumPedido = null;
    mudar({ instalado: true, pedido: null, janelaAberta: false });
  });
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", (e) => {
    if (e.matches) mudar({ instalado: true });
  });
}

function assinar(ouvinte: () => void) {
  iniciar();
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

/** Estado da instalação. `pronto` fica falso no servidor e na primeira pintura, para não piscar o botão. */
export function useInstalar() {
  return useSyncExternalStore(assinar, () => estado, () => INICIAL);
}

/**
 * Ação do botão "Instalar app": abre o pedido nativo do navegador quando existe;
 * senão, abre a janela com o passo a passo.
 */
export async function instalar() {
  iniciar();
  const pedido = estado.pedido;
  if (!pedido) {
    mudar({ janelaAberta: true });
    return;
  }
  // O mesmo evento só pode ser usado uma vez.
  window.__foliumPedido = null;
  mudar({ pedido: null });
  try {
    await pedido.prompt();
    const { outcome } = await pedido.userChoice;
    if (outcome === "accepted") mudar({ instalado: true });
  } catch {
    mudar({ janelaAberta: true });
  }
}

export function fecharJanelaInstalar() {
  mudar({ janelaAberta: false });
}
