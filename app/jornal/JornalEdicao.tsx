"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TravaPremium } from "@/components/Area";
import { FotoEnquadrada } from "@/components/FotoEnquadrada";
import { ALUNOS_VITRINE, iniciais, linkPerfil, unsplash, type Aluno } from "@/lib/data";
import { OPORTUNIDADES, type Oportunidade } from "@/lib/conteudo";
import { MOSTRAR_EXEMPLOS } from "@/lib/config";
import { useConta, type TipoConta } from "@/lib/conta";
import { MATERIAS_EXEMPLO, edicaoAtual } from "@/lib/jornal";
import { SERVICOS_PRECO, brl } from "@/lib/precos";
import { listarAlunosReais, listarMaterias, listarOportunidadesReais, type Materia } from "@/lib/repositorio";
import { bancoLigado } from "@/lib/supabase";

const NOME_EDICAO: Record<TipoConta, string> = {
  contratante: "Edição de quem contrata",
  colaborador: "Edição do colaborador",
};

/** O que cada edição traz, na ordem em que aparece. Vira o índice para quem ainda não assina. */
const INDICE: Record<TipoConta, { titulo: string; texto: string }[]> = {
  contratante: [
    { titulo: "Talento da semana", texto: "Um portfólio escolhido pela equipe, com o trabalho em destaque." },
    { titulo: "Recém-chegados", texto: "Quem acabou de publicar portfólio no Fólium." },
    { titulo: "Quanto pagar", texto: "Faixas de preço por serviço para fechar proposta justa." },
    { titulo: "Matérias", texto: "Como contratar bem, briefing, contrato simples e bastidores." },
  ],
  colaborador: [
    { titulo: "Vaga da semana", texto: "A oportunidade que a equipe mais recomenda." },
    { titulo: "Classificados", texto: "As vagas novas do mural, em uma página só." },
    { titulo: "Quanto cobrar", texto: "Faixas de preço por serviço para não cobrar barato demais." },
    { titulo: "Perfil da semana", texto: "Um colega em destaque. O próximo pode ser você." },
    { titulo: "Matérias", texto: "Carreira, primeiro freela, negociação e bastidores." },
  ],
};

