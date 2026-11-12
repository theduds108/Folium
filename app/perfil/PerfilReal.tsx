"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Aluno } from "@/lib/data";
import type { Avaliacao } from "@/lib/conteudo";
import { buscarAlunoReal } from "@/lib/repositorio";
import { avaliacoesDe, portfolioPublico, registrarVisita } from "@/lib/negocios";
import { useConta } from "@/lib/conta";
import { PerfilVista } from "@/components/PerfilVista";
import { EsqueletoPerfil } from "@/components/Esqueleto";
import { AcoesContratante } from "@/components/AcoesContratante";
import { CartaoAviso } from "@/components/Area";

/**
 * Portfólio do banco, em /perfil/?u=slug.
 * Com conta: portfólio completo. Sem conta: só se o aluno ligou o link público (sem contatos).
 */
export function PerfilReal() {
  const slug = useSearchParams().get("u") ?? "";
  const { conta, logado, carregando } = useConta();
  const [aluno, setAluno] = useState<Aluno | null | undefined>(undefined);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (carregando) return;
    if (!slug) {
      setAluno(null);
      return;
    }
    let ativo = true;
    setFalhou(false);
    setAluno(undefined);
    (logado ? buscarAlunoReal(slug) : portfolioPublico(slug))
      .then((a) => {
        if (!ativo) return;
        setAluno(a);
        if (!a) return;
        document.title = `${a.nome}, ${a.curso} · Fólium`;
        registrarVisita(slug);
        if (logado && a.id)
          avaliacoesDe(a.id).then((l) => {
            if (ativo) setAvaliacoes(l.map((x) => ({ nota: x.nota, texto: x.texto, autor: x.autor_nome, selo: "trabalho combinado pelo Fólium" })));
          });
      })
      .catch(() => {
        if (ativo) setFalhou(true);
      });
    return () => {
      ativo = false;
    };
  }, [slug, tentativa, logado, carregando]);

  if (falhou)
    return (
      <div className="container">
        <div className="cartao pagina-estreita" role="alert">
          <h1 style={{ fontSize: "var(--t-tit-m)" }}>Não deu para carregar o portfólio</h1>
          <p className="suave">Parece que a internet caiu ou o Fólium demorou a responder. O portfólio continua aqui.</p>
          <button type="button" className="botao botao-primario" style={{ width: "100%" }} onClick={() => setTentativa((n) => n + 1)}>
            Tentar de novo
          </button>
        </div>
      </div>
    );

  if (aluno === undefined) return <EsqueletoPerfil />;

  // Sem conta e sem link público: o mesmo convite para entrar de antes.
  if (!aluno && !logado)
    return (
      <CartaoAviso titulo="Entre para ver este portfólio">
        <p className="suave">
          Os portfólios dos alunos ficam visíveis só para quem tem conta no Fólium. A conta é grátis: aluno usa o e-mail
          institucional, empresa ou contratante usa qualquer e-mail.
        </p>
        <Link href="/entrar" className="botao botao-primario" style={{ width: "100%" }}>Entrar</Link>
        <Link href="/entrar?modo=primeiro" className="botao botao-contorno" style={{ width: "100%", marginTop: 12 }}>
          Fazer o primeiro acesso
        </Link>
      </CartaoAviso>
    );

  if (!aluno)
    return (
      <div className="container">
        <div className="cartao pagina-estreita">
          <h1 style={{ fontSize: "var(--t-tit-m)" }}>Portfólio não encontrado</h1>
          <p className="suave">O endereço pode estar errado, ou o aluno deixou o portfólio fora da busca.</p>
          <Link href="/talentos" className="botao botao-primario" style={{ width: "100%" }}>Ver talentos</Link>
        </div>
      </div>
    );

  // Convites e propostas só depois que a equipe aprovar o contratante (o banco também barra).
  const acoes = conta?.tipo === "contratante" && conta.aprovada && aluno.id ? <AcoesContratante aluno={aluno} /> : null;
  return <PerfilVista aluno={aluno} avaliacoes={avaliacoes} acoes={acoes} />;
}
