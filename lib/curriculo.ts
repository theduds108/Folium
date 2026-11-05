/**
 * Leitura do currículo do aluno para preencher o portfólio.
 *
 * Tudo acontece no próprio navegador: o arquivo não é enviado a nenhum servidor nem
 * a serviço de terceiros. O texto é lido do PDF (pdf.js) ou do Word (.docx, descompactado
 * aqui mesmo) e passa por regras que reconhecem as seções comuns de um currículo brasileiro
 * (Resumo, Experiência, Formação, Cursos, Idiomas, Habilidades, Contato).
 *
 * O resultado é só uma sugestão: o editor mostra tudo para o aluno conferir antes de usar.
 */

import { CURSOS, NIVEIS_IDIOMA, type Certificado, type Experiencia, type Idioma, type Links } from "@/lib/data";
import { mascaraTelefone } from "@/lib/formato";

export type DadosCurriculo = {
  nome?: string;
  titulo?: string;
  curso?: string;
  semestre?: number;
  conclusao?: string;
  cidade?: string;
  bio?: string;
  sobre?: string;
  habilidades: string[];
  whatsapp?: string;
  email?: string;
  links: Links;
  experiencias: Experiencia[];
  certificados: Certificado[];
  idiomas: Idioma[];
};

export const TAMANHO_MAXIMO = 8 * 1024 * 1024;

/* ------------------------------------------------------------------ */
/* 1. Ler o texto do arquivo                                           */
/* ------------------------------------------------------------------ */

export async function textoDoArquivo(arquivo: File): Promise<string> {
  if (arquivo.size > TAMANHO_MAXIMO) throw new Error("Esse arquivo passa de 8 MB. Use a versão em PDF do seu currículo.");
  const nome = arquivo.name.toLowerCase();
  if (arquivo.type === "application/pdf" || nome.endsWith(".pdf")) return textoDoPdf(arquivo);
  if (nome.endsWith(".docx")) return textoDoDocx(arquivo);
  if (arquivo.type.startsWith("text/") || nome.endsWith(".txt")) return arquivo.text();
  if (nome.endsWith(".doc")) throw new Error("Arquivos .doc antigos não dá para ler. Salve como PDF ou .docx e tente de novo.");
  throw new Error("Use o currículo em PDF ou Word (.docx).");
}

async function textoDoPdf(arquivo: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  const dados = new Uint8Array(await arquivo.arrayBuffer());
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: dados, isEvalSupported: false }).promise;
  } catch (e) {
    if ((e as Error).name === "PasswordException") throw new Error("Esse PDF tem senha. Tire a senha e tente de novo.");
    throw new Error("Não consegui abrir esse PDF. Tente exportar o currículo de novo em PDF.");
  }
  const paginas: string[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, 6); n++) {
    const pagina = await doc.getPage(n);
    const conteudo = await pagina.getTextContent();
    // Agrupa os pedaços de texto por linha (mesma altura na página), da esquerda para a direita.
    type Pedaco = { x: number; y: number; texto: string; fim: boolean };
    const pedacos: Pedaco[] = [];
    for (const item of conteudo.items) {
      if (!("str" in item)) continue;
      pedacos.push({ x: item.transform[4], y: item.transform[5], texto: item.str, fim: item.hasEOL });
    }
    const linhas: { y: number; partes: Pedaco[] }[] = [];
    for (const p of pedacos) {
      if (!p.texto.trim()) continue;
      const linha = linhas.find((l) => Math.abs(l.y - p.y) < 3);
      if (linha) linha.partes.push(p);
      else linhas.push({ y: p.y, partes: [p] });
    }
    linhas.sort((a, b) => b.y - a.y);
    paginas.push(
      linhas
        .map((l) =>
          l.partes
            .sort((a, b) => a.x - b.x)
            .map((p) => p.texto)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()
        )
        .join("\n")
    );
  }
  doc.destroy();
  const texto = paginas.join("\n");
  if (texto.replace(/\s/g, "").length < 40)
    throw new Error("Esse PDF parece ser uma imagem (foto ou escaneado), então não tem texto para ler. Use o PDF exportado do Word, Canva ou Google Docs.");
  return texto;
}

