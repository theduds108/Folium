// Service worker do Fólium: deixa o site instalável e abre mais rápido com internet ruim.
// Páginas: rede primeiro, cópia guardada como reserva. Arquivos do build (_next/static, ícones,
// fontes): guardados na primeira vez, porque o nome muda a cada versão.
// Nada do Supabase passa por aqui (outro domínio), então dados e fotos protegidas nunca ficam no cache.
const CACHE = "folium-v2";
const ESSENCIAIS = ["/", "/entrar/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESSENCIAIS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
  );
  self.clients.claim();
});

function guardar(request, resposta) {
  if (resposta && resposta.ok && resposta.type === "basic") {
    const copia = resposta.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copia));
  }
  return resposta;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  const fixo = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/lottie/");
  if (fixo) {
    event.respondWith(caches.match(request).then((r) => r || fetch(request).then((resp) => guardar(request, resp))));
    return;
  }
  event.respondWith(
    fetch(request)
      .then((resp) => guardar(request, resp))
      .catch(() =>
        caches.match(request).then((r) => r || (request.mode === "navigate" ? caches.match("/") : Response.error()))
      )
  );
});
