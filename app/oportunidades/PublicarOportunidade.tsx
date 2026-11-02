"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICOS } from "@/lib/data";
import { GRUPOS_SERVICOS } from "@/components/OpcoesServicos";
import { Seletor } from "@/components/Seletor";
import { bancoLigado } from "@/lib/supabase";
import { enviarOportunidade, guardarVagaDemo } from "@/lib/repositorio";
import type { Conta } from "@/lib/conta";
import { formatarData, mascaraReais, mascaraTelefone } from "@/lib/formato";

const TIPOS = ["Freela", "Projeto", "Estágio"] as const;

const PASSOS = [
  { titulo: "Conte o que precisa", texto: "Leva 2 minutos. Seus dados do painel já vêm preenchidos." },
  { titulo: "A equipe confere", texto: "Verificamos cada empresa antes de a vaga ir ao ar." },
  { titulo: "Alunos te chamam", texto: "Quem tiver interesse fala direto com você." },
];

/** Formulário para empresas publicarem uma vaga. Ela entra como "pendente" até a equipe aprovar. */
export function PublicarOportunidade({ conta, premium = false }: { conta?: Conta | null; premium?: boolean }) {
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [erro, setErro] = useState("");
  const [contato, setContato] = useState(conta?.whatsapp || conta?.email || "");
  const [destaque, setDestaque] = useState(false);
  const [orcamento, setOrcamento] = useState("");
  const [combinar, setCombinar] = useState(false);
  const [servico, setServico] = useState<string>(SERVICOS[0]);
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Freela");

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="publicar cartao" id="publicar">
      <aside className="publicar-lado">
        <span className="rotulos"><span>Para empresas</span></span>
        <h2>Publique uma oportunidade</h2>
        <p>
          {premium
            ? "Plano Premium: vagas ilimitadas e opção de destaque no topo do mural."
            : "No plano grátis você publica 1 vaga por mês. Talento universitário da região, com selo da instituição."}
        </p>
        <ol className="publicar-passos">
          {PASSOS.map((p) => (
            <li key={p.titulo}>
              <strong>{p.titulo}</strong>
              <span>{p.texto}</span>
            </li>
          ))}
        </ol>
      </aside>

      {enviada ? (
        <div className="publicar-form publicar-ok">
          <span className="publicar-ok-icone" aria-hidden="true">✓</span>
          <h3>Vaga enviada!</h3>
          <p className="suave">
            A equipe do Fólium confere a empresa e publica em até 1 dia útil. Acompanhe o status no seu painel.
          </p>
          <div className="trava-acoes">
            <Link href="/painel" className="botao botao-verde">Ver no meu painel</Link>
            <button className="botao botao-contorno" onClick={() => setEnviada(false)}>Enviar outra vaga</button>
          </div>
        </div>
      ) : (
        <form
          className="publicar-form form"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const v = (k: string) => String(f.get(k) ?? "").trim();
            setErro("");
            const prazo = v("prazo");
            const nova = {
              titulo: v("titulo"),
              empresa: v("empresa"),
              contato: contato.trim(),
              tipo,
              servico: v("servico"),
              cidade: v("cidade") || "Bauru, SP",
              orcamento: combinar ? "A combinar" : orcamento,
              prazo: prazo ? `Até ${formatarData(prazo)}` : "",
              descricao: v("descricao"),
              destaque: premium && destaque,
            };
            if (!bancoLigado) {
              guardarVagaDemo(nova);
              setEnviada(true);
              return;
            }
            setEnviando(true);
            try {
              await enviarOportunidade(nova);
              setEnviada(true);
            } catch (err) {
              setErro((err as Error).message);
            } finally {
              setEnviando(false);
            }
          }}
        >
          <fieldset className="campo">
            <legend>Tipo de oportunidade</legend>
            <div className="opcoes">
              {TIPOS.map((t) => (
                <label key={t} className="opcao">
                  <input type="radio" name="tipo" checked={tipo === t} onChange={() => setTipo(t)} />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="campo">
            O que você precisa
            <input name="titulo" required minLength={3} maxLength={100} placeholder="Ex.: Logo para minha padaria" />
          </label>

          <div className="campo">
            Serviço
            <Seletor aria-label="Serviço" name="servico" valor={servico} onMudar={setServico} grupos={GRUPOS_SERVICOS} />
          </div>

          <label className="campo">
            Descrição
            <textarea name="descricao" required maxLength={600} rows={4} placeholder="O que precisa ser feito, onde vai ser usado e qualquer detalhe importante." />
          </label>

          <div className="linha-dupla">
            <label className="campo">
              Orçamento
              <input
                inputMode="numeric"
                value={combinar ? "" : orcamento}
                disabled={combinar}
                onChange={(e) => setOrcamento(mascaraReais(e.target.value))}
                placeholder="R$ 0"
              />
              <span className="filtro-check" style={{ fontWeight: 500 }}>
                <input type="checkbox" checked={combinar} onChange={(e) => setCombinar(e.target.checked)} />
                A combinar
              </span>
            </label>
            <label className="campo">
              Entregar até
              <input type="date" name="prazo" min={hoje} />
              <span className="ajuda">Deixe em branco se não tiver data.</span>
            </label>
          </div>

          <div className="publicar-divisor"><span>Sobre você</span></div>

          <div className="linha-dupla">
            <label className="campo">
              Empresa ou nome
              <input name="empresa" required minLength={2} maxLength={80} placeholder="Ex.: Padaria Sol" defaultValue={conta?.empresa || conta?.nome || ""} />
            </label>
            <label className="campo">
              Cidade
              <input name="cidade" maxLength={60} defaultValue={conta?.cidade || "Bauru, SP"} />
            </label>
          </div>
          <label className="campo">
            WhatsApp ou e-mail para contato
            <input
              required
              minLength={5}
              maxLength={120}
              value={contato}
              placeholder="(14) 99999-0000 ou contato@empresa.com"
              onChange={(e) => {
                const v = e.target.value;
                // Só números: formata como telefone. Com letra ou @: deixa como e-mail.
                setContato(/^[\d\s()+-]*$/.test(v) ? mascaraTelefone(v) : v);
              }}
            />
          </label>

          {premium && (
            <label className="filtro-check publicar-destaque">
              <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} />
              <span><strong>Destacar no topo do mural</strong> · incluído no Premium</span>
            </label>
          )}

          {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
          <button className="botao botao-verde" type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar para análise"}
          </button>
          <p className="ajuda" style={{ margin: 0, textAlign: "center" }}>
            Ao enviar, você concorda em tratar os alunos com respeito e pagar o combinado.
          </p>
        </form>
      )}
    </div>
  );
}
