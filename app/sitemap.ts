import type { MetadataRoute } from "next";
import { PAGINAS_PUBLICAS, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * sitemap.xml: só as páginas públicas, que qualquer pessoa vê sem conta.
 * Portfólios, vagas e páginas de conta ficam de fora (exigem login ou têm noindex).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS_PUBLICAS.map(({ caminho, prioridade }) => ({
    url: `${SITE_URL}${caminho}`,
    priority: prioridade,
  }));
}
