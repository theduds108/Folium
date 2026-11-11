"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CURSOS,
  MODALIDADES,
  NIVEIS_IDIOMA,
  REDES,
  SERVICOS,
  SERVICOS_POR_AREA,
  TIPOS_VAGA,
  linkPerfil,
  unsplash,
  type Aluno,
  type Certificado,
  type Experiencia,
  type Idioma,
  type Links,
} from "@/lib/data";
import { emailInstitucional } from "@/lib/config";
import { bancoLigado } from "@/lib/supabase";
import { ImgSegura, LinkSeguro } from "@/lib/arquivos";
import { prepararFoto } from "@/lib/validarFoto";
import { cadastrarEmpresas, enviarCurriculo, enviarFoto, meuPerfil, salvarPerfil } from "@/lib/repositorio";
import { sair, useSessao } from "@/lib/sessao";
import { RECURSOS, useConta } from "@/lib/conta";
import { SeloPlano } from "@/components/Area";
import { formatarPeriodo, mascaraAno, mascaraTelefone, telefoneValido } from "@/lib/formato";
import { CartaoAluno } from "@/components/CartaoAluno";
import { GRUPOS_SERVICOS } from "@/components/OpcoesServicos";
import { Seletor } from "@/components/Seletor";
import { Contador } from "@/components/Contador";
import { FotoEnquadrada } from "@/components/FotoEnquadrada";
import { EnquadrarFoto } from "@/components/EnquadrarFoto";
import { GuiaPrecos } from "@/components/GuiaPrecos";
import { BuscaEmpresa } from "@/components/BuscaEmpresa";
import { ImportarCurriculo } from "@/components/ImportarCurriculo";
import { mesmoTexto, type DadosCurriculo } from "@/lib/curriculo";
import { SalvoLottie } from "@/components/animacoes/SalvoLottie";

const CHAVE = "folium-rascunho-perfil";
/** Rascunho automático de quem está logado: guarda o que ainda não foi salvo no banco. */
const CHAVE_AUTO = "folium-autosave-perfil";
const CORES = ["#4F7A3A", "#B0673B", "#6B4A34", "#2F3E2A", "#C98A4B", "#7C8B5A"];
const MAX_GALERIA = 4;
const MAX_DESCRICAO = 1000;
const OUTRO = "__outro__";

type TrabalhoRascunho = {
  titulo: string;
  tipo: string;
  descricao: string;
  imagem: string;
  galeria: string[];
  cliente: string;
  ano: string;
  papel: string;
  link: string;
};

type Rascunho = {
  slug: string;
  nome: string;
  titulo: string;
  curso: string;
  semestre: number;
  conclusao: string;
  cidade: string;
  bio: string;
  sobre: string;
  servicos: string[];
  habilidades: string;
  valorReferencia: string;
  modalidades: string[];
  tiposVaga: string[];
  whatsapp: string;
  emailContato: string;
  links: Links;
  foto: string;
  curriculo: string;
  disponivel: boolean;
  publicado: boolean;
  trabalhos: TrabalhoRascunho[];
  experiencias: Experiencia[];
  certificados: Certificado[];
  idiomas: Idioma[];
};

const TRABALHO_VAZIO: TrabalhoRascunho = {
  titulo: "",
  tipo: SERVICOS[0],
  descricao: "",
  imagem: "",
  galeria: [],
  cliente: "",
  ano: "",
  papel: "",
  link: "",
};
const EXPERIENCIA_VAZIA: Experiencia = { cargo: "", lugar: "", periodo: "", descricao: "", inicio: "", fim: "", atual: false };
const CERTIFICADO_VAZIO: Certificado = { nome: "", instituicao: "", ano: "", link: "" };
const IDIOMA_VAZIO: Idioma = { idioma: "", nivel: NIVEIS_IDIOMA[1] };

const VAZIO: Rascunho = {
  slug: "",
  nome: "",
  titulo: "",
  curso: CURSOS[0],
  semestre: 1,
  conclusao: "",
  cidade: "Bauru, SP",
  bio: "",
  sobre: "",
  servicos: [],
  habilidades: "",
  valorReferencia: "",
  modalidades: [],
  tiposVaga: [],
  whatsapp: "",
  emailContato: "",
  links: {},
  foto: "",
  curriculo: "",
  disponivel: true,
  publicado: true,
  trabalhos: [TRABALHO_VAZIO],
  experiencias: [],
  certificados: [],
  idiomas: [],
};

/**
 * O portfólio é preenchido em fichas, uma por vez. As três primeiras são essenciais
 * (com elas o portfólio já pode ir ao ar); as outras "turbinam" o perfil quando o aluno quiser.
 */
const PASSOS = [
  { id: "voce", rotulo: "Você", tempo: "1 min", essencial: true, dica: "Quem é você e o que estuda. Uma foto ajuda muito." },
  { id: "obra", rotulo: "Sua obra", tempo: "2 min", essencial: true, dica: "Mostre um trabalho de que você se orgulha. Pode ser de aula." },
  { id: "contato", rotulo: "Como te contratar", tempo: "1 min", essencial: true, dica: "O que você oferece e por onde falam com você." },
  { id: "detalhes", rotulo: "Sobre mim", tempo: "2 min", essencial: false, dica: "Sua história, habilidades, valor e formatura." },
  { id: "experiencia", rotulo: "Experiência", tempo: "2 min", essencial: false, dica: "Estágio, freela, empresa júnior, monitoria, voluntariado. Tudo conta." },
  { id: "formacao", rotulo: "Cursos e idiomas", tempo: "1 min", essencial: false, dica: "Cursos livres, certificados, prêmios e idiomas." },
  { id: "links", rotulo: "Links e currículo", tempo: "1 min", essencial: false, dica: "Instagram, Behance, LinkedIn e um PDF para baixar." },
] as const;
type Passo = (typeof PASSOS)[number]["id"];

/** Quais fichas já têm o mínimo preenchido. */
function fichasFeitas(r: Rascunho): Record<Passo, boolean> {
  return {
    voce: preenchido(r.nome) && preenchido(r.curso),
    obra: r.trabalhos.some((t) => preenchido(t.titulo)),
    contato: r.servicos.length > 0 && (preenchido(r.whatsapp) || preenchido(r.emailContato)),
    detalhes: r.sobre.trim().length >= 120 || r.habilidades.split(",").filter((h) => h.trim()).length >= 3,
    experiencia: r.experiencias.some((e) => preenchido(e.cargo)),
    formacao: r.certificados.some((c) => preenchido(c.nome)) || r.idiomas.some((i) => preenchido(i.idioma)),
    links: Object.values(r.links).some((l) => l && preenchido(l)) || preenchido(r.curriculo),
  };
}

const preenchido = (s: string) => s.trim().length > 0;

