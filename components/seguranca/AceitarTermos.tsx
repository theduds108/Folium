"use client";

import Link from "next/link";
import { useState } from "react";
import { useConta } from "@/lib/conta";
import { aceitarTermos } from "@/lib/seguranca";

/** Caixa de aceite no fim do código de conduta. Grava data e versão na conta. */
export function AceitarTermos() {
  const { conta, logado, demo, recarregar } = useConta();
  const [marcado, setMarcado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(false);
  const [erro, setErro] = useState("");

  if (!logado || !conta)
    return <p className="suave">Ao criar sua conta, você vai aceitar estas regras. <Link href="/entrar">Entrar ou criar conta</Link></p>;
  if (feito || (conta.termosAceitos && !demo))
    return <p className="salvo" role="status" style={{ margin: 0 }}>Você aceitou os termos de uso e o código de conduta. Obrigado por cuidar do Fólium com a gente.</p>;

  return (
    <form
      className="aceite-termos"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!marcado) return;
        setEnviando(true);
        setErro("");
        try {
          await aceitarTermos();
          setFeito(true);
          recarregar();
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setEnviando(false);
        }
      }}
    >
      <label className="caixa-marcar">
        <input type="checkbox" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} />
        <span>
          Li e aceito os <Link href="/privacidade#termos">termos de uso</Link> e este código de conduta. Entendo que o Fólium aproxima
          alunos e contratantes, mas não é empregador nem parte do combinado.
        </span>
      </label>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <button type="submit" className="botao botao-primario" disabled={!marcado || enviando}>{enviando ? "Salvando…" : "Aceitar"}</button>
    </form>
  );
}
