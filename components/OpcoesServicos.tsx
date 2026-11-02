import { SERVICOS_POR_AREA } from "@/lib/data";

/** <option>s dos serviços agrupados por área, para usar dentro de um <select>. */
export function OpcoesServicos() {
  return (
    <>
      {SERVICOS_POR_AREA.map((g) => (
        <optgroup key={g.area} label={g.area}>
          {g.servicos.map((s) => <option key={s}>{s}</option>)}
        </optgroup>
      ))}
    </>
  );
}
