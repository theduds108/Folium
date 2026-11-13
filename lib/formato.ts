// Máscaras e formatos usados nos formulários.

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Telefone brasileiro enquanto digita: (14) 99123-4567 ou (14) 3222-0000. */
export function mascaraTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function telefoneValido(valor: string) {
  const d = valor.replace(/\D/g, "");
  return d.length === 0 || d.length === 10 || d.length === 11;
}

/** Só números, até 4 dígitos (para campos de ano). */
export function mascaraAno(valor: string) {
  return valor.replace(/\D/g, "").slice(0, 4);
}

/** "2025-03" vira "Mar/2025". Textos em outro formato voltam como estão. */
export function formatarMes(valor?: string) {
  if (!valor) return "";
  const m = /^(\d{4})-(\d{2})$/.exec(valor);
  if (!m) return valor;
  return `${MESES[Number(m[2]) - 1] ?? m[2]}/${m[1]}`;
}

/** Período de uma experiência: "Mar/2025 – atual" ou "Fev/2024 – Dez/2024". */
export function formatarPeriodo(inicio?: string, fim?: string, atual?: boolean) {
  const a = formatarMes(inicio);
  const b = atual ? "atual" : formatarMes(fim);
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

/** Valor em reais enquanto digita: "120000" vira "R$ 1.200". */
export function mascaraReais(valor: string) {
  const d = valor.replace(/\D/g, "").replace(/^0+/, "").slice(0, 7);
  if (!d) return "";
  return `R$ ${Number(d).toLocaleString("pt-BR")}`;
}

/** "2026-11-22" vira "22/11/2026". */
export function formatarData(valor: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

type DadosCurso = { semestre: number; conclusao?: string; formacao?: { situacao?: string; turno?: string; inicio?: string } };

/** Em que ponto do curso o aluno está, curto: "5º semestre", "Curso concluído", "Curso trancado". */
export function etapaCurso(a: DadosCurso) {
  const s = a.formacao?.situacao;
  if (s === "Concluído") return "Curso concluído";
  if (s === "Trancado") return "Curso trancado";
  return `${a.semestre}º semestre`;
}

/** Linha completa da graduação: "5º semestre · noturno · desde Fev/2024 · conclusão em Dez/2027". */
export function detalhesCurso(a: DadosCurso) {
  const s = a.formacao?.situacao;
  const inicio = formatarMes(a.formacao?.inicio);
  const fim = formatarMes(a.conclusao);
  const turno = a.formacao?.turno ? (a.formacao.turno === "EAD" ? "EAD" : a.formacao.turno.toLowerCase()) : "";
  if (s === "Concluído")
    return [etapaCurso(a), turno, inicio && fim ? `${inicio} – ${fim}` : fim ? `em ${fim}` : inicio ? `desde ${inicio}` : ""].filter(Boolean).join(" · ");
  return [etapaCurso(a), turno, inicio ? `desde ${inicio}` : "", fim && s !== "Trancado" ? `conclusão em ${fim}` : ""].filter(Boolean).join(" · ");
}
