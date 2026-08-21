(() => {
"use strict";

const reduzirMovimento = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    document.documentElement.classList.contains("movimento-reduzido");

const seletoresRevelacao = [
    ".secao-cabecalho",
    ".beneficio-premium-card",
    ".categoria-popular-card",
    ".produto-card",
    ".editorial-trilha",
    ".jornada-card",
    ".contato-card",
    ".diferencial-card",
    ".produto-relacionado-pagina-card",
    ".achados-dia li",
    ".quiz-card"
];

const prepararRevelacao = (raiz = document) => {
    const elementos = raiz.matches?.(seletoresRevelacao.join(",")) ? [raiz] : [...raiz.querySelectorAll?.(seletoresRevelacao.join(",")) || []];
    elementos.forEach((el, indice) => {
        if (el.dataset.interacaoPreparada === "true") return;
        el.dataset.interacaoPreparada = "true";
        el.classList.add("interacao-revelar");
        el.style.setProperty("--delay-reveal", `${Math.min(indice % 6, 5) * 55}ms`);
    });
};

const iniciarRevelacao = () => {
    prepararRevelacao();
    const elementos = [...document.querySelectorAll(".interacao-revelar")];

    if (reduzirMovimento() || !("IntersectionObserver" in window)) {
        elementos.forEach(el => el.classList.add("interacao-visivel"));
        return;
    }

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("interacao-visivel");
            observer.unobserve(entrada.target);
        });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.08 });

    elementos.forEach(el => observer.observe(el));

    const mutacao = new MutationObserver((registros) => {
        registros.forEach(registro => registro.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            prepararRevelacao(node);
            const novos = node.matches(".interacao-revelar")
                ? [node]
                : [...node.querySelectorAll(".interacao-revelar")];
            novos.forEach(el => {
                if (reduzirMovimento()) el.classList.add("interacao-visivel");
                else observer.observe(el);
            });
        }));
    });
    mutacao.observe(document.body, { childList: true, subtree: true });
};

const criarProgresso = () => {
    const barra = document.createElement("div");
    barra.className = "progresso-pagina";
    barra.setAttribute("aria-hidden", "true");
    const interno = document.createElement("div");
    interno.className = "progresso-pagina-interno";
    barra.append(interno);
    document.body.prepend(barra);

    let agendado = false;
    const atualizar = () => {
        agendado = false;
        const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const valor = Math.min(1, Math.max(0, scrollY / total));
        interno.style.transform = `scaleX(${valor})`;
    };
    const solicitar = () => {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(atualizar);
    };
    addEventListener("scroll", solicitar, { passive: true });
    addEventListener("resize", solicitar, { passive: true });
    atualizar();
};

const criarToast = () => {
    const toast = document.createElement("div");
    toast.className = "micro-toast";
    toast.setAttribute("aria-hidden", "true");
    document.body.append(toast);
    let timer = 0;

    return (texto) => {
        if (!texto) return;
        clearTimeout(timer);
        toast.textContent = texto;
        toast.classList.remove("micro-toast-visivel");
        // força nova transição visual sem gerar anúncio duplicado para leitor de tela
        void toast.offsetWidth;
        toast.classList.add("micro-toast-visivel");
        timer = window.setTimeout(() => toast.classList.remove("micro-toast-visivel"), 1900);
    };
};

const ativarFeedbackBotoes = (mostrarToast) => {
    const acoesRecentes = new WeakSet();

    document.addEventListener("pointerdown", (evento) => {
        const alvo = evento.target.closest?.(".botao, button, .editorial-trilha, .jornada-card");
        if (!alvo || reduzirMovimento()) return;
        const rect = alvo.getBoundingClientRect();
        alvo.style.setProperty("--toque-x", `${evento.clientX - rect.left}px`);
        alvo.style.setProperty("--toque-y", `${evento.clientY - rect.top}px`);
        alvo.classList.remove("interacao-toque");
        void alvo.offsetWidth;
        alvo.classList.add("interacao-toque");
        window.setTimeout(() => alvo.classList.remove("interacao-toque"), 450);
    }, { passive: true });

    document.addEventListener("click", (evento) => {
        const alvo = evento.target.closest?.("[data-favorito-id], [data-interesse-id], [data-produto-pagina-favorito], [data-produto-pagina-interesse]");
        if (!alvo) return;
        acoesRecentes.add(alvo);
        window.setTimeout(() => acoesRecentes.delete(alvo), 1400);
    });

    const observarEstados = new MutationObserver((registros) => {
        registros.forEach(({ target, attributeName }) => {
            if (attributeName !== "aria-pressed" || !(target instanceof HTMLElement)) return;
            if (!target.matches("[data-favorito-id], [data-interesse-id], [data-produto-pagina-favorito], [data-produto-pagina-interesse]")) return;
            if (!acoesRecentes.has(target)) return;

            const ativo = target.getAttribute("aria-pressed") === "true";
            target.classList.remove("estado-confirmado");
            if (ativo && !reduzirMovimento()) {
                void target.offsetWidth;
                target.classList.add("estado-confirmado");
            }

            if (target.matches("[data-favorito-id], [data-produto-pagina-favorito]")) {
                mostrarToast(ativo ? "Adicionado aos favoritos" : "Removido dos favoritos");
            } else {
                mostrarToast(ativo ? "Adicionado à sua lista" : "Removido da sua lista");
            }
        });
    });

    observarEstados.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-pressed"]
    });
};

const ativarEstadosAbertura = () => {
    const observer = new MutationObserver((registros) => {
        registros.forEach(registro => {
            if (registro.type !== "attributes" || registro.attributeName !== "hidden") return;
            const alvo = registro.target;
            if (!(alvo instanceof HTMLElement) || alvo.hidden || reduzirMovimento()) return;

            if (alvo.matches(".produto-modal, [data-produto-modal]")) {
                alvo.classList.remove("interacao-abrindo");
                void alvo.offsetWidth;
                alvo.classList.add("interacao-abrindo");
            }

            if (alvo.matches(".chatbot, [data-chatbot]")) {
                alvo.classList.remove("interacao-abrindo");
                void alvo.offsetWidth;
                alvo.classList.add("interacao-abrindo");
            }
        });
    });

    document.querySelectorAll(".produto-modal, [data-produto-modal], .chatbot, [data-chatbot]").forEach(el => {
        observer.observe(el, { attributes: true, attributeFilter: ["hidden"] });
    });
};

const ativarImagemHero = () => {
    const visual = document.querySelector(".hero-visual");
    if (!visual || reduzirMovimento() || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    visual.addEventListener("pointermove", evento => {
        const rect = visual.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / rect.width - .5;
        const y = (evento.clientY - rect.top) / rect.height - .5;
        visual.style.setProperty("--hero-x", `${x * 8}px`);
        visual.style.setProperty("--hero-y", `${y * 8}px`);
    });
    visual.addEventListener("pointerleave", () => {
        visual.style.setProperty("--hero-x", "0px");
        visual.style.setProperty("--hero-y", "0px");
    });
};

document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("interacoes-ativas");
    iniciarRevelacao();
    criarProgresso();
    const mostrarToast = criarToast();
    ativarFeedbackBotoes(mostrarToast);
    ativarEstadosAbertura();
    ativarImagemHero();
});
})();