/**
 * Validação e preparo das fotos enviadas (perfil, obras e certificados em imagem).
 *
 * Tudo roda no aparelho, antes de subir: o tipo é conferido pelo conteúdo do arquivo (não pelo
 * nome nem pelo tipo que o celular informa, que costuma vir vazio ou errado), e cada problema
 * gera um aviso específico em português. Fotos grandes demais para subir são reduzidas e
 * comprimidas para JPEG, e a pessoa é avisada do que foi feito.
 */

export const LIMITES = {
  /** Peso máximo do arquivo original aceito (a foto é reduzida depois). */
  originalMB: 25,
  /** Acima disso o arquivo é considerado pesado e é reduzido, com aviso. */
  pesoIdealMB: 5,
  /** Peso máximo do arquivo já comprimido que vai para o banco (o bucket aceita 5 MB). */
  enviadoMB: 4.5,
  /** Menor lado aceito, em pixels. Abaixo disso a foto fica borrada. */
  ladoMinimo: 300,
  /** Maior lado aceito, em pixels. Acima disso a imagem é pesada demais para o navegador. */
  ladoMaximo: 12000,
  /** Maior lado depois do preparo. */
  ladoEnviado: 2000,
  /** Proporção máxima (lado maior / lado menor): evita faixas e banners. */
  proporcaoMaxima: 5,
} as const;

export type Formato = "jpeg" | "png" | "webp" | "heic" | "avif" | "gif" | "bmp" | "tiff" | "svg" | "pdf" | "outro";

const NOME_FORMATO: Record<Formato, string> = {
  jpeg: "JPG", png: "PNG", webp: "WebP", heic: "HEIC", avif: "AVIF", gif: "GIF",
  bmp: "BMP", tiff: "TIFF", svg: "SVG", pdf: "PDF", outro: "desconhecido",
};

/** Erro com texto pronto para mostrar à pessoa. */
export class ErroFoto extends Error {
  constructor(mensagem: string, readonly motivo: "formato" | "peso" | "pequena" | "grande" | "proporcao" | "vazio" | "ilegivel") {
    super(mensagem);
    this.name = "ErroFoto";
  }
}

