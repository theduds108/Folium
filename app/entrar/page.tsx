"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DOMINIOS_INSTITUCIONAIS, emailInstitucional } from "@/lib/config";

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInstitucional(email)) {
      setErro(`Use seu e-mail institucional (termina em @${DOMINIOS_INSTITUCIONAIS[0]}).`);
      return;
    }
    setErro("");
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
                  placeholder={`seu.nome@${DOMINIOS_INSTITUCIONAIS[0]}`}
                  aria-invalid={!!erro}
                  aria-describedby="erro-email"
                  required
                />
                {erro && <span id="erro-email" className="erro">{erro}</span>}
              </label>
              <button className="botao botao-primario" type="submit">Receber link de acesso</button>
            </form>
            <p className="suave" style={{ marginTop: 20, marginBottom: 0, fontSize: "0.92rem" }}>
              Quer contratar? Você não precisa de conta. <Link href="/talentos">Ver talentos</Link>
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.9rem" }}>Confira seu e-mail</h1>
            <p className="suave">
              Mandamos um link de acesso para <strong>{email}</strong>. Ele vale por 1 hora.
            </p>
            <div className="aviso" style={{ marginBottom: 16 }}>
              Versão de demonstração: o envio de e-mail entra quando o banco de dados for ligado.
            </div>
            <button className="botao botao-verde" style={{ width: "100%" }} onClick={() => router.push("/meu-perfil")}>
              Continuar para meu portfólio
            </button>
          </>
        )}
      </div>
    </div>
  );
}
