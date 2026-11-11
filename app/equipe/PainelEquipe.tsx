"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { formatarData } from "@/lib/formato";
import {
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
type Aba = "vagas" | "denuncias" | "feedbacks" | "planos";

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
  const ABAS: { id: Aba; rotulo: string; n?: number }[] = [
    { id: "vagas", rotulo: "Vagas", n: pendentes.length },
    { id: "denuncias", rotulo: "Denúncias", n: abertas.length },
    { id: "feedbacks", rotulo: "Feedbacks" },
    { id: "planos", rotulo: "Planos", n: pedidos.length },
  ];

  return (
    <div className="container pagina equipe">
      <CabecalhoArquivo rotulo="Só a equipe vê" titulo="Painel da equipe" descricao="Aprovar vagas, cuidar de denúncias, ler feedbacks e liberar o Premium." />
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
        <section className="equipe-lista" aria-label="Planos">
          <p className="suave">Quem clicou em “Quero o Premium” aparece primeiro. Liberar sem data deixa o Premium sem prazo para acabar.</p>
          <div className="cartao equipe-tabela-moldura">
            <table className="equipe-tabela">
              <thead>
                <tr><th>Conta</th><th>Tipo</th><th>Plano</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {dados.contas.map((c) => <LinhaPlano key={c.id} c={c} onMudar={(plano, ate) => fazer(() => equipeMudarPlano(c.id, plano, ate), plano === "premium" ? "Premium liberado." : "Voltou para o plano grátis.")} />)}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function LinhaPlano({ c, onMudar }: { c: ContaEquipe; onMudar: (plano: "gratis" | "premium", ate: string | null) => void }) {
  const [ate, setAte] = useState(c.plano_ate ?? "");
  return (
    <tr>
      <td>
        <strong>{c.empresa || c.nome || "Sem nome"}</strong>
        <br />
        <span className="ajuda" style={{ overflowWrap: "anywhere" }}>{c.email}</span>
        {c.plano_pedido && c.plano === "gratis" && <span className="selo-status selo-proposto" style={{ marginLeft: 6 }}>pediu Premium</span>}
      </td>
      <td>{c.tipo}</td>
      <td>{c.plano}{c.plano_ate ? ` até ${formatarData(c.plano_ate)}` : ""}</td>
      <td>
        {c.plano === "gratis" ? (
          <div className="equipe-plano-acao">
            <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} aria-label="Premium até (opcional)" />
            <button type="button" className="botao botao-primario botao-pequeno" onClick={() => onMudar("premium", ate || null)}>Liberar Premium</button>
          </div>
        ) : (
          <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => onMudar("gratis", null)}>Voltar ao grátis</button>
        )}
      </td>
    </tr>
  );
}
