const { chromium } = require("playwright");
(async () => { const b = await chromium.launch(); const out = []; for (const vp of [{ width: 390, height: 844 }, { width: 1366, height: 800 }]) {
  const ctx = await b.newContext({ viewport: vp }); await ctx.addInitScript(() => { for (const t of ["visitante","colaborador","contratante"]) localStorage.setItem("folium-tour-"+t, "1"); });
  const page = await ctx.newPage(); const erros = []; page.on("pageerror", e => erros.push(e.message));
  await page.goto("http://localhost:3200/entrar/"); await page.getByLabel("Nome de usuário ou e-mail").fill("x"); await page.getByLabel("Senha", { exact: true }).fill("y");
  await page.getByRole("button", { name: "Entrar", exact: true }).click(); await page.getByRole("button", { name: /Continuar/ }).click(); await page.waitForTimeout(2000);
  out.push(`${vp.width} demo login -> ${page.url()}`);
  for (const p of ["/oportunidades/", "/talentos/", "/painel/", "/meu-perfil/"]) { await page.goto("http://localhost:3200" + p); await page.waitForTimeout(1200); out.push(`${vp.width} ${p} h1=${await page.locator("h1").first().textContent()} cartões=${await page.locator(".vaga, .polaroide").count()}`); }
  await page.goto("http://localhost:3200/oportunidades/"); await page.waitForTimeout(1200); await page.getByRole("button", { name: "Tenho interesse" }).first().click(); await page.waitForTimeout(500);
  out.push(`${vp.width} interesse demo marcado=${await page.getByText("Interesse enviado").first().isVisible()}`);
  await page.getByRole("button", { name: /Menu/ }).click(); await page.getByRole("button", { name: /Sair da conta/ }).click(); await page.waitForTimeout(1000);
  out.push(`${vp.width} sair demo -> ${page.url()} entrar visível=${await page.locator(".cabecalho").getByRole("link", { name: "Entrar" }).first().isVisible()}`);
  out.push(`${vp.width} erros: ${erros.join("|")}`); await ctx.close(); }
  await b.close(); console.log(out.join("\n")); })();
