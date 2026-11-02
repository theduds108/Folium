"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import type { Aluno } from "@/lib/data";
import { iniciais, unsplash } from "@/lib/data";

/**
 * Índice numerado de talentos, como a lista de projetos dos portfólios de referência.
 * No computador, a foto do aluno acompanha o mouse ao passar sobre a linha.
 */
export function ListaTalentos({ alunos }: { alunos: Aluno[] }) {
  const [ativo, setAtivo] = useState<Aluno | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.6 });

  return (
    <div
      className="indice"
      onMouseMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
      onMouseLeave={() => setAtivo(null)}
    >
      <ol className="indice-lista">
        {alunos.map((a, i) => (
          <li key={a.slug}>
            <Link href={`/aluno/${a.slug}`} className="indice-linha" onMouseEnter={() => setAtivo(a)} onFocus={() => setAtivo(null)}>
              <span className="indice-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="indice-mini" aria-hidden="true">
                {a.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={unsplash(a.foto, 160)} alt="" loading="lazy" />
                ) : (
                  iniciais(a.nome)
                )}
              </span>
              <span className="indice-nome">{a.nome}</span>
              <span className="indice-curso">{a.curso}</span>
              <span className="indice-servico">{a.servicos[0]}</span>
              <span className={a.disponivel ? "indice-status" : "indice-status nao"}>
                {a.disponivel ? "Disponível" : "Agenda cheia"}
              </span>
              <span className="indice-seta" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>

      <AnimatePresence>
        {ativo?.foto && (
          <motion.div
            key={ativo.slug}
            className="indice-previa"
            style={{ left: sx, top: sy }}
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={unsplash(ativo.foto, 500)} alt="" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
