import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MuralOportunidades } from "@/app/oportunidades/MuralOportunidades";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { DEMO_ATIVA } from "@/lib/config";

export const metadata: Metadata = {
  title: "Oportunidades (demonstração)",
  robots: { index: false, follow: false },
};

/**
 * Mural com vagas fictícias, só para prints e apresentações.
 * Existe apenas rodando local e nas prévias da Vercel; no site publicado vira "página não encontrada".
 * Não lê nem grava nada no banco.
 */
export default function DemoOportunidades() {
  if (!DEMO_ATIVA) notFound();
  return (
    <div className="container pagina">
      <p className="faixa-demo" role="note">
        <strong>Demonstração</strong> · vagas e empresas fictícias, só para apresentação. No site real aparecem apenas vagas aprovadas pela equipe.
      </p>
      <CabecalhoArquivo
        rotulo="Mural de oportunidades · região de Bauru"
        titulo="Oportunidades"
        descricao="Freelas, projetos e estágios publicados por negócios da região. Cada vaga passa pela equipe antes de ir ao ar."
      />
      <MuralOportunidades demo />
    </div>
  );
}
