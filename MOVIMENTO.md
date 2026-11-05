# Movimento no Fólium

Regra geral: movimento só para feedback, mudança de estado ou continuidade. Nada infinito em elementos de leitura, sem parallax, sem zoom de tela.
Os tempos ficam em variáveis CSS no topo de `app/globals.css`.

| Token | Valor | Onde |
| --- | --- | --- |
| `--mov-rapido` | 160ms, ease-out, sobe no máx. 3–4px | hover/foco de botões, polaroides, vagas, atalhos e fichas do leque |
| `--mov-filtro` | 200ms | abrir/fechar os filtros da mesa de pesquisa no celular |
| `--mov-feedback` | 220ms | "Tenho interesse", "Link copiado", "Portfólio salvo" (com ícone, texto e `aria-live`) |
| `--mov-entrada` | 400ms, opacity + 10px | entrada da capa e reveals ao rolar |

## Cada animação e seu objetivo

- **Abertura do app** (`Abertura`, CSS): na primeira vez que a pessoa abre o Fólium na sessão, o anel da marca se desenha, a folha brota e o nome aparece; depois o papel creme sobe como uma página virando, com uma faixa cobre atrás (~1,2s). Não bloqueia toques, não usa JS para animar e só volta numa nova sessão. A entrada da capa espera a página virar.
- **Entrada da capa** (`EntradaCapa`, CSS): marca → frase/busca/ações juntas → leque abre uma vez. Apresenta a marca e entrega a busca logo depois. Roda em CSS desde a primeira pintura, sem "piscar".
- **Folhas 3D** (`FolhasCaindo`, Three.js): caem uma única vez na chegada (3–5s) e o WebGL é liberado. Só em telas a partir de 720px. Decorativo, `aria-hidden`.
- **Reveal ao rolar** (`Revelar`, ScrollReveal): uma transição curta por seção abaixo da dobra, intervalo de 40ms em grupos. Não é usado nas listas que mudam com filtros.
- **Leque**: hover/foco traz a ficha para a frente e sobe 4px sem mexer nas vizinhas. No celular vira fileira rolável.
- **Troca de ficha no editor** (`meu-perfil`): a ficha nova entra uma vez (opacity + 10px, 400ms) e o foco vai para o título dela.
- **Confirmações**: o estado aparece com ícone e texto (não só cor ou ✓) e é anunciado por `aria-live`. O Lottie de "salvo" toca em ~250ms.

## Removido

- Letreiro de serviços correndo sem parar: virou um índice estático com links para a busca.
- Ornamentos girando em loop na capa.
- Entradas laterais (`revelar-esquerda` agora é vertical) e cascatas longas (110ms → 40ms).

## prefers-reduced-motion: reduce

O site fica completo e parado: sem abertura, sem folhas 3D, sem entrada da capa, sem reveals, sem transições de transform. Mudanças de cor e opacidade continuam (hover, foco, confirmação), e o check de "salvo" aparece pronto.
