const CACHE = "qualimax-v3.3.6";
const SHELL = [
  "./", "./index.html", "./offline.html",
  "./catalog.html", "./cart.html", "./campaigns.html", "./assets/styles/commerce.css", "./assets/styles/animations.css", "./assets/scripts/animations.js", "./assets/scripts/security.js", "./assets/scripts/security.js", "./assets/scripts/commerce-v333.js", "./data/v333.json",
  "./quiz.html",
  "./about.html",
  "./contact.html",
  "./account.html",
  "./support.html",
  "./admin.html", "./assets/styles/main.css", "./assets/scripts/site.js", "./manifest.webmanifest",
  "./data/config.json", "./data/routes.json", "./data/products.json", "./data/categories.json", "./data/quiz.json", "./data/faq.json",
  "./data/price-research.json", "./data/baskets.json", "./assets/scripts/commerce-v332.js",
  "./assets/images/max-avatar-v333.svg",
  "./assets/images/logo-saude-qualimax.webp", "./assets/scripts/pwa.js", "./assets/scripts/offline.js", "./assets/scripts/frame-guard.js", "./assets/scripts/config.js", "./assets/scripts/db.js", "./assets/scripts/collections.js", "./assets/scripts/products.js", "./assets/scripts/max-core.js", "./assets/scripts/max-entities.js", "./assets/scripts/max-recommendation.js", "./assets/scripts/max-nlu.js", "./assets/scripts/max-decision.js", "./assets/scripts/max-intents.js", "./assets/scripts/chatbot.js",
  "./assets/scripts/promotions.js",
  "./assets/scripts/discovery.js",
  "./assets/scripts/interactions.js",
  "./assets/scripts/account.js",
  "./assets/scripts/support.js",
  "./assets/scripts/admin.js",
  "./assets/scripts/journey.js", "./assets/scripts/quiz.js", "./assets/scripts/categories.js", "./assets/scripts/faq.js", "./assets/scripts/accessibility.js", "./assets/scripts/product-page.js"
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
  if (url.username || url.password || event.request.headers.has("range")) return;
  if (url.username || url.password || event.request.headers.has("range")) return;
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const semQuery = url.search === "";
    const cacheavel = /\.(?:html|css|js|json|webmanifest|png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname) || url.pathname.endsWith("/");
    const cacheavel = /\.(?:html|css|js|json|webmanifest|png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname) || url.pathname.endsWith("/");
    const dadoDinamico = /\/data\/[^/]+\.json$/i.test(url.pathname);

    // Configuração e catálogo mudam com frequência e devem priorizar a rede.
    if (dadoDinamico) {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response && response.ok && response.type === "basic") {
          cache.put(event.request, response.clone()).catch(() => {});
          return response;
        }
        const cached = await caches.match(event.request, { ignoreSearch: true });
        return cached || response;
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
      if (response && response.ok && response.type === "basic" && semQuery && cacheavel) {
        cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
