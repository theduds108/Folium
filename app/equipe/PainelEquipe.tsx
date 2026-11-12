"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { formatarData } from "@/lib/formato";
import {
  equipeAprovarContratante,
  equipeDados,
  equipeMudarPlano,
  equipeMudarVaga,
  equipeResolverDenuncia,
  equipeTirarPerfil,
  type ContaEquipe,
  type DenunciaEquipe,
  type FeedbackEquipe,
  type VagaEquipe,
} from "@/lib/negocios";

type Dados = { vagas: VagaEquipe[]; denuncias: DenunciaEquipe[]; feedbacks: FeedbackEquipe[]; contas: ContaEquipe[] };
type Aba = "vagas" | "contratantes" | "denuncias" | "feedbacks" | "planos";

const dia = (iso: string) => formatarData(iso.slice(0, 10));

/**
 * Painel interno: o que antes era feito no Table Editor do Supabase.
 * Só funciona para quem está na tabela "equipe" (as regras do banco barram o resto).
 */
export function PainelEquipe() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");
  const [negado, setNegado] = useState(false);
  const [aba, setAba] = useState<Aba>("vagas");
  const [versao, setVersao] = useState(0);
  const [aviso, setAviso] = useState("");
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    let ativo = true;
    equipeDados()
      .then((d) => ativo && (setDados(d), setErro("")))
      .catch((e: Error) => {
        if (!ativo) return;
        if (/equipe|permission|42501/i.test(e.message)) setNegado(true);
        else setErro(e.message);
      });
    return () => {
      ativo = false;
    };
  }, [versao]);

  const fazer = async (acao: () => Promise<void>, ok: string) => {
    setAviso("");
    try {
      await acao();
      setAviso(ok);
      recarregar();
    } catch (e) {
      setAviso((e as Error).message);
    }
  };

  if (negado)
    return (
      <div className="container">
        <div className="cartao pagina-estreita">
          <h1 style={{ fontSize: "var(--t-tit-m)" }}>Área só da equipe</h1>
          <p className="suave">Esta página é usada pela equipe do Fólium para aprovar vagas e cuidar de denúncias.</p>
          <Link href="/" className="botao botao-primario" style={{ width: "100%" }}>Voltar ao início</Link>
        </div>
      </div>
    );

  const pendentes = dados?.vagas.filter((v) => v.status === "pendente") ?? [];
  const abertas = dados?.denuncias.filter((d) => !d.resolvida) ?? [];
  const pedidos = dados?.contas.filter((c) => c.plano_pedido && c.plano === "gratis") ?? [];
  // aprovada_em ausente = SQL de 12/11 ainda não rodado: ninguém aparece como "em análise".
  const contratantes = dados?.contas.filter((c) => c.tipo === "contratante" && c.aprovada_em !== undefined) ?? [];
  const emAnalise = contratantes.filter((c) => !c.aprovada_em);
  const ABAS: { id: Aba; rotulo: string; n?: number }[] = [
    { id: "vagas", rotulo: "Vagas", n: pendentes.length },
    { id: "contratantes", rotulo: "Contratantes", n: emAnalise.length },
    { id: "denuncias", rotulo: "Denúncias", n: abertas.length },
    { id: "feedbacks", rotulo: "Feedbacks" },
    { id: "planos", rotulo: "Planos", n: pedidos.length },
  ];

  return (
    <div className="container pagina equipe">
      <CabecalhoArquivo rotulo="Só a equipe vê" titulo="Painel da equipe" descricao="Aprovar vagas e contratantes, cuidar de denúncias, ler feedbacks e liberar o Premium." />
      {erro && (
        <p className="erro" role="alert">{erro} <button type="button" className="link-texto" onClick={recarregar}>Tentar de novo</button></p>
      )}
      <div className="abas-equipe" role="tablist" aria-label="Seções do painel">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={aba === a.id ? "aba-equipe ativa" : "aba-equipe"} onClick={() => setAba(a.id)}>
            {a.rotulo}{a.n ? <span className="selo-novas">{a.n}</span> : null}
          </button>
        ))}
      </div>
      <p className="visualmente-oculto" role="status" aria-live="polite">{aviso}</p>
      {aviso && <p className="aviso" role="status">{aviso}</p>}
      {!dados && !erro && <p className="suave">Carregando…</p>}

      {dados && aba === "vagas" && (
        <section className="equipe-lista" aria-label="Vagas">
          {!dados.vagas.length && <p className="suave">Nenhuma vaga ainda.</p>}
          {[...pendentes, ...dados.vagas.filter((v) => v.status !== "pendente")].map((v) => (
            <article key={v.id} className="cartao equipe-item">
              <div className="combinado-topo">
                <span className={`selo-status selo-${v.status === "aprovada" ? "aceito" : v.status === "recusada" ? "recusado" : "proposto"}`}>{v.status}</span>
                <span className="suave">{dia(v.criada_em)}</span>
              </div>
              <h2>{v.titulo}</h2>
              <p className="suave">{[v.empresa, v.tipo, v.servico, v.cidade, v.orcamento || "a combinar"].join(" · ")}</p>
              <p className="equipe-texto">{v.descricao}</p>
              <p className="ajuda">Contato: {v.contato}</p>
              <div className="combinado-acoes">
                {v.status !== "aprovada" && (
                  <button type="button" className="botao botao-primario botao-pequeno" onClick={() => fazer(() => equipeMudarVaga(v.id, "aprovada"), "Vaga aprovada: já está no mural.")}>Aprovar</button>
                )}
                {v.status !== "recusada" && (
                  <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => fazer(() => equipeMudarVaga(v.id, "recusada"), "Vaga recusada: saiu do mural.")}>Recusar</button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {dados && aba === "contratantes" && (
        <section className="equipe-lista" aria-label="Contratantes">
          <p className="suave" style={{ margin: 0 }}>
            Contratante em análise vê os portfólios, mas não vê WhatsApp, e-mail, currículo nem certificados dos alunos, e não manda convites nem propostas. Confira se a empresa ou pessoa existe antes de aprovar.
          </p>
          {!contratantes.length && <p className="suave">Nenhum contratante ainda (ou o SQL de 12/11 ainda não foi rodado).</p>}
          {[...emAnalise, ...contratantes.filter((c) => c.aprovada_em)].map((c) => {
            const nome = c.empresa || c.nome || (c.email ?? "").split("@")[0] || "Conta sem nome";
            return (
              <article key={c.id} className="cartao equipe-item">
                <div className="combinado-topo">
                  <span className={`selo-status ${c.aprovada_em ? "selo-aceito" : "selo-proposto"}`}>{c.aprovada_em ? "aprovado" : "em análise"}</span>
                  {c.criada_em && <span className="suave">desde {dia(c.criada_em)}</span>}
                </div>
                <h2>{nome}</h2>
                <p className="suave">{[c.nome !== nome ? c.nome : "", c.email].filter(Boolean).join(" · ")}</p>
                <div className="combinado-acoes">
                  {c.aprovada_em ? (
                    <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => { if (window.confirm(`Voltar ${nome} para análise? Os contatos dos alunos somem para essa conta na hora.`)) fazer(() => equipeAprovarContratante(c.id, false), "Contratante voltou para análise."); }}>
                      Voltar para análise
                    </button>
                  ) : (
                    <button type="button" className="botao botao-primario botao-pequeno" onClick={() => fazer(() => equipeAprovarContratante(c.id, true), "Contratante aprovado: já vê os contatos dos alunos.")}>
                      Aprovar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {dados && aba === "denuncias" && (
        <section className="equipe-lista" aria-label="Denúncias">
          {!dados.denuncias.length && <p className="suave">Nenhuma denúncia.</p>}
          {dados.denuncias.map((d) => (
            <article key={d.id} className={d.resolvida ? "cartao equipe-item resolvida" : "cartao equipe-item"}>
              <div className="combinado-topo">
                <span className={`selo-status ${d.resolvida ? "selo-aceito" : "selo-recusado"}`}>{d.resolvida ? "resolvida" : "aberta"}</span>
                <span className="suave">{dia(d.criada_em)}</span>
              </div>
              <h2>{d.motivo}</h2>
              <p className="suave">
                {d.alvo_tipo === "perfil" ? (
                  <>Portfólio: <Link href={`/perfil/?u=${d.alvo}`}>{d.alvo}</Link></>
                ) : (
                  <>Vaga: {dados.vagas.find((v) => v.id === d.alvo)?.titulo ?? d.alvo}</>
                )}
              </p>
              {d.detalhes && <p className="equipe-texto">{d.detalhes}</p>}
              <div className="combinado-acoes">
                <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => fazer(() => equipeResolverDenuncia(d.id, !d.resolvida), d.resolvida ? "Denúncia reaberta." : "Denúncia marcada como resolvida.")}>
                  {d.resolvida ? "Reabrir" : "Marcar como resolvida"}
                </button>
                {d.alvo_tipo === "perfil" && (
                  <button type="button" className="botao botao-perigo botao-pequeno" onClick={() => { if (window.confirm("Tirar este portfólio da busca? O aluno pode voltar a publicar depois.")) fazer(() => equipeTirarPerfil(d.alvo), "Portfólio tirado da busca."); }}>
                    Tirar portfólio da busca
                  </button>
                )}
                {d.alvo_tipo === "oportunidade" && (
                  <button type="button" className="botao botao-perigo botao-pequeno" onClick={() => fazer(() => equipeMudarVaga(d.alvo, "recusada"), "Vaga tirada do mural.")}>
                    Tirar vaga do mural
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {dados && aba === "feedbacks" && (
        <section className="equipe-lista" aria-label="Feedbacks">
          {!dados.feedbacks.length && <p className="suave">Nenhum feedback ainda.</p>}
          {dados.feedbacks.map((f) => (
            <article key={f.id} className="cartao equipe-item">
              <div className="combinado-topo">
                <span className="selo-status">{f.tipo}</span>
                <span className="suave">{dia(f.criado_em)}{f.nota ? ` · nota ${f.nota}` : ""}{f.pagina ? ` · ${f.pagina}` : ""}</span>
              </div>
              <p className="equipe-texto">{f.mensagem}</p>
            </article>
          ))}
        </section>
      )}

      {dados && aba === "planos" && (
        <ListaPlanos
          contas={dados.contas}
          onMudar={(c, plano, ate) => fazer(() => equipeMudarPlano(c.id, plano, ate), plano === "premium" ? "Premium liberado." : "Voltou para o plano grátis.")}
        />
      )}
    </div>
  );
}

type FiltroPlano = "todos" | "pedidos" | "premium";

/** Lista de contas em cartões: cabe no celular sem rolar para o lado. */
function ListaPlanos({ contas, onMudar }: { contas: ContaEquipe[]; onMudar: (c: ContaEquipe, plano: "gratis" | "premium", ate: string | null) => void }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroPlano>("todos");
  const pediu = (c: ContaEquipe) => !!c.plano_pedido && c.plano === "gratis";
  const n = { todos: contas.length, pedidos: contas.filter(pediu).length, premium: contas.filter((c) => c.plano === "premium").length };
  const termo = busca.trim().toLowerCase();
  const lista = contas.filter(
    (c) =>
      (filtro === "todos" || (filtro === "pedidos" ? pediu(c) : c.plano === "premium")) &&
      (!termo || [c.nome, c.empresa, c.email].some((x) => x?.toLowerCase().includes(termo))),
  );
  const FILTROS: { id: FiltroPlano; rotulo: string }[] = [
    { id: "todos", rotulo: "Todas" },
    { id: "pedidos", rotulo: "Na lista do Premium" },
    { id: "premium", rotulo: "Já são Premium" },
  ];

  return (
    <section className="equipe-lista" aria-label="Planos">
      <p className="suave" style={{ margin: 0 }}>Quem entrou na lista do Premium aparece primeiro. Sem data, o Premium não tem prazo para acabar.</p>
      <div className="equipe-planos-filtros">
        <label className="campo">
          Buscar conta
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome ou e-mail" />
        </label>
        <div className="equipe-filtro-chips" role="group" aria-label="Mostrar">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" className={filtro === f.id ? "chip-filtro ativo" : "chip-filtro"} aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.rotulo} <span className="chip-contagem">{n[f.id]}</span>
            </button>
          ))}
        </div>
      </div>
      {lista.length === 0 && <p className="suave">Nenhuma conta encontrada.</p>}
      {lista.map((c) => <CartaoPlano key={c.id} c={c} pediu={pediu(c)} onMudar={(plano, ate) => onMudar(c, plano, ate)} />)}
    </section>
  );
}

function CartaoPlano({ c, pediu, onMudar }: { c: ContaEquipe; pediu: boolean; onMudar: (plano: "gratis" | "premium", ate: string | null) => void }) {
  const [ate, setAte] = useState(c.plano_ate ?? "");
  const usuario = (c.email ?? "").split("@")[0];
  const nome = c.empresa || c.nome || usuario || "Conta sem nome";
  const premium = c.plano === "premium";
  // Confirmação dentro do cartão: um toque sem querer não muda o plano de ninguém.
  const [confirmar, setConfirmar] = useState(false);
  const novo = premium ? "gratis" : "premium";
  return (
    <article className={pediu ? "cartao equipe-conta pediu" : "cartao equipe-conta"}>
      <div className="equipe-conta-topo">
        <div className="equipe-conta-nome">
          <h2>{nome}</h2>
          <span className="ajuda">{c.email}</span>
        </div>
        {pediu && <span className="selo-status selo-proposto">Na lista do Premium</span>}
      </div>
      <div className="equipe-conta-selos">
        <span className="etiqueta">{c.tipo === "contratante" ? "Contratante" : "Aluno"}</span>
        <span className={premium ? "etiqueta etiqueta-premium" : "etiqueta"}>
          {premium ? `Premium${c.plano_ate ? ` até ${formatarData(c.plano_ate)}` : " sem prazo"}` : "Grátis"}
        </span>
        {c.criada_em && <span className="suave equipe-conta-desde">desde {dia(c.criada_em)}</span>}
      </div>
      {confirmar ? (
        <div className="equipe-confirmar" role="alertdialog" aria-label="Confirmar mudança de plano">
          <p>
            {novo === "premium"
              ? `Liberar o Premium para ${nome}${ate ? ` até ${formatarData(ate)}` : " sem prazo"}? Nenhum pagamento é cobrado.`
              : `Voltar ${nome} para o plano grátis? Os recursos Premium somem na hora.`}
          </p>
          <div className="equipe-confirmar-botoes">
            <button type="button" className="botao botao-primario" onClick={() => { setConfirmar(false); onMudar(novo, novo === "premium" ? ate || null : null); }}>
              {novo === "premium" ? "Sim, liberar" : "Sim, voltar ao grátis"}
            </button>
            <button type="button" className="botao botao-contorno" onClick={() => setConfirmar(false)}>Cancelar</button>
          </div>
        </div>
      ) : premium ? (
        <button type="button" className="botao botao-contorno equipe-conta-botao" onClick={() => setConfirmar(true)}>Voltar ao grátis</button>
      ) : (
        <div className="equipe-conta-acao">
          <label className="campo">
            Premium até (opcional)
            <input type="date" value={ate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setAte(e.target.value)} />
          </label>
          <button type="button" className="botao botao-primario equipe-conta-botao" onClick={() => setConfirmar(true)}>Liberar Premium</button>
        </div>
      )}
    </article>
  );
}
