import type { Metadata } from "next";
import { metadadosPagina } from "@/lib/site";
import { Suspense } from "react";
import { PerfilReal } from "./PerfilReal";
import { EsqueletoPerfil } from "@/components/Esqueleto";

export const metadata: Metadata = metadadosPagina({ titulo: "Portfólio", caminho: "/perfil/", indexar: false });

/**
 * Perfis criados pelos alunos: carregados do banco no navegador, pelo endereço /perfil/?u=slug.
 * Quem não tem conta só vê o portfólio se o aluno ligou o link público (PerfilReal decide).
 */
export default function Perfil() {
  return (
    <Suspense fallback={<EsqueletoPerfil />}>
      <PerfilReal />
    </Suspense>
  );
}