/** Lê o word/document.xml de dentro do .docx (que é um .zip) sem bibliotecas extras. */
async function textoDoDocx(arquivo: File): Promise<string> {
  const zip = new Uint8Array(await arquivo.arrayBuffer());
  const dv = new DataView(zip.buffer);
  // Fim do diretório central: assinatura 0x06054b50, procurada de trás para frente.
  let fim = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      fim = i;
      break;
    }
  }
  if (fim < 0) throw new Error("Não consegui abrir esse arquivo do Word. Tente salvar como PDF.");
  const total = dv.getUint16(fim + 10, true);
  let p = dv.getUint32(fim + 16, true);
  const decodificar = new TextDecoder();
  for (let k = 0; k < total; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const metodo = dv.getUint16(p + 10, true);
    const tamanho = dv.getUint32(p + 20, true);
    const lenNome = dv.getUint16(p + 28, true);
    const lenExtra = dv.getUint16(p + 30, true);
    const lenComent = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const nome = decodificar.decode(zip.subarray(p + 46, p + 46 + lenNome));
    p += 46 + lenNome + lenExtra + lenComent;
    if (nome !== "word/document.xml") continue;
    const inicio = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
    const bruto = zip.subarray(inicio, inicio + tamanho);
    let xml: string;
    if (metodo === 0) xml = decodificar.decode(bruto);
    else if (metodo === 8 && typeof DecompressionStream !== "undefined") {
      const fluxo = new Blob([bruto]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      xml = await new Response(fluxo).text();
    } else throw new Error("Este navegador não consegue abrir arquivos do Word. Tente com o currículo em PDF.");
    return xml
      .replace(/<w:tab\/>/g, " ")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
  throw new Error("Não encontrei texto nesse arquivo do Word. Tente salvar como PDF.");
}

/* ------------------------------------------------------------------ */
/* 2. Entender o texto                                                 */
/* ------------------------------------------------------------------ */

/** Minúsculas e sem acento, para comparar. */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

type Secao = "resumo" | "experiencia" | "formacao" | "cursos" | "idiomas" | "habilidades" | "contato" | "outra";

const TITULOS_SECAO: [Secao, string[]][] = [
  ["resumo", ["resumo", "resumo profissional", "perfil", "perfil profissional", "sobre", "sobre mim", "apresentacao", "objetivo", "objetivos", "objetivo profissional", "quem sou"]],
  [
    "experiencia",
    [
      "experiencia", "experiencias", "experiencia profissional", "experiencias profissionais", "historico profissional",
      "atuacao profissional", "estagios", "estagio", "voluntariado", "trabalho voluntario", "experiencia academica",
      "atividades extracurriculares", "atividades academicas", "atividades complementares", "experiencias relevantes",
      "experience", "work experience", "professional experience",
    ],
  ],
  ["formacao", ["formacao", "formacao academica", "escolaridade", "educacao", "graduacao", "education"]],
  [
    "cursos",
    [
      "cursos", "cursos complementares", "cursos livres", "cursos extracurriculares", "certificados", "certificacoes",
      "cursos e certificacoes", "cursos e certificados", "formacao complementar", "qualificacoes", "premios",
      "premios e reconhecimentos", "certifications", "courses",
    ],
  ],
  ["idiomas", ["idiomas", "idioma", "linguas", "languages"]],
  [
    "habilidades",
    [
      "habilidades", "competencias", "conhecimentos", "ferramentas", "habilidades tecnicas", "competencias tecnicas",
      "conhecimentos tecnicos", "conhecimentos em informatica", "informatica", "hard skills", "soft skills",
      "habilidades e competencias", "skills", "softwares",
    ],
  ],
  ["contato", ["contato", "contatos", "dados pessoais", "informacoes pessoais", "informacoes de contato"]],
  ["outra", ["projetos", "portfolio", "informacoes adicionais", "referencias", "interesses", "publicacoes"]],
];

/** Se a linha é o título de uma seção, diz qual. */
function secaoDaLinha(linha: string): Secao | null {
  if (linha.length > 45 || /\d/.test(linha)) return null;
  const n = norm(linha).replace(/[:\-–—•|_*#.]+$/g, "").replace(/^[•\-–—*#]+/, "").trim();
  for (const [secao, nomes] of TITULOS_SECAO) {
    for (const nome of nomes) {
      if (n === nome || (n.startsWith(nome + " ") && n.split(" ").length <= 5) || n === nome.replace(/ /g, "")) return secao;
    }
  }
  return null;
}

const MARCADOR = /^[•●▪◦‣∙·\-–—*>✓✔➢➤►]\s*/;
const limparMarcador = (s: string) => s.replace(MARCADOR, "").trim();

const MESES: Record<string, number> = {
  jan: 1, janeiro: 1, fev: 2, fevereiro: 2, mar: 3, marco: 3, abr: 4, abril: 4, mai: 5, maio: 5, jun: 6, junho: 6,
  jul: 7, julho: 7, ago: 8, agosto: 8, set: 9, setembro: 9, out: 10, outubro: 10, nov: 11, novembro: 11, dez: 12, dezembro: 12,
  feb: 2, apr: 4, may: 5, aug: 8, sep: 9, sept: 9, oct: 10, dec: 12,
};
const ATUAL = /\b(atual(mente)?|presente|o momento|hoje|em andamento|cursando|current|present)\b/;

/** Uma data solta: "03/2023", "mar/2023", "março de 2023", "mar 2023" ou só "2023". */
const DATA = String.raw`(?:(?:\d{1,2}|[a-zç]{3,9})\.?\s*(?:\/|de|-|\s)\s*)?(?:19|20)\d{2}`;
const PERIODO = new RegExp(String.raw`(${DATA})\s*(?:-|–|—|a|até|ate|ao|to|\/)\s*(${DATA}|atual(?:mente)?|presente|o momento|hoje|em andamento|cursando|current|present)`, "i");

/** Converte uma data solta em "AAAA-MM". Só o ano vira janeiro (início) ou dezembro (fim). */
function mesAno(trecho: string, ehFim: boolean): string {
  const n = norm(trecho);
  const ano = /(19|20)\d{2}/.exec(n)?.[0];
  if (!ano) return "";
  const numero = /^(\d{1,2})\s*[\/-]/.exec(n);
  let mes = numero ? Number(numero[1]) : 0;
  if (!mes) {
    const palavra = /^([a-z]{3,9})/.exec(n)?.[1];
    if (palavra) mes = MESES[palavra] ?? MESES[palavra.slice(0, 3)] ?? 0;
  }
  if (mes < 1 || mes > 12) mes = ehFim ? 12 : 1;
  return `${ano}-${String(mes).padStart(2, "0")}`;
}

function lerPeriodo(linha: string): { inicio: string; fim: string; atual: boolean; resto: string } | null {
  const m = PERIODO.exec(linha);
  if (m) {
    const atual = ATUAL.test(norm(m[2]!));
    return {
      inicio: mesAno(m[1]!, false),
      fim: atual ? "" : mesAno(m[2]!, true),
      atual,
      resto: (linha.slice(0, m.index) + " " + linha.slice(m.index + m[0].length)).replace(/[()[\]]/g, " "),
    };
  }
  // "Desde 2023" / "Desde mar/2023"
  const desde = new RegExp(String.raw`(?:desde|since)\s+(${DATA})`, "i").exec(linha);
  if (desde) return { inicio: mesAno(desde[1]!, false), fim: "", atual: true, resto: linha.replace(desde[0], " ") };
  return null;
}

const PALAVRAS_CARGO = [
  "estagi", "assistente", "analista", "auxiliar", "desenvolvedor", "desenvolvedora", "designer", "monitor", "bolsista",
  "coordenador", "coordenadora", "gerente", "vendedor", "vendedora", "atendente", "aprendiz", "trainee", "voluntari",
  "freelancer", "freela", "redator", "redatora", "social media", "fotograf", "editor", "editora", "professor", "professora",
  "programador", "programadora", "tecnico", "tecnica", "diretor", "diretora", "membro", "presidente", "pesquisador",
  "pesquisadora", "reporter", "jornalista", "produtor", "produtora", "consultor", "consultora", "ilustrador", "ilustradora",
  "recepcionista", "operador", "operadora", "supervisor", "supervisora", "secretari", "estoquista", "caixa", "tutor",
  "tutora", "instrutor", "instrutora", "engenheiro", "engenheira", "arquiteto", "arquiteta", "iniciacao cientifica",
  "lider", "colaborador", "colaboradora", "videomaker", "editor de video", "copywriter", "intern", "developer",
];
const PALAVRAS_LUGAR = [
  "ltda", "s.a", "s/a", "eireli", " me", "empresa", "agencia", "studio", "estudio", "universidade", "unisagrado", "faculdade",
  "prefeitura", "jr", "junior", "instituto", "escola", "colegio", "banco", "grupo", "loja", "associacao", "ong",
  "fundacao", "hospital", "clinica", "laboratorio", "centro", "secretaria", "camara", "governo", "editora ", "jornal",
  "radio", "tv ", "magazine", "supermercado", "restaurante", "cooperativa", "sebrae", "senac", "senai", "sesi", "ibm", "usp",
  "unesp", "fatec", "etec",
];
const temPalavra = (texto: string, lista: string[]) => {
  const n = ` ${norm(texto)} `;
  // A palavra tem que começar no início de uma palavra do texto ("comercio" não vale dentro de "comercios de rua" por acaso).
  return lista.some((p) => n.includes(p.startsWith(" ") ? p : ` ${p}`) );
};

/** Separa "Cargo – Empresa", "Empresa | Cargo", "Cargo na Empresa" etc. */
function cargoELugar(cabecalho: string[]): { cargo: string; lugar: string } {
  const partes = cabecalho
    .flatMap((l) => l.split(/\s+[|–—-]\s+|\s*\|\s*|,\s+(?=[A-ZÀ-Ú])/))
    .map((s) => limparMarcador(s).replace(/[:;,.\s]+$/, "").trim())
    .filter((s) => s.length > 1 && !/^(19|20)\d{2}$/.test(s));
  if (partes.length === 0) return { cargo: "", lugar: "" };
  if (partes.length === 1) {
    const unico = partes[0]!;
    const na = /^(.+?)\s+(?:na|no|em|at|@)\s+(.+)$/i.exec(unico);
    if (na && temPalavra(na[1]!, PALAVRAS_CARGO)) return { cargo: na[1]!.trim(), lugar: na[2]!.trim() };
    return temPalavra(unico, PALAVRAS_CARGO) || !temPalavra(unico, PALAVRAS_LUGAR) ? { cargo: unico, lugar: "" } : { cargo: "", lugar: unico };
  }
  const iCargo = partes.findIndex((p) => temPalavra(p, PALAVRAS_CARGO) && !temPalavra(p, PALAVRAS_LUGAR));
  const iLugar = partes.findIndex((p, i) => i !== iCargo && temPalavra(p, PALAVRAS_LUGAR));
  let cargo = iCargo >= 0 ? iCargo : -1;
  let lugar = iLugar >= 0 ? iLugar : -1;
  if (cargo < 0 && lugar < 0) {
    cargo = 0;
    lugar = 1;
  } else if (cargo < 0) cargo = lugar === 0 ? 1 : 0;
  else if (lugar < 0) lugar = cargo === 0 ? 1 : 0;
  return { cargo: (partes[cargo] ?? "").slice(0, 80), lugar: (partes[lugar] ?? "").slice(0, 80) };
}

/** Uma linha "parece título" (cargo/empresa), e não parte de descrição. */
const pareceCabecalho = (l: string) => !MARCADOR.test(l) && l.length <= 90 && !/[.;]$/.test(l) && !/^[a-zà-ú]/.test(l);

function lerExperiencias(linhas: string[]): Experiencia[] {
  const comData = linhas.map((l) => lerPeriodo(l));
  const indices = comData.map((d, i) => (d ? i : -1)).filter((i) => i >= 0);
  const lista: Experiencia[] = [];

  if (indices.length === 0) {
    // Sem datas: cada linha com cara de título abre uma experiência; o resto é descrição.
    let atual: Experiencia | null = null;
    for (const l of linhas) {
      if (pareceCabecalho(l) && (!atual || atual.descricao)) {
        if (atual) lista.push(atual);
        atual = { ...cargoELugar([l]), periodo: "", descricao: "", inicio: "", fim: "", atual: false };
      } else if (atual) atual.descricao = juntar(atual.descricao, limparMarcador(l));
    }
    if (atual) lista.push(atual);
    return lista.filter((x) => x.cargo || x.lugar).slice(0, 10).map(cortarDescricao);
  }

  let usadasAte = 0;
  for (let k = 0; k < indices.length; k++) {
    const d = indices[k]!;
    const proxima = indices[k + 1] ?? linhas.length;
    const periodo = comData[d]!;
    // Cabeçalho: o que sobrou na linha da data + até 2 linhas de título logo antes dela.
    const cabecalho: string[] = [];
    for (let i = d - 1; i >= usadasAte && cabecalho.length < 2; i--) {
      if (!pareceCabecalho(linhas[i]!)) break;
      cabecalho.unshift(linhas[i]!);
    }
    const resto = periodo.resto.replace(/\s+/g, " ").replace(/^[\s|–—\-,:]+|[\s|–—\-,:]+$/g, "").trim();
    if (resto.length > 1) cabecalho.push(resto);
    // Logo após a data também pode vir o cargo (layout "Empresa / data / Cargo").
    let i = d + 1;
    if (cabecalho.length < 2 && i < proxima && pareceCabecalho(linhas[i]!) && linhas[i]!.length <= 50 && (temPalavra(linhas[i]!, PALAVRAS_CARGO) || temPalavra(linhas[i]!, PALAVRAS_LUGAR))) {
      // Só se a linha seguinte não for o cabeçalho da próxima experiência.
      const ehDaProxima = k + 1 < indices.length && indices[k + 1]! - i <= 2;
      if (!ehDaProxima) cabecalho.push(linhas[i++]!);
    }
    // Descrição: até onde começa o cabeçalho da próxima experiência.
    let fimDescricao = proxima;
    if (k + 1 < indices.length) {
      let voltas = 0;
      while (fimDescricao - 1 >= i && voltas < 2 && pareceCabecalho(linhas[fimDescricao - 1]!)) {
        fimDescricao--;
        voltas++;
      }
    }
    const descricao = linhas.slice(i, fimDescricao).map(limparMarcador).reduce(juntar, "");
    usadasAte = fimDescricao;
    const { cargo, lugar } = cargoELugar(cabecalho);
    if (!cargo && !lugar) continue;
    lista.push(cortarDescricao({ cargo, lugar, periodo: "", descricao, inicio: periodo.inicio, fim: periodo.fim, atual: periodo.atual }));
  }
  return lista.slice(0, 10);
}

const juntar = (a: string, b: string) => (!b ? a : !a ? b : /[.!?;:]$/.test(a) ? `${a} ${b}` : `${a}. ${b}`);
const cortarDescricao = (x: Experiencia): Experiencia => ({ ...x, descricao: cortar(x.descricao, 300) });
function cortar(texto: string, max: number) {
  const t = texto.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  const ponto = corte.lastIndexOf(". ");
  return ponto > max * 0.5 ? corte.slice(0, ponto + 1) : corte.replace(/\s+\S*$/, "") + "…";
}

function lerCertificados(linhas: string[]): Certificado[] {
  const lista: Certificado[] = [];
  for (const bruta of linhas) {
    const l = limparMarcador(bruta);
    if (l.length < 3) continue;
    const ano = /\b((?:19|20)\d{2})\b/.exec(l)?.[1] ?? "";
    const partes = l
      .replace(/\(([^)]*)\)/g, " | $1 | ")
      .split(/\s+[|–—-]\s+|\s*\|\s*|\s*;\s*/)
      .map((s) => s.trim().replace(/^[-–—\s]+/, "").replace(/[.,:]+$/, ""))
      .filter(
        (s) =>
          s &&
          !/^(?:\d{1,2}\/)?(?:19|20)\d{2}$/.test(s) &&
          !/^(?:carga hor[aá]ria:?\s*)?\d+\s*(h|hs|horas?)\b/i.test(s) &&
          !/^(conclu[ií]do|em andamento|cursando)$/i.test(s)
      );
    const anterior = lista[lista.length - 1];
    // Linha só com instituição/ano logo abaixo do nome do curso: completa o anterior.
    if (anterior && !anterior.instituicao && (partes.length <= 1) && (temPalavra(l, PALAVRAS_LUGAR) || (ano && partes.length === 0))) {
      if (partes[0]) anterior.instituicao = partes[0].slice(0, 80);
      if (ano && !anterior.ano) anterior.ano = ano;
      continue;
    }
    if (!partes[0]) continue;
    let nome = partes[0];
    let instituicao = partes[1] ?? "";
    const em = /^(.+?)\s+(?:pela|pelo|na|no|-)\s+(.+)$/i.exec(nome);
    if (!instituicao && em && temPalavra(em[2]!, PALAVRAS_LUGAR)) {
      nome = em[1]!;
      instituicao = em[2]!;
    }
    lista.push({ nome: nome.slice(0, 100), instituicao: instituicao.slice(0, 80), ano, link: "" });
  }
  return lista.slice(0, 15);
}

const IDIOMAS: [RegExp, string][] = [
  [/\bingl[eê]s\b|\benglish\b/i, "Inglês"],
  [/\bespanhol\b|\bspanish\b|\bespa[nñ]ol\b/i, "Espanhol"],
  [/\bfranc[eê]s\b|\bfrench\b/i, "Francês"],
  [/\balem[aã]o\b|\bgerman\b/i, "Alemão"],
  [/\bitaliano\b|\bitalian\b/i, "Italiano"],
  [/\bjapon[eê]s\b|\bjapanese\b/i, "Japonês"],
  [/\bmandarim\b|\bchin[eê]s\b/i, "Mandarim"],
  [/\bcoreano\b|\bkorean\b/i, "Coreano"],
  [/\brusso\b/i, "Russo"],
  [/\b[aá]rabe\b/i, "Árabe"],
  [/\blibras\b/i, "Libras"],
  [/\bportugu[eê]s\b|\bportuguese\b/i, "Português"],
];
const NIVEIS: [RegExp, (typeof NIVEIS_IDIOMA)[number]][] = [
  [/nativ|materna|native/, "Nativo"],
  [/fluen|fluent/, "Fluente"],
  [/avan[cç]|advanced|c1|c2/, "Avançado"],
  [/intermedi|intermediate|b1|b2|conversa/, "Intermediário"],
  [/b[aá]sic|basic|iniciante|a1|a2|elementar/, "Básico"],
];

function lerIdiomas(linhas: string[], soComNivel: boolean): Idioma[] {
  const lista: Idioma[] = [];
  for (const l of linhas) {
    // Uma linha pode ter vários: "Inglês (avançado), Espanhol (básico)"
    for (const trecho of l.split(/[,;|•]/)) {
      const idioma = IDIOMAS.find(([re]) => re.test(trecho))?.[1];
      if (!idioma || lista.some((x) => x.idioma === idioma)) continue;
      const nivel = NIVEIS.find(([re]) => re.test(norm(trecho)))?.[1];
      if (soComNivel && !nivel) continue;
      lista.push({ idioma, nivel: nivel ?? (idioma === "Português" ? "Nativo" : "Intermediário") });
    }
  }
  return lista.slice(0, 8);
}

function lerHabilidades(linhas: string[]): string[] {
  const vistas = new Set<string>();
  const lista: string[] = [];
  for (const l of linhas) {
    // "Design: Figma, Photoshop" vira só a lista depois dos dois-pontos.
    const semRotulo = /^[^:]{2,30}:\s*(.+)$/.exec(l)?.[1] ?? l;
    for (const bruta of semRotulo.split(/[,;|•·●▪]|\s+-\s+|\s+e\s+(?=[A-ZÀ-Ú])/)) {
      const h = limparMarcador(bruta).replace(/[.:]+$/, "").replace(/\s*\((b[aá]sico|intermedi[aá]rio|avan[cç]ado)\)$/i, "").trim();
      if (h.length < 2 || h.length > 40 || h.split(" ").length > 5) continue;
      const chave = norm(h);
      if (vistas.has(chave)) continue;
      vistas.add(chave);
      lista.push(h);
    }
  }
  return lista.slice(0, 25);
}

function lerFormacao(linhas: string[], tudo: string) {
  const texto = linhas.join("\n");
  const n = norm(texto);
  const r: Pick<DadosCurriculo, "curso" | "semestre" | "conclusao"> = {};
  // Curso: o nome mais longo da lista de cursos que aparece na formação (ou no currículo todo).
  const procurar = (onde: string) =>
    [...CURSOS].sort((a, b) => b.length - a.length).find((c) => new RegExp(`\\b${norm(c).replace(/[()]/g, "")}\\b`).test(onde));
  r.curso = procurar(n) ?? procurar(norm(tudo).slice(0, 4000));
  const sem = /(\d{1,2})\s*[ºo°ª]?\s*(?:semestre|periodo|termo)/.exec(n) ?? /(\d{1,2})\s*[ºo°ª]?\s*(?:semestre|periodo|termo)/.exec(norm(tudo));
  if (sem) {
    const s = Number(sem[1]);
    if (s >= 1 && s <= 12) r.semestre = s;
  }
  // Conclusão: "previsão de conclusão 12/2027", "conclusão em 2027" ou o fim do período da graduação.
  const prev = /(?:previs[aã]o|conclus[aã]o|t[eé]rmino|formatura)[^\n\d]{0,30}((?:\d{1,2}\s*\/\s*|[a-zç]{3,9}\.?\s*(?:\/|de)?\s*)?(?:20)\d{2})/i.exec(texto);
  if (prev) r.conclusao = mesAno(prev[1]!, true);
  else {
    const linhaCurso = linhas.find((l) => r.curso && norm(l).includes(norm(r.curso).slice(0, 12))) ?? "";
    const idx = linhas.indexOf(linhaCurso);
    for (const l of idx >= 0 ? linhas.slice(idx, idx + 3) : []) {
      const p = lerPeriodo(l);
      if (p?.fim) {
        r.conclusao = p.fim;
        break;
      }
    }
  }
  if (r.conclusao && !/^20\d{2}-\d{2}$/.test(r.conclusao)) delete r.conclusao;
  return r;
}

function lerLinks(texto: string): Links {
  const links: Links = {};
  const achar = (re: RegExp) => re.exec(texto)?.[0]?.replace(/[).,;]+$/, "");
  const li = achar(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[\w\-%À-ú]+\/?/i);
  if (li) links.linkedin = li;
  const gh = achar(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/i);
  if (gh) links.github = gh;
  const be = achar(/(?:https?:\/\/)?(?:www\.)?behance\.net\/[\w-]+\/?/i);
  if (be) links.behance = be;
  const ig = achar(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/[\w.]+\/?/i);
  if (ig) links.instagram = ig;
  else {
    const arroba = /instagram[^\n@]{0,15}@([\w.]{2,30})/i.exec(texto);
    if (arroba) links.instagram = `instagram.com/${arroba[1]}`;
  }
  const outros = texto.match(/(?:https?:\/\/|www\.)[^\s,;()]+|\b[\w-]+\.(?:com\.br|com|net|art|design|me|io|dev|site)(?:\/[^\s,;()]*)?/gi) ?? [];
  const site = outros
    .map((s) => s.replace(/[).,;]+$/, ""))
    .find((s) => !/linkedin|github|behance|instagram|gmail|hotmail|outlook|yahoo|@|lattes\.cnpq/i.test(s) && !texto.includes(`@${s}`));
  if (site) links.site = site;
  return links;
}

