/** Marca provisória: uma folha que também lembra uma página dobrada. */
export function FolhaIcone({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M6 26C6 13 14 5 27 5c0 13-8 21-21 21Z"
        fill="#4F7A3A"
      />
      <path d="M7 25 21 11" stroke="#F6F0E4" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 19h6M16 16v-4" stroke="#F6F0E4" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SeloVerificado() {
  return (
    <span className="selo" title="Vínculo com a instituição conferido pelo e-mail institucional">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="#B0673B" />
        <path d="m4.5 8.2 2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Aluno verificado UNISAGRADO
    </span>
  );
}
