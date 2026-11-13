import { FOLHA } from "./Marca";

/**
 * Capa provisória de um trabalho, desenhada a partir de uma cor.
 * Quando houver upload de imagens, este componente passa a mostrar a foto.
 */
export function Capa({ cor, titulo, semTexto = false }: { cor: string; titulo: string; semTexto?: boolean }) {
  return (
    <div className="capa" style={{ background: cor }}>
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="160" cy="30" r="46" fill="rgba(255,255,255,0.10)" />
        <path d="M0 120 Q60 80 120 110 T200 100 V150 H0Z" fill="rgba(0,0,0,0.12)" />
        <path d={FOLHA.limbo} transform="translate(14 6) scale(0.42)" fill="rgba(255,255,255,0.25)" />
      </svg>
      {!semTexto && <span>{titulo}</span>}
    </div>
  );
}
