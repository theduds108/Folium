import type { Metadata } from "next";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { InstalarApp } from "@/components/InstalarApp";

export const metadata: Metadata = { title: "Instalar o app" };

/** Passo a passo para instalar o Fólium no celular. O Fólium é um site instalável (PWA): não precisa de loja de aplicativos. */
export default function Instalar() {
  return (
    <div className="container pagina">
      <CabecalhoArquivo
        rotulo="Fólium no celular"
        titulo="Instalar o app"
        descricao="O Fólium funciona como aplicativo, sem baixar da loja. Ele ganha um ícone na tela inicial e abre em tela cheia, como qualquer outro app."
      >
        <p style={{ margin: "12px 0 0" }}>
          <InstalarApp className="botao botao-verde" rotulo="Instalar agora" />
        </p>
      </CabecalhoArquivo>

      <div className="dois-lados" style={{ marginTop: 24 }}>
        <section className="cartao lado" aria-labelledby="inst-android">
          <h2 id="inst-android" className="h-pequeno">Android (Chrome)</h2>
          <ol className="passos-instalar">
            <li>Abra o Fólium no <strong>Chrome</strong>.</li>
            <li>Toque nos <strong>três pontinhos</strong> no canto de cima da tela.</li>
            <li>Escolha <strong>Instalar app</strong> (ou <strong>Adicionar à tela inicial</strong>) e confirme em <strong>Instalar</strong>.</li>
            <li>O ícone da folha aparece junto com seus outros apps.</li>
          </ol>
        </section>

        <section className="cartao lado" aria-labelledby="inst-iphone">
          <h2 id="inst-iphone" className="h-pequeno">iPhone e iPad (Safari)</h2>
          <ol className="passos-instalar">
            <li>Abra o Fólium no <strong>Safari</strong>. Em outro navegador, a opção não aparece.</li>
            <li>Toque em <strong>Compartilhar</strong> (o quadrado com a seta para cima).</li>
            <li>Role a lista e escolha <strong>Adicionar à Tela de Início</strong>.</li>
            <li>Toque em <strong>Adicionar</strong>. O ícone da folha aparece na tela inicial.</li>
          </ol>
        </section>
      </div>

      <section className="cartao lado" aria-labelledby="inst-pc" style={{ marginTop: 20 }}>
        <h2 id="inst-pc" className="h-pequeno">No computador (Chrome ou Edge)</h2>
        <p className="suave" style={{ margin: 0 }}>
          Clique no ícone de instalar no fim da barra de endereço (um monitor com uma seta) e depois em <strong>Instalar</strong>.
        </p>
      </section>

      <p className="suave" style={{ marginTop: 20 }}>
        Não achou a opção? Atualize o navegador e abra o Fólium direto pelo endereço do site, sem ser por dentro de outro aplicativo
        (como Instagram ou WhatsApp). Instalar não ocupa quase espaço e você pode remover o ícone quando quiser.
      </p>
    </div>
  );
}
