import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fólium",
    short_name: "Fólium",
    description: "Portfólios de universitários da UNISAGRADO que viram oportunidade.",
    start_url: "/?origem=app",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#F6F0E4",
    theme_color: "#4F7A3A",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["education", "business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Versões com margem e fundo cheio: o Android recorta em círculo/gota sem cortar a folha.
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Encontrar talentos", url: "/talentos/", icons: [{ src: "/icons/icon-maskable-192.png", sizes: "192x192" }] },
      { name: "Oportunidades", url: "/oportunidades/", icons: [{ src: "/icons/icon-maskable-192.png", sizes: "192x192" }] },
      { name: "Meu portfólio", url: "/meu-perfil/", icons: [{ src: "/icons/icon-maskable-192.png", sizes: "192x192" }] },
    ],
  };
}
