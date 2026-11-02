"use client";

import { motion } from "motion/react";

/**
 * Título em linhas que sobem de trás de uma máscara, uma depois da outra.
 * Cada item de `linhas` é uma linha; use <em> para a palavra em itálico.
 */
export function TituloSobe({ linhas, className = "" }: { linhas: React.ReactNode[]; className?: string }) {
  return (
    <h1 className={className}>
      {linhas.map((linha, i) => (
        <span key={i} className="linha-mascara">
          <motion.span
            className="linha"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.09 }}
          >
            {linha}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
