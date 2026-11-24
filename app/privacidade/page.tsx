import type { Metadata } from "next";
import { metadadosPagina } from "@/lib/site";
import Link from "next/link";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { Fornecedor } from "@/components/Fornecedor";
import { ATUALIZADO_EM } from "@/lib/fornecedor";
import { ExcluirConta } from "./ExcluirConta";
import { BaixarDados } from "./BaixarDados";

export const metadata: Metadata = metadadosPagina({
  titulo: "Política de privacidade",
  descricao: "Política de privacidade e de cookies do Fólium (LGPD): quais dados guardamos, para quê, por quanto tempo, com quem e como baixar ou excluir tudo.",
  caminho: "/privacidade/",
});

/** Para que usamos cada grupo de dados, com qual base da LGPD (art. 7º) e por quanto tempo. */
const TRATAMENTOS: { dado: string; finalidade: string; base: string; prazo: string }[] = [
  {
    dado: "Conta (e-mail, nome de usuário, senha embaralhada, tipo de conta)",
    finalidade: "Criar a conta, entrar, conferir que o aluno é da faculdade e recuperar a senha",
    base: "Execução de contrato (art. 7º, V)",
    prazo: "Enquanto a conta existir. Apagado na hora ao excluir a conta",
  },
  {
    dado: "Portfólio (nome, curso, foto, trabalhos, serviços, valores, contatos, currículo, certificados)",
    finalidade: "Mostrar o portfólio a contratantes aprovados e, se você ligar, pelo link público",
    base: "Execução de contrato (art. 7º, V)",
    prazo: "Enquanto a conta existir, ou até você apagar o item",
  },
  {
    dado: "Contratante (nome, empresa, cidade, contato, vagas, talentos salvos)",
    finalidade: "Conferir quem contrata, publicar vagas e ligar a empresa aos alunos",
    base: "Execução de contrato (art. 7º, V) e legítimo interesse na segurança dos alunos (art. 7º, IX)",
    prazo: "Enquanto a conta existir. Vagas ficam sem o login depois da exclusão",
  },
  {
    dado: "Combinados, convites e avaliações",
    finalidade: "Registrar o que foi combinado entre as partes e mostrar avaliações a quem tem conta aprovada",
    base: "Execução de contrato (art. 7º, V)",
    prazo: "Enquanto a conta existir. Avaliações que você escreveu ficam sem o seu login",
  },
  {
    dado: "Denúncias, pedidos de ajuda, provas, aceite dos termos e suspensões",
    finalidade: "Proteger as pessoas, apurar casos e se defender em processos",
    base: "Legítimo interesse (art. 7º, IX) e exercício regular de direitos (art. 7º, VI)",
    prazo: "Até 5 anos depois do caso encerrado, mesmo se a conta for excluída",
  },
  {
    dado: "Tentativas de login erradas",
    finalidade: "Travar quem tenta adivinhar senha",
    base: "Legítimo interesse na segurança (art. 7º, IX)",
    prazo: "30 dias, depois são apagadas automaticamente",
  },
  {
    dado: "Contagem de visitas ao portfólio e estatísticas do site",
    finalidade: "Mostrar ao aluno quantas visitas teve e entender o uso do site, sem identificar ninguém",
    base: "Legítimo interesse (art. 7º, IX)",
    prazo: "Enquanto o portfólio existir (só totais por dia)",
  },
  {
    dado: "Feedbacks",
    finalidade: "Responder você e melhorar o site",
    base: "Legítimo interesse (art. 7º, IX)",
    prazo: "Até 2 anos. Ficam sem o seu login se a conta for excluída",
  },
];

/** O que o navegador guarda. Nada disso é cookie de propaganda ou de rastreio. */
const ARMAZENADOS: { nome: string; para: string; tipo: string }[] = [
  { nome: "Sessão do login (sb-…-auth-token)", para: "Manter você conectado neste aparelho até sair", tipo: "Necessário" },
  { nome: "folium-tour-visto-…", para: "Não repetir o tour guiado", tipo: "Preferência" },
  { nome: "folium-rascunho-perfil e folium-autosave-perfil", para: "Não perder o que você digitou no editor do portfólio", tipo: "Necessário" },
  { nome: "folium-tipo-pretendido", para: "Lembrar se você ia criar conta de aluno ou de contratante", tipo: "Necessário" },
  { nome: "folium-visitante", para: "Número aleatório para contar uma visita por dia, sem saber quem você é", tipo: "Estatística anônima" },
  { nome: "folium-meus-portfolios", para: "Não contar como visita quando você abre o próprio portfólio", tipo: "Necessário" },
];

/**
 * Política de privacidade e de cookies (LGPD), em linguagem simples.
 * Aberta a todos (inclusive sem conta). Os botões de baixar dados e excluir a conta só funcionam para quem está logado.
 */
