const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const base = { cidade: "Bauru, SP", bio: "bio", servicos: ["Identidade visual"], habilidades: [], valor_referencia: "", whatsapp: "(14) 99123-4567", email_contato: "", disponivel: true, publicado: true, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] };
(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { ...base, id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3 });
  await post("perfis", { ...base, id: "u-gi", slug: "gi-lima", nome: "Gi Lima", curso: "Jornalismo", semestre: 6 });
  await post("trabalhos", [{ id: "t1", perfil_id: "u-aluna", titulo: "Artigo", tipo: "Identidade visual", descricao: "", ordem: 0, galeria: [] }]);
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(() => { for (const t of ["visitante", "colaborador", "contratante"]) { localStorage.setItem("folium-tour-" + t, "1"); localStorage.setItem("folium-tour-visto-" + t, "1"); } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/entrar/"); await page.getByLabel("Nome de usuário ou e-mail").fill("ana"); await page.getByLabel("Senha", { exact: true }).fill("Senha#123"); await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/meu-perfil/**"); await page.waitForTimeout(2000); await page.keyboard.press("Escape");
  // Formação
  await page.locator(".ficha-aba", { hasText: "Formação" }).first().click();
  ok("ficha Formação mostra a instituição", await page.getByText("Conferida pelo seu e-mail institucional").isVisible());
  await page.getByLabel("Turno").click(); await page.getByRole("option", { name: "Noturno" }).click();
  await page.locator("label.opcao", { hasText: "Concluído" }).click();
  ok("concluído esconde o semestre", !(await page.getByLabel("Semestre").isVisible().catch(() => false)));
  await page.getByRole("button", { name: "+ Adicionar outra formação" }).click();
  await page.getByLabel("Curso da formação 1").fill("Técnico em Comunicação Visual");
  await page.getByLabel("Instituição da formação 1").fill("ETEC Bauru");
  // Collab
  await page.locator(".ficha-aba", { hasText: "Sua obra" }).first().click();
  const campo = page.getByLabel("Colegas do trabalho 1");
  await campo.fill("gi"); await page.waitForTimeout(800);
  await page.getByRole("option", { name: /Gi Lima/ }).click();
  await campo.fill("Carlos Mendes"); await campo.press("Enter");
  ok("Enter no campo de colega não salva o formulário", !(await page.getByText(/Portfólio salvo|Salvo/).first().isVisible().catch(() => false)));
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(2000);
  const st = await (await fetch(MOCK + "/__state")).json();
  const p = st.db.perfis.find((x) => x.id === "u-aluna");
  ok("salva situação e turno", p.formacao && p.formacao.situacao === "Concluído" && p.formacao.turno === "Noturno", JSON.stringify(p.formacao));
  ok("salva outra formação", p.formacao.outras.length === 1 && p.formacao.outras[0].instituicao === "ETEC Bauru");
  const t = st.db.trabalhos.find((x) => x.perfil_id === "u-aluna");
  ok("salva colegas do trabalho", JSON.stringify(t.coautores) === JSON.stringify([{ nome: "Gi Lima", slug: "gi-lima" }, { nome: "Carlos Mendes" }]), JSON.stringify(t.coautores));
  // Perfil público
  await page.goto(BASE + "/perfil/?u=ana-souza"); await page.waitForTimeout(2500);
  ok("perfil mostra curso concluído", await page.getByText("Curso concluído").first().isVisible());
  ok("perfil mostra outra formação", await page.getByText("Técnico em Comunicação Visual").isVisible());
  const link = page.locator(".obra-collab a", { hasText: "Gi Lima" }).first();
  ok("colega do Fólium vira link na mesma aba", (await link.getAttribute("href"))?.includes("/perfil/?u=gi-lima") && !(await link.getAttribute("target")));
  ok("colega sem portfólio aparece só com nome", await page.locator(".obra-collab", { hasText: "Carlos Mendes" }).first().isVisible());
  await ctx.close();
} catch (e) { out.push("ERRO " + e.message.split("\n")[0]); } await browser.close(); console.log(out.join("\n")); })();