export function JornalEdicao() {
  const { conta, premium, carregando } = useConta();
  const [escolhida, setEscolhida] = useState<TipoConta>("contratante");
  const [alunos, setAlunos] = useState<Aluno[]>(ALUNOS_VITRINE);
  const [vagas, setVagas] = useState<Oportunidade[]>(OPORTUNIDADES);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const edicao = edicaoAtual();
  // Quem tem conta lê a edição do próprio tipo; visitante escolhe qual espiar.
  const tipo: TipoConta = conta?.tipo ?? escolhida;
  const completo = !!conta && premium;

  useEffect(() => {
    const comExemplos = MOSTRAR_EXEMPLOS || !bancoLigado;
    listarAlunosReais().then((r) => setAlunos([...r, ...ALUNOS_VITRINE]));
    listarOportunidadesReais().then((r) => setVagas(comExemplos ? [...r, ...OPORTUNIDADES] : r));
  }, []);

  useEffect(() => {
    if (!completo) return;
    listarMaterias().then(setMaterias);
  }, [completo]);

  const disponiveis = alunos.filter((a) => a.disponivel);
  const talento = disponiveis.length ? disponiveis[edicao.numero % disponiveis.length]! : alunos[0];
  const recentes = alunos.filter((a) => a !== talento).slice(0, 4);
  const vagaSemana = vagas.find((v) => v.destaque) ?? vagas[0];
  const classificados = vagas.filter((v) => v !== vagaSemana).slice(0, 6);

  const precos = useMemo(() => {
    const procurados = new Set(vagas.map((v) => v.servico));
    const daVez = SERVICOS_PRECO.filter((s) => procurados.has(s.vaga));
    return (daVez.length >= 4 ? daVez : SERVICOS_PRECO).slice(0, 6);
  }, [vagas]);

  const daEdicao = (materias.length ? materias : MATERIAS_EXEMPLO).filter((m) => m.publico === "todos" || m.publico === tipo);

  if (carregando) return <div className="container pagina"><p className="suave">Carregando a edição…</p></div>;

  return (
    <div className="container pagina jornal">
      <header className="jornal-cabeca">
        <div className="rotulos">
          <span>Edição nº {edicao.numero}</span>
          <span>Semana de {edicao.data}</span>
        </div>
        <h1 className="jornal-nome">Jornal do Fólium</h1>
        <div className="rotulos jornal-linha">
          <span>{NOME_EDICAO[tipo]}</span>
          <span>{completo ? "Assinante Premium" : "Exclusivo do Premium"}</span>
        </div>
      </header>

      {!conta && (
        <div className="abas-conta jornal-abas" role="tablist" aria-label="Escolha a edição">
          {(["contratante", "colaborador"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tipo === t} className={tipo === t ? "aba-conta ativa" : "aba-conta"} onClick={() => setEscolhida(t)}>
              {t === "contratante" ? "Para quem contrata" : "Para colaboradores"}
            </button>
          ))}
        </div>
      )}

      {tipo === "contratante" ? (
        talento && <MancheteTalento aluno={talento} rotulo="Talento da semana" />
      ) : (
        vagaSemana && <MancheteVaga vaga={vagaSemana} />
      )}

      {!completo ? (
        <section className="jornal-dobra" aria-labelledby="titulo-indice">
          <h2 id="titulo-indice" className="jornal-secao-titulo">Nesta edição</h2>
          <ol className="jornal-indice">
            {INDICE[tipo].slice(1).map((s) => (
              <li key={s.titulo}>
                <strong>{s.titulo}</strong>
                <span className="suave">{s.texto}</span>
              </li>
            ))}
          </ol>
          {conta ? (
            <TravaPremium
              titulo="Leia a edição inteira"
              texto={
                tipo === "contratante"
                  ? "O Contratante Premium recebe toda semana os talentos em alta, quem acabou de chegar e quanto pagar por serviço, além das matérias da equipe."
                  : "O Colaborador Premium recebe toda semana as vagas novas, quanto cobrar por serviço e as matérias da equipe, e pode ser o perfil da semana."
              }
            />
          ) : (
            <div className="trava-premium">
              <span className="trava-carimbo" aria-hidden="true">Premium</span>
              <h3>O jornal é dos assinantes Premium</h3>
              <p className="suave">Crie sua conta grátis e veja o que o Premium inclui para {tipo === "contratante" ? "quem contrata" : "colaboradores"}.</p>
              <div className="trava-acoes">
                <Link href={`/entrar/?como=${tipo}`} className="botao botao-primario">Criar conta</Link>
                <Link href="/planos" className="botao botao-contorno">Ver planos</Link>
              </div>
            </div>
          )}
        </section>
      ) : tipo === "contratante" ? (
        <div className="jornal-colunas jornal-colunas-2">
          <section className="jornal-coluna" aria-labelledby="j-recentes">
            <h2 id="j-recentes" className="jornal-secao-titulo">Recém-chegados</h2>
            <ul className="jornal-lista">
              {recentes.map((a) => (
                <li key={a.slug}>
                  <Link href={linkPerfil(a)}><strong>{a.nome}</strong></Link>
                  <span className="suave">{a.titulo || a.servicos[0] || a.curso} · {a.curso}, {a.semestre}º semestre</span>
                </li>
              ))}
            </ul>
            <Link href="/talentos" className="link-mao">ver todos os talentos →</Link>
          </section>
          <Termometro titulo="Quanto pagar" itens={precos} nota="Faixas para quem está começando na região. Experiência e prazo curto puxam o valor para cima." />
          <Materias lista={daEdicao} />
        </div>
      ) : (
        <div className="jornal-colunas">
          <section className="jornal-coluna" aria-labelledby="j-classificados">
            <h2 id="j-classificados" className="jornal-secao-titulo">Classificados</h2>
            <ul className="jornal-lista">
              {classificados.map((v) => (
                <li key={v.id}>
                  <strong>{v.titulo}</strong>
                  <span className="suave">{v.tipo} · {v.empresa} · {v.orcamento}</span>
                </li>
              ))}
            </ul>
            <Link href="/oportunidades" className="link-mao">abrir o mural →</Link>
          </section>
          <Termometro titulo="Quanto cobrar" itens={precos} nota="Use como ponto de partida. A calculadora do guia ajusta pelo tamanho do trabalho e pela sua experiência." />
          {talento && (
            <section className="jornal-coluna" aria-labelledby="j-perfil">
              <h2 id="j-perfil" className="jornal-secao-titulo">Perfil da semana</h2>
              <MancheteTalento aluno={talento} rotulo="Perfil da semana" compacta />
              <p className="ajuda">Assinantes Premium com portfólio completo entram no sorteio da equipe para o perfil da semana.</p>
            </section>
          )}
          <Materias lista={daEdicao} />
        </div>
      )}
    </div>
  );
}

