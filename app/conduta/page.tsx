import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { AceitarTermos } from "@/components/seguranca/AceitarTermos";
import { PRAZO_AJUDA, PRAZO_DENUNCIA, TELEFONES_APOIO } from "@/lib/seguranca-dados";

export const metadata: Metadata = { title: "Código de conduta e segurança" };

const ATUALIZADO_EM = "12 de novembro de 2026";

/**
 * Código de conduta (aluno e contratante) e como funciona a segurança no Fólium:
 * botão "Preciso de ajuda", denúncia nos dois sentidos, decisões da equipe e avaliações.
 * Aberta a todos; o aceite aparece no fim para quem está logado.
 */
export default function Conduta() {
  return (
    <div className="container pagina pagina-legal">
      <CabecalhoArquivo
        rotulo="Segurança"
        titulo="Código de conduta"
        descricao={`As regras que protegem quem trabalha e quem contrata pelo Fólium, e o que acontece quando alguém não cumpre. Atualizado em ${ATUALIZADO_EM}.`}
      />

      <nav className="cartao legal-indice" aria-label="Nesta página">
        <a href="#papel">O papel do Fólium</a>
        <a href="#todos">Para todos</a>
        <a href="#contratante">Para quem contrata</a>
        <a href="#aluno">Para quem trabalha</a>
        <a href="#ajuda">Preciso de ajuda</a>
        <a href="#denuncias">Denúncias</a>
        <a href="#avaliacoes">Avaliações</a>
        <a href="#aceite">Aceite</a>
      </nav>

      <section id="papel" className="cartao legal-secao" aria-labelledby="t-papel">
        <h2 id="t-papel">O papel do Fólium</h2>
        <ol>
          <li>
            O Fólium <strong>aproxima</strong> alunos e contratantes. Não é empregador, agência nem intermediador de pagamento,
            e não é parte do combinado: quem combina, executa, paga e responde pelo trabalho são o aluno e o contratante.
          </li>
          <li>
            O Fólium <strong>não está presente</strong> no local de trabalho e não acompanha o dia a dia. Por isso, cada parte
            responde pelo que faz, e o que acontecer fora da plataforma é de responsabilidade de quem fez.
          </li>
          <li>
            O que o Fólium faz: confere contratantes e vagas antes de aparecerem, guarda o combinado por escrito, recebe pedidos
            de ajuda e denúncias, analisa com as duas versões, toma medidas na plataforma (advertir, suspender, banir) e guarda o
            registro de tudo isso.
          </li>
          <li>
            Crime se resolve com a polícia e a Justiça. O Fólium colabora com as autoridades quando pedido, mas não substitui
            nenhuma delas.
          </li>
        </ol>
      </section>

      <section id="todos" className="cartao legal-secao" aria-labelledby="t-todos">
        <h2 id="t-todos">Para todos</h2>
        <ul>
          <li>Tratar a outra parte com respeito. Assédio moral ou sexual, ameaça, humilhação e discriminação levam a banimento.</li>
          <li>Combinar tudo por escrito no Fólium antes de começar: o que será feito, prazo, valor, sinal e ajustes.</li>
          <li>Não mudar o combinado sem a concordância dos dois. Mudou? Façam um combinado novo.</li>
          <li>Não pedir nem fazer pagamento “por fora” para fugir do combinado, nem cobrar para “liberar” vaga.</li>
          <li>Usar os contatos e os arquivos da outra parte só para o trabalho combinado.</li>
          <li>Denunciar só o que aconteceu. Denúncia falsa feita de má-fé também é punida.</li>
        </ul>
      </section>

      <section id="contratante" className="cartao legal-secao" aria-labelledby="t-contratante">
        <h2 id="t-contratante">Para quem contrata</h2>
        <ul>
          <li>Pagar o valor e no prazo combinados.</li>
          <li>Não pedir trabalho de graça nem “teste” sem pagar. Teste pago entra como combinado.</li>
          <li>Não pressionar com horários, metas ou tarefas fora do combinado, nem fazer contato fora de hora sem necessidade.</li>
          <li>Primeiro encontro presencial em local público ou no endereço comercial da empresa, nunca em lugar isolado.</li>
          <li>Lembrar que o aluno é estudante: o trabalho precisa caber na rotina de aulas.</li>
        </ul>
      </section>

      <section id="aluno" className="cartao legal-secao" aria-labelledby="t-aluno">
        <h2 id="t-aluno">Para quem trabalha</h2>
        <ul>
          <li>Entregar o que foi combinado, no prazo, e avisar cedo se algo for atrasar.</li>
          <li>Mostrar só trabalhos próprios e dizer qual foi o seu papel.</li>
          <li>Não abandonar o trabalho sem avisar. Se precisar parar por segurança, use o botão <strong>Preciso de ajuda</strong>.</li>
          <li>Guardar sigilo sobre dados e materiais da empresa.</li>
          <li>Antes de um encontro presencial, avise alguém de confiança aonde vai e com quem.</li>
        </ul>
      </section>

      <section id="ajuda" className="cartao legal-secao" aria-labelledby="t-ajuda">
        <h2 id="t-ajuda">Botão “Preciso de ajuda”</h2>
        <p>
          Fica em todo combinado em andamento, só para o aluno. É para quando o trabalho virou um risco: assédio, pressão,
          ameaça, discriminação ou perigo físico.
        </p>
        <ul>
          <li><strong>Em perigo agora, ligue 190.</strong> O Fólium não é serviço de emergência e não chega a tempo de proteger ninguém.</li>
          <li>O pedido chega à equipe do Fólium com prioridade, e a equipe responde em até <strong>{PRAZO_AJUDA}</strong>.</li>
          <li>Você pode <strong>pausar o combinado na hora</strong>, sem multa nem nota baixa por isso.</li>
          <li>O contratante <strong>não é avisado</strong> de que você pediu ajuda.</li>
          <li>A faculdade só fica sabendo se você marcar essa opção.</li>
        </ul>
        <h3>Telefones gratuitos, 24 horas</h3>
        <ul>
          {TELEFONES_APOIO.map((t) => (
            <li key={t.numero}><strong>{t.numero}</strong> ({t.nome}): {t.quando}</li>
          ))}
        </ul>
      </section>

      <section id="denuncias" className="cartao legal-secao" aria-labelledby="t-denuncias">
        <h2 id="t-denuncias">Denúncias nos dois sentidos</h2>
        <p>O aluno pode denunciar o contratante, e o contratante pode denunciar o aluno, sempre ligado a um combinado.</p>
        <ol>
          <li><strong>Registro.</strong> Você escolhe o motivo, conta o que aconteceu e pode anexar prints. A equipe responde em até {PRAZO_DENUNCIA}.</li>
          <li><strong>Sigilo.</strong> A outra parte nunca lê o seu relato nem vê os seus prints. Se a equipe precisar da versão dela, manda só um resumo do problema.</li>
          <li><strong>Direito de defesa.</strong> Ninguém é punido sem poder contar a própria versão, a não ser em caso de risco grave, quando a equipe pode suspender antes.</li>
          <li>
            <strong>Decisão em degraus.</strong> Arquivar (quando não há como confirmar), advertência, suspensão de 30 dias ou
            banimento. Quem denunciar de má-fé leva advertência.
          </li>
          <li><strong>Registro.</strong> Cada passo fica guardado com data e responsável, para proteger as duas partes.</li>
        </ol>
      </section>

      <section id="avaliacoes" className="cartao legal-secao" aria-labelledby="t-avaliacoes">
        <h2 id="t-avaliacoes">Avaliações</h2>
        <ul>
          <li>Só quem concluiu um combinado avalia, e uma vez só.</li>
          <li>O contratante avalia o aluno em pontualidade, qualidade, comunicação e respeito. O aluno avalia o contratante em respeito, pagamento em dia, clareza e ambiente seguro.</li>
          <li><strong>Às cegas:</strong> a sua nota só aparece quando a outra parte também avaliar, ou depois de 14 dias. Assim ninguém dá nota por vingança.</li>
          <li>A média só aparece a partir de 3 avaliações, e só para quem tem conta aprovada.</li>
          <li>Quem recebe pode responder uma vez. A equipe anula avaliações ofensivas ou de retaliação.</li>
        </ul>
      </section>

      <section id="aceite" className="cartao legal-secao" aria-labelledby="t-aceite">
        <h2 id="t-aceite">Aceite</h2>
        <p className="suave">
          Junto com os <Link href="/privacidade#termos">termos de uso e a política de privacidade</Link>, este código vale para
          todas as contas. Guardamos a data e a versão do seu aceite.
        </p>
        <AceitarTermos />
      </section>
    </div>
  );
}
