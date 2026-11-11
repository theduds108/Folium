// Varredura: todas as páginas, 3 perfis, 2 telas. Erros de JS, rolagem horizontal, links internos em nova aba.
const { chromium } = require("playwright");
const BASE = "http://localhost:3100";
const PAGS = ["/", "/talentos/", "/oportunidades/", "/jornal/", "/guia/", "/planos/", "/sobre/", "/feedback/", "/instalar/", "/entrar/", "/senha/", "/meu-perfil/", "/painel/", "/publicar/", "/perfil/?u=nao-existe", "/aluno/ana-ribeiro/", "/pagina-que-nao-existe/"];
const out = [];
(async () => { const browser = await chromium.launch();
  for (const quem of ["visitante", "ana", "empresa"]) for (const vp of [{ n: "cel", v: { width: 390, height: 844 }, m: true }, { n: "pc", v: { width: 1366, height: 800 } }]) {
    const ctx = await browser.newContext({ viewport: vp.v, isMobile: vp.m, hasTouch: vp.m });
    await ctx.addInitScript(() => { try { for (const t of ["visitante","colaborador","contratante"]) localStorage.setItem("folium-tour-"+t, "1"); } catch {} });
    const page = await ctx.newPage(); let erros = [];
    page.on("pageerror", (e) => erros.push("pageerror: " + e.message.slice(0, 160)));
    page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && erros.push("console: " + m.text().slice(0, 160)));
    if (quem !== "visitante") { await page.goto(BASE + "/entrar/"); await page.getByLabel("Nome de usuário ou e-mail").fill(quem); await page.getByLabel("Senha", { exact: true }).fill("Senha#123"); await page.getByRole("button", { name: "Entrar", exact: true }).click(); await page.waitForTimeout(2500); }
    for (const p of PAGS) {
      erros = [];
      const r = await page.goto(BASE + p).catch((e) => null); await page.waitForTimeout(1800);
      const info = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        blank: Array.from(document.querySelectorAll('a[target="_blank"]')).filter((a) => a.host === location.host).map((a) => a.getAttribute("href")),
        h1: document.querySelector("h1")?.textContent?.slice(0, 50),
        carregando: document.body.innerText.includes("Carregando…"),
      }));
      const probs = [];
      if (info.overflow > 1) probs.push(`rolagem horizontal ${info.overflow}px`);
      if (info.blank.length) probs.push(`link interno em nova aba: ${info.blank.join(",")}`);
      if (info.carregando) probs.push("ficou em Carregando…");
      if (erros.length) probs.push(erros.join(" | "));
      out.push(`${probs.length ? "PROB" : "ok  "} ${quem}/${vp.n} ${p} [${r?.status()}] h1="${info.h1}" ${probs.join(" ; ")}`);
      if (probs.length) await page.screenshot({ path: `${__dirname}/capturas/v-${quem}-${vp.n}-${p.replace(/\W+/g, "_")}.png` });
    }
    await ctx.close();
  }
  await browser.close(); console.log(out.join("\n")); })();
