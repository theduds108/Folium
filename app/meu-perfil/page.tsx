"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CURSOS, SERVICOS, linkPerfil, unsplash, type Aluno } from "@/lib/data";
import { emailInstitucional } from "@/lib/config";
import { bancoLigado } from "@/lib/supabase";
import { enviarFoto, meuPerfil, salvarPerfil } from "@/lib/repositorio";
import { sair, useSessao } from "@/lib/sessao";
import { CartaoAluno } from "@/components/CartaoAluno";
import { SalvoLottie } from "@/components/animacoes/SalvoLottie";

const CHAVE = "folium-rascunho-perfil";
const CORES = ["#4F7A3A", "#B0673B", "#6B4A34", "#2F3E2A", "#C98A4B", "#7C8B5A"];
const MAX_TRABALHOS = 6;

type TrabalhoRascunho = { titulo: string; tipo: string; descricao: string; imagem: string };

type Rascunho = {
  slug: string;
  nome: string;
  curso: string;
  semestre: number;
  cidade: string;
  bio: string;
  servicos: string[];
  habilidades: string;
  valorReferencia: string;
  whatsapp: string;
  emailContato: string;
  foto: string;
  disponivel: boolean;
  publicado: boolean;
  trabalhos: TrabalhoRascunho[];
};

const TRABALHO_VAZIO: TrabalhoRascunho = { titulo: "", tipo: SERVICOS[0], descricao: "", imagem: "" };

const VAZIO: Rascunho = {
  slug: "",
  nome: "",
  curso: CURSOS[0],
  semestre: 1,
  cidade: "Bauru, SP",
  bio: "",
  servicos: [],
  habilidades: "",
  valorReferencia: "",
  whatsapp: "",
  emailContato: "",
  foto: "",
  disponivel: true,
  publicado: true,
  trabalhos: [TRABALHO_VAZIO],
};

