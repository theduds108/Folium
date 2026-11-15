import type { Metadata } from "next";

/**
 * Endereço oficial do site, usado em canonical, sitemap, robots e Open Graph.
 * Hoje é o endereço da Vercel. Quando o domínio próprio for comprado, basta criar a variável
 * NEXT_PUBLIC_SITE_URL na Vercel (ex.: https://foliumapp.com.br) e fazer um novo deploy.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://folium-phi.vercel.app").trim().replace(/\/+$/, "");

export const SITE_NOME = "Fólium";
export const SITE_TITULO = "Fólium · Portfólios que viram oportunidade";
export const SITE_DESCRICAO =
  "Vitrine segura de portfólios de universitários da UNISAGRADO. Encontre talentos locais para seu próximo freela.";

/** Imagem de compartilhamento (WhatsApp, Instagram, LinkedIn, X), 1200×630. */
export const IMAGEM_COMPARTILHAR = {
  url: "/og-folium.png",
  width: 1200,
  height: 630,
  alt: "Fólium: portfólios de universitários da UNISAGRADO que viram oportunidade",
};

/**
 * Código da verificação do Google Search Console (método "Tag HTML", só o valor de content).
 * Fica numa variável da Vercel: NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
 */
export const VERIFICACAO_GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

/** Páginas públicas que entram no sitemap.xml (com a barra no fim, como o site serve). */
export const PAGINAS_PUBLICAS: { caminho: string; prioridade: number }[] = [
  { caminho: "/", prioridade: 1 },
  { caminho: "/sobre/", prioridade: 0.8 },
  { caminho: "/guia/", prioridade: 0.8 },
  { caminho: "/planos/", prioridade: 0.7 },
  { caminho: "/instalar/", prioridade: 0.5 },
  { caminho: "/conduta/", prioridade: 0.4 },
  { caminho: "/privacidade/", prioridade: 0.3 },
];

/**
 * Metadados de uma página: título, descrição, canonical, Open Graph e Twitter Card.
 * O Next substitui (não mescla) o openGraph do layout quando a página define o seu,
 * por isso cada página recebe o bloco completo daqui.
 * indexar: false = páginas de conta, que não devem aparecer no Google (noindex, mas links seguidos).
 */
export function metadadosPagina({
  titulo,
  descricao = SITE_DESCRICAO,
  caminho,
  indexar = true,
}: {
  /** Sem "· Fólium": o template do layout acrescenta. Vazio = título da home. */
  titulo?: string;
  descricao?: string;
  /** Caminho com barra no fim, ex.: "/sobre/". */
  caminho: string;
  indexar?: boolean;
}): Metadata {
  const tituloCompleto = titulo ? `${titulo} · ${SITE_NOME}` : SITE_TITULO;
  return {
    title: titulo ? titulo : { absolute: SITE_TITULO },
    description: descricao,
    alternates: { canonical: caminho },
    robots: indexar ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NOME,
      url: caminho,
      title: tituloCompleto,
      description: descricao,
      images: [IMAGEM_COMPARTILHAR],
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: descricao,
      images: [IMAGEM_COMPARTILHAR.url],
    },
  };
}
