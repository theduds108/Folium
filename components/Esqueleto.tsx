/**
 * Esqueletos discretos no estilo papel/linha, mostrados enquanto perfis e vagas
 * chegam do banco. Sem brilho correndo nem spinner: são fichas em branco, paradas.
 * Ficam escondidos dos leitores de tela; quem chama anuncia "carregando" em texto.
 */

export function EsqueletoPolaroide() {
  return (
    <div className="polaroide esqueleto" aria-hidden="true">
      <span className="esqueleto-foto" />
      <span className="esqueleto-linha" style={{ width: "70%", height: 16 }} />
      <span className="esqueleto-linha" style={{ width: "50%" }} />
      <span className="esqueleto-linha" style={{ width: "40%" }} />
    </div>
  );
}

export function EsqueletoVaga() {
  return (
    <div className="cartao vaga esqueleto" aria-hidden="true">
      <span className="esqueleto-linha" style={{ width: 70, height: 22 }} />
      <span className="esqueleto-linha" style={{ width: "80%", height: 16 }} />
      <span className="esqueleto-linha" style={{ width: "45%" }} />
      <span className="esqueleto-linha" style={{ width: "100%", height: 40 }} />
      <span className="esqueleto-linha" style={{ width: "100%" }} />
    </div>
  );
}

export function EsqueletoGrade({ tipo, quantidade = 3 }: { tipo: "talento" | "vaga"; quantidade?: number }) {
  const Item = tipo === "talento" ? EsqueletoPolaroide : EsqueletoVaga;
  return (
    <div className={tipo === "talento" ? "grade-alunos" : "grade-vagas"} role="status">
      <span className="visualmente-oculto">{tipo === "talento" ? "Carregando talentos…" : "Carregando oportunidades…"}</span>
      {Array.from({ length: quantidade }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}

export function EsqueletoPerfil() {
  return (
    <div className="container perfil" role="status">
      <span className="visualmente-oculto">Carregando portfólio…</span>
      <div className="perfil-cabeca" aria-hidden="true">
        <span className="esqueleto-linha" style={{ width: 220, marginTop: 28 }} />
        <span className="esqueleto-linha" style={{ width: "min(560px, 90%)", height: 56, marginTop: 18 }} />
        <span className="esqueleto-linha" style={{ width: 260, height: 18, marginTop: 12 }} />
      </div>
      <div className="perfil-apresenta esqueleto" aria-hidden="true" style={{ marginTop: 28 }}>
        <span className="esqueleto-foto" style={{ aspectRatio: "3 / 4" }} />
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <span className="esqueleto-linha" style={{ width: "90%" }} />
          <span className="esqueleto-linha" style={{ width: "80%" }} />
          <span className="esqueleto-linha" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}
