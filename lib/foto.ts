/**
 * Enquadramento da foto de perfil.
 *
 * O aluno escolhe qual parte da foto aparece (ponto de foco, em %) e quanto de zoom.
 * Para não mudar o banco, o enquadramento vai junto com o endereço da foto, depois do "#"
 * (ex.: https://…/foto.jpg#e=40,25,1.4). O navegador ignora o que vem depois do "#",
 * então a imagem carrega normalmente, e cada tela (cartão, ficha, perfil) usa o mesmo
 * ponto de foco no formato que precisar.
 */
export type Enquadramento = { x: number; y: number; z: number };

export const ENQUADRAMENTO_PADRAO: Enquadramento = { x: 50, y: 50, z: 1 };
export const ZOOM_MAX = 3;

const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Separa o endereço da imagem do enquadramento guardado depois do "#". */
export function lerFoto(url: string): { src: string; enq: Enquadramento } {
  const i = url.lastIndexOf("#e=");
  if (i < 0) return { src: url, enq: ENQUADRAMENTO_PADRAO };
  const [x, y, z] = url.slice(i + 3).split(",").map(Number);
  const ok = [x, y, z].every((n) => Number.isFinite(n));
  return {
    src: url.slice(0, i),
    enq: ok ? { x: limitar(x!, 0, 100), y: limitar(y!, 0, 100), z: limitar(z!, 1, ZOOM_MAX) } : ENQUADRAMENTO_PADRAO,
  };
}

/** Junta o endereço da imagem e o enquadramento. No padrão (centro, sem zoom), não escreve nada. */
export function gravarFoto(src: string, enq: Enquadramento): string {
  const { x, y, z } = enq;
  if (Math.round(x) === 50 && Math.round(y) === 50 && z <= 1.001) return src;
  return `${src}#e=${Math.round(x)},${Math.round(y)},${Math.round(z * 100) / 100}`;
}