/** Itens que contam para o "perfil completo", com a dica do que falta. */
function checklist(r: Rascunho) {
  return [
    { ok: preenchido(r.foto), dica: "Coloque uma foto de perfil" },
    { ok: preenchido(r.titulo), dica: "Escreva seu título profissional" },
    { ok: r.bio.trim().length >= 40, dica: "Escreva um resumo de pelo menos duas frases" },
    { ok: r.sobre.trim().length >= 120, dica: "Conte mais sobre você em \"Sobre mim\"" },
    { ok: r.servicos.length > 0, dica: "Escolha os serviços que você oferece" },
    { ok: r.habilidades.split(",").filter((h) => h.trim()).length >= 3, dica: "Liste pelo menos 3 habilidades" },
    { ok: r.trabalhos.filter((t) => preenchido(t.titulo)).length >= 2, dica: "Mostre pelo menos 2 trabalhos" },
    { ok: r.trabalhos.some((t) => preenchido(t.imagem)), dica: "Coloque imagem nos trabalhos" },
    { ok: r.experiencias.some((e) => preenchido(e.cargo)), dica: "Adicione uma experiência (estágio, freela, empresa júnior, extensão)" },
    { ok: r.certificados.some((c) => preenchido(c.nome)) || r.idiomas.some((i) => preenchido(i.idioma)), dica: "Adicione um curso ou idioma" },
    { ok: preenchido(r.whatsapp) || preenchido(r.emailContato), dica: "Coloque um contato" },
    { ok: Object.values(r.links).some((l) => l && preenchido(l)), dica: "Coloque um link (Instagram, Behance, LinkedIn…)" },
  ];
}

function paraAluno(r: Rascunho): Aluno {
  return {
    slug: r.slug || "previa",
    nome: r.nome || "Seu nome",
    titulo: r.titulo,
    curso: r.curso,
    semestre: r.semestre,
    cidade: r.cidade,
    bio: r.bio,
    servicos: r.servicos.length ? r.servicos : ["Escolha seus serviços"],
    habilidades: r.habilidades.split(",").map((h) => h.trim()).filter(Boolean),
    valorReferencia: r.valorReferencia,
    disponivel: r.disponivel,
    whatsapp: r.whatsapp,
    email: r.emailContato,
    foto: r.foto || undefined,
    trabalhos: r.trabalhos.map((t, i) => ({ ...t, imagem: t.imagem || undefined, cor: CORES[i % CORES.length]! })),
  };
}

export default function MeuPerfil() {
  const { usuario, carregando } = useSessao();
  const { conta, carregando: carregandoConta } = useConta();

  // Portfólio é a área do colaborador. Contratante tem o próprio painel.
  if (conta?.tipo === "contratante")
    return (
      <Aviso titulo="Sua conta é de contratante">
        <p className="suave">O portfólio é para alunos que oferecem trabalho. Para publicar vagas e ver quem se interessou, use o seu painel.</p>
        <Link href="/painel" className="botao botao-primario" style={{ width: "100%" }}>Ir para o meu painel</Link>
      </Aviso>
    );
  if (!bancoLigado) return <Editor modo="demo" />;
  if (carregando || (usuario && carregandoConta)) return <Aguarde texto="Carregando…" />;
  if (!usuario)
    return (
      <Aviso titulo="Entre para montar seu portfólio">
        <p className="suave">Entre com seu nome de usuário e senha. No primeiro acesso, use o e-mail institucional.</p>
        <Link href="/entrar" className="botao botao-primario" style={{ width: "100%" }}>Entrar</Link>
      </Aviso>
    );
  if (!emailInstitucional(usuario.email ?? ""))
    return (
      <Aviso titulo="Esse e-mail não é institucional">
        <p className="suave">
          Você entrou como <strong>{usuario.email}</strong>. Só alunos com e-mail da universidade podem criar portfólio.
        </p>
        <button className="botao botao-contorno" style={{ width: "100%" }} onClick={sair}>Sair e usar outro e-mail</button>
      </Aviso>
    );
  return <Editor modo="banco" userId={usuario.id} email={usuario.email ?? ""} />;
}

function Aguarde({ texto }: { texto: string }) {
  return (
    <div className="container">
      <div className="cartao pagina-estreita"><p className="suave" style={{ margin: 0 }}>{texto}</p></div>
    </div>
  );
}

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="cartao pagina-estreita">
        <h1 style={{ fontSize: "var(--t-tit-m)" }}>{titulo}</h1>
        {children}
      </div>
    </div>
  );
}

type PropsEditor = { modo: "demo" } | { modo: "banco"; userId: string; email: string };

