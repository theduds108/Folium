"use client";

import Link from "next/link";
import { useState } from "react";
import { enviarFeedback, type TipoFeedback } from "@/lib/repositorio";
import { useConta } from "@/lib/conta";
import { reverTour } from "@/components/TourGuiado";

const TIPOS: { valor: TipoFeedback; rotulo: string; dica: string }[] = [
  { valor: "sugestao", rotulo: "Sugestão", dica: "O que você gostaria que o Fólium tivesse ou fizesse diferente?" },
  { valor: "problema", rotulo: "Problema", dica: "O que aconteceu? Em qual tela? O que você esperava que acontecesse?" },
  { valor: "elogio", rotulo: "Elogio", dica: "O que funcionou bem para você?" },
  { valor: "outro", rotulo: "Outro", dica: "Escreva o que quiser contar para a equipe." },
];

const ONDE = ["Página inicial", "Talentos", "Vagas", "Meu portfólio", "Painel do contratante", "Publicar vaga", "Jornal", "Guia", "Entrar e senha", "Outro lugar"];

export function FormFeedback() {
  const { conta } = useConta();
  const [tipo, setTipo] = useState<TipoFeedback>("sugestao");
  const [onde, setOnde] = useState("");
  const [nota, setNota] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [estado, setEstado] = useState<"" | "enviando" | "enviado">("");
  const [erro, setErro] = useState("");

  if (estado === "enviado") {
    return (
      <div className="cartao bloco feedback-ok">
        <span className="publicar-ok-icone" aria-hidden="true">✓</span>
        <h2 className="h-pequeno">Obrigado! Seu feedback chegou na equipe.</h2>
        <p className="suave">A gente lê tudo. Se for um problema, vamos tentar resolver o quanto antes.</p>
        <div className="trava-acoes">
          <button type="button" className="botao botao-contorno" onClick={() => { setMensagem(""); setNota(null); setEstado(""); }}>
            Mandar outro
          </button>
          <Link href={conta?.tipo === "contratante" ? "/painel" : conta?.tipo === "colaborador" ? "/meu-perfil" : "/"} className="botao botao-verde">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const dica = TIPOS.find((t) => t.valor === tipo)!.dica;

  return (
    <div className="feedback-grade">
      <form
        className="cartao bloco form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (mensagem.trim().length < 5) {
            setErro("Escreva um pouco mais para a equipe entender.");
            return;
          }
          setErro("");
          setEstado("enviando");
          try {
            await enviarFeedback({ tipo, mensagem, pagina: onde, nota });
            setEstado("enviado");
          } catch (err) {
            setErro((err as Error).message);
            setEstado("");
          }
        }}
      >
        <fieldset className="campo">
          <legend>Sobre o quê?</legend>
          <div className="opcoes">
            {TIPOS.map((t) => (
              <label key={t.valor} className="opcao">
                <input type="radio" name="tipo" checked={tipo === t.valor} onChange={() => setTipo(t.valor)} />
                {t.rotulo}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="campo">
          Em qual parte do Fólium? <span className="suave">(opcional)</span>
          <select value={onde} onChange={(e) => setOnde(e.target.value)}>
            <option value="">Escolha…</option>
            {ONDE.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>

        <label className="campo">
          Sua mensagem
          <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} required minLength={5} maxLength={1500} rows={6} placeholder={dica} />
          <span className="ajuda">{mensagem.length}/1500 · não coloque senha nem dados pessoais de outras pessoas.</span>
        </label>

        <fieldset className="campo">
          <legend>De 1 a 5, quanto o Fólium está te ajudando? <span className="suave">(opcional)</span></legend>
          <div className="opcoes feedback-notas">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="opcao">
                <input type="radio" name="nota" checked={nota === n} onChange={() => setNota(n)} />
                {n}
              </label>
            ))}
          </div>
        </fieldset>

        {erro && <p className="erro" role="alert" style={{ margin: 0 }}>{erro}</p>}
        <button type="submit" className="botao botao-verde" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar feedback"}
        </button>
      </form>

      <aside className="cartao bloco feedback-lado">
        <h2 className="h-pequeno">Primeira vez por aqui?</h2>
        <p className="suave">O tour mostra em poucos passos onde fica cada coisa no Fólium.</p>
        <button type="button" className="botao botao-contorno" onClick={reverTour}>Ver o tour de novo</button>
        <h2 className="h-pequeno" style={{ marginTop: 24 }}>Quer denunciar alguém?</h2>
        <p className="suave">Use o botão de denúncia no próprio perfil ou vaga. Assim a equipe sabe exatamente o que analisar.</p>
      </aside>
    </div>
  );
}