function MancheteTalento({ aluno, rotulo, compacta = false }: { aluno: Aluno; rotulo: string; compacta?: boolean }) {
  const obra = aluno.trabalhos.find((t) => t.imagem);
  const imagem = obra?.imagem ?? aluno.foto;
  return (
    <article className={compacta ? "jornal-manchete compacta" : "jornal-manchete"}>
      <div className="jornal-manchete-foto">
        {imagem ? (
          <FotoEnquadrada className="foto-cobrir" src={unsplash(imagem, 900)} alt={obra ? `${obra.titulo}, de ${aluno.nome}` : `Foto de ${aluno.nome}`} width={900} height={600} />
        ) : (
          <span className="polaroide-iniciais" aria-hidden="true">{iniciais(aluno.nome)}</span>
        )}
      </div>
      <div className="jornal-manchete-texto">
        <span className="jornal-chapeu">{rotulo}</span>
        <h2>{aluno.nome}</h2>
        <p className="jornal-linha-fina">{aluno.titulo || aluno.servicos.slice(0, 2).join(" e ")} · {aluno.curso}, {aluno.semestre}º semestre</p>
        {!compacta && <p>{aluno.bio}</p>}
        {obra && !compacta && <p className="suave">Em destaque: <em>{obra.titulo}</em>{obra.cliente ? `, para ${obra.cliente}` : ""}.</p>}
        <Link href={linkPerfil(aluno)} className="botao botao-contorno">Ver portfólio</Link>
      </div>
    </article>
  );
}

function MancheteVaga({ vaga }: { vaga: Oportunidade }) {
  return (
    <article className="jornal-manchete jornal-manchete-vaga">
      <div className="jornal-manchete-texto">
        <span className="jornal-chapeu">Vaga da semana · {vaga.tipo}</span>
        <h2>{vaga.titulo}</h2>
        <p className="jornal-linha-fina">{vaga.empresa} · {vaga.cidade}</p>
        <p>{vaga.descricao}</p>
        <dl className="vaga-dados">
          <div><dt>Orçamento</dt><dd>{vaga.orcamento}</dd></div>
          <div><dt>Prazo</dt><dd>{vaga.prazo}</dd></div>
          <div><dt>Serviço</dt><dd>{vaga.servico}</dd></div>
        </dl>
        <Link href="/oportunidades" className="botao botao-primario">Ver no mural</Link>
      </div>
    </article>
  );
}

function Termometro({ titulo, itens, nota }: { titulo: string; itens: typeof SERVICOS_PRECO; nota: string }) {
  return (
    <section className="jornal-coluna" aria-label={titulo}>
      <h2 className="jornal-secao-titulo">{titulo}</h2>
      <ul className="jornal-lista jornal-precos">
        {itens.map((s) => (
          <li key={s.id}>
            <strong>{s.servico}</strong>
            <span>{brl(s.min)} a {brl(s.max)} <span className="suave">{s.base}</span></span>
          </li>
        ))}
      </ul>
      <p className="ajuda">{nota} <Link href="/guia/#precos">Abrir a calculadora</Link></p>
    </section>
  );
}

function Materias({ lista }: { lista: Materia[] }) {
  if (!lista.length) return null;
  return (
    <section className="jornal-materias" aria-labelledby="j-materias">
      <h2 id="j-materias" className="jornal-secao-titulo">Matérias</h2>
      {lista.map((m) => (
        <article key={m.id} className="jornal-materia">
          <span className="jornal-chapeu">{m.editoria}</span>
          <h3>{m.titulo}</h3>
          <p className="jornal-linha-fina">{m.linhaFina}</p>
          <details>
            <summary>Ler a matéria</summary>
            {m.texto.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            <p className="ajuda">Por {m.autor}</p>
          </details>
        </article>
      ))}
    </section>
  );
}
