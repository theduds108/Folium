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
import { cadastrarEmpresas, enviarCurriculo, enviarFoto, meuPerfil, salvarPerfil } from "@/lib/repositorio";
import { sair, useSessao } from "@/lib/sessao";
import { formatarPeriodo, mascaraAno, mascaraTelefone, telefoneValido } from "@/lib/formato";
import { CartaoAluno } from "@/components/CartaoAluno";
import { OpcoesServicos } from "@/components/OpcoesServicos";
import { BuscaEmpresa } from "@/components/BuscaEmpresa";
import { SalvoLottie } from "@/components/animacoes/SalvoLottie";

const CHAVE = "folium-rascunho-perfil";
const CORES = ["#4F7A3A", "#B0673B", "#6B4A34", "#2F3E2A", "#C98A4B", "#7C8B5A"];
const MAX_TRABALHOS = 6;
const MAX_GALERIA = 4;
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

const SECOES = [
  { id: "basico", rotulo: "Básico" },
  { id: "sobre", rotulo: "Sobre mim" },
  { id: "trabalhos", rotulo: "Trabalhos" },
  { id: "experiencia", rotulo: "Experiência" },
  { id: "formacao", rotulo: "Cursos e idiomas" },
  { id: "contato", rotulo: "Contato e links" },
];

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

  if (!bancoLigado) return <Editor modo="demo" />;
  if (carregando) return <Aguarde texto="Carregando…" />;
  if (!usuario)
    return (
      <Aviso titulo="Entre para montar seu portfólio">
        <p className="suave">Use seu e-mail institucional. Mandamos um link de acesso, sem senha.</p>
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
        <h1 style={{ fontSize: "1.9rem" }}>{titulo}</h1>
        {children}
      </div>
    </div>
  );
}

type PropsEditor = { modo: "demo" } | { modo: "banco"; userId: string; email: string };

