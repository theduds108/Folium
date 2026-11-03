"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { emailInstitucional } from "@/lib/config";
import { bancoLigado, supabase } from "@/lib/supabase";
import { traduzirErro } from "@/lib/repositorio";
import { INICIO_DA_AREA, definirContaDemo, guardarTipoPretendido, useConta, type TipoConta } from "@/lib/conta";

const TEXTO: Record<TipoConta, { aba: string; titulo: string; intro: string; campo: string }> = {
  colaborador: {
    aba: "Sou aluno",
    titulo: "Entrar como colaborador",
    intro: "Para manter o espaço seguro, só alunos com e-mail institucional podem criar portfólio. Enviamos um link de acesso, sem senha.",
    campo: "E-mail institucional",
  },
  contratante: {
    aba: "Vou contratar",
    titulo: "Entrar como contratante",
    intro: "Para ver portfólios e chamar alguém, não precisa de conta. Com a conta grátis você publica vagas e acompanha quem se interessou. Qualquer e-mail serve.",
    campo: "Seu e-mail",
  },
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
  const pedido = useSearchParams().get("como");
  const { conta, logado } = useConta();
  const [tipo, setTipo] = useState<TipoConta>(pedido === "contratante" ? "contratante" : "colaborador");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const t = TEXTO[tipo];

  // Quem já está logado vai direto para a própria área.
  useEffect(() => {
    if (logado && conta) router.replace(INICIO_DA_AREA[conta.tipo]);
  }, [logado, conta, router]);

  const trocarTipo = (novo: TipoConta) => {
    setTipo(novo);
    setErro("");
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpo = email.trim().toLowerCase();
    if (tipo === "colaborador" && !emailInstitucional(limpo)) {
      setErro("Use o e-mail institucional que a universidade deu para você.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) {
      setErro("Confira o e-mail digitado.");
      return;
    }
    setErro("");
    guardarTipoPretendido(tipo);
    const sb = supabase();
    if (!sb) {
      setEnviado(true);
      return;
    }
    setEnviando(true);
    const { error } = await sb.auth.signInWithOtp({
      email: limpo,
      options: { emailRedirectTo: `${window.location.origin}${INICIO_DA_AREA[tipo]}/`, shouldCreateUser: true },
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
            <div className="abas-conta" role="tablist" aria-label="Tipo de conta">
              {(["colaborador", "contratante"] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  role="tab"
                  aria-selected={tipo === op}
                  className={tipo === op ? "aba-conta ativa" : "aba-conta"}
                  onClick={() => trocarTipo(op)}
                >
                  {TEXTO[op].aba}
                </button>
              ))}
            </div>
            <h1 style={{ fontSize: "1.9rem" }}>{t.titulo}</h1>
            <p className="suave">{t.intro}</p>
            <form className="form" onSubmit={enviar} noValidate>
              <label className="campo">
                {t.campo}
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
            {tipo === "contratante" && (
              <p className="suave" style={{ marginTop: 20, marginBottom: 0, fontSize: "0.92rem" }}>
                Só quer olhar? <Link href="/talentos">Ver talentos sem conta</Link>
              </p>
            )}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
