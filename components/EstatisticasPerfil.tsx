"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { minhasEstatisticas, useVagasNovas, type Estatisticas } from "@/lib/negocios";

/** Números do portfólio no editor. Grátis vê as visitas do mês; o Premium vê o detalhe. */
export function EstatisticasPerfil() {
  const [e, setE] = useState<Estatisticas | null | undefined>(undefined);
  const novas = useVagasNovas();

  useEffect(() => {
    let ativo = true;
    minhasEstatisticas()
      .then((x) => ativo && setE(x))
      .catch(() => ativo && setE(null));
    return () => {
      ativo = false;
    };
  }, []);

  if (e === undefined || e === null) return null;

  return (
    <div className="cartao estatisticas" aria-labelledby="estat-titulo">
      <strong id="estat-titulo">Seu portfólio em números</strong>
      <dl className="estatisticas-grade">
        <div><dt>Visitas em 30 dias</dt><dd>{e.visitas_30}</dd></div>
        <div><dt>Vagas em que você se interessou</dt><dd>{e.interesses}</dd></div>
        <div><dt>Convites recebidos</dt><dd>{e.convites}</dd></div>
        {e.premium && (
          <>
            <div><dt>Visitas em 7 dias</dt><dd>{e.visitas_7 ?? 0}</dd></div>
            <div><dt>Visitas de contratantes (30 dias)</dt><dd>{e.visitas_contratantes_30 ?? 0}</dd></div>
            <div><dt>Contratantes que te salvaram</dt><dd>{e.salvos ?? 0}</dd></div>
          </>
        )}
      </dl>
      {!e.premium && (
        <p className="ajuda" style={{ margin: 0 }}>
          Com o <Link href="/planos">Premium</Link> você vê quantas visitas vieram de contratantes e quantos te salvaram.
        </p>
      )}
      {novas > 0 && (
        <Link href="/oportunidades" className="estatisticas-novas">
          {novas === 1 ? "1 vaga nova" : `${novas} vagas novas`} na sua área →
        </Link>
      )}
    </div>
  );
}
