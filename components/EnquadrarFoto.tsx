"use client";

import { useEffect, useRef, useState } from "react";
import { FotoEnquadrada } from "@/components/FotoEnquadrada";
import { ENQUADRAMENTO_PADRAO, ZOOM_MAX, gravarFoto, lerFoto, type Enquadramento } from "@/lib/foto";

/**
 * Janela para escolher como a foto aparece: arraste a imagem ou use os controles.
 * As prévias mostram a foto nos três formatos do site (cartão, perfil e miniatura redonda),
 * então o aluno vê o resultado real antes de salvar.
 */
export function EnquadrarFoto({
  foto,
  exibir,
  onSalvar,
  onFechar,
}: {
  /** Valor guardado (endereço + enquadramento). */
  foto: string;
  /** Endereço pronto para mostrar (ex.: com tamanho do Unsplash), sem enquadramento. */
  exibir: (src: string) => string;
  onSalvar: (novo: string) => void;
  onFechar: () => void;
}) {
  const inicial = lerFoto(foto);
  const [enq, setEnq] = useState<Enquadramento>(inicial.enq);
  const dialogo = useRef<HTMLDialogElement>(null);
  const quadro = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mudar = (m: Partial<Enquadramento>) => setEnq((a) => ({ ...a, ...m }));
  const url = (e: Enquadramento) => gravarFoto(exibir(inicial.src), e);

  /** Quanto a imagem sobra do quadro em cada eixo (px), já com o zoom. Zero = não há o que arrastar. */
  const sobra = () => {
    const q = quadro.current;
    const img = q?.querySelector("img");
    if (!q || !img || !img.naturalWidth) return { x: 0, y: 0 };
    const { width: w, height: h } = q.getBoundingClientRect();
    const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    return {
      x: Math.max(0, img.naturalWidth * escala * enq.z - w),
      y: Math.max(0, img.naturalHeight * escala * enq.z - h),
    };
  };

  /** Move a foto junto com o ponteiro (1 px arrastado = 1 px na tela). */
  const mover = (dx: number, dy: number, base: { x: number; y: number }) => {
    const s = sobra();
    const limitar = (n: number) => Math.min(100, Math.max(0, n));
    mudar({
      x: s.x > 0 ? limitar(base.x - (dx / s.x) * 100) : base.x,
      y: s.y > 0 ? limitar(base.y - (dy / s.y) * 100) : base.y,
    });
  };

  // Rodinha do mouse = zoom. Precisa de ouvinte nativo para poder cancelar a rolagem da janela.
  useEffect(() => {
    const q = quadro.current;
    if (!q) return;
    const rodar = (e: WheelEvent) => {
      e.preventDefault();
      setEnq((a) => ({ ...a, z: Math.min(ZOOM_MAX, Math.max(1, Math.round((a.z - e.deltaY * 0.002) * 100) / 100)) }));
    };
    q.addEventListener("wheel", rodar, { passive: false });
    return () => q.removeEventListener("wheel", rodar);
  }, []);

  return (
    <dialog ref={dialogo} className="enquadrar" onClose={onFechar} aria-labelledby="enq-titulo">
      <form method="dialog" onSubmit={(e) => e.preventDefault()}>
        <h2 id="enq-titulo">Enquadrar foto</h2>
        <p className="suave" style={{ margin: "0 0 12px" }}>
          Arraste a foto com o mouse (ou o dedo) até ficar como você quer. Gire a rodinha ou use o zoom para aproximar.
        </p>

        <div className="enquadrar-grade">
          <div
            ref={quadro}
            className="enquadrar-quadro"
            tabIndex={0}
            role="group"
            aria-label="Foto para enquadrar. Arraste com o mouse ou use as setas do teclado."
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              arrasto.current = { px: e.clientX, py: e.clientY, x: enq.x, y: enq.y };
            }}
            onPointerMove={(e) => {
              const a = arrasto.current;
              if (a) mover(e.clientX - a.px, e.clientY - a.py, a);
            }}
            onPointerUp={() => (arrasto.current = null)}
            onPointerCancel={() => (arrasto.current = null)}
            onKeyDown={(e) => {
              const passo = e.shiftKey ? 40 : 12;
              const mapa: Record<string, [number, number]> = {
                ArrowLeft: [passo, 0], ArrowRight: [-passo, 0], ArrowUp: [0, passo], ArrowDown: [0, -passo],
              };
              const d = mapa[e.key];
              if (!d) return;
              e.preventDefault();
              mover(d[0], d[1], enq);
            }}
          >
            <FotoEnquadrada src={url(enq)} alt="Foto sendo enquadrada" className="foto-cobrir" />
            <span className="enquadrar-dica" aria-hidden="true">✥ arraste a foto</span>
          </div>

          <div className="enquadrar-previas" aria-label="Como a foto aparece no site">
            <figure>
              <div className="enquadrar-previa-cartao"><FotoEnquadrada src={url(enq)} className="foto-cobrir" /></div>
              <figcaption>Cartão</figcaption>
            </figure>
            <figure>
              <div className="enquadrar-previa-perfil"><FotoEnquadrada src={url(enq)} className="foto-cobrir" /></div>
              <figcaption>Perfil</figcaption>
            </figure>
            <figure>
              <div className="enquadrar-previa-redonda"><FotoEnquadrada src={url(enq)} className="foto-cobrir" /></div>
              <figcaption>Redonda</figcaption>
            </figure>
          </div>
        </div>

        <div className="enquadrar-controles">
          <label className="campo campo-pequeno">
            Zoom
            <input type="range" min={1} max={ZOOM_MAX} step={0.05} value={enq.z} onChange={(e) => mudar({ z: Number(e.target.value) })} />
          </label>
        </div>

        <div className="enquadrar-acoes">
          <button type="button" className="link-denuncia" onClick={() => setEnq(ENQUADRAMENTO_PADRAO)}>Centralizar</button>
          <span style={{ flex: 1 }} />
          <button type="button" className="botao botao-contorno" onClick={() => dialogo.current?.close()}>Cancelar</button>
          <button
            type="button"
            className="botao botao-primario"
            onClick={() => {
              onSalvar(gravarFoto(inicial.src, enq));
              dialogo.current?.close();
            }}
          >
            Salvar enquadramento
          </button>
        </div>
      </form>
    </dialog>
  );
}
