"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SENHA_MINIMA } from "@/lib/config";
import { lerNomeUsuario, normalizarNomeUsuario, problemaNomeUsuario, problemaSenha, salvarLogin, sugerirNomeUsuario } from "@/lib/acesso";
import { INICIO_DA_AREA, useConta } from "@/lib/conta";
import { useSessao } from "@/lib/sessao";
import { supabase } from "@/lib/supabase";

/**
 * Criar (ou trocar) o login de quem está logado: nome de usuário + senha.
 * Os links do primeiro acesso e do "Esqueci a senha" trazem a pessoa para cá.
 */
export default function Senha() {
  const router = useRouter();
  const { usuario, carregando } = useSessao();
  const { conta } = useConta();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const temLogin = !!usuario?.user_metadata?.nome_usuario && !!usuario?.user_metadata?.tem_senha;
  const destino = conta ? INICIO_DA_AREA[conta.tipo] : "/";

  // Preenche com o nome atual, ou sugere um a partir do e-mail.
  useEffect(() => {
    if (!usuario) return;
    let ativo = true;
    lerNomeUsuario(usuario.id).then((atual) => {
      if (ativo) setNome((n) => n || atual || sugerirNomeUsuario(usuario.email ?? ""));
    });
    return () => {
      ativo = false;
    };
  }, [usuario]);

  if (carregando) return null;

  if (!supabase() || !usuario)
    return (
      <div className="container">
        <div className="cartao pagina-estreita">
          <h1 style={{ fontSize: "1.9rem" }}>Entre para criar seu login</h1>
          <p className="suave">
            {supabase()
              ? "O link pode ter expirado ou já ter sido usado. Peça outro em “Esqueci a senha”."
              : "Modo demonstração: não há contas de verdade, então não há login para criar."}
          </p>
          <Link href="/entrar" className="botao botao-primario" style={{ width: "100%" }}>Ir para entrar</Link>
        </div>
      </div>
    );

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const problema =
      problemaNomeUsuario(nome) || (temLogin && !senha && !senha2 ? "" : problemaSenha(senha, senha2));
    if (problema) {
      setErro(problema);
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      await salvarLogin(usuario.id, nome, senha);
      setPronto(true);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container">
      <div className="cartao pagina-estreita">
        {pronto ? (
          <>
            <h1 style={{ fontSize: "1.9rem" }}>Login criado</h1>
            <div className="aviso" style={{ marginBottom: 16 }}>
              A partir de agora, este é o seu login: usuário <strong>{nome}</strong> e a senha que você criou. Não
              precisa mais esperar link no e-mail.
            </div>
            <button className="botao botao-verde" style={{ width: "100%" }} onClick={() => router.push(destino)}>
              Continuar
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.9rem" }}>{temLogin ? "Trocar usuário ou senha" : "Crie seu usuário e senha"}</h1>
            <p className="suave">
              {temLogin
                ? "Troque o que quiser. Deixe a senha em branco para manter a atual."
                : "Seu e-mail já foi confirmado. Agora crie um nome de usuário e uma senha: esse será o seu login daqui em diante, sem precisar de link no e-mail."}{" "}
              Conta: <strong>{usuario.email}</strong>.
            </p>
            <form className="form" onSubmit={salvar} noValidate>
              <label className="campo">
                Nome de usuário
                <input
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={30}
                  value={nome}
                  onChange={(e) => setNome(normalizarNomeUsuario(e.target.value))}
                  required
                />
                <span className="ajuda">Letras minúsculas, números, ponto ou sublinhado. Ex.: ana.silva</span>
              </label>
              <label className="campo">
                {temLogin ? "Senha nova (opcional)" : `Senha (mínimo ${SENHA_MINIMA} caracteres)`}
                <input
                  type={verSenha ? "text" : "password"}
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required={!temLogin}
                />
              </label>
              <label className="campo">
                Repita a senha
                <input
                  type={verSenha ? "text" : "password"}
                  autoComplete="new-password"
                  value={senha2}
                  onChange={(e) => setSenha2(e.target.value)}
                  required={!temLogin}
                />
              </label>
              <label className="ajuda" style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: 0 }}>
                <input type="checkbox" checked={verSenha} onChange={(e) => setVerSenha(e.target.checked)} />
                Mostrar senha
              </label>
              {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
              <button className="botao botao-primario" type="submit" disabled={salvando}>
                {salvando ? "Salvando…" : temLogin ? "Salvar" : "Criar meu login"}
              </button>
            </form>
            <p className="suave" style={{ marginTop: 20, marginBottom: 0, fontSize: "0.92rem" }}>
              <Link href={destino}>Agora não</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
