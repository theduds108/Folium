import type { NextConfig } from "next";

// Por enquanto o site é exportado como arquivos estáticos (sem servidor),
// o que permite hospedar a prévia em qualquer lugar. Quando entrar o banco
// de dados (Supabase), dá para remover "output: export" e hospedar na Vercel.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Só para a prévia: serve os arquivos internos em /a/_next (o host da prévia não aceita pastas que começam com "_").
  assetPrefix: process.env.PREVIA ? "/a" : undefined,
};

export default nextConfig;
