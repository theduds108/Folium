// Supabase simulado (auth + PostgREST mínimo) para testes E2E do Fólium.
const http = require("http");
const crypto = require("crypto");
const PORT = 54321;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const log = [];
const users = [
  { id: "u-aluna", email: "ana.123@alunos.unisagrado.edu.br", password: "Senha#123", user_metadata: { nome_usuario: "ana", tem_senha: true } },
  { id: "u-empresa", email: "contato@empresa.com", password: "Senha#123", user_metadata: { nome_usuario: "empresa", tem_senha: true } },
  { id: "u-gi", email: "gi.789@alunos.unisagrado.edu.br", password: "Senha#123", user_metadata: { nome_usuario: "gi", tem_senha: true } },
  { id: "u-novo", email: "bia.456@alunos.unisagrado.edu.br", password: null, user_metadata: {} },
];
const db = {
  contas: [
    { id: "u-aluna", tipo: "colaborador", plano: "gratis", plano_ate: null, plano_pedido: null, nome: "", empresa: "", whatsapp: "", cidade: "Bauru, SP", tour_visto_em: null },
    { id: "u-gi", tipo: "colaborador", plano: "gratis", plano_ate: null, plano_pedido: null, nome: "", empresa: "", whatsapp: "", cidade: "Bauru, SP", tour_visto_em: "2026-11-01T00:00:00Z" },
    { id: "u-empresa", tipo: "contratante", plano: "gratis", plano_ate: null, plano_pedido: null, nome: "Empresa", empresa: "Empresa X", whatsapp: "", cidade: "Bauru, SP", tour_visto_em: "2026-11-01T00:00:00Z" },
  ],
  nomes_usuario: [ { id: "u-aluna", nome: "ana" }, { id: "u-empresa", nome: "empresa" }, { id: "u-gi", nome: "gi" } ],
};
const DEFAULTS = { contas: { plano: "gratis", plano_ate: null, plano_pedido: null, nome: "", empresa: "", whatsapp: "", cidade: "Bauru, SP", tour_visto_em: null } };
const tokens = new Map(); // access -> userId
const refresh = new Map();
let failContas = 0; const falhar = {}; // quantas leituras de contas falham (simula rede ruim)
function pubUser(u) { return { id: u.id, aud: "authenticated", role: "authenticated", email: u.email, user_metadata: u.user_metadata, app_metadata: { provider: "email" }, created_at: "2026-11-01T00:00:00Z", email_confirmed_at: "2026-11-01T00:00:00Z" }; }
function session(u) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const access = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: u.id, email: u.email, role: "authenticated", aud: "authenticated", exp, iat: exp - 3600, session_id: crypto.randomUUID() })}.c2ln`;
  const rt = crypto.randomUUID();
  tokens.set(access, u.id); refresh.set(rt, u.id);
  return { access_token: access, refresh_token: rt, token_type: "bearer", expires_in: 3600, expires_at: exp, user: pubUser(u) };
}
function who(req) { const a = (req.headers.authorization || "").replace("Bearer ", ""); const id = tokens.get(a); return users.find((u) => u.id === id) || null; }
function send(res, code, body, extra = {}) {
  res.writeHead(code, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*", "access-control-expose-headers": "*", ...extra });
  res.end(body === undefined ? "" : JSON.stringify(body));
}
function filtros(url) { const f = []; for (const [k, v] of url.searchParams) { if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(k)) continue; const m = /^(eq|neq|in|is)\.(.*)$/.exec(v); if (m) f.push([k, m[1], m[2]]); } return f; }
function casa(row, f) { return f.every(([k, op, v]) => { const val = row[k]; if (op === "eq") return String(val) === v; if (op === "neq") return String(val) !== v; if (op === "ilike") return String(val ?? "").toLowerCase().includes(v.replace(/[%*]/g, "").toLowerCase()); if (op === "is") return v === "null" ? val == null : String(val) === v; if (op === "in") return v.replace(/[()]/g, "").split(",").map((s) => s.replace(/"/g, "")).includes(String(val)); return true; }); }
const server = http.createServer((req, res) => {
  let corpo = ""; req.on("data", (c) => (corpo += c)); req.on("end", () => {
    const url = new URL(req.url, "http://x");
    const body = corpo ? JSON.parse(corpo) : {};
    log.push(`${req.method} ${url.pathname}${url.search}`);
    if (req.method === "OPTIONS") return send(res, 204);
    const p = url.pathname;
    if (p === "/__log") return send(res, 200, log.splice(0));
    if (p === "/__state") return send(res, 200, { users, db, tokens: tokens.size });
    if (p === "/__fail") { falhar[url.searchParams.get("t")] = Number(url.searchParams.get("n")); return send(res, 200, {}); }
    if (p === "/__failcontas") { failContas = Number(url.searchParams.get("n")); return send(res, 200, {}); }
    // ---------- auth ----------
    if (p === "/auth/v1/token") {
      const gt = url.searchParams.get("grant_type");
      if (gt === "password") { const u = users.find((x) => x.email === body.email); if (!u || !u.password || u.password !== body.password) return send(res, 400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" }); return send(res, 200, session(u)); }
      if (gt === "refresh_token") { const id = refresh.get(body.refresh_token); const u = users.find((x) => x.id === id); if (!u) return send(res, 400, { error_code: "refresh_token_not_found", msg: "Invalid Refresh Token" }); refresh.delete(body.refresh_token); return send(res, 200, session(u)); }
    }
    if (p === "/auth/v1/user") { const u = who(req); if (!u) return send(res, 401, { msg: "invalid JWT", error_code: "bad_jwt" }); if (req.method === "PUT") { if (body.password) { if (body.password === u.password) return send(res, 422, { error_code: "same_password", msg: "New password should be different from the old password." }); u.password = body.password; } if (body.data) u.user_metadata = { ...u.user_metadata, ...body.data }; } return send(res, 200, pubUser(u)); }
    if (p === "/auth/v1/logout") { const scope = url.searchParams.get("scope") || "global"; const u = who(req); if (u && scope === "global") { for (const [k, v] of tokens) if (v === u.id) tokens.delete(k); } else tokens.delete((req.headers.authorization || "").replace("Bearer ", "")); return send(res, 204); }
    if (p === "/auth/v1/otp" || p === "/auth/v1/recover") return send(res, 200, {});
    if (p === "/__magic") { const u = users.find((x) => x.email === url.searchParams.get("email")); const s = session(u); return send(res, 200, s); }
    // ---------- rpc ----------
    if (p.startsWith("/rest/v1/rpc/")) {
      const fn = p.split("/").pop();
      if (fn === "email_para_login") { const n = db.nomes_usuario.find((r) => r.nome === body.p_usuario); const u = n && users.find((x) => x.id === n.id); return send(res, 200, u && u.password === body.p_senha ? u.email : null); }
      if (fn === "nome_usuario_livre") { const me = who(req); const n = db.nomes_usuario.find((r) => r.nome === body.p_nome); return send(res, 200, !n || (me && n.id === me.id)); }
      if (fn === "salvar_trabalhos") {
        const me = who(req); if (!me) return send(res, 401, { message: "JWT expired" });
        // Transação: se a gravação falhar, nada muda (POST:trabalhos simula a falha).
        if (falhar["POST:trabalhos"] > 0) { falhar["POST:trabalhos"]--; return send(res, 500, { message: "simulated" }); }
        // Como no banco (SQL 20261113180000): mantém o id dos que já existem e sincroniza os convites de collab.
        const lista = (body.p_trabalhos || []).filter((t) => (t.titulo || "").trim());
        const manter = new Set(lista.map((t) => t.id).filter(Boolean));
        const sai = (db.trabalhos || []).filter((x) => x.perfil_id === me.id && !manter.has(x.id)).map((x) => x.id);
        db.trabalhos = (db.trabalhos || []).filter((x) => !sai.includes(x.id));
        db.collab = (db.collab || []).filter((c) => !sai.includes(c.trabalho_id));
        const ids = lista.map((t, i) => {
          const atual = db.trabalhos.find((x) => x.id === t.id && x.perfil_id === me.id);
          const novo = { ...t, id: atual ? atual.id : crypto.randomUUID(), perfil_id: me.id, ordem: i };
          if (atual) Object.assign(atual, novo); else db.trabalhos.push(novo);
          const marcados = (novo.coautores || []).map((c) => (db.perfis || []).find((p) => p.slug === c.slug)).filter((p) => p && p.id !== me.id).map((p) => p.id);
          db.collab = (db.collab || []).filter((c) => c.trabalho_id !== novo.id || marcados.includes(c.coautor_id));
          for (const pid of marcados) if (!db.collab.some((c) => c.trabalho_id === novo.id && c.coautor_id === pid)) db.collab.push({ trabalho_id: novo.id, coautor_id: pid, status: "pendente", papel: "", criado_em: new Date().toISOString() });
          return novo.id;
        });
        return send(res, 200, ids);
      }
      if (fn === "meus_convites_collab") {
        const me = who(req); if (!me) return send(res, 401, { message: "JWT expired" });
        return send(res, 200, (db.collab || []).filter((c) => c.coautor_id === me.id && c.status !== "recusado").map((c) => { const t = db.trabalhos.find((x) => x.id === c.trabalho_id) || {}; const d = (db.perfis || []).find((p) => p.id === t.perfil_id) || {}; return { trabalho_id: t.id, titulo: t.titulo, tipo: t.tipo, imagem_url: t.imagem_url || null, status: c.status, papel: c.papel, dono_nome: d.nome, dono_slug: d.slug }; }));
      }
      if (fn === "responder_collab") {
        const me = who(req); const c = (db.collab || []).find((x) => me && x.coautor_id === me.id && x.trabalho_id === body.p_trabalho);
        if (!c) return send(res, 404, { code: "P0002", message: "Esse convite de collab não existe mais" });
        c.status = body.p_aceitar ? "aceito" : "recusado"; c.papel = (body.p_papel || "").trim().slice(0, 200); c.respondido_em = new Date().toISOString();
        return send(res, 200, null);
      }
      if (fn === "collabs_do_perfil") {
        const me = who(req); const p = (db.perfis || []).find((x) => x.slug === body.p_slug && x.publicado);
        if (!p) return send(res, 200, []);
        return send(res, 200, (db.collab || []).filter((c) => c.coautor_id === p.id && c.status === "aceito").map((c) => { const t = db.trabalhos.find((x) => x.id === c.trabalho_id); const d = (db.perfis || []).find((x) => x.id === t.perfil_id); return { t, d, c }; }).filter(({ d }) => d && d.publicado && (me || (p.link_publico && d.link_publico))).map(({ t, d, c }) => ({ ...t, papel: c.papel, dono_nome: d.nome, dono_slug: d.slug })));
      }
      if (fn === "portfolio_publico") {
        const p = (db.perfis || []).find((r) => r.slug === body.p_slug && r.publicado && r.link_publico);
        if (!p) return send(res, 200, null);
        const { whatsapp: _w, email_contato: _e, curriculo_url: _c, certificados: _ce, links: _l, experiencias: _x, ...seguro } = p;
        return send(res, 200, { ...seguro, trabalhos: (db.trabalhos || []).filter((t) => t.perfil_id === p.id) });
      }
      if (fn === "registrar_visita") { db.visitas = (db.visitas || 0) + 1; return send(res, 200, null); }
      if (fn === "minhas_estatisticas") {
        const me = who(req); if (!me) return send(res, 200, null);
        const premium = (db.contas || []).some((c) => c.id === me.id && c.plano === "premium");
        return send(res, 200, { premium, visitas_30: db.visitas || 0, visitas_7: premium ? db.visitas || 0 : null, visitas_contratantes_30: premium ? 0 : null, visitas_total: premium ? db.visitas || 0 : null, salvos: premium ? 0 : null, interesses: (db.interesses || []).filter((i) => i.perfil_id === me.id).length, convites: (db.convites || []).filter((c) => c.perfil_id === me.id).length });
      }
      if (fn === "responder_convite") {
        const me = who(req); const c = (db.convites || []).find((x) => x.id === body.p_id && me && x.perfil_id === me.id);
        if (!c) return send(res, 404, { code: "P0002", message: "Convite não encontrado" });
        c.status = body.p_aceitar ? "aceito" : "recusado";
        if (body.p_aceitar) { db.interesses ??= []; if (!db.interesses.some((i) => i.oportunidade_id === c.oportunidade_id && i.perfil_id === c.perfil_id)) db.interesses.push({ oportunidade_id: c.oportunidade_id, perfil_id: c.perfil_id }); }
        return send(res, 200, null);
      }
      if (fn === "mudar_combinado") {
        const me = who(req); const c = (db.combinados || []).find((x) => x.id === body.p_id);
        if (!c || !me || ![c.perfil_id, c.contratante_id].includes(me.id)) return send(res, 404, { code: "P0002", message: "Combinado não encontrado" });
        const a = body.p_acao, aluno = me.id === c.perfil_id;
        const novo = a === "aceitar" && c.status === "proposto" && aluno ? "aceito" : a === "recusar" && c.status === "proposto" && aluno ? "recusado" : a === "cancelar" && c.status === "proposto" && !aluno ? "cancelado" : a === "concluir" && c.status === "aceito" && !aluno ? "concluido" : a === "pausar" && c.status === "aceito" && aluno ? "pausado" : a === "retomar" && c.status === "pausado" && aluno ? "aceito" : null;
        if (!novo) return send(res, 400, { code: "P0001", message: "Essa mudança não é possível agora" });
        c.status = novo; return send(res, 200, novo);
      }
      if (fn === "contatos_perfis") {
        // Contratante com aprovada_em = null está em análise: só vê os próprios (nenhum).
        const me = who(req); if (!me) return send(res, 401, { message: "JWT expired" });
        const conta = (db.contas || []).find((c) => c.id === me.id);
        const pode = !(conta && conta.tipo === "contratante" && conta.aprovada_em === null) || (db.equipe || []).some((e) => e.id === me.id);
        return send(res, 200, (db.perfis || []).filter((r) => (body.p_ids || []).includes(r.id) && (r.id === me.id || pode))
          .map((r) => ({ id: r.id, whatsapp: r.whatsapp || "", email_contato: r.email_contato || "", curriculo_url: r.curriculo_url || null, certificados: r.certificados || [] })));
      }
      // ---- Segurança das pessoas (12/11 à tarde)
      if (fn === "aceitar_termos") { const me = who(req); const c = (db.contas || []).find((x) => me && x.id === me.id); if (c) { c.termos_aceitos_em = new Date().toISOString(); c.termos_versao = body.p_versao; } return send(res, 200, null); }
      if (fn === "meus_pedidos_de_defesa") { const me = who(req); return send(res, 200, (db.ocorrencias || []).filter((o) => me && o.alvo_id === me.id && o.tipo === "denuncia" && o.resumo_defesa).map((o) => ({ id: o.id, categoria: o.categoria, resumo_defesa: o.resumo_defesa, titulo_combinado: ((db.combinados || []).find((c) => c.id === o.combinado_id) || {}).titulo || "Combinado", defesa: o.defesa, defesa_em: o.defesa_em, status: o.status }))); }
      if (fn === "enviar_defesa") { const me = who(req); const o = (db.ocorrencias || []).find((x) => x.id === body.p_id && me && x.alvo_id === me.id && x.status === "aguardando_defesa"); if (!o) return send(res, 404, { code: "P0002", message: "Esse pedido de defesa não está aberto" }); o.defesa = body.p_texto; o.defesa_em = new Date().toISOString(); o.status = "em_analise"; return send(res, 200, null); }
      if (fn === "equipe_ocorrencia") {
        const me = who(req); if (!me || !(db.equipe || []).some((e) => e.id === me.id)) return send(res, 400, { code: "42501", message: "Só para a equipe" });
        const o = (db.ocorrencias || []).find((x) => x.id === body.p_id); if (!o) return send(res, 404, { code: "P0002", message: "Ocorrência não encontrada" });
        if (body.p_acao === "analisar") o.status = "em_analise";
        if (body.p_acao === "pedir_defesa") { o.status = "aguardando_defesa"; o.resumo_defesa = body.p_texto; }
        if (body.p_acao === "decidir") {
          o.status = body.p_decisao === "arquivada" ? "arquivada" : "resolvida"; o.decisao = body.p_decisao; o.decisao_texto = body.p_texto || ""; o.decidida_em = new Date().toISOString();
          const alvo = (db.contas || []).find((c) => c.id === (body.p_decisao === "ma_fe" ? o.autor_id : o.alvo_id));
          if (alvo && body.p_decisao === "suspensao") alvo.suspensa_ate = new Date(Date.now() + 30 * 86400000).toISOString();
          if (alvo && body.p_decisao === "banimento") alvo.suspensa_ate = "infinity";
        }
        db.ocorrencias_historico ??= []; db.ocorrencias_historico.push({ id: db.ocorrencias_historico.length + 1, ocorrencia_id: o.id, quem: me.id, acao: body.p_acao, texto: body.p_texto || "", em: new Date().toISOString() });
        return send(res, 200, null);
      }
      if (fn === "equipe_tirar_suspensao") { const c = (db.contas || []).find((x) => x.id === body.p_id); if (c) c.suspensa_ate = null; return send(res, 200, null); }
      if (fn === "responder_avaliacao") { const me = who(req); const a = (db.avaliacoes || []).find((x) => x.id === body.p_id && me && x.alvo_id === me.id && !x.resposta); if (!a) return send(res, 404, { code: "P0002", message: "Não dá para responder essa avaliação" }); a.resposta = body.p_texto; return send(res, 200, null); }
      if (fn === "eh_equipe") { const me = who(req); return send(res, 200, !!me && (db.equipe || []).some((e) => e.id === me.id)); }
      if (fn === "equipe_contas") {
        const me = who(req); if (!me || !(db.equipe || []).some((e) => e.id === me.id)) return send(res, 400, { code: "42501", message: "Só para a equipe" });
        return send(res, 200, (db.contas || []).map((c) => ({ ...c, email: (users.find((u) => u.id === c.id) || {}).email || "" })));
      }
      if (fn === "excluir_minha_conta") {
        const me = who(req); if (!me) return send(res, 401, { message: "JWT expired" });
        users.splice(users.indexOf(me), 1);
        for (const t of ["perfis", "contas", "nomes_usuario"]) db[t] = (db[t] || []).filter((r) => r.id !== me.id);
        db.trabalhos = (db.trabalhos || []).filter((r) => r.perfil_id !== me.id);
        for (const [k, v] of tokens) if (v === me.id) tokens.delete(k);
        return send(res, 200, null);
      }
      return send(res, 200, null);
    }
    // ---------- tabelas ----------
    if (p.startsWith("/rest/v1/")) {
      const t = p.split("/").pop(); db[t] ??= []; const rows = db[t]; const f = filtros(url);
      const objeto = (req.headers.accept || "").includes("vnd.pgrst.object");
      const volta = (lista) => { if (objeto) { if (lista.length !== 1) return send(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" }); return send(res, 200, lista[0]); } return send(res, 200, lista, { "content-range": `0-${Math.max(0, lista.length - 1)}/${lista.length}` }); };
      if (falhar["POST:" + t] > 0 && req.method === "POST") { falhar["POST:" + t]--; return send(res, 500, { message: "simulated" }); }
      if (falhar[t] > 0 && req.method === "GET") { falhar[t]--; return send(res, 500, { message: "simulated" }); }
      if (req.method === "GET" && t === "perfis" && (url.searchParams.get("select") || "").includes("trabalhos(")) { const l = rows.filter((r) => casa(r, f)).map((r) => ({ ...r, trabalhos: (db.trabalhos || []).filter((x) => x.perfil_id === r.id) })); return volta(l); }
      if (t === "interesses" && req.method === "POST" && !(db.perfis || []).some((x) => x.id === body.perfil_id)) return send(res, 409, { code: "23503", message: "insert or update on table \"interesses\" violates foreign key constraint" });
      if (req.method === "GET" || req.method === "HEAD") { if (t === "contas" && failContas > 0) { failContas--; return send(res, 500, { message: "simulated network error" }); } return volta(rows.filter((r) => casa(r, f))); }
      if (req.method === "POST" && t === "ocorrencias") {
        const me = who(req);
        for (const b of (Array.isArray(body) ? body : [body])) {
          const c = (db.combinados || []).find((x) => x.id === b.combinado_id);
          if (!c || !me || ![c.perfil_id, c.contratante_id].includes(me.id) || (b.tipo === "ajuda" && me.id !== c.perfil_id)) return send(res, 403, { code: "42501", message: "new row violates row-level security policy" });
          Object.assign(b, { autor_id: me.id, alvo_id: me.id === c.perfil_id ? c.contratante_id : c.perfil_id, autor_lado: me.id === c.perfil_id ? "aluno" : "contratante", urgente: b.tipo === "ajuda", status: "aberta", criada_em: new Date().toISOString(), prazo_em: new Date(Date.now() + (b.tipo === "ajuda" ? 1 : 7) * 86400000).toISOString(), resumo_defesa: "", defesa: "", defesa_em: null, decisao: null, decisao_texto: "", sigilo: true });
          if (b.tipo === "ajuda" && b.pausou_combinado && c.status === "aceito") c.status = "pausado";
        }
      }
      if (req.method === "POST" && (t === "convites" || t === "combinados" || t === "avaliacoes")) { const me = who(req); for (const b of (Array.isArray(body) ? body : [body])) { if (t === "avaliacoes") { b.autor_id = me && me.id; b.autor_nome = ((db.contas || []).find((c) => c.id === b.autor_id) || {}).empresa || ((db.perfis || []).find((p) => p.id === b.autor_id) || {}).nome || "Usuário"; b.criado_em = new Date().toISOString(); } else { b.contratante_id = me && me.id; b.status = t === "convites" ? "enviado" : "proposto"; b.criado_em = new Date().toISOString(); if (t === "combinados") b.contratante_nome = ((db.contas || []).find((c) => c.id === b.contratante_id) || {}).empresa || "Contratante"; } } }
      if (req.method === "POST") { const novos = (Array.isArray(body) ? body : [body]).map((b) => { const oc = url.searchParams.get("on_conflict") || "id"; const ex = rows.find((r) => b[oc] !== undefined && r[oc] === b[oc]); if (ex) { if ((req.headers.prefer || "").includes("merge-duplicates")) { Object.assign(ex, b); return ex; } return null; } const n = { ...(DEFAULTS[t] || {}), id: b.id ?? crypto.randomUUID(), ...b }; rows.push(n); return n; }); if (novos.includes(null)) return send(res, 409, { code: "23505", message: "duplicate key" }); return (req.headers.prefer || "").includes("return=representation") ? volta(novos) : send(res, 201); }
      if (req.method === "PATCH") { const alvo = rows.filter((r) => casa(r, f)); alvo.forEach((r) => Object.assign(r, body)); return (req.headers.prefer || "").includes("return=representation") ? volta(alvo) : send(res, 204); }
      if (req.method === "DELETE") { db[t] = rows.filter((r) => !casa(r, f)); return send(res, 204); }
    }
    if (p.startsWith("/storage/v1/")) return send(res, 200, req.method === "POST" && p.includes("/sign/") ? { signedURL: "/x" } : []);
    send(res, 404, { msg: "not mocked " + p });
  });
});
server.listen(PORT, () => console.log("mock on", PORT));
