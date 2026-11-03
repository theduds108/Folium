import { SERVICOS_POR_AREA } from "@/lib/data";
import type { GrupoSeletor } from "./Seletor";

/** Serviços agrupados por área, no formato do Seletor. */
export const GRUPOS_SERVICOS: GrupoSeletor[] = SERVICOS_POR_AREA.map((g) => ({ titulo: g.area, opcoes: g.servicos }));

/** Mesma lista, com a opção "Todos" no começo (para filtros). */
export const GRUPOS_SERVICOS_FILTRO: GrupoSeletor[] = [{ opcoes: [{ valor: "", rotulo: "Todos" }] }, ...GRUPOS_SERVICOS];
