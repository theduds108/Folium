"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useConta } from "@/lib/conta";
import { alternarSalvo, listarSalvos } from "@/lib/repositorio";

/**
 * Botão "Salvar talento" no portfólio. Só aparece para contratantes:
 * no Premium salva na lista do painel; no grátis leva para os planos.
 */
export function SalvarTalento({ slug }: { slug: string }) {
  const { conta, premium } = useConta();
  const [salvo, setSalvo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (conta?.tipo !== "contratante" || !premium) return;
    listarSalvos().then((l) => setSalvo(l.includes(slug)));
  }, [conta, premium, slug]);

  if (conta?.tipo !== "contratante") return null;

  if (!premium)
    return (
      <Link href="/planos" className="botao botao-contorno botao-salvar-talento">
        Salvar talento <span className="selo-plano selo-premium">Premium</span>
      </Link>
    );

  return (
    <>
      <button
        type="button"
        className={salvo ? "botao botao-contorno botao-salvar-talento salvo-ativo" : "botao botao-contorno botao-salvar-talento"}
        aria-pressed={salvo}
        disabled={ocupado}
        onClick={async () => {
          setOcupado(true);
          setErro("");
          try {
            await alternarSalvo(slug, !salvo);
            setSalvo(!salvo);
          } catch (e) {
            setErro((e as Error).message);
          } finally {
            setOcupado(false);
          }
        }}
      >
        {salvo ? "Salvo no seu painel" : "Salvar talento"}
      </button>
      {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
    </>
  );
}
