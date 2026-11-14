"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { meusConvitesCollab, responderCollab, type ConviteCollab } from "@/lib/repositorio";

/**
 * No editor do portfólio: colegas que marcaram esta pessoa num trabalho em collab.
 * Ela escreve o que fez e aceita; só então o trabalho entra no portfólio dela.
 * Os aceitos ficam listados para editar a parte ou tirar do portfólio.
 */
export function ConvitesCollab({ slug }: { slug?: string }) {
  const [lista, setLista] = useState<ConviteCollab[]>([]);
  const [partes, setPartes] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    meusConvitesCollab().then(
      (l) => {
        if (!ativo) return;
        setLista(l);
        setPartes(Object.fromEntries(l.map((c) => [c.trabalho_id, c.papel])));
      },
      () => undefined
    );
    return () => {
      ativo = false;
    };
  }, []);

  if (!lista.length) return null;
  const pendentes = lista.filter((c) => c.status === "pendente");
  const aceitos = lista.filter((c) => c.status === "aceito");

  const responder = async (c: ConviteCollab, aceitar: boolean) => {
    setErro("");
    setOcupado(c.trabalho_id);
    try {
      const papel = partes[c.trabalho_id] ?? "";
      await responderCollab(c.trabalho_id, aceitar, papel);
      setLista((l) => (aceitar ? l.map((x) => (x.trabalho_id === c.trabalho_id ? { ...x, status: "aceito", papel } : x)) : l.filter((x) => x.trabalho_id !== c.trabalho_id)));
      setEditando(null);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  };

  const campoParte = (c: ConviteCollab) => (
    <label className="campo campo-pequeno">
      O que você fez neste trabalho
      <textarea
        className="entrada"
        rows={2}
        maxLength={200}
        value={partes[c.trabalho_id] ?? ""}
        onChange={(e) => setPartes((p) => ({ ...p, [c.trabalho_id]: e.target.value }))}
        placeholder="Ex.: pesquisa, entrevistas e texto final"
      />
      <span className="ajuda">Aparece como &quot;Minha parte&quot; no seu portfólio. {(partes[c.trabalho_id] ?? "").length}/200</span>
    </label>
  );

  const autor = (c: ConviteCollab) => <Link href={`/perfil/?u=${encodeURIComponent(c.dono_slug)}`}>{c.dono_nome}</Link>;

  return (
    <section className="cartao convites convites-collab" aria-labelledby="collab-titulo">
      <h2 id="collab-titulo">
        {pendentes.length
          ? pendentes.length === 1
            ? "Marcaram você num trabalho em collab"
            : `Marcaram você em ${pendentes.length} trabalhos em collab`
          : "Trabalhos em collab no seu portfólio"}
      </h2>
      {pendentes.length > 0 && (
        <p className="suave" style={{ margin: 0 }}>Conte o que você fez e aceite para o trabalho aparecer também no seu portfólio. Sem o seu aceite, nada aparece.</p>
      )}
      <ul className="convites-lista">
        {pendentes.map((c) => (
          <li key={c.trabalho_id} className="convite">
            <strong>{c.titulo}</strong>
            <span className="suave">{c.tipo} · publicado por {autor(c)}</span>
            {campoParte(c)}
            <div className="convite-acoes">
              <button type="button" className="botao botao-primario botao-pequeno" disabled={ocupado === c.trabalho_id} onClick={() => responder(c, true)}>
                Aceitar e pôr no meu portfólio
              </button>
              <button type="button" className="link-texto" disabled={ocupado === c.trabalho_id} onClick={() => responder(c, false)}>
                Não participei
              </button>
            </div>
          </li>
        ))}
        {aceitos.map((c) => (
          <li key={c.trabalho_id} className="convite convite-aceito">
            <strong>{c.titulo}</strong>
            <span className="suave">com {autor(c)} · no seu portfólio</span>
            {editando === c.trabalho_id ? (
              <>
                {campoParte(c)}
                <div className="convite-acoes">
                  <button type="button" className="botao botao-primario botao-pequeno" disabled={ocupado === c.trabalho_id} onClick={() => responder(c, true)}>
                    Salvar minha parte
                  </button>
                  <button type="button" className="link-texto" onClick={() => setEditando(null)}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                {c.papel && <span className="convite-parte"><strong>Minha parte:</strong> {c.papel}</span>}
                <div className="convite-acoes">
                  <button type="button" className="link-texto" onClick={() => setEditando(c.trabalho_id)}>Editar minha parte</button>
                  <button type="button" className="link-texto" disabled={ocupado === c.trabalho_id} onClick={() => responder(c, false)}>
                    Tirar do meu portfólio
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {slug && aceitos.length > 0 && (
        <Link href={`/perfil/?u=${encodeURIComponent(slug)}`} className="link-mao">ver como aparece no meu portfólio →</Link>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
    </section>
  );
}
