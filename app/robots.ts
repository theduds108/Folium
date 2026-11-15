import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * robots.txt: o site todo pode ser rastreado. As páginas de conta não são bloqueadas aqui de propósito:
 * elas têm noindex (lib/site.ts), e o Google só enxerga o noindex se puder abrir a página.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
