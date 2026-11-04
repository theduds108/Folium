"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessao } from "@/lib/sessao";

/**
 * Faixa para quem entrou pelo link do e-mail e ainda não criou nome de usuário e senha.
 * Some quando user_metadata.nome_usuario e tem_senha ficam preenchidos (ver lib/acesso.ts).
 */
export function AvisoSenha() {
  const { usuario } = useSessao();
  const pathname = usePathname();
  if (!usuario || (usuario.user_metadata?.nome_usuario && usuario.user_metadata?.tem_senha) || pathname.startsWith("/senha")) return null;
  return (
    <div className="faixa-senha" role="status">
      <div className="container faixa-senha-interna">
        <p>
          <strong>Crie seu nome de usuário e senha.</strong> Eles serão o seu login no Fólium daqui em diante, sem esperar link no e-mail.
        </p>
        <Link href="/senha" className="botao botao-primario">Criar meu login</Link>
      </div>
    </div>
  );
}