export const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: bytes < 10 * 1024 * 1024 ? 1 : 0 })} MB`;

const ascii = (b: Uint8Array, de: number, ate: number) => String.fromCharCode(...b.slice(de, ate));

/** Descobre o formato pelos primeiros bytes do arquivo. */
export function identificarFormato(b: Uint8Array): Formato {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && b[0] === 0x89 && ascii(b, 1, 4) === "PNG") return "png";
  if (b.length >= 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return "webp";
  if (b.length >= 6 && ascii(b, 0, 3) === "GIF") return "gif";
  if (b.length >= 2 && ascii(b, 0, 2) === "BM") return "bmp";
  if (b.length >= 4 && (ascii(b, 0, 4) === "II*\0" || ascii(b, 0, 4) === "MM\0*")) return "tiff";
  if (b.length >= 4 && ascii(b, 0, 4) === "%PDF") return "pdf";
  if (b.length >= 12 && ascii(b, 4, 8) === "ftyp") {
    const marca = ascii(b, 8, 12);
    if (marca === "avif" || marca === "avis") return "avif";
    if (/^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(marca)) return "heic";
  }
  const inicio = ascii(b, 0, Math.min(b.length, 256)).trimStart().toLowerCase();
  if (inicio.startsWith("<svg") || (inicio.startsWith("<?xml") && inicio.includes("<svg"))) return "svg";
  return "outro";
}

/** Confere tamanho e formato do arquivo, antes de abrir a imagem. */
export function verificarArquivo(tamanho: number, formato: Formato): void {
  if (tamanho === 0) throw new ErroFoto("O arquivo está vazio. Escolha outra foto.", "vazio");
  if (formato === "pdf") {
    throw new ErroFoto("Isso é um PDF, não uma imagem. Aqui use uma foto em JPG, PNG ou WebP.", "formato");
  }
  if (formato === "outro") {
    throw new ErroFoto("Formato não compatível. Use uma foto em JPG, PNG ou WebP.", "formato");
  }
  if (formato === "gif" || formato === "bmp" || formato === "tiff" || formato === "svg") {
    throw new ErroFoto(`Formato ${NOME_FORMATO[formato]} não é compatível. Use uma foto em JPG, PNG ou WebP.`, "formato");
  }
  if (tamanho > LIMITES.originalMB * 1024 * 1024) {
    throw new ErroFoto(
      `A foto passou do tamanho máximo: tem ${mb(tamanho)} e o limite é ${LIMITES.originalMB} MB. Escolha uma foto menor ou reduza a qualidade na câmera.`,
      "peso",
    );
  }
}

/** Confere as dimensões da imagem já aberta. */
export function verificarDimensoes(largura: number, altura: number): void {
  const menor = Math.min(largura, altura);
  const maior = Math.max(largura, altura);
  if (!menor) throw new ErroFoto("Não consegui ler o tamanho dessa imagem. Escolha outra foto.", "ilegivel");
  if (menor < LIMITES.ladoMinimo) {
    throw new ErroFoto(
      `A foto é pequena demais (${largura}×${altura} px). Use uma com pelo menos ${LIMITES.ladoMinimo} px no menor lado, senão ela fica borrada.`,
      "pequena",
    );
  }
  if (maior > LIMITES.ladoMaximo) {
    throw new ErroFoto(
      `As dimensões passaram do necessário (${largura}×${altura} px). O máximo é ${LIMITES.ladoMaximo.toLocaleString("pt-BR")} px de lado. Reduza a foto antes de enviar.`,
      "grande",
    );
  }
  if (maior / menor > LIMITES.proporcaoMaxima) {
    throw new ErroFoto(
      `O formato da imagem não é compatível (${largura}×${altura} px, muito comprida). Use uma foto com proporção mais próxima de um retrato ou paisagem normal.`,
      "proporcao",
    );
  }
}

export type ResultadoFoto = { blob: Blob; aviso?: string };

/**
 * Valida a foto e devolve um JPEG pronto para enviar, com um aviso quando ela foi reduzida.
 * Lança ErroFoto (mensagem pronta para a pessoa) quando a foto não serve.
 */
export async function prepararFoto(arquivo: Blob & { name?: string }, ladoMax: number = LIMITES.ladoEnviado): Promise<ResultadoFoto> {
  const cabecalho = new Uint8Array(await arquivo.slice(0, 512).arrayBuffer());
  const formato = identificarFormato(cabecalho);
  verificarArquivo(arquivo.size, formato);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  } catch {
    if (formato === "heic" || formato === "avif") {
      throw new ErroFoto(
        `O formato ${NOME_FORMATO[formato]} não abre neste navegador. No celular, mude a câmera para "Mais compatível" (JPG) ou tire um print da foto e envie o print.`,
        "formato",
      );
    }
    throw new ErroFoto("Não consegui abrir essa imagem: o arquivo parece corrompido. Escolha outra foto ou tire um print dela.", "ilegivel");
  }

  try {
    verificarDimensoes(bitmap.width, bitmap.height);
    const { width: largura, height: altura } = bitmap;
    const escala = Math.min(1, ladoMax / Math.max(largura, altura));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(largura * escala));
    canvas.height = Math.max(1, Math.round(altura * escala));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ErroFoto("O navegador não conseguiu preparar a imagem. Tente em outro navegador.", "ilegivel");
    ctx.fillStyle = "#fff"; // PNG com transparência vira fundo branco no JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let blob: Blob | null = null;
    for (const qualidade of [0.85, 0.7, 0.55]) {
      blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", qualidade));
      if (blob && blob.size <= LIMITES.enviadoMB * 1024 * 1024) break;
    }
    if (!blob) throw new ErroFoto("O navegador não conseguiu preparar a imagem. Tente em outro navegador.", "ilegivel");
    if (blob.size > LIMITES.enviadoMB * 1024 * 1024) {
      throw new ErroFoto(
        `O tamanho passou do necessário: mesmo reduzida a foto ficou com ${mb(blob.size)} (limite ${LIMITES.enviadoMB} MB). Escolha uma foto com menos detalhes.`,
        "peso",
      );
    }

    const partes: string[] = [];
    if (escala < 1) partes.push(`de ${largura}×${altura} para ${canvas.width}×${canvas.height} px`);
    if (arquivo.size > LIMITES.pesoIdealMB * 1024 * 1024) partes.push(`de ${mb(arquivo.size)} para ${mb(blob.size)}`);
    const aviso = partes.length
      ? `Sua foto passou do tamanho necessário e foi reduzida automaticamente (${partes.join(", ")}). A qualidade continua boa para o portfólio.`
      : formato === "heic" || formato === "avif"
        ? `Sua foto era ${NOME_FORMATO[formato]} e foi convertida para JPG.`
        : undefined;
    return { blob, aviso };
  } finally {
    bitmap.close?.();
  }
}
