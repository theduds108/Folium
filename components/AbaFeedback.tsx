"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Aba fixa na lateral direita, em todas as páginas, que leva para a página de Feedback (na mesma aba). */
export function AbaFeedback() {
  const pathname = usePathname();
  if (pathname.startsWith("/feedback")) return null;
  // <aside> marca a aba como região própria, para leitor de tela (fica fora do <main>).
  return (
    <aside aria-label="Feedback">
      <Link href="/feedback" className="aba-feedback" data-tour="feedback" aria-label="Mandar feedback para a equipe do Fólium">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 5v2h10V9Zm0 4v2h7v-2Z" fill="currentColor" fillRule="evenodd" />
        </svg>
        <span>Feedback</span>
      </Link>
    </aside>
  );
}
