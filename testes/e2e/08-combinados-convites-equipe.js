// Segunda rodada de 11/11/2026: link público, estatísticas, PDF, vagas novas, convites,
// combinados, avaliações e painel da equipe.
const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const estado = async () => (await fetch(MOCK + "/__state")).json();
const TOUR = () => { for (const t of ["visitante", "colaborador", "contratante"]) localStorage.setItem("folium-tour-visto-" + t, "1"); };
async function entrar(page, usuario) {
  await page.goto(BASE + "/entrar/");
  await page.getByLabel("Nome de usuário ou e-mail").fill(usuario);
  await page.getByLabel("Senha", { exact: true }).fill("Senha#123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForTimeout(2000);
}
const semRolagem = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

(async () => { const browser = await chromium.launch(); try {
  const ontem = new Date(Date.now() - 86400000).toISOString();
  await post("perfis", { id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3, cidade: "Bauru, SP", bio: "bio", servicos: ["Identidade visual"], habilidades: [], valor_referencia: "", whatsapp: "(14) 99123-4567", email_contato: "ana@x.com", disponivel: true, publicado: true, link_publico: false, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] });
  await post("trabalhos", [{ id: "t1", perfil_id: "u-aluna", titulo: "Logo café", tipo: "Identidade visual", descricao: "", ordem: 0, galeria: [] }]);
  await post("oportunidades", [
    { id: "v1", titulo: "Logo para padaria", empresa: "Empresa X", contato: "(14) 3333-0000", tipo: "Freela", servico: "Identidade visual", cidade: "Bauru, SP", orcamento: "R$ 800", prazo: "", descricao: "Logo novo", status: "aprovada", autor_id: "u-empresa", criada_em: ontem, aprovada_em: new Date().toISOString(), destaque: false },
    { id: "v2", titulo: "Vaga pendente", empresa: "Outra", contato: "contato@x.com", tipo: "Projeto", servico: "Fotografia", cidade: "Bauru, SP", orcamento: "", prazo: "", descricao: "Fotos", status: "pendente", autor_id: "u-empresa", criada_em: ontem, destaque: false },
  ]);
  // A aluna viu o mural anteontem: a vaga v1 (aprovada agora, da área dela) é nova.
  await fetch(`${MOCK}/rest/v1/contas?id=eq.u-aluna`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ vagas_vistas_em: new Date(Date.now() - 2 * 86400000).toISOString(), criada_em: "2026-11-01T00:00:00Z" }) });

  // ---- Aluna: liga o link público, vê estatísticas e a bolinha de vaga nova
  const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctxA.addInitScript(TOUR);
  const aluna = await ctxA.newPage();
  await entrar(aluna, "ana");
  await aluna.waitForURL("**/meu-perfil/**"); await aluna.waitForTimeout(1500);
  ok("bolinha de vaga nova na barra", await aluna.locator(".barra-inferior .selo-novas").isVisible());
  ok("cartão de estatísticas no editor", await aluna.getByText("Seu portfólio em números").isVisible());
  await aluna.getByRole("button", { name: /Como te contratar/ }).first().click().catch(() => undefined);
  await aluna.waitForTimeout(400);
  await aluna.getByLabel("Link público para clientes").check();
  await aluna.getByRole("button", { name: /Salvar portfólio/ }).first().click(); await aluna.waitForTimeout(1500);
  ok("link público salvo no banco", (await estado()).db.perfis.find((p) => p.id === "u-aluna").link_publico === true);
  ok("editor sem rolagem lateral", await semRolagem(aluna));

  // ---- Visitante sem conta abre o link público
  const ctxV = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctxV.addInitScript(TOUR);
  const vis = await ctxV.newPage();
  await vis.goto(BASE + "/perfil/?u=ana-souza"); await vis.waitForTimeout(2000);
  ok("link público abre sem conta", await vis.getByRole("heading", { name: "Ana Souza" }).isVisible());
  ok("link público não mostra WhatsApp", (await vis.getByText("Conversar no WhatsApp").count()) === 0);
  ok("link público convida a criar conta", await vis.getByRole("link", { name: "Criar conta grátis" }).isVisible());
  await vis.emulateMedia({ media: "print" });
  ok("PDF: cabeçalho some na impressão", !(await vis.locator(".cabecalho").isVisible()));
  await vis.goto(BASE + "/perfil/?u=outro-aluno"); await vis.waitForTimeout(1500);
  ok("sem link público pede para entrar", await vis.getByText("Entre para ver este portfólio").isVisible());
  await ctxV.close();

  // ---- Contratante convida e propõe combinado
  const ctxC = await browser.newContext({ viewport: { width: 1366, height: 800 } });
  await ctxC.addInitScript(TOUR);
  const emp = await ctxC.newPage();
  await entrar(emp, "empresa");
  await emp.goto(BASE + "/perfil/?u=ana-souza"); await emp.waitForTimeout(2000);
  ok("contratante vê WhatsApp (com conta)", await emp.getByText("Conversar no WhatsApp").isVisible());
  ok("botão Baixar em PDF", await emp.getByRole("button", { name: "Baixar em PDF" }).isVisible());
  await emp.getByRole("button", { name: "Convidar para uma vaga" }).click(); await emp.waitForTimeout(800);
  await emp.getByLabel("Qual vaga").selectOption("v1");
  await emp.getByLabel(/Recado/).fill("Adorei seu logo do café!");
  await emp.getByRole("button", { name: "Enviar convite" }).click(); await emp.waitForTimeout(1000);
  ok("convite gravado", (await estado()).db.convites?.length === 1);
  await emp.getByRole("button", { name: "Propor um combinado" }).click(); await emp.waitForTimeout(500);
  await emp.getByLabel("O que vai ser feito").fill("Logo da Padaria");
  await emp.getByLabel("O que está incluso").fill("3 propostas de logo e arquivos finais");
  await emp.getByLabel("Valor total").fill("900");
  await emp.getByRole("button", { name: "Enviar proposta" }).click(); await emp.waitForTimeout(1000);
  const comb = (await estado()).db.combinados?.[0];
  ok("combinado proposto", comb?.status === "proposto" && comb?.valor === "R$ 900", JSON.stringify(comb || {}).slice(0, 80));

  // ---- Aluna responde convite e aceita combinado
  await aluna.goto(BASE + "/oportunidades/"); await aluna.waitForTimeout(2000);
  ok("aluna vê o convite no mural", await aluna.getByText("Você recebeu um convite").isVisible());
  ok("bolinha some depois de abrir o mural", (await aluna.locator(".barra-inferior .selo-novas").count()) === 0);
  await aluna.locator(".convite").getByRole("button", { name: "Tenho interesse" }).click(); await aluna.waitForTimeout(800);
  const st1 = await estado();
  ok("aceitar convite marca interesse", st1.db.convites[0].status === "aceito" && st1.db.interesses.some((i) => i.oportunidade_id === "v1"));
  await aluna.goto(BASE + "/combinados/"); await aluna.waitForTimeout(1500);
  ok("combinados sem rolagem lateral (celular)", await semRolagem(aluna));
  await aluna.getByRole("button", { name: "Aceitar o combinado" }).click(); await aluna.waitForTimeout(1200);
  ok("aluna aceitou", (await estado()).db.combinados[0].status === "aceito");

  // ---- Contratante conclui e avalia
  await emp.goto(BASE + "/combinados/"); await emp.waitForTimeout(1500);
  ok("contratante vê convite enviado", await emp.getByText("Convites que você enviou").isVisible());
  await emp.getByRole("button", { name: /concluir/ }).click(); await emp.waitForTimeout(1200);
  ok("combinado concluído", (await estado()).db.combinados[0].status === "concluido");
  await emp.locator(".estrela-op").nth(4).click();
  await emp.getByLabel(/Comentário/).fill("Entregou antes do prazo.");
  await emp.getByRole("button", { name: "Enviar avaliação" }).click(); await emp.waitForTimeout(1200);
  ok("avaliação do contratante gravada", (await estado()).db.avaliacoes?.some((a) => a.alvo_id === "u-aluna" && a.nota === 5));
  ok("formulário some depois de avaliar", await emp.getByText("Você já avaliou este trabalho").isVisible());

  // ---- Aluna avalia o contratante
  await aluna.goto(BASE + "/combinados/"); await aluna.waitForTimeout(1500);
  await aluna.locator(".estrela-op").nth(3).click({ timeout: 5000 });
  ok("avaliar sem rolagem lateral (celular)", await semRolagem(aluna));
  await aluna.getByRole("button", { name: "Enviar avaliação" }).click(); await aluna.waitForTimeout(1200);
  ok("avaliação da aluna gravada", (await estado()).db.avaliacoes?.some((a) => a.alvo_id === "u-empresa" && a.nota === 4));

  // ---- Avaliação aparece no portfólio
  await emp.goto(BASE + "/perfil/?u=ana-souza"); await emp.waitForTimeout(2000);
  ok("avaliação real no portfólio", await emp.getByText("trabalho combinado pelo Fólium").first().isVisible());

  // ---- Painel da equipe
  await aluna.goto(BASE + "/equipe/"); await aluna.waitForTimeout(1500);
  ok("quem não é da equipe é barrado", await aluna.getByText("Área só da equipe").isVisible());
  await post("equipe", { id: "u-empresa" });
  await emp.goto(BASE + "/equipe/"); await emp.waitForTimeout(2000);
  ok("equipe vê o painel", await emp.getByRole("heading", { name: "Painel da equipe" }).isVisible());
  await emp.locator(".equipe-item", { hasText: "Vaga pendente" }).getByRole("button", { name: "Aprovar" }).click(); await emp.waitForTimeout(1200);
  ok("equipe aprova vaga", (await estado()).db.oportunidades.find((o) => o.id === "v2").status === "aprovada");
  await emp.getByRole("tab", { name: /Planos/ }).click(); await emp.waitForTimeout(300);
  await emp.locator(".equipe-conta", { hasText: "ana.123" }).getByRole("button", { name: "Liberar Premium" }).click(); await emp.waitForTimeout(1200);
  ok("planos sem rolagem lateral (celular)", await (async () => { await emp.setViewportSize({ width: 390, height: 844 }); await emp.waitForTimeout(300); const r = await semRolagem(emp); await emp.setViewportSize({ width: 1366, height: 800 }); return r; })());
  ok("equipe libera Premium", (await estado()).db.contas.find((c) => c.id === "u-aluna").plano === "premium");
  await emp.getByRole("button", { name: /Menu/ }).click(); await emp.waitForTimeout(400);
  ok("menu mostra Painel da equipe", await emp.getByRole("link", { name: /Painel da equipe/ }).isVisible());
  await ctxA.close(); await ctxC.close();
} catch (e) { out.push("ERRO " + e.message.split("\n").slice(0, 14).join(" / ")); } await browser.close(); console.log(out.join("\n")); })();
