import type { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina } from "@/lib/site";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { Fornecedor } from "@/components/Fornecedor";
import { ATUALIZADO_EM } from "@/lib/fornecedor";

export const metadata: Metadata = metadadosPagina({
  titulo: "Termos de uso",
  descricao: "Termos de uso do Fólium: quem somos, regras de uso, licença dos trabalhos, planos, cancelamento, reembolso, publicidade e uso de inteligência artificial.",
  caminho: "/termos/",
});

/**
 * Termos de uso em linguagem simples. Aberta a todos, porque quem vai se cadastrar precisa ler antes.
 * Mudou algo importante aqui? Atualize ATUALIZADO_EM (lib/fornecedor.ts) e VERSAO_TERMOS (lib/versao-termos.ts),
 * que pede um novo aceite a todo mundo.
 */
export default function Termos() {
  return (
    <div className="container pagina pagina-legal">
      <CabecalhoArquivo
        rotulo="Regras"
        titulo="Termos de uso"
        descricao={`As regras para usar o Fólium, escritas sem juridiquês. Atualizado em ${ATUALIZADO_EM}.`}
      />

      <nav className="cartao legal-indice" aria-label="Nesta página">
        <a href="#quem-somos">Quem somos</a>
        <a href="#uso">Como funciona</a>
        <a href="#conteudo">Seu conteúdo</a>
        <a href="#regras">O que não pode</a>
        <a href="#planos">Planos e cobrança</a>
        <a href="#cancelamento">Cancelamento</a>
        <a href="#reembolso">Reembolso</a>
        <a href="#publicidade">Publicidade e depoimentos</a>
        <a href="#ia">Inteligência artificial</a>
        <a href="#denuncias">Denúncias</a>
        <a href="#mudancas">Mudanças e contato</a>
      </nav>

      <section id="quem-somos" className="cartao legal-secao" aria-labelledby="t-quem">
        <h2 id="t-quem">Quem somos</h2>
        <Fornecedor />
      </section>

      <section id="uso" className="cartao legal-secao" aria-labelledby="t-uso">
        <h2 id="t-uso">Como o Fólium funciona</h2>
        <ol>
          <li>
            <strong>O que é.</strong> Uma vitrine de portfólios de universitários que liga esses alunos a quem quer contratar.
            O Fólium é a vitrine e o ponto de contato: não participa da negociação, não recebe pagamentos entre aluno e
            contratante e não é parte do contrato entre eles.
          </li>
          <li>
            <strong>Sem vínculo com o Fólium.</strong> O Fólium não é empregador, agência nem intermediador de pagamento.
            Aluno e contratante respondem pelo que combinam e fazem, inclusive no local de trabalho. Quem usa o Fólium
            aceita também o <Link href="/conduta">código de conduta</Link>.
          </li>
          <li>
            <strong>Quem pode usar.</strong> Alunos entram com o e-mail institucional da faculdade. Contratantes (empresas ou
            pessoas) entram com qualquer e-mail e passam por uma conferência da equipe antes de ver os contatos dos alunos.
            O Fólium é feito para maiores de 18 anos: quem tem menos precisa da autorização de um responsável.
          </li>
          <li>
            <strong>Sua conta.</strong> Cada pessoa usa só a própria conta e guarda a própria senha. Desconfiou que alguém
            entrou na sua conta? Troque a senha em <Link href="/senha">Senha</Link> e avise a equipe pelo{" "}
            <Link href="/feedback">Feedback</Link>.
          </li>
          <li>
            <strong>Vagas.</strong> Toda vaga é conferida pela equipe antes de aparecer no mural. Isso diminui o risco, mas
            não substitui o cuidado de vocês: combinem tudo por escrito e vejam o <Link href="/guia">Guia</Link>.
          </li>
          <li>
            <strong>Disponibilidade.</strong> Cuidamos para o site ficar no ar e guardar seus dados com segurança, mas ele pode
            sair do ar por manutenção ou falha dos serviços que usamos. Guarde uma cópia dos seus arquivos originais.
          </li>
        </ol>
      </section>

      <section id="conteudo" className="cartao legal-secao" aria-labelledby="t-conteudo">
        <h2 id="t-conteudo">Seu conteúdo e licença de uso</h2>
        <ul>
          <li>
            <strong>O trabalho é seu.</strong> Você continua dono(a) dos direitos autorais de tudo o que publica (Lei 9.610/1998).
            Só publique trabalhos que você fez ou dos quais participou, dizendo qual foi o seu papel e, em trabalhos em
            grupo, marcando os colegas.
          </li>
          <li>
            <strong>O que você nos autoriza.</strong> Ao publicar, você dá ao Fólium uma licença gratuita, não exclusiva e
            que pode ser retirada a qualquer momento, só para mostrar o conteúdo dentro da plataforma: no seu portfólio, na
            busca, no PDF que você gera e no link público, se você ligar. A licença acaba quando você apaga o trabalho ou a conta.
          </li>
          <li>
            <strong>Divulgação.</strong> O Fólium só usa seu nome, foto ou trabalho em redes sociais, apresentações ou
            anúncios com a sua autorização por escrito, pedida caso a caso.
          </li>
          <li>
            <strong>Direitos de terceiros.</strong> Se o trabalho foi feito para um cliente, confira se o contrato permite
            mostrá-lo em portfólio. Alguém publicou algo seu? Denuncie no perfil e a equipe tira do ar enquanto analisa.
          </li>
          <li>
            <strong>O Fólium.</strong> A marca, o visual e o código do Fólium são da equipe do projeto. As fontes,
            bibliotecas e imagens de terceiros usadas no site seguem as licenças de cada uma.
          </li>
        </ul>
      </section>

      <section id="regras" className="cartao legal-secao" aria-labelledby="t-regras">
        <h2 id="t-regras">O que não pode</h2>
        <p>
          Golpe, vaga falsa, pedido de pagamento antecipado para “liberar” vaga, conteúdo ofensivo, discriminatório ou de
          outra pessoa, perfil falso, uso dos contatos dos alunos para propaganda e tentativas de invadir, copiar em massa
          ou derrubar o site. A equipe pode tirar do ar vagas e perfis assim, suspender ou encerrar a conta, como explica o{" "}
          <Link href="/conduta#denuncias">código de conduta</Link>.
        </p>
      </section>

      <section id="planos" className="cartao legal-secao" aria-labelledby="t-planos">
        <h2 id="t-planos">Planos, preços e cobrança</h2>
        <ul>
          <li>
            <strong>Hoje nada é cobrado.</strong> O Fólium está em fase de teste. O plano Grátis é gratuito de verdade, e o
            Premium ainda não está à venda: quem pede entra numa lista e a equipe libera à mão, sem custo.
          </li>
          <li>
            <strong>Preço sempre visível.</strong> Os preços ficam na página <Link href="/planos">Planos</Link>, com o valor
            total, o que está incluído e o período. Não há taxa escondida nem comissão sobre o que aluno e contratante
            combinam entre si.
          </li>
          <li>
            <strong>Quando a venda abrir.</strong> Antes de pagar, você verá o resumo com preço, período, forma de pagamento e
            como cancelar. Recebe a confirmação e o recibo por e-mail. Nenhuma cobrança acontece sem você pedir.
          </li>
          <li>
            <strong>Mudança de preço.</strong> Avisamos com pelo menos 30 dias de antecedência e o novo valor só vale a partir
            do período seguinte. Se não concordar, é só cancelar antes.
          </li>
        </ul>
      </section>

      <section id="cancelamento" className="cartao legal-secao" aria-labelledby="t-cancelamento">
        <h2 id="t-cancelamento">Cancelamento</h2>
        <ul>
          <li>Você cancela quando quiser, pelo próprio site, do mesmo jeito simples com que assinou. Sem multa e sem fidelidade.</li>
          <li>O Premium continua ativo até o fim do período já pago e depois a conta volta para o Grátis, sem perder o portfólio.</li>
          <li>Enquanto a venda não abre, para sair da lista do Premium ou voltar ao Grátis é só pedir pelo <Link href="/feedback">Feedback</Link>.</li>
          <li>Para apagar a conta inteira, use o botão em <Link href="/privacidade#excluir">Excluir minha conta</Link>.</li>
        </ul>
      </section>

      <section id="reembolso" className="cartao legal-secao" aria-labelledby="t-reembolso">
        <h2 id="t-reembolso">Reembolso</h2>
        <ul>
          <li>
            <strong>Arrependimento em 7 dias.</strong> Comprou e desistiu? Peça em até 7 dias corridos depois do pagamento e
            devolvemos o valor inteiro, pelo mesmo meio de pagamento (Código de Defesa do Consumidor, art. 49).
          </li>
          <li>
            <strong>Depois dos 7 dias.</strong> O cancelamento vale para o próximo período e o mês em curso não é devolvido,
            mas o Premium segue ativo até o fim dele.
          </li>
          <li>
            <strong>Problema nosso.</strong> Se o Premium ficar fora do ar ou não entregar o que prometemos, devolvemos a parte
            proporcional.
          </li>
          <li>Peça pelo <Link href="/feedback">Feedback</Link>. Respondemos em até 5 dias úteis e o estorno sai em até 10 dias úteis.</li>
        </ul>
      </section>

      <section id="publicidade" className="cartao legal-secao" aria-labelledby="t-publicidade">
        <h2 id="t-publicidade">Publicidade e depoimentos</h2>
        <ul>
          <li>O Fólium não vende espaço de propaganda hoje e não mostra anúncios de terceiros.</li>
          <li>Vagas em destaque (do Premium) aparecem com a marca “Destaque”, para você saber que tiveram prioridade paga.</li>
          <li>Se um dia o Jornal do Fólium tiver matéria patrocinada ou parceria paga, ela virá marcada como “Publicidade”.</li>
          <li>
            Avaliações e depoimentos são de pessoas reais, escritos por elas, e não são editados para parecer melhores.
            Qualquer exemplo usado para demonstrar o site vem marcado como ilustrativo.
          </li>
        </ul>
      </section>

      <section id="ia" className="cartao legal-secao" aria-labelledby="t-ia">
        <h2 id="t-ia">Inteligência artificial</h2>
        <ul>
          <li>
            <strong>Nenhuma decisão sobre você é tomada por IA.</strong> Aprovar contratante e vaga, analisar denúncia,
            suspender conta e ordenar a busca são feitos por regras simples ou por pessoas da equipe.
          </li>
          <li>
            <strong>Importar currículo.</strong> O botão que lê o seu PDF funciona no seu próprio aparelho, com regras de
            texto, sem IA e sem mandar o arquivo para ninguém. Você revisa tudo antes de salvar.
          </li>
          <li>
            <strong>Como o site foi feito.</strong> O código do Fólium foi escrito com a ajuda do Claude, assistente de IA da
            Anthropic, e revisado pela equipe. Nenhum dado de quem usa o Fólium é enviado para a Anthropic ou para outra IA.
          </li>
          <li>Se um dia usarmos IA em alguma função, avisamos aqui e na própria tela antes de ela tocar nos seus dados.</li>
        </ul>
      </section>

      <section id="denuncias" className="cartao legal-secao" aria-labelledby="t-denuncias">
        <h2 id="t-denuncias">Denúncias e pedidos de ajuda</h2>
        <p>
          Em cada combinado, o aluno tem o botão “Preciso de ajuda” e as duas partes podem denunciar a outra. A equipe ouve os
          dois lados e pode advertir, suspender ou banir uma conta. Em perigo, ligue 190: o Fólium não é serviço de emergência.
          Viu algo errado num perfil ou vaga? Use o botão de denúncia ou a página <Link href="/feedback">Feedback</Link>.
        </p>
      </section>

      <section id="mudancas" className="cartao legal-secao" aria-labelledby="t-mudancas">
        <h2 id="t-mudancas">Mudanças, lei e contato</h2>
        <ul>
          <li>Quando estes termos mudarem de forma importante, avisamos no site e pedimos um novo aceite antes de você continuar.</li>
          <li>Valem as leis do Brasil. Se houver disputa, você pode usar o foro da sua cidade.</li>
          <li>
            Dúvidas sobre estes termos ou sobre seus dados: <Link href="/feedback">Feedback</Link>. Veja também a{" "}
            <Link href="/privacidade">Política de privacidade</Link>.
          </li>
        </ul>
      </section>
    </div>
  );
}
