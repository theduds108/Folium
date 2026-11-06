"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartaoAluno } from "@/components/CartaoAluno";
import { EsqueletoPolaroide } from "@/components/Esqueleto";
import { Leque } from "@/components/Leque";
import { Anotacao } from "@/components/Zine";
import { ALUNOS_VITRINE, type Aluno } from "@/lib/data";
import { listarAlunosReais, listarOportunidadesReais } from "@/lib/repositorio";
import { OPORTUNIDADES, type Oportunidade } from "@/lib/conteudo";
import { MOSTRAR_EXEMPLOS } from "@/lib/config";
import { bancoLigado } from "@/lib/supabase";
import { useConta } from "@/lib/conta";

/** Perfis reais publicados + exemplos (quando ligados), compartilhados entre o leque e os destaques. */
let cache: Promise<Aluno[]> | null = null;
function carregarVitrine() {
  cache ??= listarAlunosReais().then((r) => [...r, ...ALUNOS_VITRINE]);
  return cache;
}

/** Portfólios só aparecem para quem entrou: visitante não carrega nada. */
function useVitrine() {
  const { logado, carregando: carregandoConta } = useConta();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    if (carregandoConta) return;
    if (!logado) {
      setAlunos([]);
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    carregarVitrine()
      .then((a) => ativo && setAlunos(a))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [logado, carregandoConta]);
  return { alunos, carregando, logado };
}

/** Leque de fichas da capa. Some quando ainda não há nenhum portfólio publicado. */
export function LequeInicio() {
  const { alunos } = useVitrine();
  const leque = alunos.slice(0, 5);
  if (leque.length === 0) return null;
  return (
    <>
      <div className="leque-legenda">
        <span className="rotulos"><span>Do arquivo · {leque.length} {leque.length === 1 ? "ficha" : "fichas"}</span></span>
        <Anotacao className="anotacao-capa">abra uma ficha</Anotacao>
        <Link href="/talentos" className="link-mao">ver todos →</Link>
      </div>
      <Leque alunos={leque} />
    </>
  );
}

/** Seção "Disponíveis agora" da página inicial. */
export function DestaquesInicio() {
  const { alunos, carregando, logado } = useVitrine();
  const destaques = alunos.filter((a) => a.disponivel).slice(0, 3);

  if (carregando) {
    return (
      <div className="grade-alunos grade-destaques">
        {[0, 1, 2].map((i) => <EsqueletoPolaroide key={i} />)}
      </div>
    );
  }
  if (!logado) {
    return (
      <div className="cartao vazio">
        <h3>Entre para ver quem está disponível</h3>
        <p className="suave">Os portfólios ficam visíveis só para quem tem conta no Fólium. A conta é grátis.</p>
        <Link href="/entrar" className="botao botao-contorno">Entrar</Link>
      </div>
    );
  }
  if (destaques.length === 0) {
    return (
      <div className="cartao vazio">
        <h3>Os primeiros portfólios estão chegando</h3>
        <p className="suave">É aluno da UNISAGRADO? Publique o seu e apareça aqui.</p>
        <Link href="/entrar" className="botao botao-contorno">Criar meu portfólio</Link>
      </div>
    );
  }
  return (
    <div className="grade-alunos grade-destaques">
      {destaques.map((a) => (
        <CartaoAluno key={(a.real ? "r-" : "e-") + a.slug} aluno={a} />
      ))}
    </div>
  );
}

/** Seção "Oportunidades recentes": só vagas reais aprovadas (as de exemplo só com MOSTRAR_EXEMPLOS ou no modo demo). */
export function VagasInicio() {
  const { logado, carregando: carregandoConta, conta } = useConta();
  const [vagas, setVagas] = useState<Oportunidade[] | null>(null);

  useEffect(() => {
    if (carregandoConta) return;
    if (!logado) {
      setVagas([]);
      return;
    }
    let ativo = true;
    listarOportunidadesReais().then((r) => {
      if (ativo) setVagas((MOSTRAR_EXEMPLOS || !bancoLigado ? [...r, ...OPORTUNIDADES] : r).slice(0, 3));
    });
    return () => {
      ativo = false;
    };
  }, [logado, carregandoConta]);

  if (vagas === null) {
    return (
      <div className="cartao vazio">
        <p className="suave" style={{ margin: 0 }}>Carregando vagas…</p>
      </div>
    );
  }
  if (!logado) {
    return (
      <div className="cartao vazio">
        <h3>Entre para ver as vagas</h3>
        <p className="suave">As oportunidades ficam visíveis só para quem tem conta no Fólium. A conta é grátis.</p>
        <Link href="/entrar" className="botao botao-contorno">Entrar</Link>
      </div>
    );
  }
  if (vagas.length === 0) {
    const contratante = conta?.tipo === "contratante";
    return (
      <div className="cartao vazio">
        <h3>As primeiras vagas estão chegando</h3>
        <p className="suave">
          {contratante ? "Publique a sua: ela passa pela equipe e vai para o mural." : "Assim que uma empresa publicar, a vaga aparece aqui e no mural."}
        </p>
        {contratante && <Link href="/publicar" className="botao botao-contorno">Publicar vaga</Link>}
      </div>
    );
  }
  return (
    <div className="grade-vagas">
      {vagas.map((o) => {
        const classe = o.tipo === "Estágio" ? "estagio" : o.tipo.toLowerCase();
        return (
          <Link key={o.id} href="/oportunidades" className={`cartao vaga vaga-link vaga-${classe}`}>
            <div className="vaga-topo">
              <span className={`carimbo carimbo-${classe}`}>{o.tipo}</span>
              <span className="suave vaga-data">{o.publicadaHa}</span>
            </div>
            <h3>{o.titulo}</h3>
            <p className="suave vaga-empresa">{o.empresa}</p>
            <dl className="vaga-dados">
              <div><dt>Orçamento</dt><dd>{o.orcamento}</dd></div>
              <div><dt>Prazo</dt><dd>{o.prazo}</dd></div>
            </dl>
          </Link>
        );
      })}
    </div>
  );
}
