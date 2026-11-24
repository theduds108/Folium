/**
 * Quem é o responsável pelo Fólium (identificação do fornecedor e controlador dos dados).
 *
 * PREENCHER quando a empresa for aberta (ME no Simples). Enquanto cnpj estiver vazio, o site mostra
 * que o Fólium é um projeto acadêmico em formalização e que nada é vendido.
 * Antes de cobrar o Premium, a lei exige nome empresarial, CNPJ e endereço visíveis no site
 * (Decreto 7.962/2013, art. 2º). Confira os dados com o contador.
 */
export const FORNECEDOR = {
  /** Ex.: "Fólium Tecnologia Ltda." (como está no cartão CNPJ). */
  razaoSocial: "",
  /** Ex.: "00.000.000/0001-00". */
  cnpj: "",
  /** Endereço do registro da empresa (pode ser o de um escritório virtual). */
  endereco: "",
  /** E-mail de atendimento e privacidade (canal do titular de dados). Vazio = só a página Feedback. */
  email: "",
};

/** Equipe que responde pelo projeto enquanto não há empresa aberta. */
export const RESPONSAVEIS = "Eduarda Ferreira Corrêa, Giovana Buscariolo de Lima e Lauren Zareski de Oliveira";

export const EMPRESA_ABERTA = FORNECEDOR.cnpj.trim() !== "";

/** Data da última mudança nos termos e na política. Mude junto com VERSAO_TERMOS (lib/versao-termos.ts). */
export const ATUALIZADO_EM = "24 de novembro de 2026";
