(function () {
  "use strict";

  var root = document.documentElement;
  var initialLayoutHeight = window.innerHeight;
  var tableIndex = 0;
  var resizeFrame = 0;

  function closestHeading(table) {
    var context = table.closest("section, article, main");
    var heading = context && context.querySelector("h1, h2, h3");
    var caption = table.querySelector("caption");
    return (caption && caption.textContent.trim()) ||
      (heading && heading.textContent.trim()) || "informações da loja";
  }

  function tableContainer(table) {
    var existing = table.closest(".responsive-table-v357, .responsive-table-v358, .v340-compare, [class*='table-wrap'], [class*='tabela-wrapper']");
    if (existing) return existing;
    var wrapper = document.createElement("div");
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    return wrapper;
  }

  function enhanceTable(table) {
    var wrapper = tableContainer(table);
    if (wrapper.dataset.v358Table === "ready") return;
    tableIndex += 1;
    var sibling = wrapper.nextElementSibling;
    var hint = sibling && sibling.id && sibling.id.indexOf("table-hint-v357-") === 0
      ? sibling : document.createElement("p");
    if (!hint.id) hint.id = "table-help-v358-" + tableIndex;
    hint.classList.add("sr-only");
    hint.textContent = "Esta tabela pode ser movida horizontalmente. Deslize ou use as teclas de seta para consultar todas as colunas.";
    hint.hidden = true;
    wrapper.classList.add("responsive-table-v358");
    wrapper.dataset.v358Table = "ready";
    wrapper.tabIndex = -1;
    wrapper.setAttribute("role", "region");
    if (!wrapper.hasAttribute("aria-label")) wrapper.setAttribute("aria-label", "Tabela rolável: " + closestHeading(table));
    if (!hint.isConnected) wrapper.insertAdjacentElement("afterend", hint);

    function measure() {
      var overflow = table.scrollWidth > wrapper.clientWidth + 2;
      wrapper.dataset.overflow = String(overflow);
      wrapper.tabIndex = overflow ? 0 : -1;
      hint.hidden = !overflow;
      if (overflow) wrapper.setAttribute("aria-describedby", hint.id);
      else wrapper.removeAttribute("aria-describedby");
    }
    measure();
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(wrapper);
  }

  function stabilizeImages() {
    document.querySelectorAll("img").forEach(function (image, index) {
      if (!image.hasAttribute("decoding")) image.decoding = "async";
      if (!image.hasAttribute("loading") && index > 1 && !image.hasAttribute("fetchpriority")) image.loading = "lazy";
      function preserveRatio() {
        if (!image.hasAttribute("width") && image.naturalWidth) image.width = image.naturalWidth;
        if (!image.hasAttribute("height") && image.naturalHeight) image.height = image.naturalHeight;
      }
      if (image.complete) preserveRatio();
      else image.addEventListener("load", preserveRatio, { once: true });
    });
  }

  function containOverflow() {
    document.querySelectorAll("main > *, main section > .container, .modal-conteudo, .chatbot-dialog").forEach(function (element) {
      var rect = element.getBoundingClientRect();
      var exceeds = rect.right > window.innerWidth + 2 || rect.left < -2;
      element.classList.toggle("v358-overflow-contained", exceeds);
    });
  }

  function updateViewport() {
    var viewport = window.visualViewport;
    var height = viewport ? viewport.height : window.innerHeight;
    var width = viewport ? viewport.width : window.innerWidth;
    root.style.setProperty("--v358-viewport-height", height + "px");
    root.dataset.v358Viewport = width < 360 ? "zoomed" : width < 640 ? "compact" : width < 1100 ? "tablet" : "wide";
    var formFocused = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    var keyboardOpen = formFocused && initialLayoutHeight - height > 140;
    root.dataset.v358Keyboard = keyboardOpen ? "open" : "closed";
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(containOverflow);
  }

  function init() {
    document.querySelectorAll("table").forEach(enhanceTable);
    stabilizeImages();
    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    window.addEventListener("orientationchange", function () {
      initialLayoutHeight = window.innerHeight;
      updateViewport();
    }, { passive: true });
    document.addEventListener("focusin", updateViewport);
    document.addEventListener("focusout", updateViewport);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewport, { passive: true });
      window.visualViewport.addEventListener("scroll", updateViewport, { passive: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
