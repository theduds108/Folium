"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emailInstitucional } from "@/lib/config";
import { bancoLigado, supabase } from "@/lib/supabase";
import { traduzirErro } from "@/lib/repositorio";
import { useSessao } from "@/lib/sessao";

export default function Entrar() {
  const router = useRouter();
  const { usuario } = useSessao();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Quem já está logado vai direto para o portfólio.
  useEffect(() => {
    if (usuario) router.replace("/meu-perfil");
  }, [usuario, router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpo = email.trim().toLowerCase();
    if (!emailInstitucional(limpo)) {
      setErro("Use o e-mail institucional que a universidade deu para você.");
      return;
    }
    setErro("");
    const sb = supabase();
    if (!sb) {
      setEnviado(true);
      return;
    }
    setEnviando(true);
    const { error } = await sb.auth.signInWithOtp({
      email: limpo,
      options: { emailRedirectTo: `${window.location.origin}/meu-perfil/`, shouldCreateUser: true },
    });
    setEnviando(false);
    if (error) {
      setErro(traduzirErro(error).message);
      return;
    }
    setEnviado(true);
  };

  return (
    <div className="container">
      <div className="cartao pagina-estreita">
        {!enviado ? (
          <>
            <h1 style={{ fontSize: "1.9rem" }}>Entrar no Fólium</h1>
            <p className="suave">
              Para manter o espaço seguro, só alunos com e-mail institucional podem criar portfólio.
              Enviamos um link de acesso, sem senha.
            </p>
            <form className="form" onSubmit={enviar} noValidate>
              <label className="campo">
                E-mail institucional
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!erro}
                  aria-describedby="erro-email"
                  required
                />
                {erro && <span id="erro-email" className="erro">{erro}</span>}
              </label>
              <button className="botao botao-primario" type="submit" disabled={enviando}>
                {enviando ? "Enviando…" : "Receber link de acesso"}
              </button>
            </form>
            <p className="suave" style={{ marginTop: 20, marginBottom: 0, fontSize: "0.92rem" }}>
              Quer contratar? Você não precisa de conta. <Link href="/talentos">Ver talentos</Link>
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.9rem" }}>Confira seu e-mail</h1>
            <p className="suave">
              Mandamos um link de acesso para <strong>{email.trim().toLowerCase()}</strong>. Abra o link neste
              aparelho para entrar. Se não chegar em alguns minutos, olhe a caixa de spam.
            </p>
            {bancoLigado ? (
              <button className="botao botao-contorno" style={{ width: "100%" }} onClick={() => setEnviado(false)}>
                Usar outro e-mail
              </button>
            ) : (
              <>
                <div className="aviso" style={{ marginBottom: 16 }}>
                  Modo demonstração: o banco ainda não foi ligado, então nenhum e-mail foi enviado.
                </div>
                <button className="botao botao-verde" style={{ width: "100%" }} onClick={() => router.push("/meu-perfil")}>
                  Continuar para meu portfólio
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
