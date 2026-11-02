"use client";

import { useEffect, useState } from "react";
import { OPORTUNIDADES, type Oportunidade } from "@/lib/conteudo";
import { GRUPOS_SERVICOS_FILTRO } from "@/components/OpcoesServicos";
import { Seletor } from "@/components/Seletor";
import { MOSTRAR_EXEMPLOS } from "@/lib/config";
import { bancoLigado } from "@/lib/supabase";
import { listarOportunidadesReais, marcarInteresse } from "@/lib/repositorio";
import { useSessao } from "@/lib/sessao";
import { Denunciar } from "@/components/Denunciar";

const TIPOS = ["Freela", "Projeto", "Estágio"] as const;

export function MuralOportunidades() {
  const { usuario } = useSessao();
  const [tipo, setTipo] = useState("");
  const [servico, setServico] = useState("");
  const [interesse, setInteresse] = useState<string[]>([]);
  const [reais, setReais] = useState<Oportunidade[]>([]);

  useEffect(() => {
    listarOportunidadesReais().then(setReais);
  }, []);

  const todas = MOSTRAR_EXEMPLOS || !bancoLigado ? [...reais, ...OPORTUNIDADES] : reais;
  const lista = todas.filter((o) => (!tipo || o.tipo === tipo) && (!servico || o.servico === servico));

  const tenhoInteresse = (o: Oportunidade) => {
    setInteresse((x) => (x.includes(o.id) ? x : [...x, o.id]));
    if (o.real && usuario) marcarInteresse(o.id, usuario.id).catch(() => {});
  };

  return (
    <>
      <div className="cartao filtros filtros-dois">
        <div className="campo">
          Tipo
          <Seletor aria-label="Tipo" valor={tipo} onMudar={setTipo} placeholder="Todos" grupos={[{ opcoes: [{ valor: "", rotulo: "Todos" }, ...TIPOS] }]} />
        </div>
        <div className="campo">
          Serviço
          <Seletor aria-label="Serviço" valor={servico} onMudar={setServico} placeholder="Todos" grupos={GRUPOS_SERVICOS_FILTRO} />
        </div>
      </div>

      <p className="suave" aria-live="polite">
        {lista.length === 1 ? "1 oportunidade" : `${lista.length} oportunidades`}
      </p>

      <div className="grade-vagas revelar-grupo">
        {lista.map((o) => {
          const marcada = interesse.includes(o.id);
          return (
            <article key={o.id} className="cartao vaga">
              <div className="vaga-topo">
                <span className={o.tipo === "Estágio" ? "etiqueta etiqueta-terra" : "etiqueta"}>{o.tipo}</span>
                <span className="suave vaga-data">{o.publicadaHa}</span>
              </div>
              <h3>{o.titulo}</h3>
              <p className="suave vaga-empresa">{o.empresa} · {o.cidade}</p>
              <p>{o.descricao}</p>
              <dl className="vaga-dados">
                <div><dt>Orçamento</dt><dd>{o.orcamento}</dd></div>
                <div><dt>Prazo</dt><dd>{o.prazo}</dd></div>
              </dl>
              {marcada && o.contato ? (
                <p className="salvo" style={{ margin: 0 }}>
                  Fale com a empresa: <strong>{o.contato}</strong>
                </p>
              ) : (
                <button
                  type="button"
                  className={marcada ? "botao botao-contorno" : "botao botao-primario"}
                  onClick={() => (marcada ? setInteresse((x) => x.filter((i) => i !== o.id)) : tenhoInteresse(o))}
                >
                  {marcada ? "Interesse enviado ✓" : "Tenho interesse"}
                </button>
              )}
              {o.real && <Denunciar alvo={o.id} tipo="oportunidade" />}
            </article>
          );
        })}
      </div>
    </>
  );
}
