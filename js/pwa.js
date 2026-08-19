(() => {
  "use strict";

  const paginaProduto = location.pathname.includes("/produto/");
  const raiz = paginaProduto ? "../" : "./";
  let promptInstalacao = null;
  let registroSW = null;
  let nomeApp = "Aplicativo";

  const obterConfig = () => new Promise((resolve) => {
    if (window.QualimaxConfig) {
      resolve(window.QualimaxConfig);
      return;
    }
    const timer = window.setTimeout(() => resolve(window.QualimaxConfig || {}), 1400);
    document.addEventListener("qualimax:config-ready", (evento) => {
      clearTimeout(timer);
      resolve(evento.detail || window.QualimaxConfig || {});
    }, { once: true });
  });

  const pwaAtiva = () => window.QualimaxConfig?.recursos?.pwa !== false;

  const criarStatusConexao = () => {
    let status = document.querySelector("[data-conexao-status]");
    if (status) return status;

    status = document.createElement("div");
    status.className = "status-conexao";
    status.dataset.conexaoStatus = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    status.hidden = true;
    const skip = document.querySelector(".skip-link");
    if (skip) skip.insertAdjacentElement("afterend", status);
    else document.body.prepend(status);
    return status;
  };

  const atualizarConexao = () => {
    if (!pwaAtiva()) return;
    const status = criarStatusConexao();
    if (navigator.onLine) {
      if (!status.hidden) {
        status.textContent = "Conexão restabelecida.";
        status.classList.remove("status-conexao-offline");
        status.classList.add("status-conexao-online");
        window.setTimeout(() => { status.hidden = true; }, 2500);
      }
      return;
    }
    status.hidden = false;
    status.classList.remove("status-conexao-online");
    status.classList.add("status-conexao-offline");
    status.textContent = "Você está offline. Conteúdo já visitado pode continuar disponível.";
  };

  const criarAreaPWA = () => {
    let area = document.querySelector("[data-pwa-acoes]");
    if (area) return area;

    const rodapeFinal = document.querySelector(".rodape-final");

    area = document.createElement("div");
    area.className = rodapeFinal ? "pwa-acoes" : "pwa-acoes pwa-acoes-flutuante";
    area.dataset.pwaAcoes = "";

    if (rodapeFinal) {
      rodapeFinal.append(area);
    } else {
      area.setAttribute("role", "region");
      area.setAttribute("aria-label", "Ações da aplicação");
      document.body.append(area);
    }
    return area;
  };

  const criarBotaoInstalar = () => {
    if (!promptInstalacao || window.matchMedia("(display-mode: standalone)").matches) return;
    const area = criarAreaPWA();
    if (!area || area.querySelector("[data-instalar-app]")) return;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "pwa-botao";
    botao.dataset.instalarApp = "";
    botao.textContent = `Instalar ${nomeApp}`;
    botao.addEventListener("click", async () => {
      if (!promptInstalacao) return;
      botao.disabled = true;
      try {
        await promptInstalacao.prompt();
        await promptInstalacao.userChoice;
      } finally {
        promptInstalacao = null;
        botao.remove();
      }
    });
    area.append(botao);
  };

  const mostrarAtualizacao = (worker) => {
    const area = criarAreaPWA();
    if (!area || area.querySelector("[data-atualizar-app]")) return;

    const bloco = document.createElement("div");
    bloco.className = "pwa-atualizacao";
    bloco.setAttribute("role", "status");

    const texto = document.createElement("span");
    texto.textContent = `Uma nova versão de ${nomeApp} está disponível.`;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "pwa-botao";
    botao.dataset.atualizarApp = "";
    botao.textContent = "Atualizar agora";
    botao.addEventListener("click", () => {
      botao.disabled = true;
      worker.postMessage({ tipo: "SKIP_WAITING" });
    });

    bloco.append(texto, botao);
    area.append(bloco);
  };

  const observarRegistro = (registro) => {
    if (!registro) return;
    if (registro.waiting && navigator.serviceWorker.controller) {
      mostrarAtualizacao(registro.waiting);
    }

    registro.addEventListener("updatefound", () => {
      const instalando = registro.installing;
      if (!instalando) return;
      instalando.addEventListener("statechange", () => {
        if (instalando.state === "installed" && navigator.serviceWorker.controller) {
          mostrarAtualizacao(instalando);
        }
      });
    });
  };

  window.addEventListener("online", atualizarConexao);
  window.addEventListener("offline", atualizarConexao);
  document.addEventListener("DOMContentLoaded", atualizarConexao);

  window.addEventListener("beforeinstallprompt", async (evento) => {
    evento.preventDefault();
    promptInstalacao = evento;
    const config = await obterConfig();
    nomeApp = config.empresa?.nome || nomeApp;
    if (config.recursos?.pwa !== false) criarBotaoInstalar();
  });

  window.addEventListener("appinstalled", () => {
    promptInstalacao = null;
    document.querySelector("[data-instalar-app]")?.remove();
  });

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    const haviaControladorAoCarregar = Boolean(navigator.serviceWorker.controller);
    let atualizacaoSolicitada = false;

    window.addEventListener("load", async () => {
      const config = await obterConfig();
      nomeApp = config.empresa?.nome || nomeApp;
      if (config.recursos?.pwa === false) {
        promptInstalacao = null;
        document.querySelector("[data-pwa-acoes]")?.remove();
        try {
          const escopoEsperado = new URL(raiz, location.href).href;
          const registros = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registros
            .filter((registro) => registro.scope === escopoEsperado)
            .map((registro) => registro.unregister()));
        } catch {}
        return;
      }
      try {
        registroSW = await navigator.serviceWorker.register(`${raiz}sw.js`, { scope: raiz });
        observarRegistro(registroSW);
        criarBotaoInstalar();
      } catch (erro) {
        console.warn("PWA: não foi possível registrar o Service Worker.", erro);
      }
    });

    document.addEventListener("click", (evento) => {
      if (evento.target.closest?.("[data-atualizar-app]")) {
        atualizacaoSolicitada = true;
      }
    });

    let recarregando = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (recarregando) return;
      if (!haviaControladorAoCarregar && !atualizacaoSolicitada) return;
      recarregando = true;
      location.reload();
    });
  }
})();
