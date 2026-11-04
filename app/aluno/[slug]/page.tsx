import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALUNOS, buscarAluno } from "@/lib/data";
import { PerfilVista } from "@/components/PerfilVista";
import { SoComConta } from "@/components/SoComConta";
import { avaliacoesDe } from "@/lib/conteudo";

type Props = { params: Promise<{ slug: string }> };

// As páginas dos exemplos continuam sendo geradas (o export estático exige ao menos uma),
// mas com os fictícios desligados buscarAluno não os encontra e a página vira 404.
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

  return (
    <SoComConta titulo="Entre para ver este portfólio" texto="Os portfólios dos alunos ficam visíveis só para quem tem conta no Fólium. A conta é grátis: aluno usa o e-mail institucional, empresa ou contratante usa qualquer e-mail.">
      <PerfilVista aluno={aluno} avaliacoes={avaliacoesDe(aluno.slug)} />
    </SoComConta>
  );
}