function Editor(props: PropsEditor) {
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [pronto, setPronto] = useState(props.modo === "demo");
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [cursoOutro, setCursoOutro] = useState(false);
  const userId = props.modo === "banco" ? props.userId : "";
  const email = props.modo === "banco" ? props.email : "";
  const real = props.modo === "banco";

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
        setErro("Não consegui carregar seu perfil. Confira a internet e recarregue a página.");
        setPronto(true);
      });
  }, [props.modo, userId, email]);

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

  /** Sobe a imagem e devolve a URL, ou null se der erro (o erro aparece no formulário). */
  const subir = async (arquivo: File | undefined, chave: string, tipo: "imagem" | "pdf" | "documento" = "imagem") => {
    if (!arquivo) return null;
    setErro("");
    setEnviando(chave);
    try {
      if (!real) return await arquivoLocal(arquivo);
      const pdf = tipo === "pdf" || (tipo === "documento" && arquivo.type === "application/pdf");
      return pdf ? await enviarCurriculo(userId, arquivo) : await enviarFoto(userId, arquivo);
    } catch (e) {
      setErro((e as Error).message);
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
    if (!telefoneValido(r.whatsapp)) {
      setErro("Confira o WhatsApp: use DDD + número, ex.: (14) 99123-4567.");
      document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!r.whatsapp.trim() && !r.emailContato.trim()) {
      setErro("Coloque pelo menos um contato: WhatsApp ou e-mail.");
      document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
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
      setSalvo(true);
      cadastrarEmpresas(r.experiencias.map((x) => x.lugar)).catch(() => {});
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  if (!pronto) return <Aguarde texto="Carregando seu portfólio…" />;

  const itens = checklist(r);
  const feitos = itens.filter((i) => i.ok).length;
  const porcento = Math.round((feitos / itens.length) * 100);
  const faltam = itens.filter((i) => !i.ok).slice(0, 3);

  return (
    <div className="container editor">
      <form className="editor-form form" onSubmit={salvar}>
        <div className="cartao editor-topo">
          <h1 style={{ fontSize: "1.9rem", marginBottom: 4 }}>Meu portfólio</h1>
          <p className="suave" style={{ margin: 0 }}>
            {real ? <>Você entrou como <strong>{email}</strong>. </> : null}
            Quanto mais completo, mais fácil alguém te contratar.
          </p>
          <nav className="editor-indice" aria-label="Seções do portfólio">
            {SECOES.map((s) => (
              <a key={s.id} href={`#${s.id}`}>{s.rotulo}</a>
            ))}
          </nav>
        </div>

        {/* Básico */}
        <section id="basico" className="cartao secao-editor">
          <h2>Básico</h2>
          {(
            <div className="campo">
              Foto de perfil
              <div className="linha-arquivo">
                {r.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={unsplash(r.foto, 160)} alt="" width={64} height={64} className="miniatura redonda" />
                ) : null}
                <EscolherArquivo
                  rotulo={r.foto ? "Trocar foto" : "Escolher foto"}
                  enviando={enviando === "foto"}
                  onEscolher={async (f) => {
                    const url = await subir(f, "foto");
                    if (url) mudar("foto", url);
                  }}
                />
                {r.foto && <button type="button" className="link-denuncia" onClick={() => mudar("foto", "")}>Remover</button>}
              </div>
            </div>
          )}

          <label className="campo">
            Nome
            <input value={r.nome} onChange={(e) => mudar("nome", e.target.value)} placeholder="Como quer aparecer" required minLength={2} maxLength={80} />
          </label>

          <label className="campo">
            Título profissional
            <input value={r.titulo} onChange={(e) => mudar("titulo", e.target.value)} maxLength={80} placeholder="Ex.: Designer gráfica e ilustradora" />
            <span className="ajuda">Aparece logo abaixo do seu nome. Diga o que você faz em poucas palavras.</span>
          </label>

          <div className="linha-dupla">
            <label className="campo">
              Curso
              <select
                value={cursoOutro ? OUTRO : r.curso}
                onChange={(e) => {
                  const v = e.target.value;
                  setCursoOutro(v === OUTRO);
                  mudar("curso", v === OUTRO ? "" : v);
                }}
              >
                {CURSOS.map((c) => <option key={c}>{c}</option>)}
                <option value={OUTRO}>Outro curso…</option>
              </select>
              {cursoOutro && (
                <input value={r.curso} onChange={(e) => mudar("curso", e.target.value)} placeholder="Nome do seu curso" maxLength={80} required aria-label="Nome do seu curso" />
              )}
            </label>
            <label className="campo">
              Semestre
              <input type="number" min={1} max={12} value={r.semestre} onChange={(e) => mudar("semestre", Math.min(12, Math.max(1, Number(e.target.value) || 1)))} />
            </label>
          </div>

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
        </section>

        {/* Sobre */}
        <section id="sobre" className="cartao secao-editor">
          <h2>Sobre mim</h2>
          <label className="campo">
            Resumo
            <textarea value={r.bio} onChange={(e) => mudar("bio", e.target.value)} maxLength={280} rows={3} placeholder="Em duas frases: o que você faz e para quem." />
            <span className="ajuda">{r.bio.length}/280. Aparece no seu cartão na busca.</span>
          </label>
          <label className="campo">
            Sobre mim (completo)
            <textarea value={r.sobre} onChange={(e) => mudar("sobre", e.target.value)} maxLength={1500} rows={6} placeholder="Como você começou, como gosta de trabalhar, que tipo de projeto te anima…" />
            <span className="ajuda">{r.sobre.length}/1500</span>
          </label>

          <fieldset className="campo">
            <legend>Serviços que você oferece</legend>
            <div className="grupos-servicos">
              {SERVICOS_POR_AREA.map((g) => (
                <div key={g.area}>
                  <span className="grupo-servicos-titulo">{g.area}</span>
                  <div className="opcoes">
                    {g.servicos.map((s) => (
                      <label key={s} className="opcao">
                        <input type="checkbox" checked={r.servicos.includes(s)} onChange={() => alternar("servicos", s)} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <label className="campo">
            Habilidades e ferramentas
            <input value={r.habilidades} onChange={(e) => mudar("habilidades", e.target.value)} placeholder="Figma, Lightroom, Redação…" />
            <span className="ajuda">Separe por vírgula.</span>
          </label>

          <label className="campo">
            Valor de referência
            <input value={r.valorReferencia} onChange={(e) => mudar("valorReferencia", e.target.value)} placeholder="A partir de R$ 150" />
            <span className="ajuda"><Link href="/guia#precos">Não sabe quanto cobrar? Veja o guia.</Link></span>
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

          <label className="filtro-check">
            <input type="checkbox" checked={r.disponivel} onChange={(e) => mudar("disponivel", e.target.checked)} />
            Estou disponível para novos trabalhos
          </label>
        </section>

        {/* Trabalhos */}
        <section id="trabalhos" className="cartao secao-editor">
          <h2>Trabalhos</h2>
          <p className="suave ajuda-secao">Projetos de aula, freelas, extensão, estágio. Conte para quem foi e o que você fez.</p>
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
                <select className="entrada" value={t.tipo} onChange={(e) => mudarTrabalho(i, { tipo: e.target.value })} aria-label={`Tipo do trabalho ${i + 1}`}>
                  <OpcoesServicos />
                </select>
              </div>
              <div className="linha-dupla">
                <input className="entrada" value={t.cliente} onChange={(e) => mudarTrabalho(i, { cliente: e.target.value })} placeholder="Cliente ou disciplina" maxLength={80} aria-label={`Cliente do trabalho ${i + 1}`} />
                <input className="entrada" value={t.ano} onChange={(e) => mudarTrabalho(i, { ano: mascaraAno(e.target.value) })} placeholder="Ano (ex.: 2025)" inputMode="numeric" aria-label={`Ano do trabalho ${i + 1}`} />
              </div>
              <textarea className="entrada" rows={2} value={t.descricao} onChange={(e) => mudarTrabalho(i, { descricao: e.target.value })} placeholder="O que foi o trabalho e qual foi o resultado" maxLength={200} aria-label={`Descrição do trabalho ${i + 1}`} />
              <input className="entrada" value={t.papel} onChange={(e) => mudarTrabalho(i, { papel: e.target.value })} placeholder="Se foi em grupo: o que você fez?" maxLength={120} aria-label={`Seu papel no trabalho ${i + 1}`} />
              <input className="entrada" value={t.link} onChange={(e) => mudarTrabalho(i, { link: e.target.value })} placeholder="Link (Behance, site no ar, vídeo, matéria publicada)" maxLength={300} aria-label={`Link do trabalho ${i + 1}`} />
              {(
                <div className="linha-arquivo">
                  {[t.imagem, ...t.galeria].filter(Boolean).map((img, k) => (
                    <span key={img} className="miniatura-caixa">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={unsplash(img, 240)} alt="" className="miniatura" />
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
              )}
            </div>
          ))}
          {r.trabalhos.length < MAX_TRABALHOS ? (
            <button type="button" className="botao botao-contorno botao-add" onClick={() => mudar("trabalhos", [...r.trabalhos, TRABALHO_VAZIO])}>
              + Adicionar trabalho
            </button>
          ) : (
            <span className="ajuda">O plano grátis permite até {MAX_TRABALHOS} trabalhos.</span>
          )}
        </section>

        {/* Experiência */}
        <section id="experiencia" className="cartao secao-editor">
          <h2>Experiência</h2>
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
        </section>

        {/* Formação */}
        <section id="formacao" className="cartao secao-editor">
          <h2>Cursos, certificados e idiomas</h2>
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
                  {c.arquivo && <a href={c.arquivo} target="_blank" rel="noopener noreferrer">Ver certificado anexado</a>}
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
              <select className="entrada" value={x.nivel} onChange={(e) => mudar("idiomas", trocar(r.idiomas, i, { nivel: e.target.value }))} aria-label={`Nível do idioma ${i + 1}`}>
                {NIVEIS_IDIOMA.map((n) => <option key={n}>{n}</option>)}
              </select>
              <button type="button" className="link-denuncia" onClick={() => mudar("idiomas", r.idiomas.filter((_, j) => j !== i))}>Remover</button>
            </div>
          ))}
          {r.idiomas.length < 8 && (
            <button type="button" className="botao botao-contorno botao-add" onClick={() => mudar("idiomas", [...r.idiomas, IDIOMA_VAZIO])}>
              + Adicionar idioma
            </button>
          )}
        </section>

        {/* Contato */}
        <section id="contato" className="cartao secao-editor">
          <h2>Contato e links</h2>
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
                {r.curriculo && <a href={r.curriculo} target="_blank" rel="noopener noreferrer">Ver currículo enviado</a>}
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
              <span className="ajuda">Até 3 MB. Quem visitar seu portfólio poderá baixar.</span>
            </div>
          )}
          {real && (
            <label className="filtro-check">
              <input type="checkbox" checked={r.publicado} onChange={(e) => mudar("publicado", e.target.checked)} />
              Mostrar meu portfólio na busca de talentos
            </label>
          )}
        </section>

        <div className="cartao barra-salvar">
          {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button className="botao botao-primario" type="submit" disabled={salvando || enviando !== null}>
              {salvando ? "Salvando…" : real ? "Salvar portfólio" : "Salvar rascunho"}
            </button>
            {salvo && (
              <span className="salvo" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <SalvoLottie />
                {real ? "Portfólio salvo" : "Rascunho salvo neste aparelho"}
              </span>
            )}
          </div>
          {real && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              {r.slug && <Link href={linkPerfil({ slug: r.slug, real: true })} className="link-mao">ver meu portfólio público →</Link>}
              <button type="button" className="link-denuncia" onClick={sair}>Sair da conta</button>
            </div>
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
          <CartaoAluno aluno={paraAluno(r)} />
        </div>
      </aside>
    </div>
  );
}

/**
 * Modo demonstração: guarda a imagem no próprio aparelho (reduzida para caber no navegador).
 * PDFs abrem só nesta aba, porque não há onde guardar.
 */
async function arquivoLocal(arquivo: File): Promise<string> {
  if (arquivo.type === "application/pdf") return URL.createObjectURL(arquivo);
  if (!arquivo.type.startsWith("image/")) throw new Error("Use uma imagem JPG, PNG ou WebP.");
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.75);
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
  aceita = "image/jpeg,image/png,image/webp",
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
