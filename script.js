document.addEventListener("DOMContentLoaded", () => {
    const botaoMenu = document.querySelector(".botao-menu");
    const navegacao = document.querySelector(".navegacao");
    const cabecalho = document.querySelector(".cabecalho");
    const movimentoReduzido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const atualizarEstadoMenu = (aberto) => {
        if (!navegacao || !botaoMenu) {
            return;
        }

        botaoMenu.setAttribute("aria-expanded", String(aberto));
        botaoMenu.setAttribute(
            "aria-label",
            aberto
                ? "Fechar menu de navegação"
                : "Abrir menu de navegação"
        );
    };

    const fecharMenu = (devolverFoco = false) => {
        if (!navegacao || !botaoMenu) {
            return;
        }

        navegacao.classList.remove("menu-aberto");
        atualizarEstadoMenu(false);

        if (devolverFoco) {
            botaoMenu.focus();
        }
    };

    const abrirFecharMenu = () => {
        if (!navegacao || !botaoMenu) {
            return;
        }

        const aberto = navegacao.classList.toggle("menu-aberto");
        atualizarEstadoMenu(aberto);

        if (aberto) {
            const primeiroLink = navegacao.querySelector("a");
            primeiroLink?.focus();
        }
    };

    if (botaoMenu && navegacao) {
        atualizarEstadoMenu(false);
        botaoMenu.addEventListener("click", abrirFecharMenu);
    }

    document.querySelectorAll(".navegacao a").forEach((link) => {
        link.addEventListener("click", () => fecharMenu());
    });

    document.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Escape" &&
            navegacao?.classList.contains("menu-aberto")
        ) {
            fecharMenu(true);
        }
    });

    document.addEventListener("click", (evento) => {
        if (
            !navegacao ||
            !botaoMenu ||
            !navegacao.classList.contains("menu-aberto")
        ) {
            return;
        }

        const alvo = evento.target;

        if (
            alvo instanceof Node &&
            !navegacao.contains(alvo) &&
            !botaoMenu.contains(alvo)
        ) {
            fecharMenu();
        }
    });

    const sincronizarMenuComViewport = () => {
        if (window.innerWidth > 850) {
            fecharMenu();
        }
    };

    window.addEventListener(
        "resize",
        sincronizarMenuComViewport,
        { passive: true }
    );

    const atualizarCabecalho = () => {
        cabecalho?.classList.toggle(
            "cabecalho-scrolled",
            window.scrollY > 50
        );
    };

    window.addEventListener(
        "scroll",
        atualizarCabecalho,
        { passive: true }
    );

    atualizarCabecalho();

    const obterDestino = (href) => {
        if (
            !href ||
            href === "#" ||
            !href.startsWith("#")
        ) {
            return null;
        }

        try {
            return document.querySelector(href);
        } catch {
            return null;
        }
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (evento) => {
            const href = link.getAttribute("href");
            const elemento = obterDestino(href);

            if (!elemento) {
                return;
            }

            evento.preventDefault();

            elemento.scrollIntoView({
                behavior: movimentoReduzido ? "auto" : "smooth",
                block: "start"
            });

            if (href && history.pushState) {
                history.pushState(null, "", href);
            }
        });
    });

    const buscaAtalho = document.querySelector("[data-busca-atalho]");
    const botaoIrBusca = document.querySelector("[data-ir-busca]");
    const executarBuscaAtalho = () => {
        const valor = buscaAtalho?.value.trim();
        const buscaCatalogo = document.querySelector("[data-busca-produtos]");
        if (!buscaCatalogo) return;
        document.querySelector("#produtos")?.scrollIntoView({
            behavior: movimentoReduzido ? "auto" : "smooth",
            block: "start"
        });
        buscaCatalogo.value = valor || "";
        buscaCatalogo.dispatchEvent(new Event("input", { bubbles: true }));
        window.setTimeout(() => buscaCatalogo.focus(), movimentoReduzido ? 0 : 350);
    };
    botaoIrBusca?.addEventListener("click", executarBuscaAtalho);
    buscaAtalho?.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            executarBuscaAtalho();
        }
    });

    const elementosAnimados = document.querySelectorAll(
        [
            ".categoria-card",
            ".diferencial",
            ".contato-card",
            ".faixa-item",
            ".entrega-card",
            ".hero-card-principal",
            ".sobre-visual",
            ".sobre-conteudo",
            ".entrega-conteudo",
            ".entrega-visual",
            ".faq-list details"
        ].join(", ")
    );

    if (
        movimentoReduzido ||
        !("IntersectionObserver" in window)
    ) {
        elementosAnimados.forEach((elemento) => {
            elemento.classList.add("elemento-visivel");
        });
    } else {
        const observador = new IntersectionObserver(
            (entradas, observer) => {
                entradas.forEach((entrada) => {
                    if (!entrada.isIntersecting) {
                        return;
                    }

                    entrada.target.classList.add("elemento-visivel");
                    observer.unobserve(entrada.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        elementosAnimados.forEach((elemento) => {
            elemento.classList.add("elemento-animado");
            observador.observe(elemento);
        });
    }

    const galeria = document.querySelector("[data-galeria='360']");

    if (galeria) {
        const slides = Array.from(
            galeria.querySelectorAll(".galeria-slide")
        );
        const thumbs = Array.from(
            galeria.querySelectorAll(".galeria-thumb")
        );
        const setaAnterior = galeria.querySelector(
            ".galeria-seta-anterior"
        );
        const setaProxima = galeria.querySelector(
            ".galeria-seta-proxima"
        );
        const status = galeria.querySelector(".galeria-viewport");
        let indiceAtual = 0;

        if (slides.length > 0) {
            galeria.setAttribute("role", "region");
            galeria.setAttribute(
                "aria-label",
                "Galeria de imagens de produtos"
            );
            galeria.setAttribute("tabindex", "0");

            const atualizarGaleria = (novoIndice) => {
                indiceAtual =
                    (novoIndice + slides.length) % slides.length;

                slides.forEach((slide, index) => {
                    const ativo = index === indiceAtual;
                    slide.classList.toggle("is-active", ativo);
                    slide.setAttribute(
                        "aria-hidden",
                        String(!ativo)
                    );
                });

                thumbs.forEach((thumb, index) => {
                    const ativo = index === indiceAtual;
                    thumb.classList.toggle("is-active", ativo);
                    thumb.setAttribute(
                        "aria-pressed",
                        String(ativo)
                    );
                    thumb.setAttribute(
                        "aria-label",
                        `Mostrar imagem ${index + 1} de ${slides.length}`
                    );
                });

                if (status) {
                    status.setAttribute(
                        "aria-label",
                        `Visão da galeria: imagem ${indiceAtual + 1} de ${slides.length}`
                    );
                    status.setAttribute("aria-live", "polite");
                }
            };

            setaAnterior?.addEventListener("click", () => {
                atualizarGaleria(indiceAtual - 1);
                setaAnterior.focus();
            });

            setaProxima?.addEventListener("click", () => {
                atualizarGaleria(indiceAtual + 1);
                setaProxima.focus();
            });

            thumbs.forEach((thumb) => {
                thumb.addEventListener("click", () => {
                    atualizarGaleria(Number(thumb.dataset.index));
                    thumb.focus();
                });

                thumb.addEventListener("keydown", (evento) => {
                    if (
                        evento.key === "Enter" ||
                        evento.key === " "
                    ) {
                        evento.preventDefault();
                        thumb.click();
                    }
                });
            });

            galeria.addEventListener("keydown", (evento) => {
                if (evento.key === "ArrowRight") {
                    evento.preventDefault();
                    atualizarGaleria(indiceAtual + 1);
                }

                if (evento.key === "ArrowLeft") {
                    evento.preventDefault();
                    atualizarGaleria(indiceAtual - 1);
                }
            });

            atualizarGaleria(0);
        }
    }

    const perguntas = document.querySelectorAll(
        ".faq-list details"
    );

    perguntas.forEach((pergunta) => {
        pergunta.addEventListener("toggle", () => {
            if (!pergunta.open) {
                return;
            }

            perguntas.forEach((outra) => {
                if (
                    outra !== pergunta &&
                    outra.open
                ) {
                    outra.open = false;
                }
            });
        });
    });

    const copiarTexto = async (texto) => {
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(texto);
            return;
        }

        const areaTexto = document.createElement("textarea");

        areaTexto.value = texto;
        areaTexto.setAttribute("readonly", "");
        areaTexto.style.position = "fixed";
        areaTexto.style.opacity = "0";
        areaTexto.style.pointerEvents = "none";

        document.body.appendChild(areaTexto);
        areaTexto.select();
        areaTexto.setSelectionRange(0, areaTexto.value.length);

        let sucesso = false;

        try {
            sucesso = document.execCommand("copy");
        } catch {
            sucesso = false;
        }

        areaTexto.remove();

        if (!sucesso) {
            throw new Error("Falha ao copiar o conteúdo.");
        }
    };

    document.querySelectorAll("[data-copiar]").forEach((botao) => {
        botao.addEventListener("click", async () => {
            const texto = botao.dataset.copiar;

            if (!texto) {
                return;
            }

            const textoOriginal = botao.textContent;

            try {
                await copiarTexto(texto);
                botao.textContent = "Copiado!";

                window.setTimeout(() => {
                    botao.textContent = textoOriginal;
                }, 2000);
            } catch {
                botao.textContent = "Não foi possível copiar";

                window.setTimeout(() => {
                    botao.textContent = textoOriginal;
                }, 2500);
            }
        });
    });

    document.querySelectorAll(".ano-atual").forEach((elemento) => {
        elemento.textContent = String(
            new Date().getFullYear()
        );
    });

    const botaoTopo = document.querySelector(".botao-topo");

    if (botaoTopo) {
        const controlarBotaoTopo = () => {
            botaoTopo.classList.toggle(
                "visivel",
                window.scrollY > 500
            );
        };

        window.addEventListener(
            "scroll",
            controlarBotaoTopo,
            { passive: true }
        );

        controlarBotaoTopo();

        botaoTopo.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: movimentoReduzido
                    ? "auto"
                    : "smooth"
            });
        });
    }

    const progresso = document.querySelector(
        ".barra-progresso"
    );

    if (progresso) {
        const atualizarProgresso = () => {
            const alturaPagina =
                document.documentElement.scrollHeight -
                window.innerHeight;

            if (alturaPagina <= 0) {
                progresso.style.width = "0%";
                return;
            }

            const percentual =
                (window.scrollY / alturaPagina) * 100;

            progresso.style.width =
                `${Math.min(Math.max(percentual, 0), 100)}%`;
        };

        window.addEventListener(
            "scroll",
            atualizarProgresso,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            atualizarProgresso,
            { passive: true }
        );

        atualizarProgresso();
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const href = link.getAttribute("href");

        if (
            href &&
            href !== "#" &&
            !obterDestino(href)
        ) {
            console.warn(
                `Destino não encontrado: ${href}`
            );
        }
    });

    if (movimentoReduzido) {
        document.documentElement.classList.add(
            "movimento-reduzido"
        );
    }
});


// v2.0 — PWA leve: registra cache do shell em navegadores compatíveis.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
