/**
 * Abertura do app: a folha do Fólium se desenha e a página "vira" para cima.
 *
 * Objetivo: um momento curto de marca na primeira vez que a pessoa abre o Fólium
 * (no navegador ou no app instalado), sem atrasar o uso. Coreografia (~1,6s, só CSS):
 *   1. o anel se desenha e a folha brota do talo, com um leve balanço (0–650ms);
 *   2. o nome "Fólium" aparece e a frase "Seu trabalho, reconhecido." se escreve à mão, em Caveat (300–1080ms);
 *   3. o papel creme sobe como uma página virando, com uma faixa cobre logo atrás (1200–1610ms).
 * Não bloqueia toques (pointer-events: none) e roda desde a primeira pintura, sem JS.
 * Aparece uma vez por sessão: o script abaixo marca <html class="sem-abertura"> nas visitas
 * seguintes. Com prefers-reduced-motion: reduce, não aparece.
 */
import { FOLHA } from "../Marca";

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
              <circle className="abertura-anel" cx={FOLHA.anel.cx} cy={FOLHA.anel.cy} r={FOLHA.anel.r} pathLength="1" />
              <path className="abertura-limbo" d={FOLHA.limbo} />
              <path className="abertura-nervura" d={FOLHA.nervura} pathLength="1" />
            </svg>
            <span className="abertura-nome">Fólium</span>
            <span className="abertura-frase">Seu trabalho, reconhecido.</span>
          </div>
        </div>
      </div>
    </>
  );
}
