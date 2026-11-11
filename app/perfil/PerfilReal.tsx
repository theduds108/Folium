"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Aluno } from "@/lib/data";
import { buscarAlunoReal } from "@/lib/repositorio";
import { PerfilVista } from "@/components/PerfilVista";
import { EsqueletoPerfil } from "@/components/Esqueleto";

export function PerfilReal() {
  const slug = useSearchParams().get("u") ?? "";
  const [aluno, setAluno] = useState<Aluno | null | undefined>(undefined);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!slug) {
      setAluno(null);
      return;
    }
    let ativo = true;
    setFalhou(false);
    setAluno(undefined);
    buscarAlunoReal(slug)
      .then((a) => {
        if (!ativo) return;
        setAluno(a);
        if (a) document.title = `${a.nome}, ${a.curso} · Fólium`;
      })
      .catch(() => {
        if (ativo) setFalhou(true);
      });
    return () => {
      ativo = false;
    };
  }, [slug, tentativa]);

  if (falhou)
    return (
      <div className="container">
        <div className="cartao pagina-estreita" role="alert">
          <h1 style={{ fontSize: "var(--t-tit-m)" }}>Não deu para carregar o portfólio</h1>
          <p className="suave">Parece que a internet caiu ou o Fólium demorou a responder. O portfólio continua aqui.</p>
          <button type="button" className="botao botao-primario" style={{ width: "100%" }} onClick={() => setTentativa((n) => n + 1)}>
            Tentar de novo
          </button>
        </div>
      </div>
    );

  if (aluno === undefined) return <EsqueletoPerfil />;

  if (!aluno)
    return (
      <div className="container">
        <div className="cartao pagina-estreita">
          <h1 style={{ fontSize: "var(--t-tit-m)" }}>Portfólio não encontrado</h1>
          <p className="suave">O endereço pode estar errado, ou o aluno deixou o portfólio fora da busca.</p>
          <Link href="/talentos" className="botao botao-primario" style={{ width: "100%" }}>Ver talentos</Link>
        </div>
      </div>
    );

  return <PerfilVista aluno={aluno} />;
}
