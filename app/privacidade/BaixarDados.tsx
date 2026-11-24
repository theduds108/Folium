"use client";

import Link from "next/link";
import { useState } from "react";
import { useSessao } from "@/lib/sessao";
import { bancoLigado } from "@/lib/supabase";
import { exportarMeusDados } from "@/lib/repositorio";

/** Baixa um arquivo .json com os dados da própria conta. Só aparece para quem está logado. */
export function BaixarDados() {
  const { usuario, carregando } = useSessao();
  const [estado, setEstado] = useState<"" | "baixando" | "pronto">("");
  const [erro, setErro] = useState("");

  if (carregando) return null;
  if (!usuario || !bancoLigado)
    return (
      <p className="suave">
        <Link href="/entrar">Entre na sua conta</Link> para baixar seus dados.
      </p>
    );

  return (
    <div className="baixar-dados">
      <button
        type="button"
        className="botao botao-contorno"
        disabled={estado === "baixando"}
        onClick={async () => {
          setErro("");
          setEstado("baixando");
          try {
            const dados = await exportarMeusDados();
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `meus-dados-folium-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setEstado("pronto");
          } catch (e) {
            setErro((e as Error).message);
            setEstado("");
          }
        }}
      >
        {estado === "baixando" ? "Preparando…" : "Baixar meus dados"}
      </button>
      {estado === "pronto" && <p className="salvo" role="status">Pronto: o arquivo foi baixado para o seu aparelho.</p>}
      {erro && <p className="erro" role="alert">{erro}</p>}
    </div>
  );
}
