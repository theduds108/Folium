"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, SeloPlano, TravaPremium } from "@/components/Area";
import { CartaoAluno } from "@/components/CartaoAluno";
import { ALUNOS_VITRINE, type Aluno } from "@/lib/data";
import { RECURSOS, salvarDadosConta, type Conta } from "@/lib/conta";
import { listarAlunosReais, listarSalvos, minhasVagas, type MinhaVaga } from "@/lib/repositorio";
import { mascaraTelefone, telefoneValido } from "@/lib/formato";
import { sair } from "@/lib/sessao";

const STATUS: Record<MinhaVaga["status"], { rotulo: string; classe: string }> = {
  pendente: { rotulo: "Em análise", classe: "status status-pendente" },
  aprovada: { rotulo: "No mural", classe: "status status-aprovada" },
  recusada: { rotulo: "Não aprovada", classe: "status status-recusada" },
};

/** Área do contratante: vagas, talentos salvos, dados da empresa e plano. */
export default function Painel() {
  return <Area tipo="contratante">{({ conta, premium }) => <PainelContratante conta={conta!} premium={premium} />}</Area>;
}

function PainelContratante({ conta, premium }: { conta: Conta; premium: boolean }) {
  const [vagas, setVagas] = useState<MinhaVaga[] | null>(null);
  const [salvos, setSalvos] = useState<Aluno[] | null>(null);
  const recursos = RECURSOS.contratante[premium ? "premium" : "gratis"];

  useEffect(() => {
    minhasVagas().then(setVagas);
  }, []);

  useEffect(() => {
    if (!premium) return;
    Promise.all([listarSalvos(), listarAlunosReais()]).then(([slugs, reais]) => {
      const todos = [...reais, ...ALUNOS_VITRINE];
      setSalvos(slugs.map((s) => todos.find((a) => a.slug === s)).filter((a): a is Aluno => !!a));
    });
  }, [premium]);

  const noMes = (vagas ?? []).filter((v) => Date.now() - new Date(v.criadaEm).getTime() < 30 * 86_400_000).length;
  const podePublicar = noMes < recursos.vagasPorMes;
  const nome = conta.empresa || conta.nome;

  return (
    <div className="container pagina painel">
      <header className="cabecalho-arquivo">
        <div className="rotulos">
          <span>Painel do contratante</span>
          <span>{conta.cidade || "Bauru · SP"}</span>
        </div>
        <div className="painel-titulo">
          <h1 className="titulo-pagina">{nome ? `Olá, ${nome}` : "Seu painel"}</h1>
          <SeloPlano premium={premium} />
        </div>
        <p className="cabecalho-arquivo-desc">Publique vagas, acompanhe quem se interessou e guarde os talentos que chamaram sua atenção.</p>
      </header>

      <nav className="painel-atalhos" aria-label="Atalhos">
        <Link href="/talentos" className="cartao atalho-painel">
          <strong>Encontrar talentos</strong>
          <span className="suave">Filtre por serviço e fale direto com o aluno.</span>
        </Link>
        <Link href="/publicar" className="cartao atalho-painel">
          <strong>Publicar vaga</strong>
          <span className="suave">
            {premium ? "Vagas ilimitadas, com destaque no mural." : podePublicar ? "Você tem 1 vaga disponível este mês." : "Sua vaga do mês já foi usada."}
          </span>
        </Link>
        <Link href="/jornal" className="cartao atalho-painel">
          <strong>Jornal do Fólium</strong>
          <span className="suave">{premium ? "A edição desta semana já saiu." : "Talentos em alta e quanto pagar. Premium."}</span>
        </Link>
      </nav>

      <div className="painel-grade">
        <section className="cartao bloco painel-secao" aria-labelledby="titulo-vagas">
          <div className="secao-titulo">
            <h2 id="titulo-vagas" className="h-pequeno">Suas vagas</h2>
            {!premium && <span className="ajuda">{Math.min(noMes, 1)} de 1 vaga este mês</span>}
          </div>
          {vagas === null ? (
            <p className="suave">Carregando…</p>
          ) : vagas.length === 0 ? (
            <div className="painel-vazio">
              <p className="suave">Você ainda não publicou nenhuma vaga.</p>
              <Link href="/publicar" className="botao botao-verde">Publicar a primeira</Link>
            </div>
          ) : (
            <ul className="lista-vagas">
              {vagas.map((v) => (
                <li key={v.id}>
                  <div>
                    <strong>{v.titulo}</strong>
                    <span className="suave"> · {v.tipo} · {v.servico}</span>
                    {v.destaque && <span className="carimbo carimbo-destaque">Destaque</span>}
                  </div>
                  <div className="lista-vagas-dados">
                    <span className={STATUS[v.status].classe}>{STATUS[v.status].rotulo}</span>
                    <span className="suave">
                      {v.interessados === 1 ? "1 aluno interessado" : `${v.interessados} alunos interessados`} · {v.publicadaHa}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!premium && !podePublicar && (
            <TravaPremium compacto titulo="Precisa de mais vagas?" texto="No Premium você publica quantas vagas quiser e pode colocar cada uma no topo do mural." />
          )}
        </section>

        <DadosContratante conta={conta} />
      </div>

      <section className="secao" aria-labelledby="titulo-salvos">
        <div className="secao-titulo">
          <h2 id="titulo-salvos">Talentos salvos</h2>
        </div>
        {!premium ? (
          <TravaPremium
            titulo="Guarde quem chamou sua atenção"
            texto="Com o Premium, o botão Salvar aparece em cada portfólio e a sua lista fica aqui, pronta para quando surgir o próximo trabalho."
          />
        ) : salvos === null ? (
          <p className="suave">Carregando…</p>
        ) : salvos.length === 0 ? (
          <div className="cartao bloco painel-vazio">
            <p className="suave">Abra um portfólio e use o botão <strong>Salvar talento</strong> para ele aparecer aqui.</p>
            <Link href="/talentos" className="botao botao-contorno">Ver talentos</Link>
          </div>
        ) : (
          <div className="grade-alunos">
            {salvos.map((a) => <CartaoAluno key={a.slug} aluno={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function DadosContratante({ conta }: { conta: Conta }) {
  const [nome, setNome] = useState(conta.nome);
  const [empresa, setEmpresa] = useState(conta.empresa);
  const [whatsapp, setWhatsapp] = useState(conta.whatsapp);
  const [cidade, setCidade] = useState(conta.cidade || "Bauru, SP");
  const [estado, setEstado] = useState<"" | "salvando" | "salvo">("");
  const [erro, setErro] = useState("");

  return (
    <section className="cartao bloco painel-secao" aria-labelledby="titulo-dados">
      <h2 id="titulo-dados" className="h-pequeno">Seus dados</h2>
      <p className="ajuda" style={{ marginTop: 0 }}>Usados para preencher suas vagas. Só a equipe e os alunos interessados veem o contato.</p>
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!telefoneValido(whatsapp)) {
            setErro("Confira o WhatsApp: DDD e número.");
            return;
          }
          setErro("");
          setEstado("salvando");
          try {
            await salvarDadosConta({ nome: nome.trim(), empresa: empresa.trim(), whatsapp, cidade: cidade.trim() });
            setEstado("salvo");
          } catch (err) {
            setErro((err as Error).message);
            setEstado("");
          }
        }}
      >
        <label className="campo">
          Seu nome
          <input value={nome} maxLength={80} onChange={(e) => { setNome(e.target.value); setEstado(""); }} autoComplete="name" />
        </label>
        <label className="campo">
          Empresa ou negócio
          <input value={empresa} maxLength={80} onChange={(e) => { setEmpresa(e.target.value); setEstado(""); }} placeholder="Deixe em branco se contrata como pessoa" />
        </label>
        <div className="linha-dupla">
          <label className="campo">
            WhatsApp
            <input inputMode="tel" value={whatsapp} onChange={(e) => { setWhatsapp(mascaraTelefone(e.target.value)); setEstado(""); }} placeholder="(14) 99999-0000" />
          </label>
          <label className="campo">
            Cidade
            <input value={cidade} maxLength={60} onChange={(e) => { setCidade(e.target.value); setEstado(""); }} />
          </label>
        </div>
        <p className="ajuda" style={{ margin: 0 }}>
          Conta: {conta.email} ·{" "}
          <button type="button" className="link-denuncia" onClick={sair}>Sair da conta</button>
        </p>
        {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
        <button type="submit" className="botao botao-contorno" disabled={estado === "salvando"}>
          {estado === "salvando" ? "Salvando…" : estado === "salvo" ? "Dados salvos" : "Salvar dados"}
        </button>
      </form>
    </section>
  );
}
