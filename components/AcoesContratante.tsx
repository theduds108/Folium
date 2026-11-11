"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Aluno } from "@/lib/data";
import { minhasVagas, type MinhaVaga } from "@/lib/repositorio";
import { convidar, proporCombinado } from "@/lib/negocios";
import { mascaraReais } from "@/lib/formato";

/**
 * No portfólio, para quem contrata: convidar o aluno para uma vaga e propor um combinado por escrito.
 * Os formulários abrem aqui mesmo, sem sair da página.
 */
export function AcoesContratante({ aluno }: { aluno: Aluno }) {
  const [aberto, setAberto] = useState<null | "convite" | "combinado">(null);
  const [vagas, setVagas] = useState<MinhaVaga[] | null>(null);
  const primeiroNome = aluno.nome.split(" ")[0];

  useEffect(() => {
    if (!aberto || vagas) return;
    minhasVagas().then((l) => setVagas(l.filter((v) => v.status === "aprovada")), () => setVagas([]));
  }, [aberto, vagas]);

  return (
    <div className="acoes-contratante">
      <div className="acoes-contratante-botoes">
        <button type="button" className="botao botao-contorno" aria-expanded={aberto === "convite"} onClick={() => setAberto(aberto === "convite" ? null : "convite")}>
          Convidar para uma vaga
        </button>
        <button type="button" className="botao botao-contorno" aria-expanded={aberto === "combinado"} onClick={() => setAberto(aberto === "combinado" ? null : "combinado")}>
          Propor um combinado
        </button>
      </div>
      {aberto === "convite" && <FormConvite aluno={aluno} vagas={vagas} primeiroNome={primeiroNome} onFechar={() => setAberto(null)} />}
      {aberto === "combinado" && <FormCombinado aluno={aluno} vagas={vagas} primeiroNome={primeiroNome} onFechar={() => setAberto(null)} />}
    </div>
  );
}

function FormConvite({ aluno, vagas, primeiroNome, onFechar }: { aluno: Aluno; vagas: MinhaVaga[] | null; primeiroNome: string; onFechar: () => void }) {
  const [vaga, setVaga] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState(false);

  if (feito)
    return (
      <p className="aviso" role="status">
        Convite enviado. {primeiroNome} vê o convite no mural de vagas. <button type="button" className="link-texto" onClick={onFechar}>Fechar</button>
      </p>
    );
  if (vagas === null) return <p className="suave">Carregando suas vagas…</p>;
  if (!vagas.length)
    return (
      <p className="suave">
        Você ainda não tem vaga aprovada para convidar. <Link href="/publicar">Publicar uma vaga</Link>
      </p>
    );

  return (
    <form
      className="form form-compacto"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!vaga || !aluno.id) return;
        setEnviando(true);
        setErro("");
        try {
          await convidar(vaga, aluno.id, mensagem);
          setFeito(true);
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setEnviando(false);
        }
      }}
    >
      <label className="campo">
        Qual vaga
        <select value={vaga} onChange={(e) => setVaga(e.target.value)} required>
          <option value="">Escolha</option>
          {vagas.map((v) => (
            <option key={v.id} value={v.id}>{v.titulo}</option>
          ))}
        </select>
      </label>
      <label className="campo">
        Recado (opcional)
        <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} maxLength={400} rows={3} placeholder={`Ex.: Gostei muito do seu trabalho, ${primeiroNome}. Topa conversar?`} />
      </label>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <button type="submit" className="botao botao-primario" disabled={enviando || !vaga}>{enviando ? "Enviando…" : "Enviar convite"}</button>
    </form>
  );
}

function FormCombinado({ aluno, vagas, primeiroNome, onFechar }: { aluno: Aluno; vagas: MinhaVaga[] | null; primeiroNome: string; onFechar: () => void }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [c, setC] = useState({ titulo: "", escopo: "", prazo: "", valor: "", sinal: "50% no início, 50% na entrega", pagamento: "Pix", ajustes: "2 rodadas de ajustes", oportunidade_id: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState(false);
  const mudar = (k: keyof typeof c, v: string) => setC((x) => ({ ...x, [k]: v }));

  if (feito)
    return (
      <p className="aviso" role="status">
        Proposta enviada. Quando {primeiroNome} aceitar, o combinado aparece em <Link href="/combinados">Combinados</Link>.{" "}
        <button type="button" className="link-texto" onClick={onFechar}>Fechar</button>
      </p>
    );

  return (
    <form
      className="form form-compacto"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!aluno.id) return;
        setEnviando(true);
        setErro("");
        try {
          await proporCombinado({ ...c, perfil_id: aluno.id, oportunidade_id: c.oportunidade_id || null });
          setFeito(true);
        } catch (err) {
          setErro((err as Error).message);
        } finally {
          setEnviando(false);
        }
      }}
    >
      <p className="ajuda" style={{ margin: 0 }}>
        Tudo combinado por escrito evita mal-entendido e calote. {primeiroNome} recebe e aceita (ou recusa) no Fólium.
      </p>
      <label className="campo">
        O que vai ser feito
        <input value={c.titulo} onChange={(e) => mudar("titulo", e.target.value)} required minLength={3} maxLength={100} placeholder="Ex.: Logo da Padaria Sol" />
      </label>
      <label className="campo">
        O que está incluso
        <textarea value={c.escopo} onChange={(e) => mudar("escopo", e.target.value)} required minLength={10} maxLength={1500} rows={4} placeholder="Ex.: 3 propostas de logo, paleta de cores e arquivos em PNG, PDF e vetor." />
      </label>
      <div className="linha-dupla">
        <label className="campo">
          Valor total
          <input value={c.valor} onChange={(e) => mudar("valor", mascaraReais(e.target.value))} required inputMode="numeric" placeholder="R$ 0" />
        </label>
        <label className="campo">
          Entrega até
          <input type="date" value={c.prazo} min={hoje} onChange={(e) => mudar("prazo", e.target.value)} />
        </label>
      </div>
      <div className="linha-dupla">
        <label className="campo">
          Sinal
          <input value={c.sinal} onChange={(e) => mudar("sinal", e.target.value)} maxLength={40} />
        </label>
        <label className="campo">
          Forma de pagamento
          <input value={c.pagamento} onChange={(e) => mudar("pagamento", e.target.value)} maxLength={200} />
        </label>
      </div>
      <label className="campo">
        Ajustes inclusos
        <input value={c.ajustes} onChange={(e) => mudar("ajustes", e.target.value)} maxLength={200} />
      </label>
      {vagas && vagas.length > 0 && (
        <label className="campo">
          Ligado a uma vaga (opcional)
          <select value={c.oportunidade_id} onChange={(e) => mudar("oportunidade_id", e.target.value)}>
            <option value="">Nenhuma</option>
            {vagas.map((v) => <option key={v.id} value={v.id}>{v.titulo}</option>)}
          </select>
        </label>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
      <button type="submit" className="botao botao-primario" disabled={enviando}>{enviando ? "Enviando…" : "Enviar proposta"}</button>
    </form>
  );
}
