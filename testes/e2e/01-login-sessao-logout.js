const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = [];
const ok = (n, c, extra = "") => { out.push(`${c ? "PASS" : "FAIL"} ${n} ${extra}`); };
(async () => { try {
  const browser = await chromium.launch();
  for (const vp of [{ name: "celular", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, { name: "computador", viewport: { width: 1366, height: 800 } }]) {
    const ctx = await browser.newContext({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
    const page = await ctx.newPage();
    const erros = []; page.on("pageerror", (e) => erros.push(e.message)); page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
    const P = `[${vp.name}]`; await page.keyboard.press("Escape");
    // 1. Login com usuário + senha errada
    await page.goto(BASE + "/entrar/");
    await page.getByLabel("Nome de usuário ou e-mail").fill("ana");
    await page.getByLabel("Senha", { exact: true }).fill("errada");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.waitForTimeout(800);
    ok(P + " senha errada mostra erro", await page.locator("p.erro").isVisible(), await page.locator("p.erro").textContent().catch(() => ""));
    // 2. login certo (com maiúscula e espaços)
    await page.getByLabel("Nome de usuário ou e-mail").fill("  Ana ");
    await page.getByLabel("Senha", { exact: true }).fill("Senha#123");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.waitForURL("**/meu-perfil/**", { timeout: 8000 }).catch(() => {});
    ok(P + " login usuário+senha vai para /meu-perfil", page.url().includes("/meu-perfil"), page.url());
    // 3. recarrega: continua logado
    await page.reload(); await page.waitForTimeout(2500);
    const tokenSalvo = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes("auth-token")));
    ok(P + " sessão salva no navegador", tokenSalvo.length > 0, tokenSalvo.join(","));
    ok(P + " após recarregar continua na área (sem convite de entrar)", !(await page.getByText("Fazer o primeiro acesso").isVisible().catch(() => false)));
    // 4. nova aba no mesmo navegador
    const p2 = await ctx.newPage(); await p2.goto(BASE + "/entrar/"); await p2.waitForURL("**/meu-perfil/**", { timeout: 8000 }).catch(() => {});
    ok(P + " /entrar com sessão salva redireciona p/ área", p2.url().includes("/meu-perfil"), p2.url()); await p2.close();
    await page.screenshot({ path: `${__dirname}/capturas/shot-${vp.name}-meu-perfil.png`, fullPage: false });
    // 5. logout
    const sairBtn = page.getByRole("button", { name: /Sair da conta/ });
    ok(P + " botão sair visível na área", await sairBtn.count() > 0);
    await fetch(MOCK + "/__log");
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    if (await sairBtn.count()) { await sairBtn.first().click(); await page.waitForTimeout(1500); }
    const log = await (await fetch(MOCK + "/__log")).json();
    out.push(`INFO ${P} chamadas no logout: ${log.filter((l) => l.includes("logout")).join(" | ")}`);
    const tokenDepois = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes("auth-token")));
    ok(P + " logout apaga sessão", tokenDepois.length === 0);
    await page.reload(); await page.waitForTimeout(1500);
    ok(P + " depois do logout cabeçalho mostra Entrar", await page.locator(".cabecalho").getByRole("link", { name: "Entrar" }).first().isVisible().catch(() => false));
    // 6. login por e-mail
    await page.goto(BASE + "/entrar/"); await page.waitForTimeout(1500); out.push("INFO url "+page.url()); await page.screenshot({path:__dirname+"/dbg.png"});
    await page.getByLabel("Nome de usuário ou e-mail").fill("CONTATO@empresa.com");
    await page.getByLabel("Senha", { exact: true }).fill("Senha#123");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.waitForURL("**/painel/**", { timeout: 8000 }).catch(() => {});
    ok(P + " login por e-mail (contratante) vai para /painel", page.url().includes("/painel"), page.url());
    await page.waitForTimeout(2500);
    ok(P + " tour não reaparece p/ quem já viu na conta", !(await page.locator(".tour-cartao, [role=dialog][aria-label*=our]").isVisible().catch(() => false)));
    await page.screenshot({ path: `${__dirname}/capturas/shot-${vp.name}-painel.png` });
    out.push(`INFO ${P} erros console: ${erros.slice(0, 5).join(" || ")}`);
    await ctx.close();
  }
  await browser.close();
  } catch(e){ out.push("ERRO "+e.message.split("\n")[0]); }
  console.log(out.join("\n")); process.exit(0);
})();