function Editor(props: PropsEditor) {
  const { premium } = useConta();
  const MAX_TRABALHOS = RECURSOS.colaborador[premium ? "premium" : "gratis"].trabalhos;
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [pronto, setPronto] = useState(props.modo === "demo");
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  /** O perfil salvo não carregou: o editor fica fechado para ninguém salvar um formulário vazio por cima dele. */
  const [falhaCarga, setFalhaCarga] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [msgArquivo, setMsgArquivo] = useState<{ chave: string; tipo: "erro" | "aviso"; texto: string } | null>(null);
  const [cursoOutro, setCursoOutro] = useState(false);
  const [passo, setPasso] = useState<Passo>("voce");
  const [enquadrando, setEnquadrando] = useState(false);
  const [recuperado, setRecuperado] = useState(false);
  const [importado, setImportado] = useState(false);
  /** Texto (JSON) do último estado salvo no banco: serve para saber se há algo ainda não salvo. */
  const base = useRef("");
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const trocouPasso = useRef(false);
  const userId = props.modo === "banco" ? props.userId : "";
  const email = props.modo === "banco" ? props.email : "";
  const real = props.modo === "banco";
  const chaveAuto = `${CHAVE_AUTO}-${userId}`;

  useEffect(() => {
    if (props.modo === "demo") {
      try {
        const guardado = localStorage.getItem(CHAVE);
        if (guardado) {
          const g = JSON.parse(guardado);
          setCursoOutro(Boolean(g.curso) && !(CURSOS as readonly string[]).includes(g.curso));
          setR({ ...VAZIO, ...g, trabalhos: (g.trabalhos ?? [TRABALHO_VAZIO]).map((t: TrabalhoRascunho) => ({ ...TRABALHO_VAZIO, ...t })) });
        }
      } catch {
        /* sem acesso ao armazenamento: começa vazio */
      }
      return;
    }
    meuPerfil(userId)
      .then((p) => {
        if (p) {
          setCursoOutro(!(CURSOS as readonly string[]).includes(p.curso));
          setR({
            slug: p.slug,
            nome: p.nome,
            titulo: p.titulo ?? "",
            curso: p.curso,
            semestre: p.semestre,
            conclusao: p.conclusao ?? "",
            cidade: p.cidade,
            bio: p.bio,
            sobre: p.sobre_longo ?? "",
            servicos: p.servicos,
            habilidades: p.habilidades.join(", "),
            valorReferencia: p.valor_referencia,
            modalidades: p.modalidades ?? [],
            tiposVaga: p.tipos_vaga ?? [],
            whatsapp: mascaraTelefone(p.whatsapp),
            emailContato: p.email_contato,
            links: p.links ?? {},
            foto: p.foto_url ?? "",
            curriculo: p.curriculo_url ?? "",
            disponivel: p.disponivel,
            publicado: p.publicado,
            experiencias: p.experiencias ?? [],
            certificados: p.certificados ?? [],
            idiomas: p.idiomas ?? [],
            trabalhos: p.trabalhos?.length
              ? [...p.trabalhos].sort((a, b) => a.ordem - b.ordem).map((t) => ({
                  titulo: t.titulo,
                  tipo: t.tipo,
                  descricao: t.descricao,
                  imagem: t.imagem_url ?? "",
                  galeria: t.galeria ?? [],
                  cliente: t.cliente ?? "",
                  ano: t.ano ?? "",
                  papel: t.papel ?? "",
                  link: t.link ?? "",
                }))
              : [TRABALHO_VAZIO],
          });
        } else {
          setR({ ...VAZIO, emailContato: email });
        }
        setPronto(true);
      })
      .catch(() => {
        // Não abre o editor vazio: salvar por cima apagaria o portfólio e os trabalhos do banco.
        setFalhaCarga(true);
      });
  }, [props.modo, userId, email, tentativa]);

  const mudar = <K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) => {
    setR((atual) => ({ ...atual, [campo]: valor }));
    setSalvo(false);
  };

  const alternar = (campo: "servicos" | "modalidades" | "tiposVaga", valor: string) =>
    mudar(campo, r[campo].includes(valor) ? r[campo].filter((x) => x !== valor) : [...r[campo], valor]);

  const mudarTrabalho = (i: number, mudanca: Partial<TrabalhoRascunho>) => {
    setR((atual) => ({ ...atual, trabalhos: atual.trabalhos.map((t, j) => (j === i ? { ...t, ...mudanca } : t)) }));
    setSalvo(false);
  };

  /**
   * Sobe a imagem e devolve a URL, ou null se der erro. Problemas e avisos de foto aparecem
   * junto do campo que a pessoa usou (chave), não só no fim do formulário.
   */
  const subir = async (arquivo: File | undefined, chave: string, tipo: "imagem" | "pdf" | "documento" = "imagem") => {
    if (!arquivo) return null;
    setErro("");
    setMsgArquivo(null);
    setEnviando(chave);
    try {
      const pdf = tipo === "pdf" || (tipo === "documento" && arquivo.type === "application/pdf");
      if (!real) return await arquivoLocal(arquivo, (texto) => setMsgArquivo({ chave, tipo: "aviso", texto }));
      return pdf
        ? await enviarCurriculo(userId, arquivo)
        : await enviarFoto(userId, arquivo, (texto) => setMsgArquivo({ chave, tipo: "aviso", texto }));
    } catch (e) {
      setMsgArquivo({ chave, tipo: "erro", texto: (e as Error).message });
      return null;
    } finally {
      setEnviando(null);
    }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!real) {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(r));
      } catch {
        setErro("O navegador não tem espaço para tantas imagens no modo demonstração. Remova algumas e tente de novo.");
        return;
      }
      setSalvo(true);
      return;
    }
    if (r.nome.trim().length < 2 || !r.curso.trim()) {
      setErro("Falta seu nome e curso, na ficha \"Você\".");
      irPara("voce");
      return;
    }
    if (!telefoneValido(r.whatsapp)) {
      setErro("Confira o WhatsApp: use DDD + número, ex.: (14) 99123-4567.");
      irPara("contato");
      return;
    }
    if (!r.whatsapp.trim() && !r.emailContato.trim()) {
      setErro("Coloque pelo menos um contato: WhatsApp ou e-mail.");
      irPara("contato");
      return;
    }
    setSalvando(true);
    try {
      const limparLinks = Object.fromEntries(Object.entries(r.links).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v!.trim()]));
      const slug = await salvarPerfil(
        {
          id: userId,
          slug: r.slug || undefined,
          nome: r.nome.trim(),
          titulo: r.titulo.trim(),
          curso: r.curso,
          semestre: r.semestre,
          conclusao: r.conclusao.trim(),
          cidade: r.cidade.trim() || "Bauru, SP",
          bio: r.bio.trim(),
          sobre_longo: r.sobre.trim(),
          servicos: r.servicos,
          habilidades: r.habilidades.split(",").map((h) => h.trim()).filter(Boolean),
          valor_referencia: r.valorReferencia.trim(),
          modalidades: r.modalidades,
          tipos_vaga: r.tiposVaga,
          whatsapp: r.whatsapp.trim(),
          email_contato: r.emailContato.trim(),
          links: limparLinks,
          foto_url: r.foto || null,
          curriculo_url: r.curriculo || null,
          disponivel: r.disponivel,
          publicado: r.publicado,
          experiencias: r.experiencias
            .filter((x) => x.cargo.trim())
            .map((x) => ({ ...x, periodo: x.inicio || x.fim || x.atual ? formatarPeriodo(x.inicio, x.fim, x.atual) : x.periodo })),
          certificados: r.certificados.filter((x) => x.nome.trim()),
          idiomas: r.idiomas.filter((x) => x.idioma.trim()),
        },
        r.trabalhos.map((t, i) => ({
          titulo: t.titulo.trim(),
          tipo: t.tipo,
          descricao: t.descricao.trim(),
          imagem_url: t.imagem || null,
          ordem: i,
          cliente: t.cliente.trim(),
          ano: t.ano.trim(),
          papel: t.papel.trim(),
          link: t.link.trim(),
          galeria: t.galeria,
        }))
      );
      setR((atual) => ({ ...atual, slug }));
      base.current = JSON.stringify({ ...r, slug });
      setRecuperado(false);
      try {
        localStorage.removeItem(chaveAuto);
      } catch {
        /* sem acesso ao armazenamento */
      }
      setSalvo(true);
      cadastrarEmpresas(r.experiencias.map((x) => x.lugar)).catch(() => {});
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  // Quando o perfil do banco termina de carregar: guarda como "base" e, se havia
  // preenchimento não salvo (ex.: a pessoa saiu da página sem querer), traz de volta.
  useEffect(() => {
    if (!real || !pronto) return;
    base.current = JSON.stringify(r);
    try {
      const guardado = localStorage.getItem(chaveAuto);
      if (!guardado) return;
      const g = JSON.parse(guardado) as { r: Rascunho; passo?: Passo };
      if (JSON.stringify(g.r) === base.current) {
        localStorage.removeItem(chaveAuto);
        return;
      }
      setR({ ...VAZIO, ...g.r, trabalhos: (g.r.trabalhos ?? [TRABALHO_VAZIO]).map((t) => ({ ...TRABALHO_VAZIO, ...t })) });
      if (g.passo && PASSOS.some((p) => p.id === g.passo)) setPasso(g.passo);
      setRecuperado(true);
    } catch {
      /* sem acesso ao armazenamento: segue sem recuperar */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto, real]);

  // Guarda automaticamente (neste aparelho) tudo o que ainda não foi salvo no banco.
  useEffect(() => {
    if (!real || !pronto || !base.current) return;
    const atual = JSON.stringify(r);
    try {
      if (atual === base.current) localStorage.removeItem(chaveAuto);
      else localStorage.setItem(chaveAuto, JSON.stringify({ r, passo }));
    } catch {
      /* sem espaço ou sem acesso: o botão Salvar continua funcionando */
    }
  }, [r, passo, pronto, real, chaveAuto]);

  // Avisa antes de fechar a aba se houver algo não salvo.
  useEffect(() => {
    if (!real) return;
    const aviso = (e: BeforeUnloadEvent) => {
      if (base.current && JSON.stringify(r) !== base.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [r, real]);

  // Ao trocar de ficha, leva o foco (e a rolagem) para o título da nova ficha.
  useEffect(() => {
    if (!trocouPasso.current) return;
    const h = tituloRef.current;
    if (!h) return;
    h.focus({ preventScroll: true });
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    h.closest(".editor-form")?.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  }, [passo]);

  /** Aplica no rascunho o que o aluno marcou na leitura do currículo. Não salva: ele revisa e clica em Salvar. */
  const aplicarCurriculo = (d: DadosCurriculo, ok: Set<string>) => {
    setR((a) => {
      const n: Rascunho = { ...a, links: { ...a.links } };
      if (ok.has("nome") && d.nome) n.nome = d.nome;
      if (ok.has("titulo") && d.titulo) n.titulo = d.titulo.slice(0, 80);
      if (ok.has("curso") && d.curso) n.curso = d.curso;
      if (ok.has("semestre") && d.semestre) n.semestre = d.semestre;
      if (ok.has("conclusao") && d.conclusao) n.conclusao = d.conclusao;
      if (ok.has("cidade") && d.cidade) n.cidade = d.cidade;
      if (ok.has("bio") && d.bio) n.bio = d.bio.slice(0, 280);
      if (ok.has("sobre") && d.sobre) n.sobre = d.sobre.slice(0, 1500);
      if (ok.has("whatsapp") && d.whatsapp) n.whatsapp = d.whatsapp;
      if (ok.has("email") && d.email) n.emailContato = d.email;
      for (const rede of REDES) {
        const v = d.links[rede.chave];
        if (ok.has(`link-${rede.chave}`) && v) n.links[rede.chave] = v;
      }
      if (ok.has("habilidades") && d.habilidades.length) n.habilidades = d.habilidades.join(", ");
      if (ok.has("experiencias"))
        n.experiencias = [
          ...a.experiencias,
          ...d.experiencias.filter((x) => !a.experiencias.some((y) => mesmoTexto(y.cargo, x.cargo) && (mesmoTexto(y.lugar, x.lugar) || !y.lugar.trim() || !x.lugar.trim()))),
        ].slice(0, 10);
      if (ok.has("certificados"))
        n.certificados = [...a.certificados, ...d.certificados.filter((x) => !a.certificados.some((y) => mesmoTexto(y.nome, x.nome)))].slice(0, 15);
      if (ok.has("idiomas"))
        n.idiomas = [...a.idiomas, ...d.idiomas.filter((x) => !a.idiomas.some((y) => mesmoTexto(y.idioma, x.idioma)))].slice(0, 8);
      return n;
    });
    setCursoOutro(Boolean(d.curso) && ok.has("curso") ? !(CURSOS as readonly string[]).includes(d.curso!) : cursoOutro);
    setSalvo(false);
    setImportado(true);
    irPara("voce");
  };

  const irPara = (id: Passo) => {
    trocouPasso.current = true;
    setPasso(id);
  };

  if (falhaCarga)
    return (
      <Aviso titulo="Não consegui carregar seu portfólio">
        <p className="suave">Deve ter sido a internet. Nada foi apagado: confira a conexão e tente de novo.</p>
        <button
          className="botao botao-primario"
          style={{ width: "100%" }}
          onClick={() => {
            setFalhaCarga(false);
            setTentativa((t) => t + 1);
          }}
        >
          Tentar de novo
        </button>
      </Aviso>
    );
  if (!pronto) return <Aguarde texto="Carregando seu portfólio…" />;

  const feitas = fichasFeitas(r);
  const indice = PASSOS.findIndex((p) => p.id === passo);
  const anterior = PASSOS[indice - 1];
  const proximo = PASSOS[indice + 1];
  const essenciaisProntas = PASSOS.filter((p) => p.essencial).every((p) => feitas[p.id]);

  const itens = checklist(r);
  const feitos = itens.filter((i) => i.ok).length;
  const porcento = Math.round((feitos / itens.length) * 100);
  const faltam = itens.filter((i) => !i.ok).slice(0, 3);

  return (
    <div className="container editor">
      <form className="editor-form form" onSubmit={salvar}>
        <div className="cartao editor-topo">
          <div className="editor-topo-linha">
            <h1 style={{ fontSize: "var(--t-tit-m)", marginBottom: 4 }}>Meu portfólio</h1>
            <Link href="/planos" className="selo-plano-link" aria-label={`Plano ${premium ? "Premium" : "Grátis"}, ver planos`}>
              <SeloPlano premium={premium} />
            </Link>
          </div>
          <p className="suave" style={{ margin: 0 }}>
            {real ? <>Você entrou como <strong style={{ overflowWrap: "anywhere" }}>{email}</strong>. </> : null}
            Três fichas e seu portfólio já pode ir ao ar. O resto você turbina quando quiser.
          </p>
          {recuperado && (
            <div className="aviso recuperado" role="status">
              <span>Recuperamos o que você estava preenchendo e ainda não tinha salvo. Confira e clique em <strong>Salvar portfólio</strong>.</span>
              <button
                type="button"
                className="link-denuncia"
                onClick={() => {
                  try {
                    localStorage.removeItem(chaveAuto);
                  } catch {
                    /* ok */
                  }
                  if (base.current) setR(JSON.parse(base.current) as Rascunho);
                  setRecuperado(false);
                }}
              >
                Descartar e voltar ao salvo
              </button>
            </div>
          )}
          <div className="importar-faixa">
            <ImportarCurriculo
              atual={{
                nome: r.nome, titulo: r.titulo, curso: r.curso, semestre: r.semestre, conclusao: r.conclusao, cidade: r.cidade,
                bio: r.bio, sobre: r.sobre, habilidades: r.habilidades, whatsapp: r.whatsapp, emailContato: r.emailContato,
                links: r.links, nExperiencias: r.experiencias.length, nCertificados: r.certificados.length, nIdiomas: r.idiomas.length,
              }}
              onAplicar={aplicarCurriculo}
            />
            <span className="suave">Já tem currículo? A gente preenche as fichas para você conferir.</span>
          </div>
          {importado && (
            <div className="aviso recuperado" role="status">
              <span>Preenchemos as fichas com o seu currículo. <strong>Confira cada ficha</strong> e clique em <strong>Salvar portfólio</strong> quando estiver certo. Nada foi salvo ainda.</span>
              <button type="button" className="link-denuncia" onClick={() => setImportado(false)}>Entendi</button>
            </div>
          )}
          <Fichas atual={passo} feitas={feitas} onIr={irPara} />
        </div>

        {passo === "voce" && (
          <Ficha id="voce" titulo={tituloRef}>
          {(
            <div className="campo">
              Foto de perfil
              <div className="linha-arquivo">
                {r.foto ? (
                  <FotoEnquadrada src={unsplash(r.foto, 160)} className="miniatura redonda" />
                ) : null}
                <EscolherArquivo
                  rotulo={r.foto ? "Trocar foto" : "Escolher foto"}
                  enviando={enviando === "foto"}
                  onEscolher={async (f) => {
                    const url = await subir(f, "foto");
                    if (url) mudar("foto", url);
                  }}
                />
                {r.foto && (
                  <button type="button" className="botao botao-contorno botao-pequeno" onClick={() => setEnquadrando(true)}>
                    Ajustar enquadramento
                  </button>
                )}
                {r.foto && <button type="button" className="link-denuncia" onClick={() => mudar("foto", "")}>Remover</button>}
              </div>
              <MensagemArquivo msg={msgArquivo} chave="foto" />
              <span className="ajuda">JPG, PNG ou WebP, com pelo menos 300 px de lado e até 25 MB. Fotos grandes são reduzidas automaticamente.</span>
              <div className="dicas-foto">
                <span className="dicas-foto-titulo">Dicas para a foto</span>
                <ul>
                  <li>Prefira uma foto que mostre bem o seu rosto, para quem contrata reconhecer você.</li>
                  <li>Evite fotos no espelho, com filtro ou de longe.</li>
                  <li>Use luz natural e um fundo simples.</li>
                  <li>Apareça só você na foto, sem óculos escuros ou boné cobrindo o rosto.</li>
                </ul>
              </div>
            </div>
          )}
          <label className="campo">
            Nome
            <input value={r.nome} onChange={(e) => mudar("nome", e.target.value)} placeholder="Como quer aparecer" required minLength={2} maxLength={80} />
          </label>
          <div className="linha-dupla">
            <div className="campo">
              Curso
              <Seletor
                aria-label="Curso"
                valor={cursoOutro ? OUTRO : r.curso}
                onMudar={(v) => {
                  setCursoOutro(v === OUTRO);
                  mudar("curso", v === OUTRO ? "" : v);
                }}
                grupos={[{ opcoes: CURSOS }, { opcoes: [{ valor: OUTRO, rotulo: "Outro curso…" }] }]}
              />
              {cursoOutro && (
                <input value={r.curso} onChange={(e) => mudar("curso", e.target.value)} placeholder="Nome do seu curso" maxLength={80} required aria-label="Nome do seu curso" />
              )}
            </div>
            <div className="campo">
              Semestre atual
              <Contador aria-label="Semestre" valor={r.semestre} onMudar={(n) => mudar("semestre", n)} min={1} max={12} sufixo="º" />
            </div>
          </div>

          <label className="campo">
            Título profissional
            <input value={r.titulo} onChange={(e) => mudar("titulo", e.target.value)} maxLength={80} placeholder="Ex.: Designer gráfica e ilustradora" />
            <span className="ajuda">Aparece logo abaixo do seu nome. Diga o que você faz em poucas palavras.</span>
          </label>
          <label className="campo">
            Resumo
            <textarea value={r.bio} onChange={(e) => mudar("bio", e.target.value)} maxLength={280} rows={3} placeholder="Em duas frases: o que você faz e para quem." />
            <span className="ajuda">{r.bio.length}/280. Aparece no seu cartão na busca.</span>
          </label>
          </Ficha>
        )}

        {passo === "obra" && (
          <Ficha id="obra" titulo={tituloRef}>
          <p className="suave ajuda-secao">Projetos de aula, freelas, extensão, estágio. Um trabalho com imagem já basta para publicar; dá para somar outros depois.</p>
          {r.trabalhos.map((t, i) => (
            <div key={i} className="item-lista">
              <div className="item-lista-topo">
                <strong>Trabalho {i + 1}</strong>
                <div className="item-lista-acoes">
                  {i > 0 && (
                    <button type="button" className="link-denuncia" onClick={() => mudar("trabalhos", mover(r.trabalhos, i, -1))} aria-label={`Subir trabalho ${i + 1}`}>↑ subir</button>
                  )}
                  {r.trabalhos.length > 1 && (
                    <button type="button" className="link-denuncia" onClick={() => mudar("trabalhos", r.trabalhos.filter((_, j) => j !== i))}>Remover</button>
                  )}
                </div>
              </div>
              <div className="linha-dupla">
                <input className="entrada" value={t.titulo} onChange={(e) => mudarTrabalho(i, { titulo: e.target.value })} placeholder="Título do trabalho" maxLength={80} aria-label={`Título do trabalho ${i + 1}`} />
                <Seletor aria-label={`Tipo do trabalho ${i + 1}`} valor={t.tipo} onMudar={(v) => mudarTrabalho(i, { tipo: v })} grupos={GRUPOS_SERVICOS} />
              </div>
              <div className="linha-arquivo">
                  {[t.imagem, ...t.galeria].filter(Boolean).map((img, k) => (
                    <span key={img} className="miniatura-caixa">
                      <ImgSegura src={unsplash(img, 240)} alt="" className="miniatura" />
                      {k === 0 && <span className="miniatura-capa">capa</span>}
                      <button
                        type="button"
                        className="miniatura-x"
                        aria-label="Remover imagem"
                        onClick={() => {
                          const todas = [t.imagem, ...t.galeria].filter((x) => x && x !== img);
                          mudarTrabalho(i, { imagem: todas[0] ?? "", galeria: todas.slice(1) });
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {[t.imagem, ...t.galeria].filter(Boolean).length < MAX_GALERIA + 1 && (
                    <EscolherArquivo
                      rotulo={t.imagem ? "+ imagem" : "Adicionar imagem"}
                      enviando={enviando === `t${i}`}
                      onEscolher={async (f) => {
                        const url = await subir(f, `t${i}`);
                        if (!url) return;
                        setR((atual) => ({
                          ...atual,
                          trabalhos: atual.trabalhos.map((x, j) =>
                            j !== i ? x : x.imagem ? { ...x, galeria: [...x.galeria, url] } : { ...x, imagem: url }
                          ),
                        }));
                        setSalvo(false);
                      }}
                    />
                  )}
              </div>
              <MensagemArquivo msg={msgArquivo} chave={`t${i}`} />
              <label className="campo campo-pequeno">
                Conte sobre o trabalho
                <textarea className="entrada" rows={6} value={t.descricao} onChange={(e) => mudarTrabalho(i, { descricao: e.target.value })} placeholder="O que foi o trabalho, o problema que resolve, como foi feito e qual foi o resultado" maxLength={MAX_DESCRICAO} />
                <span className="ajuda">{t.descricao.length}/{MAX_DESCRICAO}. Pode usar parágrafos.</span>
              </label>
              <details className="mais-detalhes" open={Boolean(t.cliente || t.ano || t.papel || t.link)}>
                <summary>Mais detalhes (opcional): cliente, ano, sua parte, link</summary>
                <div className="mais-detalhes-corpo">
              <div className="linha-dupla">
                <input className="entrada" value={t.cliente} onChange={(e) => mudarTrabalho(i, { cliente: e.target.value })} placeholder="Cliente ou disciplina" maxLength={80} aria-label={`Cliente do trabalho ${i + 1}`} />
                <input className="entrada" value={t.ano} onChange={(e) => mudarTrabalho(i, { ano: mascaraAno(e.target.value) })} placeholder="Ano (ex.: 2025)" inputMode="numeric" aria-label={`Ano do trabalho ${i + 1}`} />
              </div>
              <input className="entrada" value={t.papel} onChange={(e) => mudarTrabalho(i, { papel: e.target.value })} placeholder="Se foi em grupo: o que você fez?" maxLength={120} aria-label={`Seu papel no trabalho ${i + 1}`} />
              <input className="entrada" value={t.link} onChange={(e) => mudarTrabalho(i, { link: e.target.value })} placeholder="Link (Behance, site no ar, vídeo, matéria publicada)" maxLength={300} aria-label={`Link do trabalho ${i + 1}`} />
                </div>
              </details>
            </div>
          ))}
          {r.trabalhos.length < MAX_TRABALHOS ? (
            <button type="button" className="botao botao-contorno botao-add" onClick={() => mudar("trabalhos", [...r.trabalhos, TRABALHO_VAZIO])}>
              + Adicionar trabalho
            </button>
          ) : (
            <span className="ajuda">
              {premium ? (
                <>Você chegou ao máximo de {MAX_TRABALHOS} trabalhos.</>
              ) : (
                <>O plano grátis permite até {MAX_TRABALHOS} trabalhos. <Link href="/planos">Com o Premium não há limite.</Link></>
              )}
            </span>
          )}
          </Ficha>
        )}

        {passo === "contato" && (
          <Ficha id="contato" titulo={tituloRef}>
          <fieldset className="campo">
            <legend>Serviços que você oferece</legend>
            <span className="ajuda">Abra uma área e marque o que você faz.</span>
            <div className="grupos-servicos">
              {SERVICOS_POR_AREA.map((g) => {
                const marcados = g.servicos.filter((x) => r.servicos.includes(x)).length;
                return (
                <details key={g.area} className="area-servicos" open={marcados > 0}>
                  <summary>
                    {g.area}
                    {marcados > 0 && <span className="area-servicos-n">{marcados} {marcados === 1 ? "marcado" : "marcados"}</span>}
                  </summary>
                  <div className="opcoes">
                    {g.servicos.map((s) => (
                      <label key={s} className="opcao">
                        <input type="checkbox" checked={r.servicos.includes(s)} onChange={() => alternar("servicos", s)} />
                        {s}
                      </label>
                    ))}
                  </div>
                </details>
                );
              })}
            </div>
          </fieldset>
          <label className="filtro-check">
            <input type="checkbox" checked={r.disponivel} onChange={(e) => mudar("disponivel", e.target.checked)} />
            Estou disponível para novos trabalhos
          </label>
          <div className="linha-dupla">
            <label className="campo">
              WhatsApp
              <input type="tel" inputMode="tel" value={r.whatsapp} onChange={(e) => mudar("whatsapp", mascaraTelefone(e.target.value))} placeholder="(14) 99999-0000" aria-invalid={!telefoneValido(r.whatsapp)} />
              {!telefoneValido(r.whatsapp) && <span className="erro">Use DDD + número, ex.: (14) 99123-4567</span>}
            </label>
            <label className="campo">
              E-mail de contato
              <input type="email" value={r.emailContato} onChange={(e) => mudar("emailContato", e.target.value)} placeholder="voce@exemplo.com" />
            </label>
          </div>
          {real && (
            <label className="filtro-check">
              <input type="checkbox" checked={r.publicado} onChange={(e) => mudar("publicado", e.target.checked)} />
              Mostrar meu portfólio na busca de talentos
            </label>
          )}
          </Ficha>
        )}

        {passo === "detalhes" && (
          <Ficha id="detalhes" titulo={tituloRef}>
          <label className="campo">
            Sobre mim (completo)
            <textarea value={r.sobre} onChange={(e) => mudar("sobre", e.target.value)} maxLength={1500} rows={6} placeholder="Como você começou, como gosta de trabalhar, que tipo de projeto te anima…" />
            <span className="ajuda">{r.sobre.length}/1500</span>
          </label>
          <label className="campo">
            Habilidades e ferramentas
            <input value={r.habilidades} onChange={(e) => mudar("habilidades", e.target.value)} placeholder="Figma, Lightroom, Redação…" />
            <span className="ajuda">Separe por vírgula.</span>
          </label>
          <label className="campo">
            Valor de referência
            <input value={r.valorReferencia} onChange={(e) => mudar("valorReferencia", e.target.value)} placeholder="A partir de R$ 150" />
            <span className="ajuda"><GuiaPrecos onUsar={(t) => mudar("valorReferencia", t)} /></span>
          </label>
          <fieldset className="campo">
            <legend>Tenho interesse em</legend>
            <div className="opcoes">
              {TIPOS_VAGA.map((t) => (
                <label key={t} className="opcao">
                  <input type="checkbox" checked={r.tiposVaga.includes(t)} onChange={() => alternar("tiposVaga", t)} />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="campo">
            <legend>Modalidade</legend>
            <div className="opcoes">
              {MODALIDADES.map((m) => (
                <label key={m} className="opcao">
                  <input type="checkbox" checked={r.modalidades.includes(m)} onChange={() => alternar("modalidades", m)} />
                  {m}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="linha-dupla">
            <label className="campo">
              Previsão de formatura
              <input type="month" value={/^\d{4}-\d{2}$/.test(r.conclusao) ? r.conclusao : ""} onChange={(e) => mudar("conclusao", e.target.value)} min="2020-01" max="2040-12" />
            </label>
            <label className="campo">
              Cidade
              <input value={r.cidade} onChange={(e) => mudar("cidade", e.target.value)} placeholder="Bauru, SP" />
            </label>
          </div>
          </Ficha>
        )}

        {passo === "experiencia" && (
          <Ficha id="experiencia" titulo={tituloRef}>
          <p className="suave ajuda-secao">Estágio, freela, empresa júnior, iniciação científica, monitoria, voluntariado. Tudo conta.</p>
          {r.experiencias.map((x, i) => (
            <div key={i} className="item-lista">
              <div className="item-lista-topo">
                <strong>Experiência {i + 1}</strong>
                <button type="button" className="link-denuncia" onClick={() => mudar("experiencias", r.experiencias.filter((_, j) => j !== i))}>Remover</button>
              </div>
              <div className="linha-dupla">
                <input className="entrada" value={x.cargo} onChange={(e) => mudar("experiencias", trocar(r.experiencias, i, { cargo: e.target.value }))} placeholder="Cargo ou função" maxLength={80} aria-label={`Cargo da experiência ${i + 1}`} />
                <BuscaEmpresa valor={x.lugar} onMudar={(nome) => mudar("experiencias", trocar(r.experiencias, i, { lugar: nome }))} rotulo={`Empresa da experiência ${i + 1}`} />
              </div>
              <div className="linha-dupla">
                <label className="campo campo-pequeno">
                  Início
                  <input type="month" value={x.inicio ?? ""} max={x.fim || undefined} onChange={(e) => mudar("experiencias", trocar(r.experiencias, i, { inicio: e.target.value }))} />
                </label>
                <label className="campo campo-pequeno">
                  Fim
                  <input type="month" value={x.atual ? "" : x.fim ?? ""} min={x.inicio || undefined} disabled={x.atual} onChange={(e) => mudar("experiencias", trocar(r.experiencias, i, { fim: e.target.value }))} />
                </label>
              </div>
              <label className="filtro-check">
                <input type="checkbox" checked={!!x.atual} onChange={(e) => mudar("experiencias", trocar(r.experiencias, i, { atual: e.target.checked, fim: e.target.checked ? "" : x.fim }))} />
                Ainda estou aqui
              </label>
              <textarea className="entrada" rows={2} value={x.descricao} onChange={(e) => mudar("experiencias", trocar(r.experiencias, i, { descricao: e.target.value }))} placeholder="O que você fazia e o que aprendeu" maxLength={300} aria-label={`Descrição da experiência ${i + 1}`} />
            </div>
          ))}
          {r.experiencias.length < 10 && (
            <button type="button" className="botao botao-contorno botao-add" onClick={() => mudar("experiencias", [...r.experiencias, EXPERIENCIA_VAZIA])}>
              + Adicionar experiência
            </button>
          )}
          </Ficha>
        )}

        {passo === "formacao" && (
          <Ficha id="formacao" titulo={tituloRef}>
          {r.certificados.map((c, i) => (
            <div key={i} className="item-lista">
              <div className="item-lista-topo">
                <strong>Curso {i + 1}</strong>
                <button type="button" className="link-denuncia" onClick={() => mudar("certificados", r.certificados.filter((_, j) => j !== i))}>Remover</button>
              </div>
              <div className="linha-dupla">
                <input className="entrada" value={c.nome} onChange={(e) => mudar("certificados", trocar(r.certificados, i, { nome: e.target.value }))} placeholder="Nome do curso ou prêmio" maxLength={100} aria-label={`Nome do curso ${i + 1}`} />
                <input className="entrada" value={c.instituicao} onChange={(e) => mudar("certificados", trocar(r.certificados, i, { instituicao: e.target.value }))} placeholder="Instituição" maxLength={80} aria-label={`Instituição do curso ${i + 1}`} />
              </div>
              <div className="linha-dupla">
                <input className="entrada" value={c.ano} onChange={(e) => mudar("certificados", trocar(r.certificados, i, { ano: mascaraAno(e.target.value) }))} placeholder="Ano (ex.: 2024)" inputMode="numeric" aria-label={`Ano do curso ${i + 1}`} />
                <input className="entrada" value={c.link ?? ""} onChange={(e) => mudar("certificados", trocar(r.certificados, i, { link: e.target.value }))} placeholder="Link do certificado (opcional)" maxLength={300} aria-label={`Link do certificado ${i + 1}`} />
              </div>
              {(
                <div className="linha-arquivo">
                  {c.arquivo && <LinkSeguro href={c.arquivo} target="_blank" rel="noopener noreferrer">Ver certificado anexado</LinkSeguro>}
                  <EscolherArquivo
                    rotulo={c.arquivo ? "Trocar arquivo" : "Anexar certificado (PDF ou imagem)"}
                    aceita="application/pdf,image/jpeg,image/png,image/webp"
                    enviando={enviando === `c${i}`}
                    onEscolher={async (f) => {
                      const url = await subir(f, `c${i}`, "documento");
                      if (url) setR((atual) => ({ ...atual, certificados: trocar(atual.certificados, i, { arquivo: url }) }));
                    }}
                  />
                  {c.arquivo && (
                    <button type="button" className="link-denuncia" onClick={() => mudar("certificados", trocar(r.certificados, i, { arquivo: "" }))}>Remover arquivo</button>
                  )}
                </div>
              )}
              <MensagemArquivo msg={msgArquivo} chave={`c${i}`} />
            </div>
          ))}
          {r.certificados.length < 15 && (
            <button type="button" className="botao botao-contorno botao-add" onClick={() => mudar("certificados", [...r.certificados, CERTIFICADO_VAZIO])}>
              + Adicionar curso ou certificado
            </button>
          )}

          <h3 style={{ marginTop: 8 }}>Idiomas</h3>
          {r.idiomas.map((x, i) => (
            <div key={i} className="linha-idioma">
              <input className="entrada" value={x.idioma} onChange={(e) => mudar("idiomas", trocar(r.idiomas, i, { idioma: e.target.value }))} placeholder="Idioma" maxLength={30} aria-label={`Idioma ${i + 1}`} />
              <Seletor aria-label={`Nível do idioma ${i + 1}`} valor={x.nivel} onMudar={(v) => mudar("idiomas", trocar(r.idiomas, i, { nivel: v }))} grupos={[{ opcoes: NIVEIS_IDIOMA }]} />
              <button type="button" className="link-denuncia" onClick={() => mudar("idiomas", r.idiomas.filter((_, j) => j !== i))}>Remover</button>
            </div>
          ))}
          {r.idiomas.length < 8 && (
            <button type="button" className="botao botao-contorno botao-add" onClick={() => mudar("idiomas", [...r.idiomas, IDIOMA_VAZIO])}>
              + Adicionar idioma
            </button>
          )}
          </Ficha>
        )}

        {passo === "links" && (
          <Ficha id="links" titulo={tituloRef}>
          {REDES.map((rede) => (
            <label key={rede.chave} className="campo">
              {rede.rotulo}
              <input
                value={r.links[rede.chave] ?? ""}
                onChange={(e) => mudar("links", { ...r.links, [rede.chave]: e.target.value })}
                placeholder={rede.exemplo}
                maxLength={200}
              />
            </label>
          ))}
          {(
            <div className="campo">
              Currículo em PDF (opcional)
              <div className="linha-arquivo">
                {r.curriculo && <LinkSeguro href={r.curriculo} target="_blank" rel="noopener noreferrer">Ver currículo enviado</LinkSeguro>}
                <EscolherArquivo
                  rotulo={r.curriculo ? "Trocar PDF" : "Enviar PDF"}
                  aceita="application/pdf"
                  enviando={enviando === "cv"}
                  onEscolher={async (f) => {
                    const url = await subir(f, "cv", "pdf");
                    if (url) mudar("curriculo", url);
                  }}
                />
                {r.curriculo && <button type="button" className="link-denuncia" onClick={() => mudar("curriculo", "")}>Remover</button>}
              </div>
              <MensagemArquivo msg={msgArquivo} chave="cv" />
              <span className="ajuda">Até 3 MB. Quem visitar seu portfólio poderá baixar.</span>
            </div>
          )}
          </Ficha>
        )}

        {enquadrando && r.foto && (
          <EnquadrarFoto
            foto={r.foto}
            exibir={(src) => unsplash(src, 900)}
            onSalvar={(novo) => mudar("foto", novo)}
            onFechar={() => setEnquadrando(false)}
          />
        )}

        <nav className="fichas-nav" aria-label="Navegar entre as fichas">
          {anterior ? (
            <button type="button" className="botao botao-contorno" onClick={() => irPara(anterior.id)}>← {anterior.rotulo}</button>
          ) : <span />}
          {proximo && (
            <button type="button" className={proximo.essencial ? "botao botao-verde" : "botao botao-contorno"} onClick={() => irPara(proximo.id)}>
              {proximo.essencial ? `Próxima: ${proximo.rotulo} →` : `Turbinar: ${proximo.rotulo} →`}
            </button>
          )}
        </nav>

        <div className="cartao barra-salvar">
          {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
          <div className="barra-salvar-linha">
            <button className="botao botao-primario" type="submit" disabled={salvando || enviando !== null}>
              {salvando ? "Salvando…" : real ? "Salvar portfólio" : "Salvar rascunho"}
            </button>
            <span role="status" aria-live="polite">
              {salvo && (
                <span className="salvo confirmacao" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <SalvoLottie />
                  {real ? "Portfólio salvo" : "Rascunho salvo neste aparelho"}
                </span>
              )}
            </span>
            {real && (
              <span className="barra-salvar-extra">
                {r.slug && <Link href={linkPerfil({ slug: r.slug, real: true })} className="link-mao">ver meu portfólio →</Link>}
                <Link href="/senha" className="link-texto" style={{ fontSize: "var(--t-sec)" }}>usuário e senha</Link>
                <button type="button" className="botao botao-contorno botao-pequeno botao-sair" onClick={sair}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M6 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H6M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sair da conta
                </button>
              </span>
            )}
          </div>
          {salvo && essenciaisProntas && PASSOS[indice]?.essencial && (
            <p className="turbinar">
              Portfólio no ar! Quando quiser, <button type="button" className="link-mao" onClick={() => irPara("detalhes")}>turbine com mais fichas →</button>
            </p>
          )}
        </div>
      </form>

      <aside className="editor-previa">
        <div className="cartao medidor">
          <div className="medidor-topo">
            <strong>Portfólio {porcento}% completo</strong>
            <span className="suave">{feitos}/{itens.length}</span>
          </div>
          <div className="medidor-barra" role="progressbar" aria-valuenow={porcento} aria-valuemin={0} aria-valuemax={100} aria-label="Portfólio completo">
            <span style={{ width: `${porcento}%` }} />
          </div>
          {faltam.length > 0 ? (
            <ul className="medidor-dicas">
              {faltam.map((f) => <li key={f.dica}>{f.dica}</li>)}
            </ul>
          ) : (
            <p className="salvo" style={{ margin: "10px 0 0" }}>Tudo preenchido. Seu portfólio está pronto para brilhar.</p>
          )}
        </div>
        <p className="suave" style={{ fontWeight: 600, margin: "20px 0 8px" }}>Prévia do seu cartão</p>
        <div style={{ maxWidth: 360, pointerEvents: "none" }}>
          <CartaoAluno aluno={paraAluno(r)} semLink />
        </div>
      </aside>
    </div>
  );
}

/**
 * Modo demonstração: guarda a imagem no próprio aparelho (reduzida para caber no navegador).
 * PDFs abrem só nesta aba, porque não há onde guardar.
 */
async function arquivoLocal(arquivo: File, aoAvisar?: (aviso: string) => void): Promise<string> {
  if (arquivo.type === "application/pdf") return URL.createObjectURL(arquivo);
  // Mesma validação do envio real, com imagens menores para caber no navegador.
  const { blob, aviso } = await prepararFoto(arquivo, 900);
  if (aviso) aoAvisar?.(aviso);
  return await new Promise<string>((ok, falhou) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(String(leitor.result));
    leitor.onerror = () => falhou(new Error("Não consegui ler a imagem. Escolha outra."));
    leitor.readAsDataURL(blob);
  });
}

/** Aviso ou erro de um envio de arquivo, logo abaixo do campo. */
function MensagemArquivo({ msg, chave }: { msg: { chave: string; tipo: "erro" | "aviso"; texto: string } | null; chave: string }) {
  if (!msg || msg.chave !== chave) return null;
  return (
    <p className={msg.tipo === "erro" ? "erro aviso-arquivo" : "aviso-arquivo aviso-arquivo-info"} role={msg.tipo === "erro" ? "alert" : "status"}>
      {msg.tipo === "erro" ? "Não foi possível enviar: " : "Aviso: "}
      {msg.texto}
    </p>
  );
}

function trocar<T>(lista: T[], i: number, mudanca: Partial<T>): T[] {
  return lista.map((x, j) => (j === i ? { ...x, ...mudanca } : x));
}

function mover<T>(lista: T[], i: number, direcao: -1 | 1): T[] {
  const nova = [...lista];
  const j = i + direcao;
  if (j < 0 || j >= nova.length) return nova;
  [nova[i], nova[j]] = [nova[j]!, nova[i]!];
  return nova;
}

function EscolherArquivo({
  rotulo,
  enviando,
  onEscolher,
  aceita = "image/*",
}: {
  rotulo: string;
  enviando: boolean;
  onEscolher: (f: File | undefined) => void;
  aceita?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={aceita}
        hidden
        onChange={(e) => {
          onEscolher(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button type="button" className="botao botao-contorno botao-pequeno" disabled={enviando} onClick={() => ref.current?.click()}>
        {enviando ? "Enviando…" : rotulo}
      </button>
    </>
  );
}

/** Fichas do editor, como abas de arquivo: essenciais primeiro, opcionais depois. */
function Fichas({ atual, feitas, onIr }: { atual: Passo; feitas: Record<Passo, boolean>; onIr: (id: Passo) => void }) {
  const grupo = (essencial: boolean) =>
    PASSOS.filter((p) => p.essencial === essencial).map((p) => {
      const n = PASSOS.indexOf(p) + 1;
      return (
        <li key={p.id}>
          <button
            type="button"
            className={`ficha-aba${p.id === atual ? " atual" : ""}${feitas[p.id] ? " feita" : ""}`}
            aria-current={p.id === atual ? "step" : undefined}
            onClick={() => onIr(p.id)}
          >
            <span className="ficha-aba-n" aria-hidden="true">{feitas[p.id] ? "✓" : String(n).padStart(2, "0")}</span>
            <span className="ficha-aba-rotulo">{p.rotulo}</span>
            <span className="visualmente-oculto">{feitas[p.id] ? " (feita)" : " (a fazer)"}</span>
          </button>
        </li>
      );
    });
  const essenciais = PASSOS.filter((p) => p.essencial);
  const prontas = essenciais.filter((p) => feitas[p.id]).length;
  return (
    <div className="fichas">
      <div className="fichas-grupo">
        <span className="fichas-grupo-rotulo">Para publicar · {prontas} de {essenciais.length}</span>
        <ol>{grupo(true)}</ol>
      </div>
      <div className="fichas-grupo">
        <span className="fichas-grupo-rotulo">Turbinar depois · opcional</span>
        <ol>{grupo(false)}</ol>
      </div>
    </div>
  );
}

/** Uma ficha do editor: cabeçalho com número, tempo estimado e dica, e os campos daquela etapa. */
function Ficha({ id, titulo, children }: { id: Passo; titulo: React.Ref<HTMLHeadingElement>; children: React.ReactNode }) {
  const p = PASSOS.find((x) => x.id === id)!;
  const n = PASSOS.indexOf(p) + 1;
  const total = PASSOS.filter((x) => x.essencial === p.essencial).length;
  const posicao = PASSOS.filter((x) => x.essencial === p.essencial).indexOf(p) + 1;
  return (
    <section id={id} className="cartao secao-editor ficha-editor" aria-labelledby={`${id}-titulo`}>
      <div className="ficha-editor-topo">
        <span className="ficha-editor-n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
        <span className="rotulos">
          <span>{p.essencial ? `Essencial · ${posicao} de ${total}` : "Opcional"} · ~{p.tempo}</span>
        </span>
      </div>
      <h2 id={`${id}-titulo`} ref={titulo} tabIndex={-1}>{p.rotulo}</h2>
      <p className="anotacao-ficha">{p.dica}</p>
      {children}
    </section>
  );
}