const UFS = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO";

/** Lê o texto do currículo e devolve o que conseguir reconhecer. */
export function lerCurriculo(texto: string): DadosCurriculo {
  const linhas = texto
    .replace(/\r/g, "")
    .replace(/[  -​]/g, " ")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const tudo = linhas.join("\n");

  // Divide em seções pelo título; o que vem antes do primeiro título é o "topo" (nome e contatos).
  const secoes: Partial<Record<Secao, string[]>> = {};
  const topo: string[] = [];
  let atual: Secao | null = null;
  for (const l of linhas) {
    const s = secaoDaLinha(l);
    if (s) {
      atual = s;
      secoes[s] ??= [];
      continue;
    }
    if (atual) secoes[atual]!.push(l);
    else topo.push(l);
  }

  const d: DadosCurriculo = { habilidades: [], links: lerLinks(tudo), experiencias: [], certificados: [], idiomas: [] };

  // Contatos (procurados no currículo todo)
  const email = /[\w.+-]+@[\w-]+(\.[\w-]+)+/.exec(tudo)?.[0];
  if (email) d.email = email.toLowerCase();
  const tel = /(?:\+?55\s*)?\(?\b\d{2}\)?\s*9?\s*\d{4}[\s.-]?\d{4}\b/.exec(tudo.replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, ""));
  if (tel) {
    const digitos = tel[0].replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
    if (digitos.length === 10 || digitos.length === 11) d.whatsapp = mascaraTelefone(digitos);
  }
  const cidade = new RegExp(String.raw`([A-ZÀ-Ú][a-zà-ú]+(?:\s+(?:d[aeo]s?\s+)?[A-ZÀ-Ú][a-zà-ú]+){0,3})\s*[-/,–]\s*(${UFS})\b`).exec(tudo);
  if (cidade) d.cidade = `${cidade[1]}, ${cidade[2]}`;

  // Nome: primeira linha do topo com cara de nome (2 a 6 palavras, só letras).
  const ehNome = (l: string) => /^[A-Za-zÀ-ÿ'´ ]{5,70}$/.test(l) && l.trim().split(/\s+/).length >= 2 && l.trim().split(/\s+/).length <= 6 && !secaoDaLinha(l);
  const candidatos = topo.length ? topo : linhas.slice(0, 5);
  const iNome = candidatos.slice(0, 6).findIndex(ehNome);
  if (iNome >= 0) {
    const bruto = candidatos[iNome]!.trim();
    d.nome = bruto === bruto.toUpperCase() ? capitalizar(bruto) : bruto;
    // Título: a linha logo abaixo do nome, se for curta e não for contato/endereço.
    const prox = candidatos[iNome + 1];
    if (prox && prox.length <= 70 && !/[@\d|]|\b(rua|av\.?|avenida|bairro|cep)\b/i.test(prox) && !ehNome(prox) && !secaoDaLinha(prox)) d.titulo = prox;
    else if (prox && ehNome(prox) && prox.split(" ").length <= 4 && temPalavra(prox, PALAVRAS_CARGO)) d.titulo = prox;
  }

  // Resumo / objetivo
  const resumo = (secoes.resumo ?? []).map(limparMarcador).join(" ").replace(/\s+/g, " ").trim();
  if (resumo) {
    d.sobre = cortar(resumo, 1500);
    const frases = resumo.match(/[^.!?]+[.!?]+/g) ?? [resumo];
    let bio = "";
    for (const f of frases) {
      if ((bio + f).trim().length > 280) break;
      bio = (bio + f).trim();
      if (bio.length >= 120) break;
    }
    d.bio = bio || cortar(resumo, 280);
    if (d.bio.length > 280) d.bio = cortar(resumo, 280);
  }

  if (secoes.experiencia?.length) d.experiencias = lerExperiencias(secoes.experiencia);
  if (secoes.cursos?.length) d.certificados = lerCertificados(secoes.cursos);
  d.idiomas = secoes.idiomas?.length ? lerIdiomas(secoes.idiomas, false) : lerIdiomas(linhas, true);
  if (secoes.habilidades?.length) d.habilidades = lerHabilidades(secoes.habilidades);
  Object.assign(d, lerFormacao(secoes.formacao ?? [], tudo));
  return d;
}

function capitalizar(nome: string) {
  const minusculas = new Set(["da", "de", "do", "das", "dos", "e"]);
  return nome
    .toLowerCase()
    .split(/\s+/)
    .map((p, i) => (i > 0 && minusculas.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

/** Quantas informações foram reconhecidas (para dizer ao aluno se a leitura deu certo). */
export function quantasInformacoes(d: DadosCurriculo) {
  return (
    [d.nome, d.titulo, d.curso, d.semestre, d.conclusao, d.cidade, d.bio, d.whatsapp, d.email].filter(Boolean).length +
    Object.keys(d.links).length +
    d.habilidades.length +
    d.experiencias.length +
    d.certificados.length +
    d.idiomas.length
  );
}
