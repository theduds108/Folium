"use client";

import Link from "next/link";
import { useState } from "react";
import { sair, useSessao } from "@/lib/sessao";
import { bancoLigado } from "@/lib/supabase";
import { excluirMinhaConta } from "@/lib/repositorio";

const PALAVRA = "EXCLUIR";

/** Botão de excluir a própria conta, com confirmação digitada. Só aparece para quem está logado. */
export function ExcluirConta() {
  const { usuario, carregando } = useSessao();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState(false);

  if (feito)
    return (
      <p className="aviso" role="status">
        Sua conta foi excluída. Obrigado por ter usado o Fólium. <Link href="/">Voltar ao início</Link>
      </p>
    );
  if (carregando) return null;
  if (!usuario || !bancoLigado)
    return (
      <p className="suave">
        <Link href="/entrar">Entre na sua conta</Link> para ver o botão de excluir.
      </p>
    );

  if (!aberto)
    return (
      <button type="button" className="botao botao-contorno botao-perigo" onClick={() => setAberto(true)}>
        Quero excluir minha conta
      </button>
    );

  return (
    <form
      className="form excluir-conta"
      onSubmit={async (e) => {
        e.preventDefault();
        if (texto.trim().toUpperCase() !== PALAVRA) return;
        setErro("");
        setExcluindo(true);
        try {
          await excluirMinhaConta(usuario.id);
          await sair();
          setFeito(true);
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setExcluindo(false);
        }
      }}
    >
      <label className="campo">
        Para confirmar, digite {PALAVRA}
        <input value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" autoCapitalize="characters" aria-describedby="excluir-ajuda" />
        <span className="ajuda" id="excluir-ajuda">Conta: {usuario.email}</span>
      </label>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <div className="excluir-acoes">
        <button type="submit" className="botao botao-perigo" disabled={excluindo || texto.trim().toUpperCase() !== PALAVRA}>
          {excluindo ? "Excluindo…" : "Excluir minha conta para sempre"}
        </button>
        <button type="button" className="link-denuncia" onClick={() => { setAberto(false); setTexto(""); setErro(""); }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
