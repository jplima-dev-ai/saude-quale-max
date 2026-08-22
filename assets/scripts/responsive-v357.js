(function () {
  "use strict";

  var root = document.documentElement;
  var tableSequence = 0;

  function textFromContext(table) {
    var caption = table.querySelector("caption");
    if (caption && caption.textContent.trim()) return caption.textContent.trim();
    var section = table.closest("section, article, main");
    var heading = section && section.querySelector("h1, h2, h3");
    return heading && heading.textContent.trim() ? heading.textContent.trim() : "informações";
  }

  function updateTable(wrapper, table, hint) {
    var overflow = table.scrollWidth > wrapper.clientWidth + 2;
    wrapper.dataset.overflow = String(overflow);
    wrapper.tabIndex = overflow ? 0 : -1;
    hint.hidden = !overflow;
    if (overflow) wrapper.setAttribute("aria-describedby", hint.id);
    else wrapper.removeAttribute("aria-describedby");
  }

  function improveTables() {
    document.querySelectorAll("table").forEach(function (table) {
      if (table.closest(".responsive-table-v357, .v340-compare, [class*='table-wrap'], [class*='tabela-wrapper']")) return;
      tableSequence += 1;
      var wrapper = document.createElement("div");
      var hint = document.createElement("p");
      hint.id = "table-hint-v357-" + tableSequence;
      hint.className = "sr-only";
      hint.textContent = "Tabela com rolagem horizontal. Deslize para os lados para consultar todas as colunas.";
      hint.hidden = true;
      wrapper.className = "responsive-table-v357";
      wrapper.tabIndex = -1;
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-label", "Tabela rolável: " + textFromContext(table));
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      wrapper.insertAdjacentElement("afterend", hint);
      updateTable(wrapper, table, hint);
      if ("ResizeObserver" in window) {
        new ResizeObserver(function () { updateTable(wrapper, table, hint); }).observe(wrapper);
      }
    });
  }

  function improveImages() {
    document.querySelectorAll("img").forEach(function (image, index) {
      if (!image.hasAttribute("decoding")) image.decoding = "async";
      if (!image.hasAttribute("loading") && index > 1 && !image.hasAttribute("fetchpriority")) image.loading = "lazy";
      if (!image.hasAttribute("sizes")) {
        if (image.closest(".produto-card, .produto-item")) image.sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";
        else if (image.closest(".produto-topo, .produto-detalhe")) image.sizes = "(max-width: 850px) 100vw, 42vw";
      }
    });
  }

  function updateViewport() {
    var width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    root.style.setProperty("--v357-vh", (height * 0.01) + "px");
    root.dataset.viewport = width < 640 ? "compact" : width < 1100 ? "tablet" : "wide";
  }

  function closeMobileMenu() {
    var button = document.querySelector(".botao-menu[aria-expanded='true']");
    if (!button) return;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Abrir menu de navegação");
    document.body.classList.remove("menu-aberto");
    var menu = document.getElementById(button.getAttribute("aria-controls") || "menu-principal");
    if (menu) menu.classList.remove("ativo", "aberto");
  }

  function init() {
    improveTables();
    improveImages();
    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    window.addEventListener("orientationchange", function () {
      closeMobileMenu();
      updateViewport();
    }, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener("resize", updateViewport, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
