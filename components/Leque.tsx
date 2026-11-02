import Link from "next/link";
import type { Aluno } from "@/lib/data";
import { iniciais, linkPerfil, unsplash } from "@/lib/data";
import { FotoEnquadrada } from "@/components/FotoEnquadrada";

// Cobre escuro no lugar do cobre puro: o nome em creme precisa de contraste AA.
const FUNDOS = ["#2F3E2A", "#94532C", "#F6F0E4", "#4F7A3A", "#6B4A34"];

/**
 * Fichas dos alunos abertas em leque, como fichas de arquivo sobre a mesa.
 * Serve de porta de entrada para a descoberta: cada ficha é um link para o portfólio.
 * No desktop o hover/foco traz a ficha para a frente sem empurrar as vizinhas;
 * no celular o leque vira uma fileira rolável, com todas as fichas legíveis.
 */
export function Leque({ alunos }: { alunos: Aluno[] }) {
  const n = alunos.length;
  return (
    <ul className="leque" style={{ ["--n" as string]: n }} aria-label="Portfólios em destaque">
      {alunos.map((a, i) => {
        const pos = i - (n - 1) / 2;
        const fundo = FUNDOS[i % FUNDOS.length]!;
        const claro = fundo === "#F6F0E4";
        return (
          <li key={a.slug} style={{ ["--i" as string]: i }}>
            <Link
              href={linkPerfil(a)}
              className="ficha"
              style={{
                ["--pos" as string]: pos,
                background: fundo,
                color: claro ? "#2F3E2A" : "#F6F0E4",
                zIndex: 10 - Math.abs(Math.round(pos)),
              }}
            >
              <span className="ficha-topo" aria-hidden="true">
                <span>{a.curso.split(" ")[0]}</span>
                <span>{String(i + 1).padStart(2, "0")}</span>
              </span>
              {a.foto ? (
                <FotoEnquadrada className="ficha-foto" src={unsplash(a.foto, 400)} width={400} height={300} loading="lazy" />
              ) : (
                <span className="ficha-iniciais" aria-hidden="true">{iniciais(a.nome)}</span>
              )}
              <span className="ficha-nome">{a.nome}</span>
              <span className="ficha-servico">{a.servicos[0]}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
