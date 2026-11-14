// Auditoria de 12/11/2026: contratante novo fica em análise e só vê contatos depois que a equipe aprova.
const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const patch = (t, q, b) => fetch(`${MOCK}/rest/v1/${t}?${q}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const estado = async () => (await fetch(MOCK + "/__state")).json();
const TOUR = () => { for (const t of ["visitante", "colaborador", "contratante"]) localStorage.setItem("folium-tour-visto-" + t, "1"); };
async function entrar(page, usuario) {
  await page.goto(BASE + "/entrar/");
  await page.getByLabel("Nome de usuário ou e-mail").fill(usuario);
  await page.getByLabel("Senha", { exact: true }).fill("Senha#123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForTimeout(2000);
}

(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3, cidade: "Bauru, SP", bio: "bio", servicos: ["Identidade visual"], habilidades: [], valor_referencia: "", whatsapp: "5514999990000", email_contato: "ana@x.com", foto_url: null, disponivel: true, publicado: true, titulo: "", sobre_longo: "", conclusao: "", modalidades: [], tipos_vaga: [], links: {}, experiencias: [], certificados: [], idiomas: [], curriculo_url: null, link_publico: false });
  await patch("contas", "id=eq.u-empresa", { aprovada_em: null });

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(TOUR);
  const page = await ctx.newPage();
  const erros = []; page.on("pageerror", (e) => erros.push(e.message));
  await entrar(page, "empresa");
  await page.goto(BASE + "/painel/"); await page.waitForTimeout(1500);
  ok("painel avisa cadastro em análise", await page.getByText("Cadastro em análise.").isVisible());
  await page.goto(BASE + "/perfil/?u=ana-souza"); await page.waitForTimeout(2000);
  ok("em análise: vê o portfólio", await page.getByRole("heading", { name: /Ana Souza/ }).first().isVisible());
  ok("em análise: aviso no lugar dos contatos", await page.getByText(/cadastro de contratante está em análise/).isVisible());
  ok("em análise: sem botão de WhatsApp", !(await page.getByText("Conversar no WhatsApp").isVisible()));
  ok("em análise: sem convite/proposta", !(await page.getByRole("button", { name: "Convidar para uma vaga" }).isVisible()));

  // Equipe aprova pelo painel
  await post("equipe", { id: "u-aluna" });
  const ctxE = await browser.newContext({ viewport: { width: 1366, height: 800 } });
  await ctxE.addInitScript(TOUR);
  const eq = await ctxE.newPage();
  await entrar(eq, "ana");
  await eq.goto(BASE + "/equipe/"); await eq.waitForTimeout(1500);
  await eq.getByRole("tab", { name: /Contratantes/ }).click();
  ok("equipe vê contratante em análise", await eq.getByText("em análise").first().isVisible());
  await eq.getByRole("button", { name: "Aprovar", exact: true }).click(); await eq.waitForTimeout(1200);
  const s = await estado();
  ok("aprovação grava aprovada_em", !!s.db.contas.find((c) => c.id === "u-empresa").aprovada_em);

  await page.reload(); await page.waitForTimeout(2000);
  ok("aprovado: aparece o WhatsApp", await page.getByText("Conversar no WhatsApp").isVisible());
  ok("aprovado: aparece convidar", await page.getByRole("button", { name: "Convidar para uma vaga" }).isVisible());
  ok("sem erros de página", !erros.length, erros.join(" | "));
} catch (e) { out.push("ERRO " + e.message); } finally { await browser.close(); console.log(out.join("\n")); } })();
