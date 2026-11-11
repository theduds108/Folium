"use client";

import { useEffect, useId, useState } from "react";
import { OPORTUNIDADES, type Oportunidade } from "@/lib/conteudo";
import { GRUPOS_SERVICOS_FILTRO } from "@/components/OpcoesServicos";
import { Seletor } from "@/components/Seletor";
import { EsqueletoVaga } from "@/components/Esqueleto";
import { MOSTRAR_EXEMPLOS } from "@/lib/config";
import { bancoLigado } from "@/lib/supabase";
import { desmarcarInteresse, listarOportunidadesReais, marcarInteresse, meusInteresses } from "@/lib/repositorio";
import { useSessao } from "@/lib/sessao";
import { useConta } from "@/lib/conta";
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
  const { conta } = useConta();
  // "Tenho interesse" é para quem trabalha; contratante só vê as vagas.
  const podeSeInteressar = conta?.tipo !== "contratante";
  const idMesa = useId();
  const [tipo, setTipo] = useState("");
  const [servico, setServico] = useState("");
  const [interesse, setInteresse] = useState<string[]>([]);
  const [reais, setReais] = useState<Oportunidade[]>([]);
  const [carregando, setCarregando] = useState(bancoLigado);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [anuncio, setAnuncio] = useState("");
  const [erroInteresse, setErroInteresse] = useState<{ id: string; texto: string } | null>(null);

  // Interesses já enviados continuam marcados depois de recarregar ou voltar à página.
  const idUsuario = usuario?.id;
  useEffect(() => {
    if (!idUsuario) return;
    let ativo = true;
    meusInteresses(idUsuario).then((ids) => ativo && ids.length && setInteresse((x) => Array.from(new Set([...x, ...ids]))));
    return () => {
      ativo = false;
    };
  }, [idUsuario]);

  useEffect(() => {
    let ativo = true;
    setFalhou(false);
    if (tentativa) setCarregando(true);
    listarOportunidadesReais(true)
      .then((r) => ativo && setReais(r))
      .catch(() => ativo && setFalhou(true))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  // Vagas em destaque (contratante Premium) vêm primeiro.
  const todas = (MOSTRAR_EXEMPLOS || !bancoLigado ? [...reais, ...OPORTUNIDADES] : [...reais]).sort(
    (a, b) => Number(!!b.destaque) - Number(!!a.destaque)
  );
  const porServico = todas.filter((o) => !servico || o.servico === servico);
  const lista = porServico.filter((o) => !tipo || o.tipo === tipo);
  const contar = (t: string) => porServico.filter((o) => o.tipo === t).length;

  const tenhoInteresse = async (o: Oportunidade) => {
    setErroInteresse(null);
    setInteresse((x) => (x.includes(o.id) ? x : [...x, o.id]));
    setAnuncio(`Interesse enviado: ${o.titulo}.${o.contato ? ` Contato da empresa: ${o.contato}.` : ""}`);
    if (!o.real || !usuario) return;
    try {
      await marcarInteresse(o.id, usuario.id);
    } catch (e) {
      // Não deu para gravar: desmarca, para o aluno não achar que a empresa recebeu.
      setInteresse((x) => x.filter((i) => i !== o.id));
      setErroInteresse({ id: o.id, texto: (e as Error).message });
      setAnuncio(`Interesse não enviado: ${(e as Error).message}`);
    }
  };

  const desfazer = async (o: Oportunidade) => {
    setErroInteresse(null);
    setInteresse((x) => x.filter((i) => i !== o.id));
    setAnuncio(`Interesse retirado: ${o.titulo}.`);
    if (!o.real || !usuario) return;
    try {
      await desmarcarInteresse(o.id, usuario.id);
    } catch (e) {
      setInteresse((x) => (x.includes(o.id) ? x : [...x, o.id]));
      setErroInteresse({ id: o.id, texto: (e as Error).message });
      setAnuncio(`Não deu para retirar o interesse: ${(e as Error).message}`);
    }
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

        {falhou && !carregando && reais.length === 0 ? (
          <div className="cartao vazio" role="alert">
            <h3>Não deu para carregar as vagas</h3>
            <p className="suave">Deve ter sido a internet. Confira a conexão e tente de novo.</p>
            <button className="botao botao-contorno" onClick={() => setTentativa((t) => t + 1)}>Tentar de novo</button>
          </div>
        ) : lista.length > 0 || carregando ? (
          <div className="grade-vagas">
            {carregando && [0, 1].map((i) => <EsqueletoVaga key={`esq-${i}`} />)}
            {lista.map((o) => {
              const marcada = interesse.includes(o.id);
              return (
                <article key={o.id} className={`cartao vaga vaga-${o.tipo === "Estágio" ? "estagio" : o.tipo.toLowerCase()}`}>
                  <div className="vaga-topo">
                    <span className={CARIMBO[o.tipo]}>{o.tipo}</span>
                    {o.destaque && <span className="carimbo carimbo-destaque">Destaque</span>}
                    <span className="suave vaga-data">{o.publicadaHa}</span>
                  </div>
                  <h3>{o.titulo}</h3>
                  <p className="suave vaga-empresa">{o.empresa} · {o.cidade}</p>
                  <dl className="vaga-dados">
                    <div><dt>Orçamento</dt><dd>{o.orcamento}</dd></div>
                    <div><dt>Prazo</dt><dd>{o.prazo}</dd></div>
                  </dl>
                  <p className="vaga-desc">{o.descricao}</p>
                  {!podeSeInteressar ? null : marcada && o.contato ? (
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
                  {erroInteresse?.id === o.id && (
                    <p className="erro" role="alert" style={{ margin: 0 }}>{erroInteresse.texto}</p>
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
