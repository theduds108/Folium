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
  const natural = useRef<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    const img = new Image();
    img.onload = () => (natural.current = { w: img.naturalWidth, h: img.naturalHeight });
    img.src = exibir(inicial.src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mudar = (m: Partial<Enquadramento>) => setEnq((a) => ({ ...a, ...m }));
  const url = (e: Enquadramento) => gravarFoto(exibir(inicial.src), e);

  /** Quanto a imagem "sobra" do quadro em cada eixo (px), para o arrasto acompanhar o dedo. */
  const sobra = () => {
    const q = quadro.current;
    const n = natural.current;
    if (!q || !n) return { x: 200, y: 200 };
    const { width: w, height: h } = q.getBoundingClientRect();
    const escala = Math.max(w / n.w, h / n.h);
    return {
      x: Math.max(40, n.w * escala * enq.z - w),
      y: Math.max(40, n.h * escala * enq.z - h),
    };
  };

  return (
    <dialog ref={dialogo} className="enquadrar" onClose={onFechar} aria-labelledby="enq-titulo">
      <form method="dialog" onSubmit={(e) => e.preventDefault()}>
        <h2 id="enq-titulo">Enquadrar foto</h2>
        <p className="suave" style={{ margin: "0 0 12px" }}>
          Arraste a foto para escolher o que aparece. Use o zoom para aproximar o rosto.
        </p>

        <div className="enquadrar-grade">
          <div
            ref={quadro}
            className="enquadrar-quadro"
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              arrasto.current = { px: e.clientX, py: e.clientY, x: enq.x, y: enq.y };
            }}
            onPointerMove={(e) => {
              const a = arrasto.current;
              if (!a) return;
              const s = sobra();
              mudar({
                x: Math.min(100, Math.max(0, a.x - ((e.clientX - a.px) / s.x) * 100)),
                y: Math.min(100, Math.max(0, a.y - ((e.clientY - a.py) / s.y) * 100)),
              });
            }}
            onPointerUp={() => (arrasto.current = null)}
            onPointerCancel={() => (arrasto.current = null)}
          >
            <FotoEnquadrada src={url(enq)} alt="Foto sendo enquadrada" className="foto-cobrir" />
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
          <label className="campo campo-pequeno">
            Esquerda ↔ direita
            <input type="range" min={0} max={100} step={1} value={enq.x} onChange={(e) => mudar({ x: Number(e.target.value) })} />
          </label>
          <label className="campo campo-pequeno">
            Cima ↕ baixo
            <input type="range" min={0} max={100} step={1} value={enq.y} onChange={(e) => mudar({ y: Number(e.target.value) })} />
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
