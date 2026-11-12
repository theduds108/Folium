"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConta } from "@/lib/conta";
import { formatarData } from "@/lib/formato";

/**
 * Faixas no topo para quem está logado:
 *  - conta suspensa pela equipe (depois de uma denúncia);
 *  - termos de uso e código de conduta ainda não aceitos (ou mudaram desde o último aceite).
 * Sem o aceite dá para navegar, mas não dá para fechar combinados.
 */
export function FaixaConta() {
  const { conta } = useConta();
  const pathname = usePathname() ?? "";
  if (!conta) return null;

  if (conta.suspensaAte) {
    const banida = conta.suspensaAte.startsWith("infinity");
    return (
      <div className="faixa-senha faixa-suspensa" role="status">
        <div className="container faixa-senha-interna">
          <p>
            <strong>{banida ? "Sua conta foi encerrada pela equipe do Fólium." : `Sua conta está suspensa até ${formatarData(conta.suspensaAte.slice(0, 10))}.`}</strong>{" "}
            Isso aconteceu depois da análise de uma denúncia. Enquanto isso, não dá para publicar vagas, convidar, propor nem aceitar combinados.
            Se acha que foi um engano, escreva pela página <Link href="/feedback">Feedback</Link>.
          </p>
        </div>
      </div>
    );
  }

  if (!conta.termosAceitos && !pathname.startsWith("/conduta"))
    return (
      <div className="faixa-senha" role="status">
        <div className="container faixa-senha-interna">
          <p>
            <strong>Leia e aceite o código de conduta.</strong> São as regras que protegem você e quem trabalha com você. Sem o aceite, não dá para fechar combinados.
          </p>
          <Link href="/conduta" className="botao botao-primario">Ler e aceitar</Link>
        </div>
      </div>
    );

  return null;
}
