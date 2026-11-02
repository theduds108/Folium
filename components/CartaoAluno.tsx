import Link from "next/link";
import type { Aluno } from "@/lib/data";
import { iniciais, linkPerfil, unsplash } from "@/lib/data";

const FUNDOS = ["#2F3E2A", "#B0673B", "#4F7A3A", "#6B4A34"];

function corDe(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FUNDOS[h % FUNDOS.length]!;
}

/**
 * Cartão do aluno em formato de polaroide.
 * Ordem de leitura: nome → especialidade → disponibilidade → até 2 serviços (+N).
 * O excesso fica escondido por hierarquia e truncamento, sem diminuir a fonte.
 */
export function CartaoAluno({ aluno }: { aluno: Aluno }) {
  const especialidade = aluno.titulo || aluno.servicos[0] || aluno.curso;
  const tags = aluno.titulo ? aluno.servicos.slice(0, 2) : aluno.servicos.slice(1, 3);
  const usados = aluno.titulo ? 2 : 3;
  const resto = Math.max(0, aluno.servicos.length - usados);

  return (
    <Link href={linkPerfil(aluno)} className="polaroide">
      <span className="polaroide-foto" style={{ background: corDe(aluno.slug) }}>
        {aluno.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="foto-cobrir"
            src={unsplash(aluno.foto, 600)}
            alt={`Foto de ${aluno.nome}`}
            width={600}
            height={450}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="polaroide-iniciais" aria-hidden="true">{iniciais(aluno.nome)}</span>
        )}
        <span className="polaroide-curso">{aluno.curso}</span>
      </span>
      <span className="polaroide-corpo">
        <span className="polaroide-nome">{aluno.nome}</span>
        <span className="polaroide-titulo">{especialidade}</span>
        <span className={aluno.disponivel ? "disponivel" : "disponivel nao"}>
          {aluno.disponivel ? "Disponível para freelas" : "Agenda cheia no momento"}
        </span>
        {(tags.length > 0 || resto > 0) && (
          <span className="etiquetas polaroide-etiquetas">
            {tags.map((s) => (
              <span key={s} className="etiqueta">{s}</span>
            ))}
            {resto > 0 && (
              <span className="etiqueta etiqueta-mais" aria-label={`e mais ${resto} ${resto === 1 ? "serviço" : "serviços"}`}>
                +{resto}
              </span>
            )}
          </span>
        )}
        <span className="suave polaroide-sub">{aluno.semestre}º semestre · {aluno.cidade}</span>
      </span>
    </Link>
  );
}
