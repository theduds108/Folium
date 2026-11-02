"use client";

import { useEffect, useId, useState } from "react";
import { OPORTUNIDADES, type Oportunidade } from "@/lib/conteudo";
import { GRUPOS_SERVICOS_FILTRO } from "@/components/OpcoesServicos";
import { Seletor } from "@/components/Seletor";
import { EsqueletoVaga } from "@/components/Esqueleto";
import { MOSTRAR_EXEMPLOS } from "@/lib/config";
import { bancoLigado } from "@/lib/supabase";
import { listarOportunidadesReais, marcarInteresse } from "@/lib/repositorio";
import { useSessao } from "@/lib/sessao";
import { Denunciar } from "@/components/Denunciar";

const TIPOS = ["Freela", "Projeto", "Estágio"] as const;

/** Classe do carimbo de cada tipo: forma e cor diferentes, sempre com o nome escrito. */
const CARIMBO: Record<Oportunidade["tipo"], string> = {
  Freela: "carimbo carimbo-freela",
  Projeto: "carimbo carimbo-projeto",
  Estágio: "carimbo carimbo-estagio",
};

function IconeCheck() {
  return (
    <svg className="confirmacao-icone" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="currentColor" opacity="0.15" />
      <path d="m5 9.2 2.6 2.6L13 6.4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MuralOportunidades() {
  const { usuario } = useSessao();
  const idMesa = useId();
  const [tipo, setTipo] = useState("");
  const [servico, setServico] = useState("");
  const [interesse, setInteresse] = useState<string[]>([]);
  const [reais, setReais] = useState<Oportunidade[]>([]);
  const [carregando, setCarregando] = useState(bancoLigado);
  const [anuncio, setAnuncio] = useState("");

  useEffect(() => {
    let ativo = true;
    listarOportunidadesReais()
      .then((r) => ativo && setReais(r))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const todas = MOSTRAR_EXEMPLOS || !bancoLigado ? [...reais, ...OPORTUNIDADES] : reais;
  const porServico = todas.filter((o) => !servico || o.servico === servico);
  const lista = porServico.filter((o) => !tipo || o.tipo === tipo);
  const contar = (t: string) => porServico.filter((o) => o.tipo === t).length;

  const tenhoInteresse = (o: Oportunidade) => {
    setInteresse((x) => (x.includes(o.id) ? x : [...x, o.id]));
    setAnuncio(`Interesse enviado: ${o.titulo}.${o.contato ? ` Contato da empresa: ${o.contato}.` : ""}`);
    if (o.real && usuario) marcarInteresse(o.id, usuario.id).catch(() => {});
  };

  const desfazer = (o: Oportunidade) => {
    setInteresse((x) => x.filter((i) => i !== o.id));
    setAnuncio(`Interesse retirado: ${o.titulo}.`);
  };

  const limpar = () => {
    setTipo("");
    setServico("");
  };

  return (
    <div className="arquivo">
      <section className="mesa" aria-labelledby={`${idMesa}-titulo`}>
        <div className="mesa-topo">
          <h2 className="mesa-titulo" id={`${idMesa}-titulo`}>Mesa de pesquisa</h2>
          {(tipo || servico) && (
            <button type="button" className="mesa-limpar" onClick={limpar}>
              Limpar
            </button>
          )}
        </div>
        <div className="mesa-form">
          <fieldset className="mesa-tipos">
            <legend>Tipo</legend>
            <div className="opcoes">
              {[{ valor: "", rotulo: "Todos", n: porServico.length }, ...TIPOS.map((t) => ({ valor: t, rotulo: t, n: contar(t) }))].map((op) => (
                <label key={op.rotulo} className="opcao">
                  <input type="radio" name={`${idMesa}-tipo`} value={op.valor} checked={tipo === op.valor} onChange={() => setTipo(op.valor)} />
                  {op.rotulo} <span className="opcao-numero">{op.n}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="campo">
            Serviço
            <Seletor aria-label="Serviço" valor={servico} onMudar={setServico} placeholder="Todos" grupos={GRUPOS_SERVICOS_FILTRO} />
          </div>
        </div>
      </section>

      <div className="arquivo-resultados">
        <p className="contagem" aria-live="polite">
          <strong>{lista.length}</strong> {lista.length === 1 ? "oportunidade" : "oportunidades"}
          {(tipo || servico) && <span className="contagem-filtros"> · {[tipo, servico].filter(Boolean).join(" · ")}</span>}
          {carregando && <span className="contagem-filtros"> · carregando vagas…</span>}
        </p>
        <p className="visualmente-oculto" aria-live="polite">{anuncio}</p>

        {lista.length > 0 || carregando ? (
          <div className="grade-vagas">
            {carregando && [0, 1].map((i) => <EsqueletoVaga key={`esq-${i}`} />)}
            {lista.map((o) => {
              const marcada = interesse.includes(o.id);
              return (
                <article key={o.id} className={`cartao vaga vaga-${o.tipo === "Estágio" ? "estagio" : o.tipo.toLowerCase()}`}>
                  <div className="vaga-topo">
                    <span className={CARIMBO[o.tipo]}>{o.tipo}</span>
                    <span className="suave vaga-data">{o.publicadaHa}</span>
                  </div>
                  <h3>{o.titulo}</h3>
                  <p className="suave vaga-empresa">{o.empresa} · {o.cidade}</p>
                  <dl className="vaga-dados">
                    <div><dt>Orçamento</dt><dd>{o.orcamento}</dd></div>
                    <div><dt>Prazo</dt><dd>{o.prazo}</dd></div>
                  </dl>
                  <p className="vaga-desc">{o.descricao}</p>
                  {marcada && o.contato ? (
                    <p className="salvo confirmacao" style={{ margin: 0 }}>
                      <IconeCheck />
                      <span>Interesse enviado. Fale com a empresa: <strong>{o.contato}</strong></span>
                    </p>
                  ) : marcada ? (
                    <button type="button" className="botao botao-contorno botao-confirmado" onClick={() => desfazer(o)}>
                      <IconeCheck />
                      <span className="confirmacao">Interesse enviado</span>
                      <span className="botao-desfazer">desfazer</span>
                    </button>
                  ) : (
                    <button type="button" className="botao botao-primario" onClick={() => tenhoInteresse(o)}>
                      Tenho interesse
                    </button>
                  )}
                  {o.real && <Denunciar alvo={o.id} tipo="oportunidade" />}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="cartao vazio">
            <h3>Nenhuma oportunidade com esses filtros</h3>
            <p className="suave">Tente outro tipo ou serviço.</p>
            <button className="botao botao-contorno" onClick={limpar}>Limpar filtros</button>
          </div>
        )}
      </div>
    </div>
  );
}
