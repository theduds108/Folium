/**
 * Marca do Fólium: a folha oficial é a do "O" da capa (anel verde com a folha dentro).
 * Todo lugar que mostra a folha usa estas peças, para manter um só desenho:
 *   - FolhaMarca: só o símbolo (anel + folha), para ícones e tamanhos pequenos;
 *   - MarcaFolium: o wordmark "FÓLIUM" com a folha no lugar do O e o bloco cobre atrás do "LI".
 * Os ícones do app (public/icons) são gerados a partir dos mesmos traços (scripts/gerar-icones.mjs).
 */

/** Traços da folha, num quadro de 100×100. */
export const FOLHA = {
  anel: { cx: 50, cy: 50, r: 43, espessura: 11 },
  limbo: "M28 72c0-26 16-42 44-44 0 28-16 44-44 44Z",
  nervura: "M30 70 58 42",
} as const;

export function FolhaMarca({
  tamanho,
  cor = "currentColor",
  nervura = "#F6F0E4",
  className,
}: {
  tamanho?: number | string;
  cor?: string;
  nervura?: string;
  className?: string;
}) {
  const { cx, cy, r, espessura } = FOLHA.anel;
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={espessura} />
      <path d={FOLHA.limbo} fill={cor} />
      <path d={FOLHA.nervura} stroke={nervura} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Wordmark oficial. O tamanho vem do font-size do elemento que o envolve
 * (classe `marca-folium`); a capa usa a versão gigante e o cabeçalho a pequena.
 */
export function MarcaFolium() {
  return (
    <>
      <span className="bloco-cobre" aria-hidden="true" />
      <span aria-hidden="true">F</span>
      <span className="letra-folha" aria-hidden="true">
        <FolhaMarca />
      </span>
      <span aria-hidden="true">LIUM</span>
    </>
  );
}
