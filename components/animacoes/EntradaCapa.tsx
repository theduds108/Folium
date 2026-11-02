/**
 * Entrada da capa da página inicial: uma coreografia única e curta.
 *
 * Objetivo: apresentar a marca e, em seguida, a busca, sem competir com ela.
 *   1. wordmark: sobe 10px e aparece (400ms);
 *   2. frase de valor, busca, ações e provas: aparecem juntas (400ms, 120ms depois);
 *   3. fichas do leque: abrem uma vez (520ms), por último.
 * Tudo em CSS (classe .entrada-capa em globals.css), com escopo neste bloco:
 * roda desde a primeira pintura, sem esperar JavaScript, então o conteúdo não "pisca".
 * Com prefers-reduced-motion: reduce, nada se move e tudo já aparece no lugar.
 */
export function EntradaCapa({ children }: { children: React.ReactNode }) {
  return <div className="container entrada-capa">{children}</div>;
}
