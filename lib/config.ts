/**
 * Domínio do e-mail institucional aceito no cadastro.
 * A confirmar com a UNISAGRADO qual é o domínio usado pelos alunos.
 */
export const DOMINIOS_INSTITUCIONAIS = ["unisagrado.edu.br"];

export function emailInstitucional(email: string) {
  const dominio = email.trim().toLowerCase().split("@")[1] ?? "";
  return DOMINIOS_INSTITUCIONAIS.some((d) => dominio === d || dominio.endsWith(`.${d}`));
}
