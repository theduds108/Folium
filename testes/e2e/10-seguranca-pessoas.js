// Segurança das pessoas (12/11/2026): aceite do código de conduta, botão "Preciso de ajuda",
// denúncia nos dois sentidos, defesa, decisão da equipe e avaliação por critérios às cegas.
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

(async () => { const browser = await chromium.launch(); try {
  await post("perfis", { id: "u-aluna", slug: "ana-souza", nome: "Ana Souza", curso: "Design", semestre: 3, cidade: "Bauru, SP", bio: "bio", servicos: [], habilidades: [], valor_referencia: "", whatsapp: "", email_contato: "", disponivel: true, publicado: true, link_publico: false, links: {}, experiencias: [], certificados: [], idiomas: [], modalidades: [], tipos_vaga: [] });
  // SQL novo "rodado": as contas têm as colunas de termos, ainda sem aceite.
  await patch("contas", "id=eq.u-aluna", { termos_aceitos_em: null, termos_versao: null, suspensa_ate: null });
  await patch("contas", "id=eq.u-empresa", { termos_aceitos_em: null, termos_versao: null, suspensa_ate: null, aprovada_em: "2026-11-01T00:00:00Z" });
  await post("combinados", { id: "c1", contratante_id: "u-empresa", perfil_id: "u-aluna", contratante_nome: "Empresa X", titulo: "Logo da padaria", escopo: "3 propostas de logo", valor: "R$ 900", sinal: "", pagamento: "", ajustes: "", status: "aceito", criado_em: "2026-11-10T00:00:00Z", aceito_em: "2026-11-10T00:00:00Z", concluido_em: null });
  // O simulado preenche quem propôs e o status como no banco: acerta para "aceito" pela empresa.
  await patch("combinados", "id=eq.c1", { contratante_id: "u-empresa", contratante_nome: "Empresa X", status: "aceito" });

  // ---- Aluna: faixa do código de conduta e aceite
  const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctxA.addInitScript(TOUR);
  const aluna = await ctxA.newPage();
  const erros = []; aluna.on("pageerror", (e) => erros.push(e.message));
  await entrar(aluna, "ana");
  ok("faixa pede o aceite do código de conduta", await aluna.getByText("Leia e aceite o código de conduta.").isVisible());
  await aluna.getByRole("link", { name: "Ler e aceitar" }).click(); await aluna.waitForTimeout(1500);
  ok("página de conduta abre na mesma aba", aluna.url().includes("/conduta"));
  ok("conduta: 190 primeiro", await aluna.getByText("Em perigo agora, ligue 190.").isVisible());
  ok("conduta sem rolagem lateral (celular)", await semRolagem(aluna));
  await aluna.getByLabel(/Li e aceito/).check();
  await aluna.getByRole("button", { name: "Aceitar", exact: true }).click(); await aluna.waitForTimeout(1200);
  ok("aceite gravado com versão", (await estado()).db.contas.find((c) => c.id === "u-aluna").termos_versao === "2026-11-12");
  await aluna.goto(BASE + "/combinados/"); await aluna.waitForTimeout(1800);
  ok("faixa some depois do aceite", (await aluna.getByText("Leia e aceite o código de conduta.").count()) === 0);

  // ---- Botão Preciso de ajuda
  ok("botão Preciso de ajuda no combinado aceito", await aluna.getByRole("button", { name: "Preciso de ajuda" }).isVisible());
  await aluna.getByRole("button", { name: "Preciso de ajuda" }).click(); await aluna.waitForTimeout(500);
  ok("janela mostra o 190 com link de ligar", (await aluna.locator('a[href="tel:190"]').count()) === 1 && await aluna.locator('a[href="tel:190"]').isVisible());
  ok("janela mostra 180, 100 e 188", (await aluna.locator('.ajuda-telefones a[href^="tel:"]').count()) === 3);
  ok("janela sem rolagem lateral (celular)", await semRolagem(aluna));
  await escolher(aluna, "O que está acontecendo", "Assédio moral ou pressão");
  await aluna.getByLabel(/Quer contar mais/).fill("O gerente me pressiona para trabalhar no fim de semana.");
  await aluna.getByLabel(/avise a minha faculdade/).check();
  await aluna.screenshot({ path: "testes/e2e/capturas/10-ajuda-celular.png" });
  await aluna.getByRole("button", { name: "Pedir ajuda" }).click(); await aluna.waitForTimeout(1200);
  ok("confirmação diz que o contratante não foi avisado", await aluna.getByText("O contratante não foi avisado.").isVisible());
  let st = await estado();
  const ajuda = (st.db.ocorrencias || []).find((o) => o.tipo === "ajuda");
  ok("pedido de ajuda gravado (urgente, faculdade, pausa)", !!ajuda && ajuda.urgente && ajuda.avisar_faculdade && ajuda.pausou_combinado, JSON.stringify(ajuda || {}).slice(0, 120));
  ok("combinado pausado", st.db.combinados.find((c) => c.id === "c1").status === "pausado");
  await aluna.getByRole("button", { name: "Fechar" }).first().click(); await aluna.waitForTimeout(1500);
  ok("cartão mostra Retomar", await aluna.getByRole("button", { name: "Retomar o combinado" }).isVisible());
  ok("acompanhamento do pedido aparece", await aluna.getByText("Seus pedidos de ajuda e denúncias").isVisible());

  // ---- Contratante: não vê o pedido de ajuda, denuncia a aluna
  const ctxC = await browser.newContext({ viewport: { width: 1366, height: 800 } });
  await ctxC.addInitScript(TOUR);
  const emp = await ctxC.newPage();
  emp.on("pageerror", (e) => erros.push(e.message));
  await entrar(emp, "empresa");
  await emp.goto(BASE + "/combinados/"); await emp.waitForTimeout(1800);
  ok("contratante não tem botão de ajuda", (await emp.getByRole("button", { name: "Preciso de ajuda" }).count()) === 0);
  ok("contratante vê que foi pausado", await emp.getByText("O aluno pausou este combinado.").isVisible());
  ok("contratante não vê o relato da aluna", (await emp.getByText("me pressiona").count()) === 0);
  await emp.getByRole("button", { name: "Denunciar o aluno" }).click(); await emp.waitForTimeout(400);
  await escolher(emp, "Motivo da denúncia", "Abandonou o trabalho sem avisar");
  await emp.getByLabel("O que aconteceu?").fill("Parou de responder e não entregou as propostas.");
  ok("enviar bloqueado sem confirmar a verdade", await emp.getByRole("button", { name: "Enviar denúncia" }).isDisabled());
  await emp.getByLabel(/Tudo o que contei é verdade/).check();
  await emp.getByRole("button", { name: "Enviar denúncia" }).click(); await emp.waitForTimeout(1200);
  st = await estado();
  const den = (st.db.ocorrencias || []).find((o) => o.tipo === "denuncia");
  ok("denúncia do contratante contra a aluna", !!den && den.autor_lado === "contratante" && den.alvo_id === "u-aluna");

  // ---- Equipe: aba Segurança abre primeiro (pedido de ajuda), pede defesa e decide
  await post("equipe", { id: "u-empresa" });
  await emp.goto(BASE + "/equipe/"); await emp.waitForTimeout(2000);
  ok("aba Segurança abre primeiro com pedido de ajuda", await emp.getByRole("tab", { name: /Segurança/, selected: true }).isVisible());
  ok("equipe vê o relato e o pedido de faculdade", await emp.getByText("O aluno pediu para avisar a faculdade.").isVisible() && await emp.getByText(/me pressiona/).isVisible());
  const cartaoDen = emp.locator(".equipe-item", { hasText: "Abandonou o trabalho" });
  await cartaoDen.getByRole("button", { name: "Pedir a versão da outra parte" }).click();
  await cartaoDen.getByLabel(/Resumo que/).fill("Recebemos um relato de que o trabalho parou sem aviso. Conte sua versão.");
  await cartaoDen.getByRole("button", { name: "Enviar pedido de defesa" }).click(); await emp.waitForTimeout(1200);
  ok("pedido de defesa gravado", (await estado()).db.ocorrencias.find((o) => o.id === den.id).status === "aguardando_defesa");

  // ---- Aluna responde a defesa
  await aluna.reload(); await aluna.waitForTimeout(1800);
  ok("aluna vê o pedido de defesa", await aluna.getByText("A equipe quer ouvir a sua versão").isVisible());
  ok("aluna não vê o relato do contratante", (await aluna.getByText("Parou de responder").count()) === 0);
  await aluna.getByRole("textbox", { name: "Sua versão" }).fill("Pausei pelo botão de ajuda por causa da pressão no fim de semana.");
  await aluna.getByRole("button", { name: "Enviar minha versão" }).click(); await aluna.waitForTimeout(1200);
  ok("defesa gravada", (await estado()).db.ocorrencias.find((o) => o.id === den.id).defesa.startsWith("Pausei"));

  // Equipe decide: suspende a empresa (pedido de ajuda) e arquiva a denúncia
  await emp.reload(); await emp.waitForTimeout(2000);
  const cartaoAj = emp.locator(".equipe-item", { hasText: "Assédio moral ou pressão" });
  await cartaoAj.getByRole("button", { name: "Decidir" }).click();
  await cartaoAj.getByLabel(/Suspender a outra parte/).check();
  await cartaoAj.getByLabel(/Motivo/).fill("Pressão confirmada com prints.");
  emp.once("dialog", (d) => d.accept());
  await cartaoAj.getByRole("button", { name: "Registrar decisão" }).click(); await emp.waitForTimeout(1500);
  st = await estado();
  ok("decisão grava suspensão de 30 dias", !!st.db.contas.find((c) => c.id === "u-empresa").suspensa_ate);
  ok("histórico registrado", (st.db.ocorrencias_historico || []).length >= 2);
  await emp.screenshot({ path: "testes/e2e/capturas/10-equipe-seguranca.png", fullPage: true });
  await emp.reload(); await emp.waitForTimeout(2000);
  ok("faixa de conta suspensa", await emp.getByText(/Sua conta está suspensa até/).isVisible());

  // ---- Avaliação por critérios e resposta
  await patch("contas", "id=eq.u-empresa", { suspensa_ate: null });
  await patch("combinados", "id=eq.c1", { status: "concluido" });
  await aluna.goto(BASE + "/combinados/"); await aluna.waitForTimeout(1800);
  ok("avaliação tem 4 critérios para o contratante", (await aluna.locator(".avaliar-criterio").count()) === 4 && await aluna.getByText("Pagamento em dia").isVisible());
  ok("enviar avaliação bloqueado com critério faltando", await aluna.getByRole("button", { name: "Enviar avaliação" }).isDisabled());
  for (let i = 0; i < 4; i++) await aluna.locator(".avaliar-criterio").nth(i).locator(".estrela-op").nth(i === 1 ? 1 : 2).click();
  await aluna.getByRole("button", { name: "Enviar avaliação" }).click(); await aluna.waitForTimeout(1200);
  const av = (await estado()).db.avaliacoes?.find((a) => a.alvo_id === "u-empresa");
  ok("avaliação com critérios gravada", !!av && av.criterios?.pagamento === 2 && av.nota === 3, JSON.stringify(av || {}).slice(0, 120));
  ok("aviso de avaliação às cegas", await aluna.getByText(/Sua nota aparece quando a outra parte avaliar/).isVisible());
  await post("avaliacoes", { id: "a-emp", combinado_id: "c1", autor_id: "u-empresa", alvo_id: "u-aluna", autor_nome: "Empresa X", nota: 2, texto: "Sumiu no meio.", criterios: { pontualidade: 2, qualidade: 2, comunicacao: 2, respeito: 2 }, criado_em: new Date().toISOString(), resposta: "" });
  await aluna.reload(); await aluna.waitForTimeout(1800);
  ok("aluna vê a nota recebida", await aluna.getByText("Nota que você recebeu:").isVisible());
  await aluna.getByRole("button", { name: "Responder a esta avaliação" }).click();
  await aluna.getByLabel(/Sua resposta/).fill("Pausei por segurança, com o apoio do Fólium.");
  await aluna.getByRole("button", { name: "Publicar resposta" }).click(); await aluna.waitForTimeout(1200);
  ok("resposta gravada", (await estado()).db.avaliacoes.find((a) => a.id === "a-emp").resposta.startsWith("Pausei"));
  await emp.goto(BASE + "/perfil/?u=ana-souza"); await emp.waitForTimeout(2000);
  ok("perfil esconde a média com menos de 3 avaliações", await emp.getByText("A média aparece a partir de 3 avaliações.").isVisible());
  ok("perfil mostra a resposta da aluna", await emp.getByText(/Resposta de Ana:/).isVisible());
  ok("sem erros de página", !erros.length, erros.join(" | "));
} catch (e) { out.push("ERRO " + e.message); } finally { await browser.close(); console.log(out.join("\n")); } })();
