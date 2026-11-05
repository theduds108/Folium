"use client";

import { useId, useRef, useState } from "react";
import { lerCurriculo, quantasInformacoes, textoDoArquivo, type DadosCurriculo } from "@/lib/curriculo";
import { REDES, type Links } from "@/lib/data";
import { formatarMes, formatarPeriodo } from "@/lib/formato";

/** O que o editor já tem, para a revisão mostrar o que seria substituído. */
export type AtualPerfil = {
  nome: string;
  titulo: string;
  curso: string;
  semestre: number;
  conclusao: string;
  cidade: string;
  bio: string;
  sobre: string;
  habilidades: string;
  whatsapp: string;
  emailContato: string;
  links: Links;
  nExperiencias: number;
  nCertificados: number;
  nIdiomas: number;
};

type Item = { id: string; rotulo: string; valor: string; atual: string };

/**
 * "Preencher com meu currículo": o aluno escolhe o arquivo, o Fólium lê (no próprio aparelho,
 * nada é enviado) e mostra uma lista do que encontrou. Nada entra no portfólio sem o aluno
 * marcar e confirmar, e mesmo depois de aplicado só é salvo quando ele clicar em "Salvar portfólio".
 */
export function ImportarCurriculo({
  atual,
  onAplicar,
}: {
  atual: AtualPerfil;
  onAplicar: (d: DadosCurriculo, escolhidos: Set<string>) => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const id = useId();
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState<DadosCurriculo | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());

  const abrir = () => {
    setErro("");
    setDados(null);
    dialogo.current?.showModal();
  };

  const ler = async (f: File | undefined) => {
    if (!f) return;
    setErro("");
    setLendo(true);
    try {
      const d = lerCurriculo(await textoDoArquivo(f));
      if (quantasInformacoes(d) < 2) {
        setErro("Abri o arquivo, mas não reconheci as informações. Confira se é o seu currículo ou preencha as fichas à mão.");
        setDados(null);
        return;
      }
      setDados(d);
      // Já vem marcado o que cabe em campo vazio; o que substituiria algo escrito fica desmarcado.
      setMarcados(new Set(itensDe(d, atual).filter((i) => !i.atual).map((i) => i.id)));
    } catch (e) {
      setErro((e as Error).message || "Não consegui ler esse arquivo.");
    } finally {
      setLendo(false);
    }
  };

  const itens = dados ? itensDe(dados, atual) : [];
  const alternar = (i: string) =>
    setMarcados((m) => {
      const n = new Set(m);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <>
      <button type="button" className="botao botao-contorno botao-pequeno" onClick={abrir}>
        Preencher com meu currículo
      </button>
      <dialog ref={dialogo} className="enquadrar importar-curriculo" aria-labelledby={`${id}-t`}>
        <h2 id={`${id}-t`}>Preencher com meu currículo</h2>
        <p className="suave" style={{ margin: "0 0 12px" }}>
          Envie seu currículo em PDF ou Word. A leitura acontece aqui no seu aparelho: o arquivo não é enviado a ninguém. Você confere
          tudo antes de usar, e nada é salvo até clicar em <strong>Salvar portfólio</strong>.
        </p>

        <input
          ref={arquivo}
          type="file"
          hidden
          accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            void ler(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <div className="linha-arquivo">
          <button type="button" className="botao botao-primario botao-pequeno" disabled={lendo} onClick={() => arquivo.current?.click()}>
            {lendo ? "Lendo seu currículo…" : dados ? "Escolher outro arquivo" : "Escolher currículo (PDF ou Word)"}
          </button>
        </div>
        {erro && <p className="erro" role="alert">{erro}</p>}

        {dados && (
          <div className="importar-lista" role="group" aria-label="Informações encontradas no currículo">
            <p style={{ margin: "16px 0 8px" }}>
              <strong>Encontrei {itens.length} {itens.length === 1 ? "informação" : "informações"}.</strong>{" "}
              <span className="suave">Desmarque o que não quiser usar.</span>
            </p>
            <ul>
              {itens.map((i) => (
                <li key={i.id}>
                  <label className="opcao">
                    <input type="checkbox" checked={marcados.has(i.id)} onChange={() => alternar(i.id)} />
                    <span>
                      <strong>{i.rotulo}</strong>
                      <span className="importar-valor">{i.valor}</span>
                      {i.atual && marcados.has(i.id) && <span className="importar-aviso">Vai trocar o que você já escreveu: “{i.atual.slice(0, 60)}”</span>}
                      {i.atual && !marcados.has(i.id) && <span className="suave importar-aviso">Você já tem algo escrito aqui, então deixei desmarcado.</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="enquadrar-acoes">
          {dados && (
            <button
              type="button"
              className="botao botao-primario"
              disabled={marcados.size === 0}
              onClick={() => {
                onAplicar(dados, marcados);
                dialogo.current?.close();
              }}
            >
              Usar {marcados.size} no meu portfólio
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" className="botao botao-contorno" onClick={() => dialogo.current?.close()}>
            {dados ? "Cancelar" : "Fechar"}
          </button>
        </div>
      </dialog>
    </>
  );
}

function itensDe(d: DadosCurriculo, a: AtualPerfil): Item[] {
  const l: Item[] = [];
  const texto = (id: string, rotulo: string, valor: string | undefined, atualValor: string) => {
    if (valor) l.push({ id, rotulo, valor, atual: atualValor.trim() });
  };
  texto("nome", "Nome", d.nome, a.nome);
  texto("titulo", "Título profissional", d.titulo, a.titulo);
  texto("curso", "Curso", d.curso, a.curso && a.curso !== "Administração" ? a.curso : "");
  texto("semestre", "Semestre", d.semestre ? `${d.semestre}º` : undefined, a.semestre > 1 ? `${a.semestre}º` : "");
  texto("conclusao", "Previsão de formatura", d.conclusao ? formatarMes(d.conclusao) : undefined, a.conclusao);
  texto("cidade", "Cidade", d.cidade, a.cidade && a.cidade !== "Bauru, SP" ? a.cidade : "");
  texto("bio", "Resumo", d.bio, a.bio);
  texto("sobre", "Sobre mim", d.sobre && d.sobre !== d.bio ? d.sobre : undefined, a.sobre);
  texto("whatsapp", "WhatsApp", d.whatsapp, a.whatsapp);
  texto("email", "E-mail de contato", d.email, a.emailContato);
  for (const rede of REDES) {
    const v = d.links[rede.chave];
    if (v) texto(`link-${rede.chave}`, rede.rotulo, v, a.links[rede.chave] ?? "");
  }
  texto("habilidades", "Habilidades", d.habilidades.join(", "), a.habilidades);
  if (d.experiencias.length)
    l.push({
      id: "experiencias",
      rotulo: `Experiências (${d.experiencias.length})`,
      valor: d.experiencias
        .map((x) => [x.cargo, x.lugar].filter(Boolean).join(" · ") + (x.inicio || x.atual ? ` (${formatarPeriodo(x.inicio, x.fim, x.atual)})` : ""))
        .join("; "),
      atual: "",
    });
  if (d.certificados.length)
    l.push({ id: "certificados", rotulo: `Cursos e certificados (${d.certificados.length})`, valor: d.certificados.map((c) => c.nome).join("; "), atual: "" });
  if (d.idiomas.length)
    l.push({ id: "idiomas", rotulo: "Idiomas", valor: d.idiomas.map((x) => `${x.idioma} (${x.nivel})`).join(", "), atual: "" });
  return l;
}
