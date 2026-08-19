(() => {
  "use strict";
  if (window.top === window.self) return;

  document.documentElement.style.display = "none";
  const mostrarBloqueio = () => {
    document.documentElement.style.display = "";
    const aviso = document.createElement("main");
    aviso.setAttribute("role", "main");
    const titulo = document.createElement("h1");
    titulo.textContent = "Conteúdo protegido";
    const texto = document.createElement("p");
    texto.textContent = "Por segurança, esta página deve ser aberta diretamente no site da Saúde Qualimax.";
    aviso.append(titulo, texto);
    document.body?.replaceChildren(aviso);
  };

  try {
    window.top.location = window.self.location.href;
    window.setTimeout(mostrarBloqueio, 800);
  } catch {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mostrarBloqueio, { once: true });
    } else {
      mostrarBloqueio();
    }
  }
})();
