// Trabalho em collab no portfólio dos colegas: convite, aceite com "minha parte", id fixo ao salvar,
// tirar do portfólio e desmarcar.
const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const estado = async () => (await (await fetch(MOCK + "/__state")).json()).db;
const base = { cidade: "Bauru, SP", bio: "bio", servicos: ["Identidade visual"], habilidades: [], valor_referencia: "", whatsapp: "(14) 99123-4567", email_contato: "", disponivel: true, publicado: true, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] };
async function entrar(browser, usuario) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(() => { for (const t of ["visitante", "colaborador", "contratante"]) { localStorage.setItem("folium-tour-" + t, "1"); localStorage.setItem("folium-tour-visto-" + t, "1"); } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/entrar/"); await page.getByLabel("Nome de usuário ou e-mail").fill(usuario); await page.getByLabel("Senha", { exact: true }).fill("Senha#123"); await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/meu-perfil/**"); await page.waitForTimeout(2000); await page.keyboard.press("Escape");
  return { ctx, page };
}
(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { ...base, id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3 });
  await post("perfis", { ...base, id: "u-gi", slug: "gi-lima", nome: "Gi Lima", curso: "Jornalismo", semestre: 6 });
  await post("trabalhos", [{ id: "11111111-1111-1111-1111-111111111111", perfil_id: "u-aluna", titulo: "Artigo: design e cidade", tipo: "Redação", descricao: "Artigo na revista do curso.", ordem: 0, galeria: [], coautores: [] }]);

  // Ana marca a Gi
  let { ctx, page } = await entrar(browser, "ana");
  await page.locator(".ficha-aba", { hasText: "Sua obra" }).first().click();
  const campo = page.getByLabel("Colegas do trabalho 1");
  await campo.fill("gi"); await page.waitForTimeout(800); await page.getByRole("option", { name: /Gi Lima/ }).click();
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(2000);
  let db = await estado();
  ok("salvar mantém o id do trabalho", db.trabalhos.some((t) => t.id === "11111111-1111-1111-1111-111111111111"));
  ok("Gi recebe convite pendente", (db.collab || []).length === 1 && db.collab[0].coautor_id === "u-gi" && db.collab[0].status === "pendente");
  await ctx.close();

  // Antes do aceite, nada no portfólio da Gi
  ({ ctx, page } = await entrar(browser, "gi"));
  await page.goto(BASE + "/perfil/?u=gi-lima"); await page.waitForTimeout(2000);
  ok("sem aceite, não aparece no portfólio da colega", !(await page.getByText("Artigo: design e cidade").isVisible().catch(() => false)));
  await page.goto(BASE + "/meu-perfil/"); await page.waitForTimeout(2000); await page.keyboard.press("Escape");
  ok("Gi vê o convite no editor", await page.getByText("Marcaram você num trabalho em collab").isVisible());
  await page.getByLabel("O que você fez neste trabalho").fill("Entrevistas e texto final");
  await page.getByRole("button", { name: "Aceitar e pôr no meu portfólio" }).click(); await page.waitForTimeout(1200);
  db = await estado();
  ok("aceite grava a parte da Gi", db.collab[0].status === "aceito" && db.collab[0].papel === "Entrevistas e texto final");
  await page.goto(BASE + "/perfil/?u=gi-lima"); await page.waitForTimeout(2500);
  await page.getByRole("tab", { name: /Collabs/ }).click();
  const sec = page.getByRole("tabpanel", { name: /Collabs/ });
  ok("portfólio da Gi mostra a aba Collabs", await sec.isVisible());
  ok("com a parte dela", await sec.getByText("Entrevistas e texto final").isVisible());
  const link = sec.locator(".obra-collab a", { hasText: "Ana Souza" });
  ok("crédito para quem publicou, com link na mesma aba", (await link.getAttribute("href"))?.includes("/perfil/?u=ana-souza") && !(await link.getAttribute("target")));
  await page.screenshot({ path: __dirname + "/capturas/collab-portfolio-gi.png", fullPage: true });
  await ctx.close();

  // Ana salva de novo: o aceite continua
  ({ ctx, page } = await entrar(browser, "ana"));
  await page.locator("input[placeholder='Como quer aparecer']").fill("Ana Souza Lima");
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(2000);
  db = await estado();
  ok("aceite sobrevive a novas gravações da Ana", db.collab.length === 1 && db.collab[0].status === "aceito");
  // Ana desmarca a Gi
  await page.locator(".ficha-aba", { hasText: "Sua obra" }).first().click();
  await page.getByRole("button", { name: "Tirar Gi Lima" }).click();
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(2000);
  db = await estado();
  ok("desmarcar tira o convite", (db.collab || []).length === 0);
  await ctx.close();
} catch (e) { out.push("ERRO " + e.message.split("\n")[0]); } await browser.close(); console.log(out.join("\n")); })();
