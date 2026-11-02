import Link from "next/link";
import type { Aluno } from "@/lib/data";
import { iniciais, unsplash } from "@/lib/data";

const FUNDOS = ["#2F3E2A", "#B0673B", "#F6F0E4", "#4F7A3A", "#6B4A34"];

/** Cartões dos alunos abertos em leque, como fichas sobre a mesa. */
export function Leque({ alunos }: { alunos: Aluno[] }) {
  const n = alunos.length;
  return (
    <div className="leque" style={{ ["--n" as string]: n }}>
      {alunos.map((a, i) => {
        const pos = i - (n - 1) / 2;
        const fundo = FUNDOS[i % FUNDOS.length]!;
        const claro = fundo === "#F6F0E4";
        return (
          <Link
            key={a.slug}
            href={`/aluno/${a.slug}`}
            className="ficha"
            style={{
              ["--pos" as string]: pos,
              background: fundo,
              color: claro ? "#2F3E2A" : "#F6F0E4",
              zIndex: 10 - Math.abs(Math.round(pos)),
            }}
          >
            <span className="ficha-topo">
              <span>{a.curso.split(" ")[0]}</span>
              <span>{String(i + 1).padStart(2, "0")}</span>
            </span>
            {a.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ficha-foto" src={unsplash(a.foto, 400)} alt="" loading="lazy" />
            ) : (
              <span className="ficha-iniciais">{iniciais(a.nome)}</span>
            )}
            <span className="ficha-nome">{a.nome}</span>
            <span className="ficha-servico">{a.servicos[0]}</span>
          </Link>
        );
      })}
    </div>
  );
}
