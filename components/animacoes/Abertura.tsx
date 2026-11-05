/**
 * Abertura do app: a folha do Fólium se desenha e a página "vira" para cima.
 *
 * Objetivo: um momento curto de marca na primeira vez que a pessoa abre o Fólium
 * (no navegador ou no app instalado), sem atrasar o uso. Coreografia (~1,2s, só CSS):
 *   1. o anel se desenha e a folha brota do talo, com um leve balanço (0–650ms);
 *   2. o nome "Fólium" aparece da esquerda para a direita (300–700ms);
 *   3. o papel creme sobe como uma página virando, com uma faixa cobre logo atrás (780–1200ms).
 * Não bloqueia toques (pointer-events: none) e roda desde a primeira pintura, sem JS.
 * Aparece uma vez por sessão: o script abaixo marca <html class="sem-abertura"> nas visitas
 * seguintes. Com prefers-reduced-motion: reduce, não aparece.
 */
const PULAR_SE_JA_VIU = `try{if(sessionStorage.getItem("folium-abertura"))document.documentElement.classList.add("sem-abertura");else sessionStorage.setItem("folium-abertura","1")}catch(e){}`;

export function Abertura() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PULAR_SE_JA_VIU }} />
      <div className="abertura" aria-hidden="true">
        <div className="abertura-faixa" />
        <div className="abertura-papel">
          <div className="abertura-marca">
            <svg viewBox="0 0 100 100" className="abertura-folha">
              <circle className="abertura-anel" cx="50" cy="50" r="43" pathLength="1" />
              <path className="abertura-limbo" d="M28 72c0-26 16-42 44-44 0 28-16 44-44 44Z" />
              <path className="abertura-nervura" d="M30 70 58 42" pathLength="1" />
            </svg>
            <span className="abertura-nome">Fólium</span>
          </div>
        </div>
      </div>
    </>
  );
}
