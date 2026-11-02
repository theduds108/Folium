import Link from "next/link";
import type { Aluno } from "@/lib/data";
import { iniciais } from "@/lib/data";
import { Capa } from "./Capa";

export function CartaoAluno({ aluno }: { aluno: Aluno }) {
  const [t1, t2, t3] = aluno.trabalhos;
  return (
    <Link href={`/aluno/${aluno.slug}`} className="cartao cartao-aluno">
      <div className="cartao-aluno-capa">
        {t1 && <Capa cor={t1.cor} titulo={t1.titulo} semTexto />}
        <div>
          <Capa cor={t2?.cor ?? "#7C8B5A"} titulo="" semTexto />
          <Capa cor={t3?.cor ?? "#C9B99A"} titulo="" semTexto />
        </div>
      </div>
      <div className="cartao-aluno-corpo">
        <div className="cartao-aluno-topo">
          <div className="avatar" style={{ width: 44, height: 44 }}>{iniciais(aluno.nome)}</div>
          <div>
            <h3>{aluno.nome}</h3>
            <p className="suave">{aluno.curso} · {aluno.semestre}º sem.</p>
          </div>
        </div>
        <div className="etiquetas">
          {aluno.servicos.map((s) => (
            <span key={s} className="etiqueta">{s}</span>
          ))}
        </div>
        <span className={aluno.disponivel ? "disponivel" : "disponivel nao"}>
          {aluno.disponivel ? "Disponível para freelas" : "Agenda cheia no momento"}
        </span>
      </div>
    </Link>
  );
}
