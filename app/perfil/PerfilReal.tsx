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

  useEffect(() => {
    if (!slug) {
      setAluno(null);
      return;
    }
    let ativo = true;
    buscarAlunoReal(slug).then((a) => {
      if (!ativo) return;
      setAluno(a);
      if (a) document.title = `${a.nome}, ${a.curso} · Fólium`;
    });
    return () => {
      ativo = false;
    };
  }, [slug]);

  if (aluno === undefined) return <EsqueletoPerfil />;

  if (!aluno)
    return (
      <div className="container">
        <div className="cartao pagina-estreita">
          <h1 style={{ fontSize: "1.9rem" }}>Portfólio não encontrado</h1>
          <p className="suave">O endereço pode estar errado, ou o aluno deixou o portfólio fora da busca.</p>
          <Link href="/talentos" className="botao botao-primario" style={{ width: "100%" }}>Ver talentos</Link>
        </div>
      </div>
    );

  return <PerfilVista aluno={aluno} />;
}
