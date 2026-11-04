"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartaoAluno } from "@/components/CartaoAluno";
import { EsqueletoPolaroide } from "@/components/Esqueleto";
import { Leque } from "@/components/Leque";
import { Anotacao } from "@/components/Zine";
import { ALUNOS_VITRINE, type Aluno } from "@/lib/data";
import { listarAlunosReais } from "@/lib/repositorio";
import { bancoLigado } from "@/lib/supabase";

/** Perfis reais publicados + exemplos (quando ligados), compartilhados entre o leque e os destaques. */
let cache: Promise<Aluno[]> | null = null;
function carregarVitrine() {
  cache ??= listarAlunosReais().then((r) => [...r, ...ALUNOS_VITRINE]);
  return cache;
}

function useVitrine() {
  const [alunos, setAlunos] = useState<Aluno[]>(bancoLigado ? [] : ALUNOS_VITRINE);
  const [carregando, setCarregando] = useState(bancoLigado);
  useEffect(() => {
    let ativo = true;
    carregarVitrine()
      .then((a) => ativo && setAlunos(a))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);
  return { alunos, carregando };
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
  const { alunos, carregando } = useVitrine();
  const destaques = alunos.filter((a) => a.disponivel).slice(0, 3);

  if (carregando) {
    return (
      <div className="grade-alunos">
        {[0, 1, 2].map((i) => <EsqueletoPolaroide key={i} />)}
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
    <div className="grade-alunos">
      {destaques.map((a) => (
        <CartaoAluno key={(a.real ? "r-" : "e-") + a.slug} aluno={a} />
      ))}
    </div>
  );
}
