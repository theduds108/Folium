import Link from "next/link";
import { EMPRESA_ABERTA, FORNECEDOR, RESPONSAVEIS } from "@/lib/fornecedor";

/**
 * Identificação de quem responde pelo Fólium (fornecedor e controlador dos dados).
 * Os dados vêm de lib/fornecedor.ts: preencha lá quando a empresa for aberta.
 */
export function Fornecedor() {
  if (!EMPRESA_ABERTA)
    return (
      <>
        <p>
          O Fólium é um projeto acadêmico de empreendedorismo, criado em parceria com a UNISAGRADO (Bauru, SP), e está em
          fase de teste. Ainda não é uma empresa aberta: por isso não tem CNPJ e não vende nada.
        </p>
        <p>
          <strong>Responsáveis pelo site e pelos dados:</strong> {RESPONSAVEIS}, equipe do Fólium.
          <br />
          <strong>Atendimento e privacidade:</strong>{" "}
          {FORNECEDOR.email ? <a href={`mailto:${FORNECEDOR.email}`}>{FORNECEDOR.email}</a> : <Link href="/feedback">página Feedback</Link>}
        </p>
        <p className="suave">Quando a empresa for registrada, o nome empresarial, o CNPJ e o endereço aparecem aqui antes de qualquer venda.</p>
      </>
    );

  return (
    <dl className="legal-dados">
      <dt>Nome empresarial</dt>
      <dd>{FORNECEDOR.razaoSocial}</dd>
      <dt>CNPJ</dt>
      <dd>{FORNECEDOR.cnpj}</dd>
      {FORNECEDOR.endereco && (
        <>
          <dt>Endereço</dt>
          <dd>{FORNECEDOR.endereco}</dd>
        </>
      )}
      <dt>Responsáveis</dt>
      <dd>{RESPONSAVEIS}</dd>
      <dt>Atendimento e privacidade</dt>
      <dd>{FORNECEDOR.email ? <a href={`mailto:${FORNECEDOR.email}`}>{FORNECEDOR.email}</a> : <Link href="/feedback">página Feedback</Link>}</dd>
    </dl>
  );
}
