"use client";

import Link from "next/link";
import { useState } from "react";
import { INICIO_DA_AREA, NOME_PLANO, pedirPremium, useConta, type EstadoConta, type TipoConta } from "@/lib/conta";

/** Cartão estreito usado nas mensagens de acesso. */
export function CartaoAviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="cartao pagina-estreita">
        <h1 style={{ fontSize: "1.9rem" }}>{titulo}</h1>
        {children}
      </div>
    </div>
  );
}

const PARA_QUEM: Record<TipoConta, string> = {
  colaborador: "alunos que montam portfólio",
  contratante: "quem contrata",
};

/**
 * Área de um tipo de conta. Visitante vê o convite para entrar; quem tem conta do
 * outro tipo é mandado para a própria área. O conteúdo recebe o estado da conta.
 */
export function Area({ tipo, children }: { tipo: TipoConta; children: (estado: EstadoConta) => React.ReactNode }) {
  const estado = useConta();
  const { conta, carregando, logado } = estado;

  if (carregando)
    return (
      <div className="container">
        <div className="cartao pagina-estreita"><p className="suave" style={{ margin: 0 }}>Carregando…</p></div>
      </div>
    );

  if (!logado)
    return (
      <CartaoAviso titulo={tipo === "contratante" ? "Entre para contratar" : "Entre para montar seu portfólio"}>
        <p className="suave">
          {tipo === "contratante"
            ? "A conta de contratante é grátis e serve para publicar vagas e acompanhar quem se interessou. Qualquer e-mail funciona."
            : "Entre com seu nome de usuário e senha. No primeiro acesso, use o e-mail institucional."}
        </p>
        <Link href={`/entrar/?como=${tipo}`} className="botao botao-primario" style={{ width: "100%" }}>Entrar</Link>
      </CartaoAviso>
    );

  if (!conta)
    return (
      <CartaoAviso titulo="Não deu para abrir sua conta">
        <p className="suave">Confira sua internet e recarregue a página. Se continuar, fale com a equipe do Fólium.</p>
      </CartaoAviso>
    );

  if (conta.tipo !== tipo)
    return (
      <CartaoAviso titulo="Esta área é de outro tipo de conta">
        <p className="suave">
          Esta parte do Fólium é para {PARA_QUEM[tipo]}. Sua conta é de{" "}
          <strong>{conta.tipo === "contratante" ? "contratante" : "colaborador"}</strong>.
        </p>
        <Link href={INICIO_DA_AREA[conta.tipo]} className="botao botao-primario" style={{ width: "100%" }}>
          Ir para a minha área
        </Link>
      </CartaoAviso>
    );

  return <>{children(estado)}</>;
}

/** Selo do plano atual. */
export function SeloPlano({ premium }: { premium: boolean }) {
  return <span className={premium ? "selo-plano selo-premium" : "selo-plano"}>Plano {NOME_PLANO[premium ? "premium" : "gratis"]}</span>;
}

/**
 * Bloco no lugar de um recurso Premium. Mostra o que o recurso faz e o botão para pedir.
 */
export function TravaPremium({ titulo, texto, compacto = false }: { titulo: string; texto: string; compacto?: boolean }) {
  const { conta, logado } = useConta();
  const [estado, setEstado] = useState<"" | "enviando" | "pedido" | "erro">(conta?.planoPedido ? "pedido" : "");

  const pedir = async () => {
    setEstado("enviando");
    try {
      const r = await pedirPremium();
      setEstado(r === "pedido" ? "pedido" : "");
    } catch {
      setEstado("erro");
    }
  };

  return (
    <div className={compacto ? "trava-premium trava-compacta" : "trava-premium"}>
      <span className="trava-carimbo" aria-hidden="true">Premium</span>
      <h3>{titulo}</h3>
      <p className="suave">{texto}</p>
      {!logado ? (
        <Link href="/planos" className="botao botao-contorno">Ver planos</Link>
      ) : estado === "pedido" || conta?.planoPedido ? (
        <p className="salvo" style={{ margin: 0 }}>Pedido enviado. A equipe libera o Premium em até 1 dia útil.</p>
      ) : (
        <div className="trava-acoes">
          <button type="button" className="botao botao-primario" onClick={pedir} disabled={estado === "enviando"}>
            {estado === "enviando" ? "Enviando…" : "Quero o Premium"}
          </button>
          <Link href="/planos" className="botao botao-contorno">Comparar planos</Link>
        </div>
      )}
      {estado === "erro" && <p className="erro" role="alert">Não deu para enviar o pedido. Tente de novo.</p>}
    </div>
  );
}
