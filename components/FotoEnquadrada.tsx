import { lerFoto } from "@/lib/foto";

/**
 * Foto que respeita o enquadramento escolhido pelo aluno (ponto de foco + zoom).
 * Preenche o espaço do pai sem deformar nem esticar; o ponto de foco fica sempre
 * visível, seja no cartão horizontal, na ficha, no perfil vertical ou na miniatura redonda.
 */
export function FotoEnquadrada({
  src,
  alt = "",
  className = "",
  width,
  height,
  loading,
}: {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}) {
  const { src: imagem, enq } = lerFoto(src);
  return (
    <span
      className={`foto-enq ${className}`.trim()}
      style={{ ["--fx" as string]: `${enq.x}%`, ["--fy" as string]: `${enq.y}%`, ["--fz" as string]: enq.z }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imagem} alt={alt} width={width} height={height} loading={loading} decoding="async" />
    </span>
  );
}
