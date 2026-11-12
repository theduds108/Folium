"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Seletor } from "@/components/Seletor";
import { CATEGORIAS_AJUDA, PRAZO_AJUDA, TELEFONES_APOIO, dataHora, registrarOcorrencia } from "@/lib/seguranca";
import { AnexarProvas } from "./AnexarProvas";

/**
 * Botão "Preciso de ajuda" do aluno, em um combinado em andamento (fase 2).
 * Mostra primeiro os telefones de emergência; depois avisa a equipe com prioridade, pode pausar
 * o combinado sem penalidade e, se o aluno quiser, pede para a equipe avisar a faculdade.
 * O contratante não é avisado.
 */
export function BotaoAjuda({ combinadoId, userId, pausado, onEnviado }: { combinadoId: string; userId: string; pausado: boolean; onEnviado: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [categoria, setCategoria] = useState("");
  const [relato, setRelato] = useState("");
  const [provas, setProvas] = useState<string[]>([]);
  const [pausar, setPausar] = useState(!pausado);
  const [faculdade, setFaculdade] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviadoEm, setEnviadoEm] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  // Ao fechar depois de enviar, a lista recarrega (onClose do diálogo).
  const fechar = () => dialogo.current?.close();

  return (
    <>
      <button type="button" className="botao botao-perigo botao-ajuda" onClick={() => dialogo.current?.showModal()}>
        Preciso de ajuda
      </button>
      <dialog ref={dialogo} className="enquadrar janela-ajuda" aria-labelledby={`${id}-t`} onClose={() => enviadoEm && onEnviado()}>
        <h2 id={`${id}-t`}>Preciso de ajuda</h2>

        <a className="ajuda-190" href="tel:190">
          <strong>Em perigo agora? Ligue 190</strong>
          <span>Ameaça, agressão ou alguém te impedindo de sair. O Fólium não é serviço de emergência.</span>
        </a>
        <ul className="ajuda-telefones">
          {TELEFONES_APOIO.filter((t) => t.numero !== "190").map((t) => (
            <li key={t.numero}>
              <a href={`tel:${t.numero}`}><strong>{t.numero}</strong> {t.nome}</a>
              <span className="ajuda">{t.quando}</span>
            </li>
          ))}
        </ul>

        {enviadoEm ? (
          <div className="ajuda-enviada" role="status">
            <p><strong>Pedido recebido.</strong> A equipe do Fólium responde até {enviadoEm}, pelo e-mail da sua conta.</p>
            <p className="suave">O contratante não foi avisado.{pausar ? " O combinado está pausado: você não precisa continuar o trabalho e não leva nota baixa por isso." : ""}</p>
            <button type="button" className="botao botao-primario" onClick={fechar}>Fechar</button>
          </div>
        ) : (
          <form
            className="form"
            style={{ gap: 12 }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!categoria) return;
              setEnviando(true);
              setErro("");
              try {
                await registrarOcorrencia({ tipo: "ajuda", combinado_id: combinadoId, categoria, relato, provas, pausou_combinado: pausar && !pausado, avisar_faculdade: faculdade });
                setEnviadoEm(dataHora(new Date(Date.now() + 24 * 3600 * 1000).toISOString()));
              } catch (err) {
                setErro((err as Error).message);
              } finally {
                setEnviando(false);
              }
            }}
          >
            <p className="suave" style={{ margin: 0 }}>
              Conte para a equipe do Fólium. Respondemos em até {PRAZO_AJUDA}. <strong>O contratante não fica sabendo.</strong>
            </p>
            <div className="campo">
              O que está acontecendo?
              <Seletor aria-label="O que está acontecendo" name="categoria" required valor={categoria} onMudar={setCategoria} placeholder="Escolha" grupos={[{ opcoes: CATEGORIAS_AJUDA }]} />
            </div>
            <label className="campo">
              Quer contar mais? (opcional)
              <textarea value={relato} onChange={(e) => setRelato(e.target.value)} maxLength={3000} rows={4} placeholder="O que aconteceu, quando e quem estava junto. Escreva só o que se sentir bem em contar." />
            </label>
            <AnexarProvas userId={userId} provas={provas} onMudar={setProvas} />
            {!pausado && (
              <label className="caixa-marcar">
                <input type="checkbox" checked={pausar} onChange={(e) => setPausar(e.target.checked)} />
                <span>Pausar o combinado agora (sem multa e sem nota baixa)</span>
              </label>
            )}
            <label className="caixa-marcar">
              <input type="checkbox" checked={faculdade} onChange={(e) => setFaculdade(e.target.checked)} />
              <span>Quero que a equipe avise a minha faculdade</span>
            </label>
            {erro && <p className="erro" role="alert">{erro}</p>}
            <div className="combinado-acoes">
              <button type="submit" className="botao botao-perigo" disabled={enviando || !categoria}>{enviando ? "Enviando…" : "Pedir ajuda"}</button>
              <button type="button" className="link-texto" onClick={fechar}>Fechar</button>
            </div>
            <p className="ajuda" style={{ margin: 0 }}>Veja como funciona no <Link href="/conduta#ajuda" onClick={fechar}>código de conduta</Link>.</p>
          </form>
        )}
      </dialog>
    </>
  );
}
