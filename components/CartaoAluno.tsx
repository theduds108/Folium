import Link from "next/link";
import type { Aluno } from "@/lib/data";
import { iniciais, linkPerfil, unsplash } from "@/lib/data";

const FUNDOS = ["#2F3E2A", "#B0673B", "#4F7A3A", "#6B4A34"];

function corDe(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FUNDOS[h % FUNDOS.length]!;
}

/** Cartão do aluno em formato de polaroide. A "foto" mostra as iniciais até haver upload de imagem. */
export function CartaoAluno({ aluno }: { aluno: Aluno }) {
  return (
    <Link href={linkPerfil(aluno)} className="polaroide">
      <span className="polaroide-foto" style={{ background: corDe(aluno.slug) }}>
        {aluno.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="foto-cobrir" src={unsplash(aluno.foto, 600)} alt={`Foto de ${aluno.nome}`} loading="lazy" />
        ) : (
          <span className="polaroide-iniciais">{iniciais(aluno.nome)}</span>
        )}
        <span className="polaroide-curso">{aluno.curso}</span>
      </span>
      <span className="polaroide-corpo">
        <span className="polaroide-nome">{aluno.nome}</span>
        {aluno.titulo && <span className="polaroide-titulo">{aluno.titulo}</span>}
        <span className="suave polaroide-sub">{aluno.semestre}º semestre · {aluno.cidade}</span>
        <span className="etiquetas">
          {aluno.servicos.map((s) => (
            <span key={s} className="etiqueta">{s}</span>
          ))}
        </span>
        <span className={aluno.disponivel ? "disponivel" : "disponivel nao"}>
          {aluno.disponivel ? "Disponível para freelas" : "Agenda cheia no momento"}
        </span>
      </span>
    </Link>
  );
}
