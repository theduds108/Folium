"use client";

import Link from "next/link";
import { useConta } from "@/lib/conta";
import { PublicarOportunidade } from "./PublicarOportunidade";

/** Faixa do topo: muda conforme quem está vendo. Colaborador não vê o convite para publicar. */
export function AvisoEmpresa() {
  const { conta, carregando } = useConta();
  if (carregando || conta?.tipo === "colaborador") return null;
  return (
    <div className="aviso-empresa cartao">
      <div>
        <strong>Tem um trabalho para oferecer?</strong>
        <span className="suave"> Com a conta de contratante grátis você publica 1 vaga por mês.</span>
      </div>
      <a href="#publicar" className="botao botao-verde">Publicar oportunidade</a>
    </div>
  );
}

/** Formulário de vaga só para contratantes. Visitante vê o convite para criar a conta. */
export function SecaoPublicar() {
  const { conta, premium, carregando } = useConta();
  if (carregando || conta?.tipo === "colaborador") return null;
  if (!conta)
    return (
      <section className="secao" id="publicar">
        <div className="publicar cartao">
          <aside className="publicar-lado">
            <span className="rotulos"><span>Para empresas</span></span>
            <h2>Publique uma oportunidade</h2>
            <p>Crie a conta de contratante, grátis e com qualquer e-mail, para publicar e acompanhar quem se interessou.</p>
          </aside>
          <div className="publicar-form publicar-ok">
            <h3>Leva 1 minuto</h3>
            <p className="suave">Mandamos um link de acesso para o seu e-mail, sem senha. Depois é só contar o que você precisa.</p>
            <Link href="/entrar/?como=contratante" className="botao botao-verde">Criar conta de contratante</Link>
          </div>
        </div>
      </section>
    );
  return (
    <section className="secao">
      <PublicarOportunidade conta={conta} premium={premium} />
    </section>
  );
}
