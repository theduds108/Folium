"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { emailInstitucional } from "@/lib/config";
import { entrarComSenha } from "@/lib/acesso";
import { bancoLigado, supabase } from "@/lib/supabase";
import { traduzirErro } from "@/lib/repositorio";
import { INICIO_DA_AREA, definirContaDemo, guardarTipoPretendido, useConta, type TipoConta } from "@/lib/conta";

const TEXTO: Record<TipoConta, { aba: string; intro: string; campo: string }> = {
  colaborador: {
    aba: "Sou aluno",
    intro: "Só alunos com e-mail institucional podem criar portfólio. Mandamos um link para o seu e-mail e, nele, você cria seu usuário e senha.",
    campo: "E-mail institucional",
  },
  contratante: {
    aba: "Vou contratar",
    intro: "Com a conta grátis você vê os portfólios, publica vagas e acompanha quem se interessou. Qualquer e-mail serve: mandamos um link e, nele, você cria seu usuário e senha.",
    campo: "Seu e-mail",
  },
};

/**
 * entrar: nome de usuário (ou e-mail) + senha, sem e-mail nenhum.
 * primeiro: link no e-mail, uma vez só, e depois cria usuário e senha em /senha.
 * recuperar: esqueceu a senha (ou já tinha conta e ainda não criou senha).
 */
type Modo = "entrar" | "primeiro" | "recuperar";

const TITULO: Record<Modo, string> = {
  entrar: "Entrar",
  primeiro: "Primeiro acesso",
  recuperar: "Esqueci a senha",
};

const BOTAO: Record<Modo, [string, string]> = {
  entrar: ["Entrar", "Entrando…"],
  primeiro: ["Receber link de acesso", "Enviando…"],
  recuperar: ["Enviar link para criar a senha", "Enviando…"],
};

export default function Entrar() {
  return (
    <Suspense fallback={null}>
      <FormEntrar />
    </Suspense>
  );
}

function FormEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const { conta, logado, carregando: carregandoConta, recarregar } = useConta();
  const [tipo, setTipo] = useState<TipoConta>(params.get("como") === "contratante" ? "contratante" : "colaborador");
  const [modo, setModo] = useState<Modo>(params.get("modo") === "primeiro" ? "primeiro" : "entrar");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<null | "primeiro" | "recuperar" | "demo">(null);
  const limpo = email.trim().toLowerCase();

  // Quem já está logado vai direto para a própria área.
  useEffect(() => {
    if (logado && conta) router.replace(INICIO_DA_AREA[conta.tipo]);
  }, [logado, conta, router]);

  const trocarModo = (novo: Modo) => {
    setModo(novo);
    setErro("");
    setSenha("");
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = supabase();

    if (modo === "entrar") {
      if (!login.trim() || !senha) {
        setErro("Digite seu nome de usuário (ou e-mail) e a senha.");
        return;
      }
      setErro("");
      if (!sb) {
        setAviso("demo");
        return;
      }
      setEnviando(true);
      try {
        await entrarComSenha(login, senha);
        // O redirecionamento acontece no useEffect, quando a conta carregar.
      } catch (err) {
        setErro((err as Error).message);
      } finally {
        setEnviando(false);
      }
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) {
      setErro("Confira o e-mail digitado.");
      return;
    }
    if (modo === "primeiro" && tipo === "colaborador" && !emailInstitucional(limpo)) {
      setErro("Use o e-mail institucional que a universidade deu para você.");
      return;
    }
    setErro("");
    guardarTipoPretendido(tipo);
    if (!sb) {
      setAviso("demo");
      return;
    }
    setEnviando(true);
    // Os dois links levam para /senha, onde a pessoa cria o nome de usuário e a senha.
    const volta = `${window.location.origin}/senha/`;
    const { error } =
      modo === "primeiro"
        ? await sb.auth.signInWithOtp({ email: limpo, options: { emailRedirectTo: volta, shouldCreateUser: true } })
        : await sb.auth.resetPasswordForEmail(limpo, { redirectTo: volta });
    setEnviando(false);
    if (error) {
      setErro(traduzirErro(error).message);
      return;
    }
    setAviso(modo);
  };

  // Entrou, mas a conta não carregou (internet caiu, banco fora do ar): avisa e deixa tentar de novo,
  // em vez de mostrar o formulário de novo como se nada tivesse acontecido.
  if (bancoLigado && logado && !carregandoConta && !conta)
    return (
      <div className="container">
        <div className="cartao pagina-estreita">
          <h1 style={{ fontSize: "var(--t-tit-m)" }}>Você entrou, mas a conta não carregou</h1>
          <p className="suave">Deve ter sido a internet. Confira a conexão e tente de novo; seu login continua salvo.</p>
          <button className="botao botao-primario" style={{ width: "100%" }} onClick={recarregar}>Tentar de novo</button>
        </div>
      </div>
    );

  if (aviso)
    return (
      <div className="container">
        <div className="cartao pagina-estreita">
          {aviso === "demo" ? (
            <>
              <h1 style={{ fontSize: "var(--t-tit-m)" }}>Modo demonstração</h1>
              <div className="aviso" style={{ marginBottom: 16 }}>
                O banco ainda não foi ligado, então nenhum e-mail foi enviado e não há senha de verdade.
              </div>
              <button
                className="botao botao-verde"
                style={{ width: "100%" }}
                onClick={() => {
                  definirContaDemo({ tipo, plano: "gratis" });
                  router.push(INICIO_DA_AREA[tipo]);
                }}
              >
                {tipo === "contratante" ? "Continuar para o meu painel" : "Continuar para meu portfólio"}
              </button>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: "var(--t-tit-m)" }}>Confira seu e-mail</h1>
              <p className="suave">
                {aviso === "primeiro" ? (
                  <>
                    Mandamos um link de acesso para <strong>{limpo}</strong>. Abra o link neste aparelho: lá você cria
                    seu nome de usuário e sua senha, e daí em diante entra com eles, sem precisar de e-mail.
                  </>
                ) : (
                  <>
                    Se <strong>{limpo}</strong> tiver conta no Fólium, mandamos um link para criar a senha nova. Abra o
                    link neste aparelho.
                  </>
                )}{" "}
                Se não chegar em alguns minutos, olhe a caixa de spam.
              </p>
              {bancoLigado && (
                <button
                  className="botao botao-contorno"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setAviso(null);
                    trocarModo("entrar");
                  }}
                >
                  Voltar para entrar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="cartao pagina-estreita">
        {modo === "primeiro" && (
          <div className="abas-conta" role="tablist" aria-label="Tipo de conta">
            {(["colaborador", "contratante"] as const).map((op) => (
              <button
                key={op}
                type="button"
                role="tab"
                aria-selected={tipo === op}
                className={tipo === op ? "aba-conta ativa" : "aba-conta"}
                onClick={() => {
                  setTipo(op);
                  setErro("");
                }}
              >
                {TEXTO[op].aba}
              </button>
            ))}
          </div>
        )}
        <h1 style={{ fontSize: "var(--t-tit-m)" }}>{TITULO[modo]}</h1>
        <p className="suave">
          {modo === "entrar" && "Que bom te ver de novo. Use seu usuário (ou e-mail) e sua senha."}
          {modo === "primeiro" && TEXTO[tipo].intro}
          {modo === "recuperar" &&
            "Mandamos um link para o seu e-mail e você cria uma senha nova na hora. Serve também para quem já tinha conta e ainda não criou usuário e senha."}
        </p>
        <form className="form" onSubmit={enviar} noValidate>
          {modo === "entrar" ? (
            <>
              <label className="campo">
                Nome de usuário ou e-mail
                <input
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </label>
              <label className="campo">
                Senha
                <input
                  type={verSenha ? "text" : "password"}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </label>
<div className="linha-senha">
                <label className="ajuda" style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: 0 }}>
                  <input type="checkbox" checked={verSenha} onChange={(e) => setVerSenha(e.target.checked)} />
                  Mostrar senha
                </label>
                <button type="button" className="link-texto" onClick={() => trocarModo("recuperar")}>Esqueci ou não tenho senha</button>
              </div>
            </>
          ) : (
            <label className="campo">
              {modo === "primeiro" ? TEXTO[tipo].campo : "E-mail da conta"}
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          )}
          {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
          {modo === "primeiro" && (
            <p className="ajuda cadastro-termos">
              Ao continuar, você concorda com os <Link href="/privacidade#termos">Termos de uso</Link> e a{" "}
              <Link href="/privacidade#privacidade">Política de privacidade</Link>.
            </p>
          )}
          <button className="botao botao-primario" type="submit" disabled={enviando}>
            {enviando ? BOTAO[modo][1] : BOTAO[modo][0]}
          </button>
        </form>
        <div className="entrar-alternativa">
          <span className="entrar-ou">{modo === "entrar" ? "primeira vez no Fólium?" : "já tem usuário e senha?"}</span>
          {modo === "entrar" ? (
            <button type="button" className="botao botao-contorno" onClick={() => trocarModo("primeiro")}>
              Fazer o primeiro acesso
            </button>
          ) : (
            <button type="button" className="botao botao-contorno" onClick={() => trocarModo("entrar")}>
              Entrar com usuário e senha
            </button>
          )}
          {modo === "entrar" && (
            <p className="ajuda" style={{ margin: 0, textAlign: "center" }}>
              Aluno usa o e-mail institucional. Empresa ou contratante usa qualquer e-mail.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
