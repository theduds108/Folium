/**
 * Domínio do e-mail institucional aceito no cadastro.
 * Os alunos usam nome.RA@alunos.unisagrado.edu.br; o subdomínio "alunos." é aceito
 * porque emailInstitucional() (e a função eh_aluno_institucional() no banco) liberam
 * qualquer subdomínio de unisagrado.edu.br.
 */
export const DOMINIOS_INSTITUCIONAIS = ["unisagrado.edu.br"];

export function emailInstitucional(email: string) {
  const dominio = email.trim().toLowerCase().split("@")[1] ?? "";
  return DOMINIOS_INSTITUCIONAIS.some((d) => dominio === d || dominio.endsWith(`.${d}`));
}

/**
 * Mostra as vagas de exemplo junto com as reais.
 * Quando houver vagas de verdade suficientes, troque para false.
 */
export const MOSTRAR_EXEMPLOS = true;

/** Tamanho mínimo da senha da conta (o Supabase exige pelo menos 6). */
export const SENHA_MINIMA = 8;

/**
 * Mostra os alunos fictícios (Ana Ribeiro, Bruno Matsuda…) junto com os perfis reais.
 * Desligado: a vitrine só mostra quem se cadastrou de verdade. Para trazê-los de volta, troque para true.
 * Sem banco ligado (rodando local sem .env.local), os exemplos aparecem de qualquer jeito.
 */
export const MOSTRAR_ALUNOS_EXEMPLO = false;
