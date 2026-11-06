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
 * Mostra as vagas de exemplo e os comentários de exemplo (depoimentos da página inicial
 * e avaliações nos perfis) junto com o conteúdo real.
 * Desligado: o site só mostra vagas e comentários de verdade. Para trazê-los de volta
 * (ex.: numa apresentação), troque para true.
 * Sem banco ligado (rodando local sem .env.local), as vagas de exemplo aparecem de qualquer jeito.
 */
export const MOSTRAR_EXEMPLOS = false;

/**
 * Por enquanto o contratante do plano grátis publica quantas vagas quiser (sem o limite de 1 por mês).
 * Para voltar ao limite, troque para false e rode de novo a parte do limite no banco
 * (veja supabase/migrations/20261106000000_feedback_vagas_liberadas.sql).
 */
export const VAGAS_LIBERADAS = true;

/** Tamanho mínimo da senha da conta (o Supabase exige pelo menos 6). */
export const SENHA_MINIMA = 8;

/**
 * Mostra os alunos fictícios (Ana Ribeiro, Bruno Matsuda…) junto com os perfis reais.
 * Desligado: a vitrine só mostra quem se cadastrou de verdade. Para trazê-los de volta, troque para true.
 * Sem banco ligado (rodando local sem .env.local), os exemplos aparecem de qualquer jeito.
 */
export const MOSTRAR_ALUNOS_EXEMPLO = false;

/**
 * Página de demonstração do mural (/demo/oportunidades), com vagas fictícias só para prints e apresentações.
 * Fica ligada rodando local e nas prévias da Vercel; no site publicado (VERCEL_ENV = "production") a página não existe.
 * Para forçar: FOLIUM_DEMO=1 liga, FOLIUM_DEMO=0 desliga (variável de ambiente na Vercel ou no .env.local).
 * Lido só no servidor, na hora de gerar o site.
 */
export const DEMO_ATIVA =
  process.env.FOLIUM_DEMO === "1" || (process.env.FOLIUM_DEMO !== "0" && process.env.VERCEL_ENV !== "production");
