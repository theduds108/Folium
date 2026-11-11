const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3, cidade: "Bauru, SP", bio: "bio", servicos: [], habilidades: [], valor_referencia: "", whatsapp: "(14) 99123-4567", email_contato: "", disponivel: true, publicado: true, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] });
  await post("trabalhos", [{ id: "t1", perfil_id: "u-aluna", titulo: "Logo café", tipo: "Identidade visual", descricao: "", ordem: 0, galeria: [] }, { id: "t2", perfil_id: "u-aluna", titulo: "Ensaio", tipo: "Fotografia", descricao: "", ordem: 1, galeria: [] }]);
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } });
  await ctx.addInitScript(() => { for (const t of ["visitante","colaborador","contratante"]) localStorage.setItem("folium-tour-"+t, "1"); });
  const page = await ctx.newPage();
  await page.goto(BASE + "/entrar/"); await page.getByLabel("Nome de usuário ou e-mail").fill("ana"); await page.getByLabel("Senha", { exact: true }).fill("Senha#123"); await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/meu-perfil/**"); await page.waitForTimeout(2000);
  ok("editor carrega nome salvo", (await page.locator("input[placeholder='Como quer aparecer']").inputValue()) === "Ana Souza");
  // falha ao carregar o perfil
  // 3 falhas: o editor e os avisos do canto (estatísticas, vagas novas) também leem perfis ao abrir.
  await fetch(MOCK + "/__fail?t=perfis&n=3");
  await page.reload(); await page.waitForTimeout(2500);
  const nome = await page.locator("input[placeholder='Como quer aparecer']").inputValue().catch(() => "(sem campo)");
  const salvarHabil = await page.getByRole("button", { name: /Salvar portfólio/ }).first().isEnabled().catch(() => false);
  out.push(`INFO após falha de rede: campo nome="${nome}", botão Salvar habilitado=${salvarHabil}, erro="${await page.locator(".erro").first().textContent().catch(()=> "")}"`);
  ok("com falha ao carregar, não deixa salvar por cima do perfil", !salvarHabil || nome === "(sem campo)");
  await page.screenshot({ path: __dirname + "/capturas/shot-falha-perfil.png" });
  if (salvarHabil && nome === "") {
    await page.locator("input[placeholder='Como quer aparecer']").fill("Ana");
  }
  // salvar normal e recarregar
  await page.reload(); await page.waitForTimeout(2500);
  await page.locator("input[placeholder='Como quer aparecer']").fill("Ana Souza Lima");
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(2000);
  out.push("INFO erro pós-salvar: " + (await page.locator(".erro").allTextContents()).join("/") + " log: " + (await (await fetch(MOCK + "/__log")).json()).filter(l=>!l.startsWith("OPTIONS")).slice(-6).join(" , "));
  const st = await (await fetch(MOCK + "/__state")).json();
  ok("salvar grava nome", st.db.perfis[0].nome === "Ana Souza Lima");
  ok("salvar mantém os 2 trabalhos", st.db.trabalhos.length === 2, String(st.db.trabalhos.length));
  await ctx.close();
} catch (e) { out.push("ERRO " + e.message.split("\n")[0]); } await browser.close(); console.log(out.join("\n")); })();
