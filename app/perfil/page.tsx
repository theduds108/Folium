import type { Metadata } from "next";
import { SoComConta } from "@/components/SoComConta";
import { Suspense } from "react";
import { PerfilReal } from "./PerfilReal";
import { EsqueletoPerfil } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Portfólio" };

/** Perfis criados pelos alunos: carregados do banco no navegador, pelo endereço /perfil/?u=slug. */
export default function Perfil() {
  return (
    <SoComConta titulo="Entre para ver este portfólio" texto="Os portfólios dos alunos ficam visíveis só para quem tem conta no Fólium. A conta é grátis: aluno usa o e-mail institucional, empresa ou contratante usa qualquer e-mail.">
      <Suspense fallback={<EsqueletoPerfil />}>
      <PerfilReal />
    </Suspense>
    </SoComConta>
  );
}
