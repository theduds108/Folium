const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const st = async () => (await fetch(MOCK + "/__state")).json();
const entrar = async (page, u) => { await page.goto(BASE + "/entrar/"); await page.getByLabel("Nome de usuário ou e-mail").fill(u); await page.getByLabel("Senha", { exact: true }).fill("Senha#123"); await page.getByRole("button", { name: "Entrar", exact: true }).click(); await page.waitForTimeout(2500); };
(async () => { const browser = await chromium.launch(); try {
  await post("oportunidades", [{ id: "v1", titulo: "Logo para padaria", empresa: "Padaria", tipo: "Freela", servico: "Identidade visual", cidade: "Bauru, SP", orcamento: "R$ 300", prazo: "", descricao: "Logo", contato: "", status: "aprovada", destaque: false, criada_em: new Date().toISOString() }]);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { for (const t of ["visitante","colaborador","contratante"]) localStorage.setItem("folium-tour-"+t, "1"); });
  const page = await ctx.newPage();
  // Entrar com falha na conta: tela de tentar de novo, sem recarregar
  await fetch(MOCK + "/__failcontas?n=1");
  await entrar(page, "ana");
  ok("conta falhou: /entrar avisa e oferece 'Tentar de novo'", await page.getByText("a conta não carregou").isVisible());
  await page.getByRole("button", { name: "Tentar de novo" }).click(); await page.waitForTimeout(2000);
  ok("tentar de novo leva para a área", page.url().includes("/meu-perfil"), page.url());
  // Interesse sem portfólio salvo (perfis vazio): erro e desmarca
  await page.goto(BASE + "/oportunidades/"); await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Tenho interesse" }).first().click(); await page.waitForTimeout(1200);
  const erro = await page.locator(".vaga p.erro").textContent().catch(() => "");
  ok("interesse sem portfólio mostra erro e não fica marcado", erro.includes("Salve seu portfólio") && await page.getByRole("button", { name: "Tenho interesse" }).isVisible(), erro);
  await page.screenshot({ path: __dirname + "/capturas/shot-interesse-erro.png" });
  // cria perfil + trabalhos e tenta de novo
  await post("perfis", { id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3, cidade: "Bauru, SP", bio: "", servicos: [], habilidades: [], valor_referencia: "", whatsapp: "(14) 99123-4567", email_contato: "", disponivel: true, publicado: true, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] });
  await post("trabalhos", [{ id: "t1", perfil_id: "u-aluna", titulo: "Logo café", tipo: "Identidade visual", descricao: "", ordem: 0, galeria: [] }, { id: "t2", perfil_id: "u-aluna", titulo: "Ensaio", tipo: "Fotografia", descricao: "", ordem: 1, galeria: [] }]);
  await page.getByRole("button", { name: "Tenho interesse" }).first().click(); await page.waitForTimeout(1200);
  ok("interesse gravado no banco", (await st()).db.interesses.length === 1);
  await page.reload(); await page.waitForTimeout(2500);
  ok("interesse continua marcado após recarregar", await page.getByText("Interesse enviado").first().isVisible());
  await page.locator(".botao-confirmado").first().click(); await page.waitForTimeout(1200);
  ok("desfazer apaga do banco", (await st()).db.interesses.length === 0);
  // Vagas com falha de rede
  await fetch(MOCK + "/__fail?t=oportunidades&n=1"); await page.reload(); await page.waitForTimeout(2500);
  ok("mural avisa quando não carrega (em vez de 'nenhuma vaga')", await page.getByText("Não deu para carregar as vagas").isVisible());
  await page.getByRole("button", { name: "Tentar de novo" }).click(); await page.waitForTimeout(1500);
  ok("tentar de novo traz as vagas", await page.getByText("Logo para padaria").isVisible());
  await fetch(MOCK + "/__fail?t=perfis&n=1"); await page.goto(BASE + "/talentos/"); await page.waitForTimeout(2500);
  ok("talentos avisa quando não carrega", await page.getByText("Não deu para carregar os talentos").isVisible());
  // Salvar portfólio com falha na gravação dos trabalhos: os antigos voltam
  await page.goto(BASE + "/meu-perfil/"); await page.waitForTimeout(2500);
  await fetch(MOCK + "/__fail?t=POST:trabalhos&n=1");
  await page.locator("input[placeholder='Como quer aparecer']").fill("Ana S.");
  await page.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await page.waitForTimeout(2000);
  const s1 = await st();
  ok("falha ao gravar trabalhos não apaga os antigos", s1.db.trabalhos.length === 2, String(s1.db.trabalhos.length));
  ok("e mostra o erro", (await page.locator(".erro").allTextContents()).join("").length > 0, (await page.locator(".erro").allTextContents()).join("/"));
  // Menu: sair
  await page.getByRole("button", { name: /Menu/ }).click(); await page.waitForTimeout(500);
  await page.screenshot({ path: __dirname + "/capturas/shot-menu-logado.png" });
  await page.getByRole("button", { name: /Sair da conta/ }).last().click(); await page.waitForTimeout(1500);
  ok("sair pelo menu volta ao início deslogado", page.url() === BASE + "/" && await page.locator(".cabecalho").getByRole("link", { name: "Entrar" }).first().isVisible(), page.url());
  await ctx.close();
} catch (e) { out.push("ERRO " + e.message.split("\n")[0]); } await browser.close(); console.log(out.join("\n")); })();
