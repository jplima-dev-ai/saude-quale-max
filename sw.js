const CACHE = "qualimax-v3.3";
const SHELL = [
  "./", "./index.html", "./offline.html",
  "./catalogo.html",
  "./quiz.html",
  "./sobre.html",
  "./contato.html",
  "./conta.html",
  "./atendimento.html",
  "./admin.html", "./style.css", "./script.js", "./manifest.webmanifest",
  "./data/config.json", "./data/produtos.json", "./data/categorias.json", "./data/quiz.json", "./data/faq.json",
  "./img/max-avatar.webp",
  "./img/logo-saude-qualimax.webp", "./js/pwa.js", "./js/offline.js", "./js/frame-guard.js", "./js/config.js", "./js/db.js", "./js/colecoes.js", "./js/produtos.js", "./js/max-core.js", "./js/max-entidades.js", "./js/max-recomendacao.js", "./js/max-nlu.js", "./js/max-decision.js", "./js/max-intencoes.js", "./js/chatbot.js",
  "./js/promocoes.js",
  "./js/descobertas.js",
  "./js/interacoes.js",
  "./js/conta.js",
  "./js/atendimento.js",
  "./js/admin.js",
  "./js/jornada.js", "./js/quiz.js", "./js/categorias.js", "./js/faq.js", "./js/acessibilidade.js", "./js/produto-page.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
  );
});

self.addEventListener("message", event => {
  if (event.data?.tipo === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const semQuery = url.search === "";
    const dadoDinamico = /\/data\/[^/]+\.json$/i.test(url.pathname);

    // Configuração e catálogo mudam com frequência e devem priorizar a rede.
    if (dadoDinamico) {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response && response.ok && response.type === "basic") {
          cache.put(event.request, response.clone()).catch(() => {});
        }
        return response;
      } catch {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        return cached || Response.error();
      }
    }

    // Navegações usam rede primeiro para reduzir risco de conteúdo obsoleto.
    if (event.request.mode === "navigate") {
      try {
        const response = await fetch(event.request);
        if (response && response.ok && semQuery) {
          cache.put(event.request, response.clone()).catch(() => {});
        }
        return response;
      } catch {
        const paginaEmCache = await caches.match(event.request, { ignoreSearch: true });
        if (paginaEmCache) return paginaEmCache;
        const offline = await caches.match("./offline.html");
        return offline || Response.error();
      }
    }

    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response && response.ok && response.type === "basic" && semQuery) {
        cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
