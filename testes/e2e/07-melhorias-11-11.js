// Melhorias de 11/11/2026: faixa de preço ao publicar vaga, perfil sem conexão, convite de colegas,
// termos/privacidade no cadastro e excluir a própria conta.
const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const estado = async () => (await fetch(MOCK + "/__state")).json();
async function entrar(page, usuario) {
  await page.goto(BASE + "/entrar/");
  await page.getByLabel("Nome de usuário ou e-mail").fill(usuario);
  await page.getByLabel("Senha", { exact: true }).fill("Senha#123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForTimeout(2000);
}
(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3, cidade: "Bauru, SP", bio: "bio", servicos: [], habilidades: [], valor_referencia: "", whatsapp: "(14) 99123-4567", email_contato: "", disponivel: true, publicado: true, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] });
  await post("trabalhos", [{ id: "t1", perfil_id: "u-aluna", titulo: "Logo café", tipo: "Identidade visual", descricao: "", ordem: 0, galeria: [] }]);

  for (const vp of [{ width: 390, height: 844 }, { width: 1366, height: 800 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    await ctx.addInitScript(() => { for (const t of ["visitante", "colaborador", "contratante"]) localStorage.setItem("folium-tour-visto-" + t, "1"); });
    const page = await ctx.newPage();
    const tag = vp.width < 500 ? "[celular]" : "[computador]";

    // Cadastro mostra os termos (link na mesma aba)
    await page.goto(BASE + "/entrar/?modo=primeiro"); await page.waitForTimeout(800);
    const termos = page.locator(".cadastro-termos a").first();
    ok(`${tag} primeiro acesso mostra link dos termos`, await termos.isVisible());
    ok(`${tag} link dos termos abre na mesma aba`, (await termos.getAttribute("target")) === null);

    // Contratante: faixa de preço ao publicar vaga
    await entrar(page, "empresa");
    await page.goto(BASE + "/publicar/"); await page.waitForTimeout(1500);
    const faixa = page.locator(".faixa-sugerida");
    ok(`${tag} publicar vaga mostra faixa de preço`, await faixa.isVisible(), (await faixa.textContent().catch(() => "")).slice(0, 90));
    await faixa.getByRole("button").click();
    const orc = await page.locator("input[placeholder='R$ 0']").inputValue();
    ok(`${tag} botão preenche o orçamento`, /^R\$ \d/.test(orc), orc);
    const larg = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    ok(`${tag} publicar sem rolagem lateral`, larg);

    // Perfil com internet falhando: aviso de conexão, e "Tentar de novo" recupera
    await fetch(MOCK + "/__fail?t=perfis&n=1");
    await page.goto(BASE + "/perfil/?u=ana-souza"); await page.waitForTimeout(2000);
    ok(`${tag} perfil sem conexão avisa`, await page.getByText("Não deu para carregar o portfólio").isVisible());
    await page.getByRole("button", { name: "Tentar de novo" }).click(); await page.waitForTimeout(1500);
    ok(`${tag} tentar de novo mostra o perfil`, await page.getByRole("heading", { name: /Ana Souza/ }).first().isVisible());
    await page.goto(BASE + "/perfil/?u=nao-existe"); await page.waitForTimeout(1500);
    ok(`${tag} perfil inexistente continua "não encontrado"`, await page.getByText("Portfólio não encontrado").isVisible());
    await ctx.close();
  }

  // Aluna: convite + salvar trabalhos pela função transacional + excluir conta
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } });
  await ctx.addInitScript(() => { for (const t of ["visitante", "colaborador", "contratante"]) localStorage.setItem("folium-tour-visto-" + t, "1"); });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  const page = await ctx.newPage();
  await entrar(page, "ana");
  await page.waitForURL("**/meu-perfil/**"); await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Convidar colegas" }).click(); await page.waitForTimeout(300);
  const copiado = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  ok("convite copia o link do primeiro acesso", copiado.includes("/entrar/?modo=primeiro"), copiado.slice(-40));
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(1500);
  const log = (await (await fetch(MOCK + "/__log")).json()).join(" ");
  ok("salvar usa a função salvar_trabalhos", log.includes("/rpc/salvar_trabalhos"), (await page.locator(".erro, [role=alert]").allTextContents()).join("/").slice(0, 160));
  ok("salvar mantém o trabalho", (await estado()).db.trabalhos.length === 1);

  await page.goto(BASE + "/privacidade/#excluir"); await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Quero excluir minha conta" }).click();
  const confirmar = page.getByRole("button", { name: "Excluir minha conta para sempre" });
  ok("excluir fica travado sem digitar EXCLUIR", await confirmar.isDisabled());
  await page.getByLabel(/digite EXCLUIR/).fill("excluir");
  await confirmar.click(); await page.waitForTimeout(1500);
  ok("mostra conta excluída", await page.getByText("Sua conta foi excluída").isVisible());
  const st = await estado();
  ok("banco apagou login, perfil e trabalhos", !st.users.some((u) => u.id === "u-aluna") && !st.db.perfis.some((p) => p.id === "u-aluna") && !st.db.trabalhos.some((t) => t.perfil_id === "u-aluna"));
  await page.goto(BASE + "/"); await page.waitForTimeout(1000);
  ok("depois de excluir, cabeçalho volta a mostrar Entrar", await page.getByRole("link", { name: "Entrar", exact: true }).first().isVisible());
  await ctx.close();
} catch (e) { out.push("ERRO " + e.message.split("\n")[0]); } await browser.close(); console.log(out.join("\n")); })();
