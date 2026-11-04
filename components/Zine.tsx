import Link from "next/link";

/* Elementos visuais do estilo "zine": ornamentos, papel rasgado, índice de serviços e anotações à mão. */

export function Ornamentos({ claro = false }: { claro?: boolean }) {
  const cor = claro ? "#F6F0E4" : "#2F3E2A";
  return (
    <span className="ornamentos" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 1l2.6 7.4L22 11l-7.4 2.6L12 21l-2.6-7.4L2 11l7.4-2.6Z" fill={cor} /></svg>
      <svg viewBox="0 0 24 24"><path d="M12 2c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10Z" fill={cor} /></svg>
      <svg viewBox="0 0 24 24"><path d="M4 20C4 10 10 4 21 3c0 11-6 17-17 17Z" fill={cor} /><path d="M5 19 15 9" stroke={claro ? "#2F3E2A" : "#F6F0E4"} strokeWidth="1.6" strokeLinecap="round" /></svg>
    </span>
  );
}

/** Borda de papel rasgado. `lado="topo"` desenha a borda de cima de um bloco escuro. */
export function PapelRasgado({ cor = "#2F3E2A", inverter = false }: { cor?: string; inverter?: boolean }) {
  return (
    <svg className="papel-rasgado" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" style={inverter ? { transform: "scaleY(-1)" } : undefined}>
      <path
        fill={cor}
        d="M0 40V22l28-6 22 9 31-12 26 8 19-10 34 11 25-7 30 9 22-14 35 10 18-6 33 12 27-9 21 5 36-13 24 11 29-6 20 8 34-12 23 7 31-9 26 12 19-8 35 6 22-10 30 13 27-7 24 5 33-11 21 9 29-8 26 10 32-12 20 6 34 7 25-10 28 9 23-6 31 11 24-8 30 6 27-9 22 10 35-7 21 8 26-5V40Z"
      />
    </svg>
  );
}

/**
 * Índice de serviços em faixa escura. Antes era um letreiro correndo sem parar;
 * agora é um bloco estático e clicável: cada serviço abre a busca já filtrada.
 * Ritmo editorial sem movimento contínuo.
 */
export function Faixa({ itens, rotulo = "Índice de serviços" }: { itens: string[]; rotulo?: string }) {
  return (
    <nav className="faixa" aria-label={rotulo}>
      <div className="container">
        <div className="faixa-topo">
          <span className="faixa-rotulo">{rotulo}</span>
          <span className="faixa-nota">escolha um e veja quem faz</span>
        </div>
        <ol className="faixa-lista">
          {itens.map((t, i) => (
            <li key={t}>
              <Link href={`/talentos/?servico=${encodeURIComponent(t)}`}>
                <span className="faixa-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="faixa-nome">{t}</span>
                <span className="faixa-seta" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

export function Anotacao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`anotacao ${className}`}>
      <svg width="34" height="40" viewBox="0 0 34 40" aria-hidden="true">
        <path d="M8 2c-4 10-4 22 4 32M12 34l-6-2M12 34l1-7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </span>
  );
}
