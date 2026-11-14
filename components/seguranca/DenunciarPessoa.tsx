"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Seletor } from "@/components/Seletor";
import {
  CATEGORIAS_ALUNO,
  CATEGORIAS_ALUNO_CONTATO,
  CATEGORIAS_CONTRATANTE,
  CATEGORIAS_CONTRATANTE_CONTATO,
  PRAZO_DENUNCIA,
  registrarOcorrencia,
  type LigacaoDenuncia,
} from "@/lib/seguranca";
import { AnexarProvas } from "./AnexarProvas";

/**
 * Denúncia de uma pessoa, nos dois sentidos: o aluno denuncia o contratante e o contratante denuncia o aluno.
 * Vale dentro de um combinado e também antes dele (convite, vaga, portfólio), porque o assédio ou o golpe
 * muitas vezes acontece no primeiro contato. A outra parte nunca lê o relato nem vê os prints.
 * Abre numa janela dentro da página: nada do que a pessoa estava fazendo se perde.
 */
export function DenunciarPessoa({ ligacao, userId, souContratante, nomeOutro, rotulo, onEnviado }: {
  ligacao: LigacaoDenuncia;
  userId: string;
  souContratante: boolean;
  nomeOutro: string;
  /** Texto do botão. Padrão: "Denunciar o aluno" ou "Denunciar o contratante". */
  rotulo?: string;
  onEnviado?: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [categoria, setCategoria] = useState("");
  const [relato, setRelato] = useState("");
  const [provas, setProvas] = useState<string[]>([]);
  const [verdade, setVerdade] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const noCombinado = "combinado_id" in ligacao;
  const categorias = noCombinado
    ? souContratante ? CATEGORIAS_CONTRATANTE : CATEGORIAS_ALUNO
    : souContratante ? CATEGORIAS_CONTRATANTE_CONTATO : CATEGORIAS_ALUNO_CONTATO;
  const fechar = () => dialogo.current?.close();
  const pronto = !!categoria && relato.trim().length >= 20 && verdade;

  return (
    <>
      <button type="button" className="link-denuncia" onClick={() => dialogo.current?.showModal()}>
        {rotulo ?? `Denunciar ${souContratante ? "o aluno" : "o contratante"}`}
      </button>
      <dialog ref={dialogo} className="enquadrar janela-ajuda" aria-labelledby={`${id}-t`} onClose={() => enviado && onEnviado?.()}>
        <h2 id={`${id}-t`}>Denunciar {nomeOutro}</h2>
        {enviado ? (
          <div className="ajuda-enviada" role="status">
            <p><strong>Denúncia recebida.</strong> A equipe do Fólium analisa e responde em até {PRAZO_DENUNCIA}, pelo e-mail da sua conta.</p>
            <p className="suave">
              {noCombinado ? "Você acompanha o andamento no topo desta página." : <>Você acompanha o andamento em <Link href="/combinados" onClick={fechar}>Combinados</Link>.</>}{" "}
              A outra parte não lê o seu relato nem vê os seus prints.
            </p>
            <button type="button" className="botao botao-primario" onClick={fechar}>Fechar</button>
          </div>
        ) : (
          <form
            className="form"
            style={{ gap: 12 }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!pronto) return;
              setEnviando(true);
              setErro("");
              try {
                await registrarOcorrencia({ tipo: "denuncia", ligacao, categoria, relato, provas });
                setEnviado(true);
              } catch (err) {
                setErro((err as Error).message);
              } finally {
                setEnviando(false);
              }
            }}
          >
            <p className="suave" style={{ margin: 0 }}>
              A equipe ouve as duas partes antes de decidir. A outra parte não lê o seu relato: se precisarmos da versão dela, mandamos só um resumo.
              {!noCombinado && " Vale também para o que aconteceu fora do Fólium, por WhatsApp ou e-mail: anexe os prints."}
            </p>
            <div className="campo">
              Motivo
              <Seletor aria-label="Motivo da denúncia" name="categoria" required valor={categoria} onMudar={setCategoria} placeholder="Escolha" grupos={[{ opcoes: categorias }]} />
            </div>
            <label className="campo">
              O que aconteceu?
              <textarea value={relato} onChange={(e) => setRelato(e.target.value)} minLength={20} maxLength={3000} rows={5} required placeholder="Datas, o que foi dito ou feito, e o que você já tentou resolver." />
              <span className="ajuda">{relato.trim().length < 20 ? `Mínimo de 20 caracteres (faltam ${20 - relato.trim().length}).` : `${relato.length} de 3000`}</span>
            </label>
            <AnexarProvas userId={userId} provas={provas} onMudar={setProvas} />
            <label className="caixa-marcar">
              <input type="checkbox" checked={verdade} onChange={(e) => setVerdade(e.target.checked)} />
              <span>Tudo o que contei é verdade. Sei que denúncia falsa de má-fé também é punida.</span>
            </label>
            <p className="ajuda" style={{ margin: 0 }}>Em perigo agora, ligue 190. O Fólium não é serviço de emergência.</p>
            {erro && <p className="erro" role="alert">{erro}</p>}
            <div className="combinado-acoes">
              <button type="submit" className="botao botao-primario" disabled={enviando || !pronto}>
                {enviando ? "Enviando…" : "Enviar denúncia"}
              </button>
              <button type="button" className="link-texto" onClick={fechar}>Cancelar</button>
            </div>
            <p className="ajuda" style={{ margin: 0 }}>Veja como a equipe decide no <Link href="/conduta#denuncias" onClick={fechar}>código de conduta</Link>.</p>
          </form>
        )}
      </dialog>
    </>
  );
}

/** Denúncia dentro de um combinado (usada na lista de combinados). */
export function DenunciarCombinado({ combinadoId, ...resto }: {
  combinadoId: string;
  userId: string;
  souContratante: boolean;
  nomeOutro: string;
  onEnviado: () => void;
}) {
  return <DenunciarPessoa ligacao={{ combinado_id: combinadoId }} {...resto} />;
}
