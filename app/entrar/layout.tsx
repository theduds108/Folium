import type { Metadata } from "next";
import { metadadosPagina } from "@/lib/site";

// A página é "use client" e não pode exportar metadados; eles ficam aqui. Página de conta: fora do Google.
export const metadata: Metadata = metadadosPagina({ titulo: "Entrar", caminho: "/entrar/", indexar: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
