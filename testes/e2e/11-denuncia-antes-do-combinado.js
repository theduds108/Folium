// Denúncia antes do combinado (14/11/2026): no convite (dois lados), na vaga e no portfólio.
const { chromium } = require("playwright");
const BASE = "http://localhost:3100", MOCK = "http://localhost:54321";
const out = []; const ok = (n, c, x = "") => out.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
const post = (t, b) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const patch = (t, q, b) => fetch(`${MOCK}/rest/v1/${t}?${q}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
const estado = async () => (await fetch(MOCK + "/__state")).json();
const TOUR = () => { for (const t of ["visitante", "colaborador", "contratante"]) localStorage.setItem("folium-tour-visto-" + t, "1"); };
const semRolagem = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
async function entrar(page, usuario) {
  await page.goto(BASE + "/entrar/");
  await page.getByLabel("Nome de usuário ou e-mail").fill(usuario);
  await page.getByLabel("Senha", { exact: true }).fill("Senha#123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForTimeout(2000);
}
async function escolher(page, rotulo, opcao) {
  await page.getByRole("button", { name: new RegExp(`^${rotulo}:`) }).click();
  await page.getByRole("option", { name: opcao }).click();
}
async function denunciar(page, botao, motivo) {
  await page.getByRole("button", { name: botao }).first().click(); await page.waitForTimeout(400);
  const janela = page.locator("dialog[open]");
  await escolher(janela, "Motivo da denúncia", motivo);
  await janela.getByLabel("O que aconteceu?").fill("Mandou mensagens de madrugada pelo WhatsApp depois que eu recusei.");
  await janela.getByLabel(/Tudo o que contei é verdade/).check();
  await janela.getByRole("button", { name: "Enviar denúncia" }).click(); await page.waitForTimeout(1200);
  return janela;
}

(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3, cidade: "Bauru, SP", bio: "bio", servicos: ["Identidade visual"], habilidades: [], valor_referencia: "", whatsapp: "(14) 99123-4567", email_contato: "ana@x.com", disponivel: true, publicado: true, link_publico: false, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] });
  await patch("contas", "id=eq.u-empresa", { aprovada_em: "2026-11-01T00:00:00Z", termos_aceitos_em: "2026-11-12T00:00:00Z", termos_versao: "2026-11-12", suspensa_ate: null });
  await patch("contas", "id=eq.u-aluna", { termos_aceitos_em: "2026-11-12T00:00:00Z", termos_versao: "2026-11-12", suspensa_ate: null });
  await post("oportunidades", [{ id: "v1", titulo: "Logo para padaria", empresa: "Empresa X", contato: "(14) 3333-0000", tipo: "Freela", servico: "Identidade visual", cidade: "Bauru, SP", orcamento: "R$ 800", prazo: "", descricao: "Logo novo", status: "aprovada", autor_id: "u-empresa", criada_em: new Date().toISOString(), aprovada_em: new Date().toISOString(), destaque: false }]);
  await post("convites", { id: "cv1", oportunidade_id: "v1", perfil_id: "u-aluna", mensagem: "Oi!" });
  await patch("convites", "id=eq.cv1", { contratante_id: "u-empresa", status: "enviado" });

  // ---- Aluna: denuncia quem convidou
  const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctxA.addInitScript(TOUR);
  const aluna = await ctxA.newPage();
  const erros = []; aluna.on("pageerror", (e) => erros.push(e.message));
  await entrar(aluna, "ana");
  await aluna.goto(BASE + "/oportunidades/"); await aluna.waitForTimeout(2000);
  ok("convite tem botão de denúncia", await aluna.getByRole("button", { name: "Denunciar quem convidou" }).isVisible());
  ok("vaga tem denúncia completa para aluno", await aluna.getByRole("button", { name: "Denunciar esta vaga ou quem publicou" }).isVisible());
  await aluna.getByRole("button", { name: "Denunciar quem convidou" }).click(); await aluna.waitForTimeout(400);
  await aluna.locator("dialog[open]").getByRole("button", { name: /^Motivo da denúncia:/ }).click(); ok("motivos de antes do combinado", await aluna.getByRole("option", { name: "Insistiu depois que eu disse não" }).isVisible()); await aluna.keyboard.press("Escape");
  ok("janela sem rolagem lateral (celular)", await semRolagem(aluna));
  await aluna.screenshot({ path: "testes/e2e/capturas/11-denuncia-convite-celular.png" });
  await aluna.keyboard.press("Escape");
  const j1 = await denunciar(aluna, "Denunciar quem convidou", "Insistiu depois que eu disse não");
  ok("confirmação aponta Combinados", await j1.getByRole("link", { name: "Combinados" }).isVisible());
  let st = await estado();
  const o1 = st.db.ocorrencias?.find((o) => o.convite_id === "cv1" && o.autor_id === "u-aluna");
  ok("denúncia do convite gravada contra a empresa", o1?.alvo_id === "u-empresa" && o1?.origem === "convite" && o1?.autor_lado === "aluno", JSON.stringify(o1 || {}).slice(0, 160));
  ok("ainda na página de vagas (nada se perdeu)", aluna.url().includes("/oportunidades"));
  await j1.getByRole("button", { name: "Fechar" }).click();

  // Segunda denúncia contra a mesma empresa enquanto a primeira está aberta: aviso claro.
  await denunciar(aluna, "Denunciar esta vaga ou quem publicou", "Vaga falsa ou diferente do anunciado");
  ok("denúncia repetida explicada", await aluna.getByText(/já tem uma denúncia aberta sobre essa pessoa/).isVisible());
  await aluna.keyboard.press("Escape");
  await aluna.goto(BASE + "/combinados/"); await aluna.waitForTimeout(1800);
  ok("aluna acompanha a denúncia em Combinados", await aluna.getByText("Seus pedidos de ajuda e denúncias").isVisible());

  // ---- Contratante: denuncia pelo convite enviado e pelo portfólio
  const ctxC = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctxC.addInitScript(TOUR);
  const emp = await ctxC.newPage();
  emp.on("pageerror", (e) => erros.push(e.message));
  await entrar(emp, "empresa");
  await emp.goto(BASE + "/perfil/?u=ana-souza"); await emp.waitForTimeout(2000);
  ok("contratante aprovado vê denúncia completa no portfólio", await emp.getByRole("button", { name: "Denunciar este aluno" }).isVisible());
  const j2 = await denunciar(emp, "Denunciar este aluno", "Portfólio com trabalho de outra pessoa");
  ok("confirmação do contratante", await j2.getByText("Denúncia recebida.").isVisible());
  st = await estado();
  const o2 = st.db.ocorrencias?.find((o) => o.autor_id === "u-empresa");
  ok("denúncia do portfólio gravada contra a aluna", o2?.alvo_id === "u-aluna" && o2?.origem === "perfil" && o2?.autor_lado === "contratante", JSON.stringify(o2 || {}).slice(0, 160));
  await emp.goto(BASE + "/combinados/"); await emp.waitForTimeout(1800);
  ok("convite enviado tem botão Denunciar", await emp.locator(".convites-enviados").getByRole("button", { name: "Denunciar" }).isVisible());

  // ---- Equipe pede defesa: a empresa lê de onde veio, sem o relato
  await patch("ocorrencias", `id=eq.${o1.id}`, { status: "aguardando_defesa", resumo_defesa: "Contato insistente depois de recusa." });
  await emp.reload(); await emp.waitForTimeout(1800);
  ok("empresa vê pedido de defesa ligado ao convite", await emp.getByText("A equipe quer ouvir a sua versão").isVisible());
  ok("relato da aluna não aparece para a empresa", (await emp.getByText(/madrugada/).count()) === 0);

  // ---- Visitante sem conta: denúncia simples continua
  const vis = await (await browser.newContext()).newPage();
  await vis.goto(BASE + "/oportunidades/"); await vis.waitForTimeout(1500);
  ok("visitante não vê denúncia completa", (await vis.getByRole("button", { name: "Denunciar esta vaga ou quem publicou" }).count()) === 0);
  ok("sem erros de página", !erros.length, erros.join(" | "));
} catch (e) { out.push("ERRO " + e.message); } finally { await browser.close(); console.log(out.join("\n")); } })();
