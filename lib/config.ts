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
 * Mostra os perfis e vagas de exemplo junto com os reais.
 * Quando houver alunos de verdade suficientes, troque para false.
 */
export const MOSTRAR_EXEMPLOS = true;

/** Exemplo mostrado no campo de e-mail da tela de entrada. */
export const EXEMPLO_EMAIL = "nome.RA@alunos.unisagrado.edu.br";
