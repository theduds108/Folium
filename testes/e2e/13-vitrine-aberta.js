// Vitrine aberta (pitch 27/11): sem conta vê talentos e portfólios, nunca contatos.
const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const base = { cidade: "Bauru, SP", bio: "bio da ana", servicos: ["Identidade visual"], habilidades: [], valor_referencia: "", whatsapp: "14991234567", email_contato: "ana.contato@exemplo.com", disponivel: true, publicado: true, link_publico: false, links: { instagram: "@ana.secreta" }, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] };
(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { ...base, id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3 });
  await post("trabalhos", [{ id: "t1", perfil_id: "u-aluna", titulo: "Marca da padaria", tipo: "Identidade visual", descricao: "", ordem: 0, galeria: [] }]);
  for (const vp of [{ width: 390, height: 844 }, { width: 1366, height: 900 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    await ctx.addInitScript(() => { for (const t of ["visitante", "colaborador", "contratante"]) { localStorage.setItem("folium-tour-" + t, "1"); localStorage.setItem("folium-tour-visto-" + t, "1"); } });
    const page = await ctx.newPage();
    const tam = vp.width + "px";
    await page.goto(BASE + "/"); await page.waitForTimeout(2500);
    ok(`${tam} capa mostra portfólio sem login`, await page.locator(".polaroide", { hasText: "Ana Souza" }).first().isVisible().catch(() => false));
    await page.goto(BASE + "/talentos/"); await page.waitForTimeout(2500);
    ok(`${tam} talentos sem login mostra a Ana`, await page.locator(".polaroide", { hasText: "Ana Souza" }).first().isVisible());
    ok(`${tam} talentos sem login não pede conta`, !(await page.getByText("Entre para ver os talentos").isVisible().catch(() => false)));
    await page.locator(".polaroide", { hasText: "Ana Souza" }).first().click(); await page.waitForTimeout(2500);
    ok(`${tam} portfólio abre sem login`, await page.getByRole("heading", { name: "Ana Souza" }).isVisible());
    ok(`${tam} portfólio mostra trabalho`, await page.getByText("Marca da padaria").first().isVisible());
    const html = await page.content();
    ok(`${tam} sem WhatsApp/e-mail/rede na página`, !/14991234567|wa\.me|ana\.contato|mailto:|ana\.secreta/.test(html));
    ok(`${tam} sem botão de contato`, !(await page.getByText("Conversar no WhatsApp").isVisible().catch(() => false)));
    ok(`${tam} pede conta para falar`, await page.getByText(/Para falar com Ana/).isVisible());
    ok(`${tam} tem voltar para talentos`, await page.getByRole("link", { name: /Voltar para talentos/ }).isVisible());
    await page.screenshot({ path: `testes/e2e/capturas/vitrine-${vp.width}.png` });
    await ctx.close();
  }
  // Vitrine fechada no banco: volta o convite para entrar.
  await post("config_site", { chave: "vitrine_aberta", valor: false });
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(BASE + "/talentos/"); await page.waitForTimeout(2500);
  ok("fechada: talentos pede conta", await page.getByText("Entre para ver os talentos").isVisible());
  await page.goto(BASE + "/perfil/?u=ana-souza"); await page.waitForTimeout(2500);
  ok("fechada: portfólio pede conta", await page.getByText("Entre para ver este portfólio").isVisible());
} catch (e) { ok("execução", false, e.message); } finally { await browser.close(); console.log(out.join("\n")); } })();
