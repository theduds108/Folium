"use client";

import Link from "next/link";
import { useConta } from "@/lib/conta";

/** Faixa do topo: muda conforme quem está vendo. Colaborador não vê o convite para publicar. */
export function AvisoEmpresa() {
  const { conta, carregando } = useConta();
  if (carregando || conta?.tipo === "colaborador") return null;
  return (
    <div className="aviso-empresa cartao">
      <div>
        <strong>Tem um trabalho para oferecer?</strong>
        <span className="suave"> Com a conta de contratante grátis você publica 1 vaga por mês.</span>
      </div>
      <Link href="/publicar" className="botao botao-verde">Publicar oportunidade</Link>
    </div>
  );
}
