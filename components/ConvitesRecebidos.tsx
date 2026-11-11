"use client";

import { useEffect, useState } from "react";
import { useConta } from "@/lib/conta";
import { convitesRecebidos, marcarVagasVistas, responderConvite, type Convite } from "@/lib/negocios";

/**
 * No mural de vagas, para o aluno: convites de contratantes que viram o portfólio.
 * Também marca as vagas como vistas (some o aviso de "vagas novas").
 */
export function ConvitesRecebidos() {
  const { conta } = useConta();
  const [lista, setLista] = useState<Convite[]>([]);
  const [erro, setErro] = useState("");
  const id = conta?.tipo === "colaborador" ? conta.id : null;

  useEffect(() => {
    if (!id) return;
    marcarVagasVistas();
    let ativo = true;
    convitesRecebidos(id).then((l) => ativo && setLista(l), () => undefined);
    return () => {
      ativo = false;
    };
  }, [id]);

  const pendentes = lista.filter((c) => c.status === "enviado");
  if (!id || !pendentes.length) return null;

  return (
    <section className="cartao convites" aria-labelledby="convites-titulo">
      <h2 id="convites-titulo">{pendentes.length === 1 ? "Você recebeu um convite" : `Você recebeu ${pendentes.length} convites`}</h2>
      <p className="suave" style={{ margin: 0 }}>Um contratante viu seu portfólio e quer você nesta vaga.</p>
      <ul className="convites-lista">
        {pendentes.map((c) => (
          <li key={c.id} className="convite">
            <strong>{c.vaga?.titulo ?? "Vaga"}</strong>
            <span className="suave">
              {[c.vaga?.empresa, c.vaga?.tipo, c.vaga?.orcamento || "A combinar"].filter(Boolean).join(" · ")}
            </span>
            {c.mensagem && <blockquote className="convite-recado">“{c.mensagem}”</blockquote>}
            {c.vaga?.descricao && <p className="convite-desc">{c.vaga.descricao}</p>}
            <div className="convite-acoes">
              <button
                type="button"
                className="botao botao-primario botao-pequeno"
                onClick={async () => {
                  setErro("");
                  try {
                    await responderConvite(c.id, true);
                    setLista((l) => l.map((x) => (x.id === c.id ? { ...x, status: "aceito" } : x)));
                  } catch (e) {
                    setErro((e as Error).message);
                  }
                }}
              >
                Tenho interesse
              </button>
              <button
                type="button"
                className="link-texto"
                onClick={async () => {
                  setErro("");
                  try {
                    await responderConvite(c.id, false);
                    setLista((l) => l.map((x) => (x.id === c.id ? { ...x, status: "recusado" } : x)));
                  } catch (e) {
                    setErro((e as Error).message);
                  }
                }}
              >
                Agora não
              </button>
            </div>
            {c.vaga?.contato && <span className="ajuda">Contato: {c.vaga.contato}</span>}
          </li>
        ))}
      </ul>
      {erro && <p className="erro" role="alert">{erro}</p>}
    </section>
  );
}
