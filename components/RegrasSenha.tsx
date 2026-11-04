"use client";

import { REGRAS_SENHA } from "@/lib/acesso";

/** Lista das regras da senha, marcando cada uma conforme a pessoa digita. */
export function RegrasSenha({ senha }: { senha: string }) {
  return (
    <ul className="regras-senha" aria-label="A senha precisa ter">
      {REGRAS_SENHA.map((r) => {
        const ok = r.ok(senha);
        return (
          <li key={r.texto} className={ok ? "ok" : ""}>
            <span aria-hidden="true">{ok ? "✓" : "○"}</span> {r.texto}
            <span className="sr-only">{ok ? " (cumprido)" : " (falta)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
