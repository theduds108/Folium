"use client";

import { useEffect } from "react";
import { useConta } from "@/lib/conta";

/**
 * Mostra o guia certo para cada tipo de conta: o "Guia do contratante" para quem contrata
 * e o "Guia do aluno" para alunos e visitantes. Enquanto a conta carrega, fica um espaço
 * em branco (sem piscar o guia errado).
 */
export function GuiaPorConta({ aluno, contratante }: { aluno: React.ReactNode; contratante: React.ReactNode }) {
  const { conta, carregando } = useConta();
  const pronto = !carregando;

  // O conteúdo chega depois da conta: leva até a seção do link (ex.: /guia#precos) quando ela aparece.
  useEffect(() => {
    if (!pronto || !window.location.hash) return;
    const alvo = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    alvo?.scrollIntoView({ block: "start" });
  }, [pronto, conta?.tipo]);

  if (!pronto) return <div className="container pagina" style={{ minHeight: "60vh" }} aria-busy="true" />;
  return <>{conta?.tipo === "contratante" ? contratante : aluno}</>;
}

/** Bloco que só aparece para alunos e visitantes (some para contratantes e enquanto a conta carrega). */
export function SoParaAluno({ children }: { children: React.ReactNode }) {
  const { conta, carregando } = useConta();
  if (carregando || conta?.tipo === "contratante") return null;
  return <>{children}</>;
}

/** Bloco que só aparece para contratantes. */
export function SoParaContratante({ children }: { children: React.ReactNode }) {
  const { conta, carregando } = useConta();
  if (carregando || conta?.tipo !== "contratante") return null;
  return <>{children}</>;
}
