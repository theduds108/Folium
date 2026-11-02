import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALUNOS, buscarAluno } from "@/lib/data";
import { PerfilVista } from "@/components/PerfilVista";
import { avaliacoesDe } from "@/lib/conteudo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALUNOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const aluno = buscarAluno(slug);
  if (!aluno) return {};
  return {
    title: `${aluno.nome}, ${aluno.curso}`,
    description: aluno.bio,
    openGraph: { title: `${aluno.nome} no Fólium`, description: aluno.bio },
  };
}

export default async function PerfilAluno({ params }: Props) {
  const { slug } = await params;
  const aluno = buscarAluno(slug);
  if (!aluno) notFound();

  return <PerfilVista aluno={aluno} avaliacoes={avaliacoesDe(aluno.slug)} />;
}
