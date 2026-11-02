import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fólium",
    short_name: "Fólium",
    description: "Portfólios de universitários da UNISAGRADO que viram oportunidade.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F0E4",
    theme_color: "#4F7A3A",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