function paraAluno(r: Rascunho): Aluno {
  return {
    slug: r.slug || "previa",
    nome: r.nome || "Seu nome",
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
  const [enviandoFoto, setEnviandoFoto] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const userId = props.modo === "banco" ? props.userId : "";
  const email = props.modo === "banco" ? props.email : "";

  useEffect(() => {
    if (props.modo === "demo") {
      try {
        const guardado = localStorage.getItem(CHAVE);
        if (guardado) setR({ ...VAZIO, ...JSON.parse(guardado) });
      } catch {
        /* sem acesso ao armazenamento: começa vazio */
      }
      return;
    }
    meuPerfil(userId)
      .then((p) => {
        if (p) {
          setR({
            slug: p.slug,
            nome: p.nome,
            curso: p.curso,
            semestre: p.semestre,
            cidade: p.cidade,
            bio: p.bio,
            servicos: p.servicos,
            habilidades: p.habilidades.join(", "),
            valorReferencia: p.valor_referencia,
            whatsapp: p.whatsapp,
            emailContato: p.email_contato,
            foto: p.foto_url ?? "",
            disponivel: p.disponivel,
            publicado: p.publicado,
            trabalhos: p.trabalhos?.length
              ? [...p.trabalhos].sort((a, b) => a.ordem - b.ordem).map((t) => ({
                  titulo: t.titulo,
                  tipo: t.tipo,
                  descricao: t.descricao,
                  imagem: t.imagem_url ?? "",
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

  const alternarServico = (s: string) =>
    mudar("servicos", r.servicos.includes(s) ? r.servicos.filter((x) => x !== s) : [...r.servicos, s]);

  const mudarTrabalho = (i: number, campo: keyof TrabalhoRascunho, valor: string) =>
    setR((atual) => ({ ...atual, trabalhos: atual.trabalhos.map((t, j) => (j === i ? { ...t, [campo]: valor } : t)) }));

  const subirImagem = async (arquivo: File | undefined, onde: "foto" | number) => {
    if (!arquivo || props.modo !== "banco") return;
    setErro("");
    setEnviandoFoto(String(onde));
    try {
      const url = await enviarFoto(userId, arquivo);
      if (onde === "foto") mudar("foto", url);
      else mudarTrabalho(onde, "imagem", url);
      setSalvo(false);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviandoFoto(null);
    }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (props.modo === "demo") {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(r));
      } catch {
        /* ignora */
      }
      setSalvo(true);
      return;
    }
    if (!r.whatsapp.trim() && !r.emailContato.trim()) {
      setErro("Coloque pelo menos um contato: WhatsApp ou e-mail.");
      return;
    }
    setSalvando(true);
    try {
      const slug = await salvarPerfil(
        {
          id: userId,
          slug: r.slug || undefined,
          nome: r.nome.trim(),
          curso: r.curso,
          semestre: r.semestre,
          cidade: r.cidade.trim() || "Bauru, SP",
          bio: r.bio.trim(),
          servicos: r.servicos,
          habilidades: r.habilidades.split(",").map((h) => h.trim()).filter(Boolean),
          valor_referencia: r.valorReferencia.trim(),
          whatsapp: r.whatsapp.trim(),
          email_contato: r.emailContato.trim(),
          foto_url: r.foto || null,
          disponivel: r.disponivel,
          publicado: r.publicado,
        },
        r.trabalhos.map((t, i) => ({
          titulo: t.titulo.trim(),
          tipo: t.tipo,
          descricao: t.descricao.trim(),
          imagem_url: t.imagem || null,
          ordem: i,
        }))
      );
      setR((atual) => ({ ...atual, slug }));
      setSalvo(true);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  if (!pronto) return <Aguarde texto="Carregando seu portfólio…" />;

  const real = props.modo === "banco";

  return (
    <div className="container editor">
      <form className="cartao editor-form form" onSubmit={salvar}>
        <div>
          <h1 style={{ fontSize: "1.9rem", marginBottom: 4 }}>Meu portfólio</h1>
          <p className="suave" style={{ margin: 0 }}>
            {real ? <>Você entrou como <strong>{email}</strong>. </> : null}
            Preencha e veja ao lado como os contratantes vão ver seu cartão.
          </p>
        </div>

        {real && (
          <div className="campo">
            Foto de perfil
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {r.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={unsplash(r.foto, 160)} alt="" width={64} height={64} style={{ borderRadius: "50%", objectFit: "cover" }} />
              ) : null}
              <EscolherImagem
                rotulo={r.foto ? "Trocar foto" : "Escolher foto"}
                enviando={enviandoFoto === "foto"}
                onEscolher={(f) => subirImagem(f, "foto")}
              />
              {r.foto && (
                <button type="button" className="link-denuncia" onClick={() => mudar("foto", "")}>Remover</button>
              )}
            </div>
          </div>
        )}

        <label className="campo">
          Nome
          <input value={r.nome} onChange={(e) => mudar("nome", e.target.value)} placeholder="Como quer aparecer" required minLength={2} maxLength={80} />
        </label>

        <div className="linha-dupla">
          <label className="campo">
            Curso
            <select value={r.curso} onChange={(e) => mudar("curso", e.target.value)}>
              {CURSOS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="campo">
            Semestre
            <input type="number" min={1} max={12} value={r.semestre} onChange={(e) => mudar("semestre", Math.min(12, Math.max(1, Number(e.target.value) || 1)))} />
          </label>
        </div>

        <label className="campo">
          Cidade
          <input value={r.cidade} onChange={(e) => mudar("cidade", e.target.value)} placeholder="Bauru, SP" />
        </label>

        <label className="campo">
          Sobre você
          <textarea value={r.bio} onChange={(e) => mudar("bio", e.target.value)} maxLength={280} placeholder="Em duas frases: o que você faz e para quem." />
          <span className="ajuda">{r.bio.length}/280</span>
        </label>

        <fieldset className="campo" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: 6 }}>Serviços que você oferece</legend>
          <div className="opcoes">
            {SERVICOS.map((s) => (
              <label key={s} className="opcao">
                <input type="checkbox" checked={r.servicos.includes(s)} onChange={() => alternarServico(s)} />
                {s}
              </label>
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

        <div className="linha-dupla">
          <label className="campo">
            WhatsApp
            <input type="tel" inputMode="tel" value={r.whatsapp} onChange={(e) => mudar("whatsapp", e.target.value)} placeholder="(14) 99999-0000" />
          </label>
          <label className="campo">
            E-mail de contato
            <input type="email" value={r.emailContato} onChange={(e) => mudar("emailContato", e.target.value)} placeholder="voce@exemplo.com" />
          </label>
        </div>

        <label className="filtro-check">
          <input type="checkbox" checked={r.disponivel} onChange={(e) => mudar("disponivel", e.target.checked)} />
          Estou disponível para freelas
        </label>
        {real && (
          <label className="filtro-check">
            <input type="checkbox" checked={r.publicado} onChange={(e) => mudar("publicado", e.target.checked)} />
            Mostrar meu portfólio na busca de talentos
          </label>
        )}

        <fieldset className="campo" style={{ border: 0, padding: 0, margin: 0, gap: 12 }}>
          <legend style={{ marginBottom: 6 }}>Trabalhos</legend>
          {r.trabalhos.map((t, i) => (
            <div key={i} className="cartao" style={{ padding: 14, boxShadow: "none", display: "grid", gap: 10 }}>
              <div className="linha-dupla">
                <input className="entrada" value={t.titulo} onChange={(e) => mudarTrabalho(i, "titulo", e.target.value)} placeholder="Título do trabalho" maxLength={80} aria-label={`Título do trabalho ${i + 1}`} />
                <select className="entrada" value={t.tipo} onChange={(e) => mudarTrabalho(i, "tipo", e.target.value)} aria-label={`Tipo do trabalho ${i + 1}`}>
                  {SERVICOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <input className="entrada" value={t.descricao} onChange={(e) => mudarTrabalho(i, "descricao", e.target.value)} placeholder="Uma linha sobre o trabalho" maxLength={200} aria-label={`Descrição do trabalho ${i + 1}`} />
              {real ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {t.imagem ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={unsplash(t.imagem, 240)} alt="" width={96} height={64} style={{ borderRadius: 8, objectFit: "cover" }} />
                  ) : null}
                  <EscolherImagem
                    rotulo={t.imagem ? "Trocar imagem" : "Adicionar imagem"}
                    enviando={enviandoFoto === String(i)}
                    onEscolher={(f) => subirImagem(f, i)}
                  />
                </div>
              ) : (
                <span className="ajuda">No modo demonstração as imagens não são enviadas.</span>
              )}
              {r.trabalhos.length > 1 && (
                <button type="button" className="botao botao-contorno" style={{ justifySelf: "start", minHeight: 36, padding: "4px 14px" }} onClick={() => mudar("trabalhos", r.trabalhos.filter((_, j) => j !== i))}>
                  Remover
                </button>
              )}
            </div>
          ))}
          {r.trabalhos.length < MAX_TRABALHOS ? (
            <button type="button" className="botao botao-contorno" style={{ justifySelf: "start" }} onClick={() => mudar("trabalhos", [...r.trabalhos, TRABALHO_VAZIO])}>
              + Adicionar trabalho
            </button>
          ) : (
            <span className="ajuda">O plano grátis permite até {MAX_TRABALHOS} trabalhos.</span>
          )}
        </fieldset>

        {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button className="botao botao-primario" type="submit" disabled={salvando || enviandoFoto !== null}>
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
            {r.slug && (
              <Link href={linkPerfil({ slug: r.slug, real: true })} className="link-mao">ver meu portfólio público →</Link>
            )}
            <button type="button" className="link-denuncia" onClick={sair}>Sair da conta</button>
          </div>
        )}
      </form>

      <div className="editor-previa">
        <p className="suave" style={{ fontWeight: 600, marginBottom: 8 }}>Prévia do seu cartão</p>
        <div style={{ maxWidth: 360, pointerEvents: "none" }}>
          <CartaoAluno aluno={paraAluno(r)} />
        </div>
      </div>
    </div>
  );
}

function EscolherImagem({ rotulo, enviando, onEscolher }: { rotulo: string; enviando: boolean; onEscolher: (f: File | undefined) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          onEscolher(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button type="button" className="botao botao-contorno" style={{ minHeight: 36, padding: "4px 14px" }} disabled={enviando} onClick={() => ref.current?.click()}>
        {enviando ? "Enviando…" : rotulo}
      </button>
    </>
  );
}
