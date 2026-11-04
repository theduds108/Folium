"use client";

import Link from "next/link";
import { useConta } from "@/lib/conta";
import { CartaoAviso } from "./Area";

/** Mostra o conteúdo só para quem entrou (qualquer tipo de conta); visitante vê o convite para entrar. */
export function SoComConta({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  const { logado, carregando } = useConta();
  // Quem já entrou continua vendo a página mesmo enquanto a conta é conferida de novo.
  if (logado) return <>{children}</>;
  if (carregando)
    return (
      <div className="container">
        <div className="cartao pagina-estreita"><p className="suave" style={{ margin: 0 }}>Carregando…</p></div>
      </div>
    );
  if (!logado)
    return (
      <CartaoAviso titulo={titulo}>
        <p className="suave">{texto}</p>
        <Link href="/entrar" className="botao botao-primario" style={{ width: "100%" }}>Entrar</Link>
        <Link href="/entrar?modo=primeiro" className="botao botao-contorno" style={{ width: "100%", marginTop: 12 }}>
          Fazer o primeiro acesso
        </Link>
      </CartaoAviso>
    );
  return <>{children}</>;
}
