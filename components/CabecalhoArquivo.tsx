/**
 * Cabeçalho editorial das listagens (talentos, oportunidades):
 * rótulo pequeno, título grande, descrição curta. O total de resultados aparece
 * logo abaixo, na barra de resultados, porque muda com os filtros.
 */
export function CabecalhoArquivo({
  rotulo,
  lugar = "Bauru · SP",
  titulo,
  descricao,
  children,
}: {
  rotulo: string;
  lugar?: string;
  titulo: string;
  descricao: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="cabecalho-arquivo">
      <div className="rotulos">
        <span>{rotulo}</span>
        <span>{lugar}</span>
      </div>
      <h1 className="titulo-pagina">{titulo}</h1>
      <p className="cabecalho-arquivo-desc">{descricao}</p>
      {children}
    </header>
  );
}
