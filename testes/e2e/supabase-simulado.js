// Supabase simulado (auth + PostgREST mínimo) para testes E2E do Fólium.
const http = require("http");
const crypto = require("crypto");
const PORT = 54321;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const log = [];
const users = [
  { id: "u-aluna", email: "ana.123@alunos.unisagrado.edu.br", password: "Senha#123", user_metadata: { nome_usuario: "ana", tem_senha: true } },
  { id: "u-empresa", email: "contato@empresa.com", password: "Senha#123", user_metadata: { nome_usuario: "empresa", tem_senha: true } },
  { id: "u-novo", email: "bia.456@alunos.unisagrado.edu.br", password: null, user_metadata: {} },
];
const db = {
  contas: [
    { id: "u-aluna", tipo: "colaborador", plano: "gratis", plano_ate: null, plano_pedido: null, nome: "", empresa: "", whatsapp: "", cidade: "Bauru, SP", tour_visto_em: null },
    { id: "u-empresa", tipo: "contratante", plano: "gratis", plano_ate: null, plano_pedido: null, nome: "Empresa", empresa: "Empresa X", whatsapp: "", cidade: "Bauru, SP", tour_visto_em: "2026-11-01T00:00:00Z" },
  ],
  nomes_usuario: [ { id: "u-aluna", nome: "ana" }, { id: "u-empresa", nome: "empresa" } ],
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
function casa(row, f) { return f.every(([k, op, v]) => { const val = row[k]; if (op === "eq") return String(val) === v; if (op === "neq") return String(val) !== v; if (op === "is") return v === "null" ? val == null : String(val) === v; if (op === "in") return v.replace(/[()]/g, "").split(",").map((s) => s.replace(/"/g, "")).includes(String(val)); return true; }); }
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
        db.trabalhos = (db.trabalhos || []).filter((x) => x.perfil_id !== me.id);
        (body.p_trabalhos || []).filter((t) => (t.titulo || "").trim()).forEach((t, i) => db.trabalhos.push({ ...t, id: crypto.randomUUID(), perfil_id: me.id, ordem: i }));
        return send(res, 200, null);
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
      if (req.method === "POST") { const novos = (Array.isArray(body) ? body : [body]).map((b) => { const oc = url.searchParams.get("on_conflict") || "id"; const ex = rows.find((r) => b[oc] !== undefined && r[oc] === b[oc]); if (ex) { if ((req.headers.prefer || "").includes("merge-duplicates")) { Object.assign(ex, b); return ex; } return null; } const n = { ...(DEFAULTS[t] || {}), id: b.id ?? crypto.randomUUID(), ...b }; rows.push(n); return n; }); if (novos.includes(null)) return send(res, 409, { code: "23505", message: "duplicate key" }); return (req.headers.prefer || "").includes("return=representation") ? volta(novos) : send(res, 201); }
      if (req.method === "PATCH") { const alvo = rows.filter((r) => casa(r, f)); alvo.forEach((r) => Object.assign(r, body)); return (req.headers.prefer || "").includes("return=representation") ? volta(alvo) : send(res, 204); }
      if (req.method === "DELETE") { db[t] = rows.filter((r) => !casa(r, f)); return send(res, 204); }
    }
    if (p.startsWith("/storage/v1/")) return send(res, 200, req.method === "POST" && p.includes("/sign/") ? { signedURL: "/x" } : []);
    send(res, 404, { msg: "not mocked " + p });
  });
});
server.listen(PORT, () => console.log("mock on", PORT));
