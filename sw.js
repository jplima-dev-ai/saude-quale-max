const CACHE = "qualimax-v2.0.2";
const SHELL = [
  "./", "./index.html",
  "./catalogo.html",
  "./quiz.html",
  "./sobre.html",
  "./contato.html", "./style.css", "./script.js", "./manifest.webmanifest",
  "./data/config.json", "./data/conteudo.json", "./data/produtos.json", "./data/categorias.json", "./data/quiz.json", "./data/faq.json",
  "./img/logo-saude-qualimax.webp", "./js/config.js", "./js/db.js", "./js/colecoes.js", "./js/produtos.js", "./js/chatbot.js", "./js/quiz.js", "./js/categorias.js", "./js/faq.js", "./js/acessibilidade.js", "./js/produto-page.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
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

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response && response.ok && (response.type === "basic" || response.type === "cors")) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    } catch {
      if (event.request.mode === "navigate") {
        return (await caches.match("./index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