export default function Privacidade() {
  return (
    <div className="container pagina pagina-legal">
      <CabecalhoArquivo
        rotulo="Seus dados"
        titulo="Política de privacidade"
        descricao={`O que guardamos sobre você, para quê, por quanto tempo e como baixar ou apagar tudo. Atualizado em ${ATUALIZADO_EM}.`}
      />

      <nav className="cartao legal-indice" aria-label="Nesta página">
        <a href="#responsaveis">Quem cuida</a>
        <a href="#privacidade">O que guardamos</a>
        <a href="#finalidades">Para quê e por quanto tempo</a>
        <a href="#quem-ve">Quem vê</a>
        <a href="#operadores">Com quem compartilhamos</a>
        <a href="#cookies">Cookies</a>
        <a href="#seguranca">Segurança</a>
        <a href="#seus-direitos">Seus direitos</a>
        <a href="#excluir">Excluir minha conta</a>
      </nav>

      <section id="responsaveis" className="cartao legal-secao" aria-labelledby="t-responsaveis">
        <h2 id="t-responsaveis">Quem cuida dos seus dados</h2>
        <p>Seguimos a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018) e guardamos só o necessário para o Fólium funcionar.</p>
        <Fornecedor />
        <p className="suave">
          As regras de uso do site estão nos <Link href="/termos">Termos de uso</Link>.
        </p>
      </section>

      <section id="privacidade" className="cartao legal-secao" aria-labelledby="t-privacidade">
        <h2 id="t-privacidade">O que guardamos</h2>
        <ul>
          <li><strong>Conta:</strong> e-mail, nome de usuário e senha (a senha fica embaralhada e ninguém da equipe consegue ler).</li>
          <li><strong>Aluno:</strong> o que você coloca no portfólio: nome, curso, semestre, cidade, foto, trabalhos, serviços, valores, contatos, experiências, certificados e currículo.</li>
          <li><strong>Contratante:</strong> nome, empresa, cidade, contato, vagas publicadas e talentos salvos.</li>
          <li><strong>Combinados e avaliações:</strong> propostas entre aluno e contratante (o que foi combinado, prazo e valor) e as notas que um deu ao outro.</li>
          <li><strong>Segurança:</strong> pedidos de ajuda e denúncias (relato, prints, andamento, defesa da outra parte e decisão da equipe), a data em que você aceitou os termos e o código de conduta e, se houver, suspensões.</li>
          <li><strong>Uso:</strong> interesses e convites em vagas, feedbacks, tentativas de login erradas e visitas aos portfólios (só a contagem: o aluno vê os totais, nunca quem visitou).</li>
        </ul>
        <p>Não pedimos CPF, RG, endereço, dados de saúde, religião ou qualquer dado sensível. Não coloque esse tipo de informação no portfólio.</p>
      </section>

      <section id="finalidades" className="cartao legal-secao" aria-labelledby="t-finalidades">
        <h2 id="t-finalidades">Para que usamos e por quanto tempo</h2>
        <div className="legal-tabela-rolagem">
          <table className="legal-tabela">
            <thead>
              <tr>
                <th scope="col">Dado</th>
                <th scope="col">Para quê</th>
                <th scope="col">Base na LGPD</th>
                <th scope="col">Por quanto tempo</th>
              </tr>
            </thead>
            <tbody>
              {TRATAMENTOS.map((t) => (
                <tr key={t.dado}>
                  <th scope="row">{t.dado}</th>
                  <td>{t.finalidade}</td>
                  <td>{t.base}</td>
                  <td>{t.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="suave">Não usamos seus dados para propaganda, não vendemos e não tomamos decisões automáticas sobre você.</p>
      </section>

      <section id="quem-ve" className="cartao legal-secao" aria-labelledby="t-quem-ve">
        <h2 id="t-quem-ve">Quem vê</h2>
        <ul>
          <li>Portfólios, vagas e talentos só aparecem para quem tem conta e está logado.</li>
          <li>A exceção é o <strong>link público</strong>, que o aluno escolhe ligar: quem tem o link vê os trabalhos e o “sobre”, nunca WhatsApp, e-mail, currículo ou certificados.</li>
          <li>Contatos, currículo e certificados só aparecem para contratantes aprovados pela equipe.</li>
          <li>Combinados só aparecem para as duas partes. Avaliações aparecem para quem tem conta aprovada, e só depois que as duas partes avaliaram (ou 14 dias depois).</li>
          <li>Relatos e prints de denúncias e pedidos de ajuda são vistos só por quem enviou e pela equipe. A outra parte nunca vê. A faculdade só é avisada se o aluno pedir.</li>
          <li>Seu portfólio pode ser tirado da busca a qualquer momento no editor.</li>
          <li>A equipe do Fólium vê os dados só para aprovar contas e vagas, cuidar de denúncias e responder feedbacks.</li>
        </ul>
      </section>

      <section id="operadores" className="cartao legal-secao" aria-labelledby="t-operadores">
        <h2 id="t-operadores">Com quem compartilhamos</h2>
        <p>Só com os serviços que fazem o site funcionar, que guardam os dados em nosso nome e seguem contratos de proteção de dados:</p>
        <ul>
          <li><strong>Supabase:</strong> banco de dados, login e arquivos, em servidores em São Paulo.</li>
          <li><strong>Vercel:</strong> hospedagem do site e estatísticas de visitas sem cookies e sem dados pessoais.</li>
          <li><strong>Resend e Supabase:</strong> envio dos e-mails de acesso e do aviso de feedback para a equipe.</li>
        </ul>
        <p>
          Essas empresas são dos Estados Unidos, então parte dos dados pode passar por servidores de fora do Brasil. Isso é
          permitido pela LGPD (art. 33) porque elas seguem cláusulas contratuais de proteção de dados. Também entregamos dados
          a autoridades quando a lei ou um juiz mandar.
        </p>
      </section>

      <section id="cookies" className="cartao legal-secao" aria-labelledby="t-cookies">
        <h2 id="t-cookies">Cookies e o que fica no seu navegador</h2>
        <p>
          O Fólium não usa cookies de propaganda nem de rastreio, e não tem anúncios. O navegador guarda só o que o site precisa
          para funcionar. Por isso não pedimos que você aceite cookies: não há nada opcional para ligar ou desligar.
        </p>
        <div className="legal-tabela-rolagem">
          <table className="legal-tabela">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Para quê</th>
                <th scope="col">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {ARMAZENADOS.map((a) => (
                <tr key={a.nome}>
                  <th scope="row">{a.nome}</th>
                  <td>{a.para}</td>
                  <td>{a.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="suave">Para apagar tudo, use “Sair” no menu e limpe os dados do site nas configurações do navegador.</p>
      </section>

      <section id="seguranca" className="cartao legal-secao" aria-labelledby="t-seguranca">
        <h2 id="t-seguranca">Como protegemos</h2>
        <ul>
          <li>Conexão sempre criptografada (HTTPS) e dados guardados criptografados nos servidores.</li>
          <li>Senha forte obrigatória, guardada embaralhada, e trava depois de várias tentativas erradas.</li>
          <li>Cada pessoa só lê e altera o que é dela, com regras conferidas pelo próprio banco de dados.</li>
          <li>Fotos, currículos e certificados ficam em pastas privadas e abrem com links que expiram.</li>
          <li>
            Se acontecer um vazamento que possa prejudicar você, avisamos você e a Autoridade Nacional de Proteção de Dados
            (ANPD) em até 3 dias úteis, dizendo o que aconteceu e o que fazer.
          </li>
          <li>
            Achou uma falha de segurança? Conte pelo <Link href="/feedback">Feedback</Link> sem expor dados de ninguém. Agradecemos
            e corrigimos o quanto antes.
          </li>
        </ul>
      </section>

      <section id="seus-direitos" className="cartao legal-secao" aria-labelledby="t-direitos">
        <h2 id="t-direitos">Seus direitos</h2>
        <p>Pela LGPD (art. 18), você pode a qualquer momento:</p>
        <ul>
          <li><strong>Saber e ver</strong> o que guardamos: está nesta página e no seu portfólio ou painel.</li>
          <li><strong>Corrigir</strong> seus dados direto no portfólio ou painel.</li>
          <li><strong>Baixar uma cópia</strong> de tudo, em arquivo, com o botão abaixo (portabilidade).</li>
          <li><strong>Esconder</strong> seu portfólio da busca, sem apagar nada.</li>
          <li><strong>Apagar tudo</strong> com o botão “Excluir minha conta”.</li>
          <li><strong>Retirar o aceite</strong> dos termos, o que encerra a conta, e <strong>se opor</strong> a um uso que ache errado.</li>
          <li>
            <strong>Pedir qualquer outra coisa</strong> ou tirar dúvidas pelo <Link href="/feedback">Feedback</Link>. Respondemos em
            até 15 dias. Se não ficar satisfeito, você pode reclamar na ANPD (gov.br/anpd).
          </li>
        </ul>
        <BaixarDados />
      </section>

      <section id="excluir" className="cartao legal-secao" aria-labelledby="t-excluir">
        <h2 id="t-excluir">Excluir minha conta</h2>
        <p>
          Apaga para sempre seu login, seu portfólio, trabalhos, fotos, currículo, certificados, talentos salvos, convites,
          combinados e as avaliações que você recebeu. Vagas, denúncias, pedidos de ajuda, feedbacks e avaliações que você escreveu
          ficam, mas sem o seu login. Não dá para desfazer: se quiser, baixe seus dados antes.
        </p>
        <ExcluirConta />
      </section>
    </div>
  );
}
