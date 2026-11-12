import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { ExcluirConta } from "./ExcluirConta";

export const metadata: Metadata = { title: "Termos e privacidade" };

const ATUALIZADO_EM = "12 de novembro de 2026";

/**
 * Termos de uso e política de privacidade (LGPD), numa página só e em linguagem simples.
 * Aberta a todos (inclusive sem conta), porque quem vai se cadastrar precisa ler antes.
 * O botão de excluir a conta só aparece para quem está logado.
 */
export default function Privacidade() {
  return (
    <div className="container pagina pagina-legal">
      <CabecalhoArquivo
        rotulo="Seus dados"
        titulo="Termos e privacidade"
        descricao={`Como o Fólium funciona, o que guardamos sobre você e como apagar tudo. Atualizado em ${ATUALIZADO_EM}.`}
      />

      <nav className="cartao legal-indice" aria-label="Nesta página">
        <a href="#termos">Termos de uso</a>
        <a href="#privacidade">Privacidade</a>
        <a href="#seus-direitos">Seus direitos</a>
        <a href="#excluir">Excluir minha conta</a>
      </nav>

      <section id="termos" className="cartao legal-secao" aria-labelledby="t-termos">
        <h2 id="t-termos">Termos de uso</h2>
        <ol>
          <li>
            <strong>O que é o Fólium.</strong> Um projeto de empreendedorismo, em parceria com a UNISAGRADO, que mostra
            portfólios de alunos e liga esses alunos a quem quer contratar. O Fólium é a vitrine e o ponto de contato:
            não participa da negociação, não recebe pagamentos e não é parte do contrato entre aluno e contratante.
          </li>
          <li>
            <strong>Sem vínculo com o Fólium.</strong> O Fólium não é empregador, agência nem intermediador de pagamento.
            Aluno e contratante respondem pelo que combinam e fazem, inclusive pelo que acontecer no local de trabalho.
            Quem usa o Fólium aceita também o <Link href="/conduta">código de conduta</Link>.
          </li>
          <li>
            <strong>Quem pode usar.</strong> Alunos entram com o e-mail institucional da faculdade. Contratantes
            (empresas ou pessoas) entram com qualquer e-mail. Cada pessoa usa só a própria conta e guarda a própria senha.
          </li>
          <li>
            <strong>O que você publica.</strong> Você só publica trabalhos que fez ou dos quais participou, dizendo qual foi
            o seu papel. O trabalho continua sendo seu: o Fólium só o mostra dentro da plataforma enquanto sua conta existir.
          </li>
          <li>
            <strong>O que não pode.</strong> Golpe, vaga falsa, pedido de pagamento antecipado para “liberar” vaga, conteúdo
            ofensivo, discriminatório ou de outra pessoa, e uso dos contatos dos alunos para propaganda. A equipe pode tirar
            do ar vagas e perfis assim e encerrar a conta.
          </li>
          <li>
            <strong>Vagas.</strong> Toda vaga é conferida pela equipe antes de aparecer no mural. Isso diminui o risco, mas
            não substitui o cuidado de vocês: combinem tudo por escrito e vejam o <Link href="/guia">Guia</Link>.
          </li>
          <li>
            <strong>Planos.</strong> Os planos pagos estão em fase de teste e a equipe libera o Premium à mão. Nada é cobrado
            sem você pedir.
          </li>
          <li>
            <strong>Denúncias e pedidos de ajuda.</strong> Em cada combinado, o aluno tem o botão “Preciso de ajuda” e as duas
            partes podem denunciar a outra. A equipe ouve os dois lados e pode advertir, suspender ou banir uma conta, como
            explica o <Link href="/conduta#denuncias">código de conduta</Link>. Em perigo, ligue 190: o Fólium não é serviço de
            emergência. Viu algo errado num perfil ou vaga? Use o botão de denúncia ou a página <Link href="/feedback">Feedback</Link>.
          </li>
        </ol>
      </section>

      <section id="privacidade" className="cartao legal-secao" aria-labelledby="t-privacidade">
        <h2 id="t-privacidade">Privacidade</h2>
        <p>Seguimos a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). Guardamos só o necessário para o Fólium funcionar.</p>

        <h3>O que guardamos</h3>
        <ul>
          <li><strong>Conta:</strong> e-mail, nome de usuário e senha (a senha fica embaralhada e ninguém da equipe consegue ler).</li>
          <li><strong>Aluno:</strong> o que você coloca no portfólio: nome, curso, semestre, cidade, foto, trabalhos, serviços, valores, contatos, experiências, certificados e currículo.</li>
          <li><strong>Contratante:</strong> nome, empresa, cidade, contato, vagas publicadas e talentos salvos.</li>
          <li><strong>Combinados e avaliações:</strong> propostas entre aluno e contratante (o que foi combinado, prazo e valor) e as notas que um deu ao outro.</li>
          <li><strong>Segurança:</strong> pedidos de ajuda e denúncias (relato, prints, andamento, defesa da outra parte e decisão da equipe), a data em que você aceitou os termos e o código de conduta e, se houver, suspensões. Esses registros ficam guardados mesmo se a conta for excluída, para proteger as duas partes.</li>
          <li><strong>Uso:</strong> interesses e convites em vagas, denúncias, feedbacks, tentativas de login erradas (para barrar quem tenta adivinhar senha) e visitas aos portfólios (só a contagem: o aluno vê os totais, nunca quem visitou).</li>
        </ul>

        <h3>Quem vê</h3>
        <ul>
          <li>Portfólios, vagas e talentos só aparecem para quem tem conta e está logado.</li>
          <li>A exceção é o <strong>link público</strong>, que o aluno escolhe ligar: quem tem o link vê os trabalhos e o “sobre”, nunca WhatsApp, e-mail, currículo ou certificados.</li>
          <li>Combinados só aparecem para as duas partes. Avaliações aparecem para quem tem conta aprovada, e só depois que as duas partes avaliaram (ou 14 dias depois).</li>
          <li>Relatos e prints de denúncias e pedidos de ajuda são vistos só por quem enviou e pela equipe. A outra parte nunca vê. A faculdade só é avisada se o aluno pedir.</li>
          <li>Fotos, currículos e certificados ficam em pastas privadas e abrem com links que expiram.</li>
          <li>Seu portfólio pode ser tirado da busca a qualquer momento no editor.</li>
          <li>A equipe do Fólium vê os dados para aprovar vagas, cuidar de denúncias e responder feedbacks. Não vendemos nem passamos seus dados para propaganda.</li>
        </ul>

        <h3>Onde ficam</h3>
        <ul>
          <li><strong>Supabase:</strong> banco de dados e arquivos, em servidores em São Paulo.</li>
          <li><strong>Vercel:</strong> hospedagem do site.</li>
          <li><strong>Serviço de e-mail:</strong> manda os links de acesso e avisa a equipe quando chega um feedback.</li>
        </ul>
        <p className="suave">O Fólium não usa cookies de propaganda. O navegador guarda só o seu login e preferências do site (como o tour já visto).</p>
      </section>

      <section id="seus-direitos" className="cartao legal-secao" aria-labelledby="t-direitos">
        <h2 id="t-direitos">Seus direitos</h2>
        <p>Pela LGPD, você pode a qualquer momento:</p>
        <ul>
          <li><strong>Ver e corrigir</strong> seus dados: tudo está no seu portfólio ou painel.</li>
          <li><strong>Esconder</strong> seu portfólio da busca, sem apagar nada.</li>
          <li><strong>Apagar tudo</strong> com o botão abaixo.</li>
          <li><strong>Pedir uma cópia</strong> ou tirar dúvidas pela página <Link href="/feedback">Feedback</Link>. A equipe responde em até 15 dias.</li>
        </ul>
      </section>

      <section id="excluir" className="cartao legal-secao" aria-labelledby="t-excluir">
        <h2 id="t-excluir">Excluir minha conta</h2>
        <p>
          Apaga para sempre seu login, seu portfólio, trabalhos, fotos, currículo, certificados, talentos salvos, convites,
          combinados e as avaliações que você recebeu. Vagas, denúncias, pedidos de ajuda, feedbacks e avaliações que você escreveu
          ficam, mas sem o seu login. Não dá para desfazer.
        </p>
        <ExcluirConta />
      </section>
    </div>
  );
}
